<template>
  <div class="card max-w-md mx-auto">
    <h2 class="text-2xl font-bold mb-6 text-center">Sign in to your account</h2>

    <form @submit.prevent="handleSubmit" novalidate>
      <div v-if="errors.general" class="mb-4 text-red-600 text-sm text-center">
        {{ errors.general }}
      </div>

      <div class="mb-4">
        <BaseInput
          v-model="email"
          label="Email address"
          type="email"
          placeholder="your@email.com"
          :error="errors.email"
          required
        />
      </div>

      <div class="mb-6">
        <BaseInput
          v-model="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          :error="errors.password"
          required
        />
      </div>

      <div class="flex items-center justify-between mb-6">
        <BaseCheckbox v-model="rememberMe" label="Remember me" />

        <NuxtLink
          to="/auth/reset-password-request"
          class="text-sm text-primary-600 hover:underline"
        >
          Forgot password?
        </NuxtLink>
      </div>

      <BaseButton type="submit" variant="primary" block :loading="loading">
        Sign in
      </BaseButton>

      <div class="mt-4 text-center">
        <p class="text-sm text-neutral-600">
          Don't have an account?
          <NuxtLink to="/auth/register" class="text-primary-600 hover:underline">
            Create one
          </NuxtLink>
        </p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import { useSupabaseClient } from '#imports';

import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCheckbox from '@/components/ui/BaseCheckbox.vue';

definePageMeta({
  layout: 'auth'
});

const supabase = useSupabaseClient();
const router = useRouter();

const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const loading = ref(false);

const errors = reactive({
  email: '',
  password: '',
  general: ''
});

const validateForm = () => {
  let isValid = true;

  errors.email = '';
  errors.password = '';
  errors.general = '';

  if (!email.value.trim()) {
    errors.email = 'Email is required';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.email = 'Please enter a valid email address';
    isValid = false;
  }

  if (!password.value) {
    errors.password = 'Password is required';
    isValid = false;
  } else if (password.value.length < 6) {
    errors.password = 'Password must be at least 6 characters';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  loading.value = true;
  errors.general = '';

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    });

    if (error) throw error;

    toast.success('Successfully signed in');
    router.push('/dashboard');
  } catch (error) {
    errors.general = error.message || 'Unexpected error during sign-in';
    toast.error(errors.general);
  } finally {
    loading.value = false;
  }
};
</script>
