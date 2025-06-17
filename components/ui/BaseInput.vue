<template>
  <div>
    <label :for="id" class="block text-sm font-medium text-neutral-700 mb-1">
      {{ label }}
    </label>
    <template v-if="type === 'checkbox'">
      <input
        :id="id"
        type="checkbox"
        :checked="modelValue"
        @change="emit('update:modelValue', $event.target.checked)"
        :class="['h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500']"
      />
    </template>
    <template v-else>
      <input
        :id="id"
        :type="type"
        :placeholder="placeholder"
        :value="displayValue"
        @input="handleInput"
        :class="[
          'block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2',
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-neutral-300 focus:ring-primary-500',
        ]"
        :required="required"
      />
    </template>
    <p v-if="error" class="mt-1 text-sm text-red-500">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: [String, Number, Boolean],
  label: String,
  placeholder: String,
  type: {
    type: String,
    default: "text",
  },
  required: Boolean,
  error: String,
});

const emit = defineEmits(['update:modelValue']);

const displayValue = computed(() => {
  if (props.type === 'number' && props.modelValue == null) return '';
  return props.modelValue ?? '';
});

function handleInput(event) {
  let value = event.target.value;
  if (props.type === 'number') {
    value = value === '' ? null : Number(value);
  }
  emit('update:modelValue', value);
}

const id = `${Math.random().toString(36).substring(2, 10)}`;
</script>
