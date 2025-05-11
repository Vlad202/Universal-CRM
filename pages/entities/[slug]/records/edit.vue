// File: pages/entities/[slug]/records/[id]/edit.vue
<template>
  <div class="container mx-auto px-4 py-8 max-w-3xl">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-neutral-900">Edit {{ entityType?.name || 'Record' }}</h1>
      <p class="text-neutral-600 mt-1" v-if="entityType?.description">{{ entityType.description }}</p>
    </div>

    <BaseLoader v-if="loading" />

    <EntityRecordForm
      v-else
      :form="form"
      :entity-type="entityType"
      :statuses="statuses"
      :loading="saving"
      submit-label="Update"
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
  try {
    const { data: type } = await supabase.from('entity_types').select('*').eq('slug', slug).single();
    if (!type) throw new Error('Entity type not found');
    entityType.value = type;

    const { data: record } = await supabase
      .from('entity_records')
      .select('*')
      .eq('id', recordId)
      .single();

    if (!record || record.entity_type_id !== type.id) throw new Error('Record not found');
    Object.assign(form, record.data);

    const { data: statusList } = await supabase
      .from('status_definitions')
      .select('*')
      .eq('entity_type_id', type.id);
    statuses.value = statusList || [];
  } catch (err) {
    toast.error('Failed to load record');
    router.push(`/entities/${slug}/records`);
  } finally {
    loading.value = false;
  }
});

async function handleSubmit() {
  saving.value = true;
  try {
    const { error } = await supabase
      .from('entity_records')
      .update({ data: { ...form }, updated_at: new Date().toISOString() })
      .eq('id', recordId);

    if (error) throw error;
    toast.success('Record updated');
    router.push(`/entities/${slug}/records`);
  } catch (err) {
    toast.error('Failed to update record');
  } finally {
    saving.value = false;
  }
}
</script>
