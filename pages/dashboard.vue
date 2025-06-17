<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-neutral-900">Дашборд</h1>
      <p class="text-neutral-600 mt-2">
        Вітаємо{{ user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : user.email }}.
      </p>
    </div>

    <BaseLoader v-if="loading" />

    <BaseCard v-else-if="hasError" class="text-center text-red-600 py-12">
      <h2 class="text-xl font-semibold mb-4">Щось пішло не так...</h2>
      <p class="text-sm">Не вдалося завантажити типи сутностей. Будь ласка, спробуйте ще.</p>
    </BaseCard>

    <template v-else>
      <!-- Stats Overview -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <BaseCard class="p-5">
          <h2 class="text-sm text-neutral-500 mb-1">Всього сутностей</h2>
          <p class="text-2xl font-bold">{{ totalRecords }}</p>
        </BaseCard>

        <BaseCard class="p-5">
          <h2 class="text-sm text-neutral-500 mb-1">Типів сутностей</h2>
          <p class="text-2xl font-bold">{{ entityTypes.length }}</p>
        </BaseCard>

        <BaseCard class="p-5">
          <h2 class="text-sm text-neutral-500 mb-1">Нещодавні зміни статусів</h2>
          <p class="text-2xl font-bold">{{ recentStatusUpdates }}</p>
        </BaseCard>
      </div>

      <!-- Entity Types -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <NuxtLink
          v-for="entityType in entityTypes.slice(0, 6)"
          :key="entityType.id"
          :to="`/entities/${entityType.slug}/records`"
          class="card hover:shadow transition-all border border-neutral-200"
        >
          <div class="flex items-center mb-4">
            <div class="h-10 w-10 rounded-md bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
              <Icon :icon="resolveIcon(entityType.icon)" class="h-6 w-6" />
            </div>
            <h3 class="text-lg font-semibold">{{ entityType.name }}</h3>
          </div>
          <hr class="border-neutral-200 mb-4" />

          <p class="text-sm text-neutral-600 mb-4 min-h-[40px]">
            {{ entityType.description || `Manage ${entityType.name.toLowerCase()}` }}
          </p>
        </NuxtLink>

        <NuxtLink
          to="/entities/create"
          class="card border border-dashed hover:border-primary-300 flex items-center justify-center text-primary-600 text-sm font-medium py-8"
        >
          <div class="flex flex-col items-center">
            <Icon icon="heroicons:plus" class="h-10 w-10 mb-3" />
            Створити новий тип сутностей
          </div>
        </NuxtLink>
      </div>

      <!-- Recent Activity -->
      <BaseCard class="mb-12">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-neutral-800">Остання активність</h2>
        </div>

        <div v-if="recentActivity.length === 0" class="text-center py-8 text-neutral-500">
          Активностей ще не було.
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="(activity, index) in recentActivity"
            :key="index"
            class="flex items-start pb-4 border-b border-neutral-100 last:border-0"
          >
            <div class="h-10 w-10 rounded-md bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
              <Icon :icon="`heroicons:${activity.icon}`" class="h-8 w-8 bg-primary-100 text-primary-600 rounded-full"  />
            </div>
            <div>
              <p class="text-sm font-medium text-neutral-800">{{ activity.message }}</p>
              <p class="text-xs text-neutral-500">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </BaseCard>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useEntityTypesStore } from '~/stores/entityTypes';
import { useSupabaseUser, useSupabaseClient } from '#imports';
import { Icon } from '@iconify/vue';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { uk } from 'date-fns/locale';

const user = useSupabaseUser();
const supabase = useSupabaseClient();
const entityTypesStore = useEntityTypesStore();

const loading = ref(true);
const hasError = ref(false);
const entityTypes = ref([]);
const totalRecords = ref(0);
const recentStatusUpdates = ref(0);

const recentActivity = ref([]);

const resolveIcon = (icon) => `heroicons:${icon || 'squares-2x2'}`;

onMounted(async () => {
  try {
    await entityTypesStore.fetchEntityTypes();
    entityTypes.value = entityTypesStore.entityTypes;

    const { count: recordCount } = await supabase
      .from('entity_records')
      .select('*', { count: 'exact', head: true });

    const { count: statusCount } = await supabase
      .from('entity_status_history')
      .select('*', { count: 'exact', head: true })
      .gte('changed_at', new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString());

    totalRecords.value = recordCount || 0;
    recentStatusUpdates.value = statusCount || 0;

    // === ОТРИМАННЯ ОСТАННІХ 3 АКТИВНОСТЕЙ ===
    // 1. Останні зміни полів (оновлення або створення)
    const { data: records, error: recordsError } = await supabase
      .from('entity_records')
      .select('id, entity_type_id, created_at, updated_at, data')
      .order('updated_at', { ascending: false })
      .limit(5);

    // 2. Останні зміни статусів
    const { data: statusHistory, error: statusError } = await supabase
      .from('entity_status_history')
      .select('id, entity_id, status_id, changed_at')
      .order('changed_at', { ascending: false })
      .limit(5);

    // 3. Останні зміни (field_change_logs)
    const { data: fieldLogs, error: logError } = await supabase
      .from('field_change_logs')
      .select('id, entity_record_id, changed_at')
      .order('changed_at', { ascending: false })
      .limit(5);

    // --- Збираємо всі івенти в один масив ---
    let events = [];

    // Додаємо створення/редагування записів
    (records || []).forEach(r => {
      // Якщо created_at = updated_at, значить це новий запис
      if (r.created_at === r.updated_at) {
        events.push({
          icon: 'user-plus',
          message: `Створено запис "${r.data?.name || r.data?.title || 'Без назви'}"`,
          time: formatDistanceToNow(parseISO(r.created_at), { locale: uk, addSuffix: true }),
          date: r.created_at
        });
      } else {
        events.push({
          icon: 'document-check',
          message: `Оновлено запис "${r.data?.name || r.data?.title || 'Без назви'}"`,
          time: formatDistanceToNow(parseISO(r.updated_at), { locale: uk, addSuffix: true }),
          date: r.updated_at
        });
      }
    });

    // Додаємо зміну статусів
    (statusHistory || []).forEach(s => {
      events.push({
        icon: 'document-plus',
        message: `Змінено статус запису`,
        time: formatDistanceToNow(parseISO(s.changed_at), { locale: uk, addSuffix: true }),
        date: s.changed_at
      });
    });

    // Додаємо інші зміни (field_change_logs) — опціонально, якщо треба ще окремо
    // (fieldLogs || []).forEach(log => {
    //   events.push({
    //     icon: 'pencil-square',
    //     message: `Оновлено поле запису`,
    //     time: formatDistanceToNow(parseISO(log.changed_at), { locale: uk, addSuffix: true }),
    //     date: log.changed_at
    //   });
    // });

    // Сортуємо всі події за датою, беремо лише 3 найсвіжіших
    events = events
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);

    recentActivity.value = events;
  } catch (err) {
    console.error('Error loading dashboard:', err);
    hasError.value = true;
  } finally {
    loading.value = false;
  }
});
</script>
