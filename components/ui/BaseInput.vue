<template>
  <div>
    <label :for="id" class="block text-sm font-medium text-neutral-700 mb-1">
      {{ label }}
    </label>
    <input
      :id="id"
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :class="[
        'block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2',
        error
          ? 'border-red-500 focus:ring-red-500'
          : 'border-neutral-300 focus:ring-primary-500',
      ]"
      :required="required"
    />
    <p v-if="error" class="mt-1 text-sm text-red-500">{{ error }}</p>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
  label: String,
  placeholder: String,
  type: {
    type: String,
    default: "text",
  },
  required: Boolean,
  error: String,
});

defineEmits(['update:modelValue']);

const id = `${Math.random().toString(36).substring(2, 10)}`;
</script>
