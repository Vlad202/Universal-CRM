<template>
  <div class="container mx-auto px-4 py-10 max-w-3xl">
    <div class="card p-6">
      <h1 class="text-3xl font-bold text-neutral-900 mb-6">My Profile</h1>

      <div v-if="user" class="space-y-4">
        <div class="flex items-center space-x-4">
          <div class="w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center text-xl font-medium text-neutral-700">
            {{ initials }}
          </div>
          <div>
            <h2 class="text-xl font-semibold text-neutral-800">{{ user.user_metadata.full_name || user.email }}</h2>
            <p class="text-sm text-neutral-500">{{ user.email }}</p>
          </div>
        </div>

        <div class="border-t border-neutral-200 pt-6">
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt class="text-sm font-medium text-neutral-500">User ID</dt>
              <dd class="text-base text-neutral-800 truncate">{{ user.id }}</dd>
            </div>

            <div>
              <dt class="text-sm font-medium text-neutral-500">Created At</dt>
              <dd class="text-base text-neutral-800">{{ formatDate(user.created_at) }}</dd>
            </div>

            <div v-if="user.phone">
              <dt class="text-sm font-medium text-neutral-500">Phone</dt>
              <dd class="text-base text-neutral-800">{{ user.phone }}</dd>
            </div>

            <div>
              <dt class="text-sm font-medium text-neutral-500">Provider</dt>
              <dd class="text-base text-neutral-800">{{ user.app_metadata.provider }}</dd>
            </div>
          </dl>
        </div>

        <div class="pt-6">
          <BaseButton @click="logout" variant="destructive">Sign Out</BaseButton>
        </div>
      </div>

      <div v-else class="text-center py-10 text-neutral-500">
        Loading profile...
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSupabaseUser, useSupabaseClient } from '#imports';
import { useRouter } from 'vue-router';
import { format } from 'date-fns';
import BaseButton from '@/components/ui/BaseButton.vue';

const router = useRouter();
const supabase = useSupabaseClient();
const user = useSupabaseUser();

const initials = computed(() => {
  if (!user.value) return '';
  const name = user.value.user_metadata?.full_name || user.value.email;
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
});

function formatDate(dateStr) {
  return format(new Date(dateStr), 'PPP');
}

const logout = async () => {
  await supabase.auth.signOut();
  router.push('/auth/login');
};
</script>

<style scoped>
.card {
  @apply bg-white shadow rounded-xl border border-neutral-200;
}
</style>
