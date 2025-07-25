<template>
  <div class="container mx-auto px-4 py-8 max-w-3xl">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-neutral-900">Редагувати {{ entityType?.name || 'запис' }}</h1>
      <p class="text-neutral-600 mt-1" v-if="entityType?.description">{{ entityType.description }}</p>
    </div>

    <BaseLoader v-if="loading" />

    <EntityRecordForm
      v-else
      :form="form"
      :entity-type="entityType"
      :statuses="statuses"
      :loading="saving"
      submit-label="Зберегти"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSupabaseClient, useSupabaseUser } from '#imports';
import { toast } from 'vue3-toastify';
import BaseLoader from '@/components/ui/BaseLoader.vue';
import EntityRecordForm from '@/components/EntityRecordForm.vue';
import { handleAutomationsClient } from '@/src/workflow/run.js';

const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient();
const user = useSupabaseUser();

const slug = route.params.slug;
const recordId = route.params.id;

const loading = ref(true);
const saving = ref(false);

const entityType = ref(null);
const statuses = ref([]);
const form = reactive({});

onMounted(async () => {
  loading.value = true;
  try {
    // Загрузка типа сущности
    const { data: type, error: typeError } = await supabase
      .from('entity_types')
      .select('*')
      .eq('slug', slug)
      .single();
    if (typeError || !type) throw new Error('Не вдалося завантажити тип сутності');
    entityType.value = type;

    // Загрузка записи
    const { data: record, error: recordError } = await supabase
      .from('entity_records')
      .select('*')
      .eq('id', recordId)
      .single();
    if (recordError || !record || record.entity_type_id !== type.id) throw new Error('Запис не знайдено');
    Object.assign(form, record.data); // копируем поля в форму

    // Загрузка статусов
    const { data: statusList, error: statusError } = await supabase
      .from('status_definitions')
      .select('*')
      .eq('entity_type_id', type.id);
    if (statusError) throw new Error('Не вдалося завантажити статуси');
    statuses.value = statusList || [];

  } catch (err) {
    console.error(err);
    //toast.error('Помилка завантаження запису');
    router.push(`/entities/${slug}/records`);
  } finally {
    loading.value = false;
  }
});

async function handleSubmit() {
  saving.value = true;
  try {
    // 1. Отримуємо старі дані запису
    const { data: existingRecord, error: fetchError } = await supabase
      .from('entity_records')
      .select('data')
      .eq('id', recordId)
      .single();

    if (fetchError || !existingRecord) throw fetchError;

    const oldData = existingRecord.data || {};
    const newData = { ...form };

    // 2. Оновлення запису
    const { error: updateError } = await supabase
      .from('entity_records')
      .update({
        data: newData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', recordId);

    if (updateError) throw updateError;

    // 3. Формування масиву змін
    const logs = Object.entries(newData)
      .filter(([key, newVal]) => String(oldData[key]) !== String(newVal))
      .map(([key, newVal]) => ({
        entity_record_id: recordId,
        user_id: user.value.id,
        field_name: key,
        old_value: String(oldData[key] ?? ''),
        new_value: String(newVal),
        changed_at: new Date().toISOString(),
      }));

    if (logs.length > 0) {
      const { error: logError } = await supabase.from('field_change_logs').insert(logs);
      if (logError) throw logError;
    }

    await handleAutomationsClient({
      entityTypeId: entityType.value.id,
      entityId: recordId,
      triggerType: 'on_update',
      entityData: { ...form }
    });

    //toast.success('Запис оновлено');
    router.push(`/entities/${slug}/records`);
  } catch (err) {
    console.error(err);
    //toast.error('Не вдалося оновити запис');
  } finally {
    saving.value = false;
  }
}

</script>
