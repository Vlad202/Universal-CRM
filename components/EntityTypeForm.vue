// File: components/EntityTypeForm.vue (обновлённый)
<template>
  <form @submit.prevent="onSubmit">
    <!-- Basic Information -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">Basic Information</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BaseInput v-model="model.name" label="Entity Name" placeholder="e.g., Leads, Projects" :error="errors.name" required />
        <BaseInput v-model="model.slug" label="Slug" placeholder="e.g., leads, projects" :error="errors.slug" hint="Used in URLs" required />
      </div>
      <div class="mt-4">
        <BaseInput v-model="model.description" label="Description" placeholder="What does this entity represent?" :error="errors.description" />
      </div>
      <div class="mt-4">
        <BaseSelect v-model="model.icon" label="Icon" :options="iconOptions" :error="errors.icon" />
      </div>
    </div>

    <!-- Status Definitions -->
    <div class="mb-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Statuses</h2>
        <button type="button" class="btn btn-sm btn-outline" @click="addStatus">
          <Icon icon="heroicons:plus" class="h-4 w-4 mr-2" /> Add Status
        </button>
      </div>

      <div v-if="!model.statuses?.length" class="py-4 text-neutral-500 text-sm">No statuses defined</div>

      <div v-else class="space-y-3">
        <div
          v-for="(status, index) in model.statuses"
          :key="index"
          class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center"
        >
          <BaseInput v-model="status.name" label="Name" required />
          <BaseSelect
            v-model="status.color"
            label="Color"
            :options="colorOptions"
          />
          <div class="flex items-center space-x-2">
            <label class="text-sm"><input type="radio" :checked="status.is_default" @change="setDefaultStatus(index)" /> Default</label>
            <button @click="removeStatus(index)" type="button" class="text-neutral-400 hover:text-red-600">
              <Icon icon="heroicons:trash" class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Fields -->
    <div class="mb-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Fields</h2>
        <button type="button" class="btn btn-sm btn-outline" @click="emit('add-field')">
          <Icon icon="heroicons:plus" class="h-4 w-4 mr-2" /> Add Field
        </button>
      </div>

      <div v-if="!model.fields.length" class="text-center text-neutral-500 py-6">
        No fields added. Click "Add Field" to start defining your entity's structure.
      </div>

      <div v-else class="space-y-6">
        <div
          v-for="(field, index) in model.fields"
          :key="index"
          class="border border-neutral-200 rounded-lg p-4"
        >
          <div class="flex justify-between items-center mb-3">
            <h3 class="font-medium">Field #{{ index + 1 }}</h3>
            <button type="button" @click="emit('remove-field', index)" class="text-neutral-400 hover:text-red-500">
              <Icon icon="heroicons:trash" class="h-5 w-5" />
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BaseInput v-model="field.name" label="Field Name" required :error="fieldErrors?.[index]?.name" />
            <BaseInput v-model="field.label" label="Label" required :error="fieldErrors?.[index]?.label" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <BaseSelect
              v-model="field.type"
              label="Field Type"
              :options="fieldTypes"
              @update:model-value="(val) => emit('update-field', { index, field: { ...field, type: val } })"
            />
            <BaseInput v-model="field.placeholder" label="Placeholder" />
          </div>

          <div v-if="field.type === 'select'" class="mt-4">
            <label class="label">Options</label>
            <div class="space-y-2">
              <div v-for="(opt, i) in field.options || []" :key="i" class="flex space-x-2">
                <BaseInput v-model="opt.label" placeholder="Label" class="flex-1" />
                <BaseInput v-model="opt.value" placeholder="Value" class="flex-1" />
                <button type="button" @click="() => field.options.splice(i, 1)" class="text-neutral-400 hover:text-red-500">
                  <Icon icon="heroicons:x-mark" class="h-5 w-5" />
                </button>
              </div>
              <button type="button" class="btn btn-sm btn-outline w-full" @click="() => (field.options = [...(field.options || []), { label: '', value: '' }])">
                Add Option
              </button>
            </div>
          </div>

          <div v-if="field.type === 'relation'" class="mt-4">
            <BaseSelect
              v-model="field.entityTypeId"
              label="Related Entity"
              :options="entityTypeOptions"
              placeholder="Select related entity"
              :error="fieldErrors?.[index]?.entityTypeId"
            />
          </div>

          <div class="mt-4">
            <BaseCheckbox v-model="field.required" label="Required Field" />
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="border-t border-neutral-200 pt-6 flex justify-end space-x-4">
      <NuxtLink to="/entities" class="btn btn-secondary">Cancel</NuxtLink>
      <BaseButton type="submit" variant="primary" :loading="loading">{{ submitLabel }}</BaseButton>
    </div>
  </form>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { useEntityForm } from '@/composables/useEntityForm';
const { fieldTypes } = useEntityForm();

const props = defineProps({
  model: Object,
  errors: Object,
  fieldErrors: Array,
  iconOptions: Array,
  entityTypeOptions: Array,
  loading: Boolean,
  submitLabel: String
});

const emit = defineEmits(['submit', 'add-field', 'remove-field', 'update-field']);

const addStatus = () => {
  if (!props.model.statuses) props.model.statuses = [];
  props.model.statuses.push({ name: '', color: 'gray', is_default: props.model.statuses.length === 0 });
};

const removeStatus = (index) => {
  props.model.statuses.splice(index, 1);
};

const setDefaultStatus = (index) => {
  props.model.statuses.forEach((s, i) => (s.is_default = i === index));
};

const colorOptions = [
  'gray', 'red', 'yellow', 'green', 'blue', 'indigo', 'purple', 'pink'
].map(c => ({ label: c.charAt(0).toUpperCase() + c.slice(1), value: c }));

const onSubmit = () => emit('submit');
</script>
