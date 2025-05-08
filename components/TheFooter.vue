<template>
  <footer class="bg-white border-t border-neutral-200 py-6">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row justify-between items-center">
        <div class="mb-4 md:mb-0">
          <p class="text-sm text-neutral-500">
            &copy; {{ currentYear }} NuxtCRM. All rights reserved.
          </p>
        </div>
        <div class="flex space-x-6">
          <a href="#" class="text-sm text-neutral-500 hover:text-primary-600 transition-colors">
            Privacy Policy
          </a>
          <a href="#" class="text-sm text-neutral-500 hover:text-primary-600 transition-colors">
            Terms of Service
          </a>
          <a href="#" class="text-sm text-neutral-500 hover:text-primary-600 transition-colors">
            Contact
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const currentYear = ref(new Date().getFullYear());
</script>