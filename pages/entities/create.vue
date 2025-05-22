<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-neutral-900">Створити тип сутності</h1>
      <p class="text-neutral-600 mt-2">Створіть нову сутність для вашої CRM.</p>
    </div>
    <div class="card max-w-4xl mx-auto">
      <EntityTypeForm
        :model="entityType"
        :errors="errors"
        :field-errors="fieldErrors"
        :icon-options="iconOptions"
        :entity-type-options="entityTypeOptions"
        :loading="loading"
        submit-label="Створіть сутність"
        @submit="handleSubmit"
        @add-field="addField"
        @remove-field="removeField"
        @update-field="updateField"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useEntityTypesStore } from '~/stores/entityTypes';
import { useEntityForm } from '~/composables/useEntityForm';
import EntityTypeForm from '@/components/EntityTypeForm.vue';
import { toast } from 'vue3-toastify';

const router = useRouter();
const store = useEntityTypesStore();
const { createEmptyField, validateField } = useEntityForm();

const loading = ref(false);
const errors = reactive({});
const fieldErrors = ref([]);

const entityType = reactive({
  name: '',
  slug: '',
  description: '',
  icon: 'squares-2x2',
  fields: []
});

const iconOptions = [
  { label: 'За замовчуванням', value: 'squares-2x2' },
  { label: 'Користувач', value: 'user' },
  { label: 'Будівля', value: 'building-office' },
  { label: 'Документ', value: 'document-text' },
  { label: 'Валюта', value: 'currency-dollar' },
  { label: 'Календар', value: 'calendar' },
  { label: 'Діаграма', value: 'chart-bar' },
  { label: 'Портфель', value: 'briefcase' },
  { label: 'Кошик', value: 'shopping-cart' },
  { label: 'Глобус', value: 'globe-alt' },
  { label: 'Телефон', value: 'phone' },
  { label: 'Пошта', value: 'envelope' }
];

const entityTypeOptions = computed(() =>
  store.entityTypes.map(et => ({ label: et.name, value: et.id }))
);

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
  errors.name = entityType.name ? '' : 'Назва обов\'язкова';
  errors.slug = /^[a-z0-9-]+$/.test(entityType.slug || '') ? '' : 'Слаг повинен містити малі літери, цифри та дефіси';
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
    await store.createEntityType(entityType);
    // toast.success('Entity created');
    router.push('/entities');
  } catch (err) {
    // toast.error('Creation failed');
  } finally {
    loading.value = false;
  }
};
</script>
