<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-neutral-900">Редагувати тип сутності</h1>
      <p class="text-neutral-600 mt-2">Оновіть конфігурацію Вашої сутності.</p>
    </div>
    <div class="card max-w-4xl mx-auto">
      <EntityTypeForm
        :model="entityType"
        :errors="errors"
        :field-errors="fieldErrors"
        :icon-options="iconOptions"
        :entity-type-options="entityTypeOptions"
        :loading="loading"
        submit-label="Оновити сутність"
        @submit="handleSubmit"
        @add-field="addField"
        @remove-field="removeField"
        @update-field="updateField"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { ref, reactive, onMounted, computed } from 'vue';
import { useEntityTypesStore } from '~/stores/entityTypes';
import EntityTypeForm from '@/components/EntityTypeForm.vue';
import { useEntityForm } from '~/composables/useEntityForm';
import { toast } from 'vue3-toastify';

const route = useRoute();
const router = useRouter();
const store = useEntityTypesStore();
const { createEmptyField, validateField } = useEntityForm();

const loading = ref(false);
const errors = reactive({});
const fieldErrors = ref([]);

const entityType = reactive({
  id: '',
  name: '',
  slug: '',
  description: '',
  icon: '',
  fields: []
});

const iconOptions = [
  { label: 'Default', value: 'squares-2x2' },
  { label: 'User', value: 'user' },
  { label: 'Building', value: 'building-office' },
  { label: 'Document', value: 'document-text' },
  { label: 'Currency', value: 'currency-dollar' },
  { label: 'Calendar', value: 'calendar' },
  { label: 'Chart', value: 'chart-bar' },
  { label: 'Briefcase', value: 'briefcase' },
  { label: 'Shopping Cart', value: 'shopping-cart' },
  { label: 'Globe', value: 'globe-alt' },
  { label: 'Phone', value: 'phone' },
  { label: 'Mail', value: 'envelope' }
];

const entityTypeOptions = computed(() => store.entityTypes.map(et => ({ label: et.name, value: et.id })));

onMounted(async () => {
  loading.value = true;
  const data = await store.getEntityTypeBySlug(route.params.slug as string);
  if (data) Object.assign(entityType, structuredClone(data));
  loading.value = false;
});

const addField = () => {
  entityType.fields.push(createEmptyField());
  fieldErrors.value.push({});
};

const removeField = index => {
  entityType.fields.splice(index, 1);
  fieldErrors.value.splice(index, 1);
};

const updateField = ({ index, field }) => {
  entityType.fields[index] = field;
};

const handleSubmit = async () => {
  console.log('Submitting form', entityType);
  fieldErrors.value = entityType.fields.map(() => ({}));
  let isValid = true;

  errors.name = entityType.name ? '' : 'Name is required';
  errors.slug = /^[a-z0-9-]+$/.test(entityType.slug || '') ? '' : 'Slug must contain lowercase letters, numbers, and hyphens';
  if (!entityType.name || errors.slug) isValid = false;

  entityType.fields.forEach((field, index) => {
    const err = validateField(field);
    if (err) {
      fieldErrors.value[index] = { general: err };
      isValid = false;
    }
  });

  if (!isValid) {
    // toast.error('Please fix the form errors.');
    return;
  }

  loading.value = true;
  try {
    console.log('Updating entity type:', entityType);
    await store.updateEntityType(entityType.id, entityType);
    // toast.success('Entity updated');
    router.push('/entities');
  } catch (err) {
    toast.error('Update failed');
  } finally {
    loading.value = false;
  }
};
</script>
