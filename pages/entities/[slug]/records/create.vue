<template>
  <div class="container mx-auto px-4 py-8 max-w-3xl">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-neutral-900">Створити {{ entityType?.name || 'запис' }}</h1>
      <p class="text-neutral-600 mt-1" v-if="entityType?.description">{{ entityType.description }}</p>
    </div>

    <BaseLoader v-if="loading" />

    <EntityRecordForm
      v-else
      :form="form"
      :entity-type="entityType"
      :statuses="statuses"
      :loading="saving"
      submit-label="Створити"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSupabaseClient, useSupabaseUser } from '#imports';
import BaseLoader from '@/components/ui/BaseLoader.vue';
import EntityRecordForm from '@/components/EntityRecordForm.vue';
import { toast } from 'vue3-toastify';
import { handleAutomationsClient } from '@/src/workflow/run.js';

const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient();
const user = useSupabaseUser();

const slug = route.params.slug;
const defaultStatus = route.query.status_id;
const loading = ref(true);
const saving = ref(false);
const entityType = ref(null);
const statuses = ref([]);
const form = reactive({});

onMounted(async () => {
  try {
    const { data: type } = await supabase.from('entity_types').select('*').eq('slug', slug).single();
    if (!type) throw new Error('Entity type not found');
    entityType.value = type;

    const { data: statusList } = await supabase
      .from('status_definitions')
      .select('*')
      .eq('entity_type_id', type.id);
    statuses.value = statusList || [];

    for (const field of type.fields || []) {
      form[field.name] = field.defaultValue || '';
    }

    if (defaultStatus && statuses.value.some(s => s.id === defaultStatus)) {
      form.status_id = defaultStatus;
    }
  } catch (err) {
    //toast.error('Failed to load entity type');
    router.push('/entities');
  } finally {
    loading.value = false;
  }
});

async function handleSubmit() {
  saving.value = true;
  try {
    // 1. Створення запису сутності
    const { data: inserted, error: insertError } = await supabase
      .from('entity_records')
      .insert({
        entity_type_id: entityType.value.id,
        user_id: user.value.id,
        data: { ...form },
      })
      .select('id, data')
      .single();

    if (insertError) throw insertError;

    // 2. Запис змін у field_change_logs
    const logs = Object.entries(form).map(([field, value]) => ({
      entity_record_id: inserted.id,
      user_id: user.value.id,
      field_name: field,
      old_value: null,
      new_value: String(value),
      changed_at: new Date().toISOString(),
    }));

    const { error: logError } = await supabase.from('field_change_logs').insert(logs);
    if (logError) throw logError;

    // === ВИКЛИК АВТОМАТИЗАЦІЙ ===
    await handleAutomationsClient({
      entityTypeId: entityType.value.id,
      entityId: inserted.id,
      triggerType: 'on_create',
      entityData: { ...form }
    });

    router.push(`/entities/${slug}/records`);
  } catch (err) {
    // toast.error('Не вдалося створити запис');
  } finally {
    saving.value = false;
  }
}
</script>
