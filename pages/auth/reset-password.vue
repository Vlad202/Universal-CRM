<template>
  <div class="card">
    <h2 class="text-2xl font-bold mb-6">Create new password</h2>
    <p class="text-neutral-600 mb-6">
      Please enter your new password below.
    </p>
    
    <form @submit.prevent="handleSubmit">
      <div class="mb-4">
        <BaseInput
          v-model="password"
          label="New password"
          type="password"
          placeholder="••••••••"
          :error="errors.password"
          required
        />
        <p class="mt-1 text-xs text-neutral-500">
          Password must be at least 8 characters long and include a mix of letters, numbers, and symbols.
        </p>
      </div>
      
      <div class="mb-6">
        <BaseInput
          v-model="confirmPassword"
          label="Confirm new password"
          type="password"
          placeholder="••••••••"
          :error="errors.confirmPassword"
          required
        />
      </div>
      
      <BaseButton
        type="submit"
        variant="primary"
        block
        :loading="loading"
      >
        Reset password
      </BaseButton>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useSupabaseClient } from '#imports';
import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';

definePageMeta({
  layout: 'auth'
});

const supabase = useSupabaseClient();
const router = useRouter();

const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const errors = reactive({
  password: '',
  confirmPassword: '',
  general: ''
});

const validateForm = () => {
  let isValid = true;
  
  // Reset errors
  errors.password = '';
  errors.confirmPassword = '';
  errors.general = '';
  
  if (!password.value) {
    errors.password = 'Password is required';
    isValid = false;
  } else if (password.value.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
    isValid = false;
  }
  
  if (password.value !== confirmPassword.value) {
    errors.confirmPassword = 'Passwords do not match';
    isValid = false;
  }
  
  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  
  loading.value = true;
  
  try {
    const { error } = await useNuxtApp().$supabaseauth.updateUser({
      password: password.value
    });
    
    if (error) throw error;
    
    toast.success('Password has been reset successfully');
    router.push('/auth/login');
  } catch (error) {
    errors.general = error.message || 'An error occurred while resetting password';
    toast.error(errors.general);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  // Check if we have a session, if not redirect to login
  const checkSession = async () => {
    const { data } = await useNuxtApp().$supabaseauth.getSession();
    if (!data.session) {
      toast.error('Password reset link is invalid or has expired');
      router.push('/auth/login');
    }
  };
  
  checkSession();
});
</script>