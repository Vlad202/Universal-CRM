<template>
  <div class="container mx-auto px-4 py-10 max-w-3xl">
    <div class="card p-6">
      <h1 class="text-3xl font-bold text-neutral-900 mb-6">
        {{ isMyProfile ? "Мій профіль" : "Профіль користувача" }}
      </h1>

      <div v-if="!loading && profile" class="space-y-6">
        <!-- Профіль -->
        <div class="flex items-center space-x-4">
          <div
            class="w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center text-xl font-medium text-neutral-700"
          >
            👤{{ initials(profile) }}
          </div>
          <div>
            <h2 class="text-xl font-semibold text-neutral-800">
              {{ fullName(profile) || profile.email }}
            </h2>
            <p class="text-sm text-neutral-500">{{ profile.email }}</p>
          </div>
        </div>

        <div class="border-t border-neutral-200 pt-4">
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt class="text-sm font-medium text-neutral-500">ID користувача</dt>
              <dd class="text-base text-neutral-800 truncate">{{ profile.id }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-neutral-500">Дата створення</dt>
              <dd class="text-base text-neutral-800">{{ formatDate(profile.created_at) }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-neutral-500">Роль</dt>
              <dd class="text-base text-neutral-800">
                {{ mapRole(profile.user_metadata?.role) }}
              </dd>
            </div>
            <div v-if="profile.phone">
              <dt class="text-sm font-medium text-neutral-500">Телефон</dt>
              <dd class="text-base text-neutral-800">{{ profile.phone }}</dd>
            </div>
          </dl>
        </div>

        <!-- Кнопка виходу -->
        <div v-if="isMyProfile" class="pt-6">
          <button @click="logout" class="btn btn-error">Вийти</button>
        </div>
      </div>

      <div v-else class="text-center text-neutral-500">Завантаження...</div>
    </div>
  </div>
</template>

<script setup>
import { useSupabaseClient, useSupabaseUser, useRoute, useRouter } from "#imports";
import { ref, computed, onMounted } from "vue";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

const supabase = useSupabaseClient();
const currentUser = useSupabaseUser();
const route = useRoute();
const router = useRouter();

const profile = ref(null);
const loading = ref(true);

const isMyProfile = computed(() => profile.value?.id === currentUser.value?.id);

function initials(user) {
  const name =
    (user?.user_metadata?.first_name || "") +
    " " +
    (user?.user_metadata?.last_name || "") ||
    user?.user_metadata?.full_name ||
    user?.email;

  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function fullName(user) {
  const meta = user?.user_metadata || {};
  return [meta.first_name, meta.last_name].filter(Boolean).join(" ");
}

function mapRole(role) {
  if (role === "admin") return "Адміністратор";
  if (role === "manager") return "Менеджер";
  return "Користувач";
}

function formatDate(date) {
  try {
    return format(new Date(date), "dd.MM.yyyy HH:mm", { locale: uk });
  } catch {
    return date;
  }
}

async function fetchUserProfile() {
  const id = route.params.id;

  const { data, error } = await supabase.auth.admin.getUserById(id);
  if (!error) {
    profile.value = data.user;
  }
  loading.value = false;
}

async function logout() {
  await supabase.auth.signOut();
  router.push("/auth/login");
}

onMounted(() => {
  // обмеження доступу — лише адміну
  if (currentUser.value?.user_metadata?.role !== "admin") {
    router.push("/");
    return;
  }
  fetchUserProfile();
});
</script>

<style scoped>
.card {
  @apply bg-white shadow rounded-xl border border-neutral-200;
}
</style>
