<template>
  <div class="flex items-start">
    <div class="flex items-center h-5">
      <input
        :id="id"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        class="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
        @change="$emit('update:modelValue', $event.target.checked)"
      />
    </div>
    <div class="ml-3 text-sm">
      <label :for="id" class="font-medium text-neutral-700">{{ label }}</label>
      <p v-if="description" class="text-neutral-500">{{ description }}</p>
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
});

defineEmits(['update:modelValue']);

const id = computed(() => {
  return `checkbox-${Math.random().toString(36).substring(2, 9)}`;
});
</script>