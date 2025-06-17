<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4"
        @click.self="close"
      >
        <div
          class="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6"
          @keydown.esc="close"
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-neutral-900">
              <slot name="title">Модальне вікно</slot>
            </h2>
            <button @click="close" class="text-neutral-400 hover:text-neutral-600 transition text-xl">&times;</button>
          </div>

          <!-- Body -->
          <div>
            <slot />
          </div>

          <!-- Footer -->
          <div class="mt-6 pt-4 border-t border-neutral-200 text-right">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, required: true }
});

const emit = defineEmits(['update:modelValue']);

function close() {
  emit('update:modelValue', false);
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
