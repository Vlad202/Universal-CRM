<template>
  <div class="card">
    <h2 class="text-2xl font-bold mb-6">Reset your password</h2>
    <p class="text-neutral-600 mb-6">
      Enter your email address and we'll send you a link to reset your password.
    </p>
    
    <form @submit.prevent="handleSubmit">
      <div class="mb-6">
        <BaseInput
          v-model="email"
          label="Email address"
          type="email"
          placeholder="your@email.com"
          :error="errors.email"
          required
        />
      </div>
      
      <BaseButton
        type="submit"
        variant="primary"
        block
        :loading="loading"
      >
        Send reset link
      </BaseButton>
      
      <div class="mt-4 text-center">
        <NuxtLink to="/auth/login" class="text-sm text-primary-600 hover:underline">
          Back to login
        </NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useSupabaseClient } from '#imports';
import { toast } from 'vue3-toastify';

definePageMeta({
  layout: 'auth'
});

const supabase = useSupabaseClient();

const email = ref('');
const loading = ref(false);
const errors = reactive({
  email: '',
  general: ''
});

const validateForm = () => {
  let isValid = true;
  
  // Reset errors
  errors.email = '';
  errors.general = '';
  
  if (!email.value) {
    errors.email = 'Email is required';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.email = 'Please enter a valid email address';
    isValid = false;
  }
  
  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  
  loading.value = true;
  
  try {
    const { error } = await useNuxtApp().$supabaseauth.resetPasswordForEmail(email.value, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });
    
    if (error) throw error;
    
    toast.success('Password reset link sent to your email');
    email.value = '';
  } catch (error) {
    errors.general = error.message || 'An error occurred while sending reset link';
    toast.error(errors.general);
  } finally {
    loading.value = false;
  }
};
</script>