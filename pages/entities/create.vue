<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-neutral-900">Create Entity Type</h1>
      <p class="text-neutral-600 mt-2">Define a new custom entity for your CRM.</p>
    </div>
    
    <div class="card max-w-4xl mx-auto">
      <form @submit.prevent="handleSubmit">
        <!-- Basic Information -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold mb-4">Basic Information</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BaseInput
              v-model="entityType.name"
              label="Entity Name"
              placeholder="e.g., Leads, Projects, Clients"
              :error="errors.name"
              required
            />
            
            <BaseInput
              v-model="entityType.slug"
              label="Slug"
              placeholder="e.g., leads, projects, clients"
              :error="errors.slug"
              hint="Used in URLs and for identification. Lowercase with no spaces."
              required
            />
          </div>
          
          <div class="mt-4">
            <BaseInput
              v-model="entityType.description"
              label="Description"
              placeholder="Describe what this entity represents in your business"
              :error="errors.description"
            />
          </div>
          
          <div class="mt-4">
            <BaseSelect
              v-model="entityType.icon"
              label="Icon"
              :options="iconOptions"
              :error="errors.icon"
            />
          </div>
        </div>
        
        <!-- Fields -->
        <div class="mb-8">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Fields</h2>
            <button 
              type="button" 
              @click="addField"
              class="btn btn-sm btn-outline"
            >
              <Icon icon="heroicons:plus" class="h-4 w-4 mr-2" />
              Add Field
            </button>
          </div>
          
          <div v-if="!entityType.fields.length" class="text-center py-8 border border-dashed border-neutral-300 rounded-md">
            <p class="text-neutral-500">No fields added yet. Click "Add Field" to create your first field.</p>
          </div>
          
          <div v-else class="space-y-6">
            <div 
              v-for="(field, index) in entityType.fields" 
              :key="field.id"
              class="border border-neutral-200 rounded-md p-4"
            >
              <div class="flex justify-between mb-4">
                <h3 class="font-medium">Field #{{ index + 1 }}</h3>
                <button 
                  type="button" 
                  @click="() => removeField(index)"
                  class="text-neutral-400 hover:text-error-600"
                >
                  <Icon icon="heroicons:trash" class="h-5 w-5" />
                </button>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BaseInput
                  v-model="field.name"
                  label="Field Name"
                  placeholder="e.g., firstName, amount, dueDate"
                  :error="fieldErrors[index]?.name"
                  required
                />
                
                <BaseInput
                  v-model="field.label"
                  label="Field Label"
                  placeholder="e.g., First Name, Amount, Due Date"
                  :error="fieldErrors[index]?.label"
                  required
                />
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <BaseSelect
                  v-model="field.type"
                  label="Field Type"
                  :options="fieldTypeOptions"
                  :error="fieldErrors[index]?.type"
                  @update:model-value="handleFieldTypeChange(index, $event)"
                />
                
                <BaseInput
                  v-model="field.placeholder"
                  label="Placeholder"
                  placeholder="Enter placeholder text"
                />
              </div>
              
              <div v-if="field.type === 'select'" class="mt-4">
                <label class="label">Options</label>
                <div class="border border-neutral-200 rounded-md p-4 space-y-3">
                  <div 
                    v-for="(option, optionIndex) in field.options || []" 
                    :key="optionIndex"
                    class="flex items-center space-x-2"
                  >
                    <BaseInput
                      v-model="option.label"
                      placeholder="Option label"
                      class="flex-1"
                    />
                    <BaseInput
                      v-model="option.value"
                      placeholder="Option value"
                      class="flex-1"
                    />
                    <button 
                      type="button" 
                      @click="() => removeOption(index, optionIndex)"
                      class="text-neutral-400 hover:text-error-600"
                    >
                      <Icon icon="heroicons:x-mark" class="h-5 w-5" />
                    </button>
                  </div>
                  
                  <button 
                    type="button" 
                    @click="() => addOption(index)"
                    class="btn btn-sm btn-outline w-full"
                  >
                    <Icon icon="heroicons:plus" class="h-4 w-4 mr-2" />
                    Add Option
                  </button>
                </div>
              </div>
              
              <div v-if="field.type === 'relation'" class="mt-4">
                <BaseSelect
                  v-model="field.entityTypeId"
                  label="Related Entity"
                  :options="entityTypeOptions"
                  :error="fieldErrors[index]?.entityTypeId"
                  placeholder="Select related entity"
                />
              </div>
              
              <div class="mt-4">
                <BaseCheckbox
                  v-model="field.required"
                  label="Required field"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div class="border-t border-neutral-200 pt-6 flex justify-end space-x-4">
          <NuxtLink to="/entities" class="btn btn-secondary">
            Cancel
          </NuxtLink>
          <BaseButton 
            type="submit" 
            variant="primary"
            :loading="loading"
          >
            Create Entity
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useEntityTypesStore } from '~/stores/entityTypes';
import { useEntityForm } from '~/composables/useEntityForm';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { toast } from 'vue3-toastify';

