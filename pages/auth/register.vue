<template>
  <div class="card max-w-md mx-auto">
    <h2 class="text-2xl font-bold mb-6 text-center">Create your account</h2>

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

      <div class="mb-4">
        <BaseInput
          v-model="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          :error="errors.password"
          required
        />
        <p class="mt-1 text-xs text-neutral-500">
          Password must be at least 8 characters long and include letters, numbers, and symbols.
        </p>
      </div>

      <div class="mb-6">
        <BaseInput
          v-model="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          :error="errors.confirmPassword"
          required
        />
      </div>

      <div class="mb-6">
        <BaseCheckbox
          v-model="acceptTerms"
          label="I accept the Terms of Service and Privacy Policy"
          :error="errors.acceptTerms"
        />
      </div>

      <BaseButton type="submit" variant="primary" block :loading="loading">
        Create account
      </BaseButton>

      <div class="mt-4 text-center">
        <p class="text-sm text-neutral-600">
          Already have an account?
          <NuxtLink to="/auth/login" class="text-primary-600 hover:underline">
            Sign in
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
const confirmPassword = ref('');
const acceptTerms = ref(false);
const loading = ref(false);

const errors = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: '',
  general: ''
});

const validatePassword = (value) => {
  return /[a-zA-Z]/.test(value) && /\d/.test(value) && /[!@#$%^&*(),.?":{}|<>]/.test(value);
};

const validateForm = () => {
  let isValid = true;

  errors.email = '';
  errors.password = '';
  errors.confirmPassword = '';
  errors.acceptTerms = '';
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
  } else if (password.value.length < 8) {
    errors.password = 'Password must be at least 8 characters';
    isValid = false;
  } else if (!validatePassword(password.value)) {
    errors.password = 'Password must include letters, numbers, and symbols';
    isValid = false;
  }

  if (password.value !== confirmPassword.value) {
    errors.confirmPassword = 'Passwords do not match';
    isValid = false;
  }

  if (!acceptTerms.value) {
    errors.acceptTerms = 'You must accept the Terms of Service and Privacy Policy';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  loading.value = true;

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`
      }
    });

    if (error) throw error;

    toast.success('Registration successful! Please check your email to verify your account.');
    router.push('/auth/login');
  } catch (error) {
    errors.general = error.message || 'An error occurred during registration';
    toast.error(errors.general);
  } finally {
    loading.value = false;
  }
};
</script>
