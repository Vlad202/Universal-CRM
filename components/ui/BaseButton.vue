<template>
  <button
    :type="type"
    @click="$emit('click', $event)"
    :class="[
      'inline-flex items-center justify-center rounded-md px-4 py-2 font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
      variant === 'primary'
        ? 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500'
        : '',
      variant === 'outline'
        ? 'border border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500'
        : '',
      block ? 'w-full' : '',
      loading ? 'opacity-60 cursor-not-allowed' : '',
    ]"
    :disabled="loading"
  >
    <span v-if="!loading">
      <slot />
    </span>
    <span
      v-else
      class="loader h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
    ></span>
  </button>
</template>

<script setup>
defineEmits(["click"]); // 👈 добавь это
defineProps({
  type: {
    type: String,
    default: "button",
  },
  variant: {
    type: String,
    default: "primary",
  },
  block: Boolean,
  loading: Boolean,
});
</script>

<style scoped>
.loader {
  display: inline-block;
  border-width: 2px;
  border-radius: 9999px;
  border-top-color: transparent;
  border-right-color: currentColor;
  border-bottom-color: currentColor;
  border-left-color: currentColor;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