import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCheckbox from '@/components/ui/BaseCheckbox.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';

definePageMeta({
  middleware: ['auth']
});

const router = useRouter();
const entityTypesStore = useEntityTypesStore();
const { fieldTypes, createEmptyField, validateField } = useEntityForm();

const loading = ref(false);
const errors = reactive({
  name: '',
  slug: '',
  description: '',
  icon: '',
  general: ''
});
const fieldErrors = ref([]);

const entityType = reactive({
  name: '',
  slug: '',
  description: '',
  icon: 'squares-2x2',
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

const fieldTypeOptions = computed(() => {
  return fieldTypes.value.map(type => ({
    label: type.label,
    value: type.value
  }));
});

const entityTypeOptions = computed(() => {
  return entityTypesStore.entityTypes.map(et => ({
    label: et.name,
    value: et.id
  }));
});

const addField = () => {
  entityType.fields.push(createEmptyField());
  fieldErrors.value.push({});
};

const removeField = (index) => {
  entityType.fields.splice(index, 1);
  fieldErrors.value.splice(index, 1);
};

const handleFieldTypeChange = (index, newType) => {
  const field = entityType.fields[index];
  const newField = createEmptyField(newType);
  
  // Preserve existing values
  newField.id = field.id;
  newField.name = field.name;
  newField.label = field.label;
  newField.placeholder = field.placeholder;
  newField.required = field.required;
  
  // Replace the field
  entityType.fields.splice(index, 1, newField);
};

const addOption = (fieldIndex) => {
  if (!entityType.fields[fieldIndex].options) {
    entityType.fields[fieldIndex].options = [];
  }
  
  entityType.fields[fieldIndex].options.push({ label: '', value: '' });
};

const removeOption = (fieldIndex, optionIndex) => {
  entityType.fields[fieldIndex].options.splice(optionIndex, 1);
};

const validateForm = () => {
  let isValid = true;
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key] = '';
  });
  
  fieldErrors.value = entityType.fields.map(() => ({}));
  
  // Validate basic info
  if (!entityType.name) {
    errors.name = 'Entity name is required';
    isValid = false;
  }
  
  if (!entityType.slug) {
    errors.slug = 'Slug is required';
    isValid = false;
  } else if (!/^[a-z0-9-]+$/.test(entityType.slug)) {
    errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
    isValid = false;
  }
  
  // Validate fields
  entityType.fields.forEach((field, index) => {
    const fieldError = validateField(field);
    if (fieldError) {
      fieldErrors.value[index] = { general: fieldError };
      
      if (!field.name) fieldErrors.value[index].name = 'Field name is required';
      if (!field.label) fieldErrors.value[index].label = 'Field label is required';
      if (field.type === 'select' && (!field.options || field.options.length === 0)) {
        fieldErrors.value[index].type = 'Select field must have at least one option';
      }
      if (field.type === 'relation' && !field.entityTypeId) {
        fieldErrors.value[index].entityTypeId = 'You must select a related entity';
      }
      
      isValid = false;
    }
  });
  
  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    toast.error('Please fix the errors in the form');
    return;
  }
  
  loading.value = true;
  
  try {
    const result = await entityTypesStore.createEntityType(entityType);
    
    if (result) {
      toast.success(`Entity "${entityType.name}" created successfully`);
      router.push('/entities');
    } else {
      throw new Error('Failed to create entity');
    }
  } catch (error) {
    errors.general = error.message || 'An error occurred while creating the entity';
    toast.error(errors.general);
  } finally {
    loading.value = false;
  }
};
</script>