<template>
  <v-md-editor v-model="text" height="400px" />
</template>

<script setup>
const text = ref('Hello **markdown**')
</script>
