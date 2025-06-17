<template>
  <div>
    <label :for="id" class="block text-sm font-medium text-neutral-700 mb-1">
      {{ label }}
    </label>

    <select
      :id="id"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      :class="[
        'block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2',
        error ? 'border-red-500 focus:ring-red-500' : 'border-neutral-300 focus:ring-primary-500'
      ]"
    >
      <option disabled value="">Оберіть опцію</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>

    <p v-if="error" class="mt-1 text-sm text-red-500">{{ error }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: String,
  label: String,
  options: {
    type: Array,
    required: true
  },
  error: String
});

const id = `${Math.random().toString(36).substring(2, 10)}`;
</script>
