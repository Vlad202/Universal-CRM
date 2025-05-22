<template>
  <header class="bg-white shadow-sm">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-8">
          <NuxtLink to="/" class="flex items-center space-x-2">
            <span class="text-xl font-bold text-primary-600">😎 CRM</span>
          </NuxtLink>
          
          <nav v-if="user" class="hidden md:flex space-x-6">
            <NuxtLink to="/dashboard" class="text-neutral-600 hover:text-primary-600 transition-colors">
              Дашборд
            </NuxtLink>
            <NuxtLink to="/entities" class="text-neutral-600 hover:text-primary-600 transition-colors">
              Сутності
            </NuxtLink>
            <NuxtLink to="/users" class="text-neutral-600 hover:text-primary-600 transition-colors">
              Користувачі
            </NuxtLink>
          </nav>
        </div>
        
        <div class="flex items-center space-x-4">
          <template v-if="user">
            <div class="relative" ref="userMenuRef">
              <button 
                @click="toggleUserMenu" 
                class="flex items-center space-x-2 focus:outline-none"
              >
                <div class="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                  {{ userInitials }}
                </div>
                <span class="hidden md:inline-block text-sm font-medium">{{ user.email }}</span>
                <Icon icon="heroicons:chevron-down" class="text-neutral-500" />
              </button>
              
              <div 
                v-show="isUserMenuOpen" 
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
              >
                <NuxtLink :to="`/users/${user.id}/profile`" class="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                  Профіль
                </NuxtLink>
              </div>
            </div>
          </template>
          
          <template v-else>
            <NuxtLink to="/auth/login" class="btn btn-sm btn-outline">
              Увійти
            </NuxtLink>
            <NuxtLink to="/auth/register" class="btn btn-sm btn-primary">
              Вийти
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useSupabaseUser, useSupabaseClient } from '#imports';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { toast } from 'vue3-toastify';

const user = useSupabaseUser();
const supabase = useSupabaseClient();
const router = useRouter();
const isUserMenuOpen = ref(false);
const userMenuRef = ref(null);

const userInitials = computed(() => {
  if (!user.value || !user.value.email) return '';
  
  const email = user.value.email;
  return email.substring(0, 1).toUpperCase();
});

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    isUserMenuOpen.value = false;
  }
};

const handleLogout = async () => {
  try {
    await useNuxtApp().$supabaseauth.signOut();
    toast.success('Successfully signed out');
    router.push('/auth/login');
  } catch (error) {
    toast.error('Error signing out: ' + error.message);
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>