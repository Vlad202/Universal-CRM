<template>
  <div class="border border-neutral-200 rounded-md p-4">
    <div class="flex justify-between mb-4">
      <h3 class="font-medium">Field #{{ index + 1 }}</h3>
      <button type="button" @click="$emit('remove', index)" class="text-neutral-400 hover:text-error-600">
        <Icon icon="heroicons:trash" class="h-5 w-5" />
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <BaseInput v-model="field.name" label="Field Name" placeholder="e.g., firstName, amount" :error="errors.name" required />
      <BaseInput v-model="field.label" label="Field Label" placeholder="e.g., First Name, Amount" :error="errors.label" required />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <BaseSelect
        v-model="field.type"
        label="Field Type"
        :options="fieldTypeOptions"
        :error="errors.type"
        @update:model-value="handleFieldTypeChange"
      />
      <BaseInput v-model="field.placeholder" label="Placeholder" placeholder="Enter placeholder text" />
    </div>

    <div v-if="field.type === 'select'" class="mt-4">
      <label class="label">Options</label>
      <div class="border border-neutral-200 rounded-md p-4 space-y-3">
        <div
          v-for="(option, optionIndex) in field.options || []"
          :key="optionIndex"
          class="flex items-center space-x-2"
        >
          <BaseInput v-model="option.label" placeholder="Option label" class="flex-1" />
          <BaseInput v-model="option.value" placeholder="Option value" class="flex-1" />
          <button type="button" @click="removeOption(optionIndex)" class="text-neutral-400 hover:text-error-600">
            <Icon icon="heroicons:x-mark" class="h-5 w-5" />
          </button>
        </div>

        <button type="button" @click="addOption" class="btn btn-sm btn-outline w-full">
          <Icon icon="heroicons:plus" class="h-4 w-4 mr-2" /> Add Option
        </button>
      </div>
    </div>

    <div v-if="field.type === 'relation'" class="mt-4">
      <BaseSelect
        v-model="field.entityTypeId"
        label="Related Entity"
        :options="entityTypeOptions"
        :error="errors.entityTypeId"
        placeholder="Select related entity"
      />
    </div>

    <div class="mt-4">
      <BaseCheckbox v-model="field.required" label="Required field" />
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseCheckbox from '@/components/ui/BaseCheckbox.vue';

const props = defineProps({
  index: Number,
  field: Object,
  errors: Object,
  entityTypeOptions: Array
});

const emit = defineEmits(['remove', 'update']);

const fieldTypeOptions = [
  { label: 'Text', value: 'text' },
  { label: 'Number', value: 'number' },
  { label: 'Date', value: 'date' },
  { label: 'Select', value: 'select' },
  { label: 'Relation', value: 'relation' }
];

const handleFieldTypeChange = (value) => {
  const updatedField = {
    ...props.field,
    type: value,
    options: value === 'select' ? [{ label: '', value: '' }] : undefined,
    entityTypeId: value === 'relation' ? '' : undefined
  };
  emit('update', props.index, updatedField);
};

const addOption = () => {
  if (!props.field.options) props.field.options = [];
  props.field.options.push({ label: '', value: '' });
};

const removeOption = (i) => {
  props.field.options.splice(i, 1);
};
</script>
