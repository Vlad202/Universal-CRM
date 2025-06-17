<template>
  <div class="container mx-auto px-4 py-10 max-w-5xl">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-neutral-900">Користувачі</h1>
        <p class="text-neutral-600 text-sm">
          Управління обліковими записами користувачів
        </p>
      </div>
      <button
        v-if="isAdmin"
        class="btn btn-primary"
        @click="showCreateModal = true"
      >
        + Створити користувача
      </button>
    </div>

    <BaseLoader v-if="loading" />
    <div v-else class="grid gap-4">
      <div
        v-for="user in users"
        :key="user.id"
        class="p-4 border rounded-lg bg-white shadow-sm"
      >
        <div class="flex justify-between items-center">
          <div>
            <p class="font-semibold">
            <NuxtLink :to="`/users/${user.id}/profile`" class="text-neutral-600 hover:text-primary-600 transition-colors">
              {{ getFullName(user) }}
            </NuxtLink>
              <span
                v-if="user.id === currentUser.value?.id"
                class="text-xs text-primary-500"
                >(ви)</span
              >
            </p>
            <p class="text-sm text-neutral-500">{{ user.email }}</p>
            <span
              class="text-xs bg-neutral-100 px-2 py-1 rounded"
              :class="
                user.user_metadata?.role === 'admin'
                  ? 'text-red-600'
                  : 'text-blue-600'
              "
            >
              {{ mapRole(user.user_metadata?.role) }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="isAdmin && user.id !== currentUser?.id"
              class="text-sm text-red-600 underline hover:text-red-800"
              @click="confirmDelete(user)"
            >
              Видалити
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Створення -->
    <CreateUserModal
      v-if="showCreateModal"
      v-model="showCreateModal"
      @created="fetchUsers"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useSupabaseClient, useSupabaseUser } from "#imports";
import BaseLoader from "@/components/ui/BaseLoader.vue";
import CreateUserModal from "@/components/modals/CreateUserModal.vue";

const supabase = useSupabaseClient();
const currentUser = useSupabaseUser();

const users = ref([]);
const loading = ref(false);
const showCreateModal = ref(false);

const isAdmin = computed(
  () => currentUser.value?.user_metadata?.role === "admin"
);

async function fetchUsers() {
  loading.value = true;
  const { data, error } = await supabase.auth.admin.listUsers();
  if (!error) users.value = data.users;
  loading.value = false;
}

function getFullName(user) {
  const meta = user.user_metadata || {};
  return (
    [meta.first_name, meta.last_name].filter(Boolean).join(" ") || user.email
  );
}

function mapRole(role) {
  if (role === "admin") return "Адміністратор";
  if (role === "manager") return "Менеджер";
  return "Користувач";
}

async function confirmDelete(user) {
  const fullName = getFullName(user);
  const ok = confirm(
    `Ви впевнені, що хочете видалити користувача "${fullName}"?`
  );
  if (!ok) return;

  const { error } = await supabase.auth.admin.deleteUser(user.id);
  if (error) {
    alert("Не вдалося видалити користувача");
    console.error(error);
    return;
  }

  await fetchUsers();
}
onMounted(fetchUsers);
</script>
