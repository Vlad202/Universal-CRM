<template>
  <Icon :icon="name" :class="computedClass" />
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { computed } from "vue";

const props = defineProps({
  name: String,
  size: {
    type: String,
    default: "md", // options: sm, md, lg
  },
  class: String,
});

const sizeClassMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

const computedClass = computed(() => {
  return [sizeClassMap[props.size] || sizeClassMap.md, props.class].join(" ");
});
</script>
