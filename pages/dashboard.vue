// File: pages/index.vue
<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-neutral-900">Dashboard</h1>
      <p class="text-neutral-600 mt-2">Welcome back{{ user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : '' }}.</p>
    </div>

    <BaseLoader v-if="loading" />

    <BaseCard v-else-if="hasError" class="text-center text-red-600 py-12">
      <h2 class="text-xl font-semibold mb-4">Something went wrong</h2>
      <p class="text-sm">Failed to load your entity types. Please try again later.</p>
    </BaseCard>

    <template v-else>
      <!-- Stats Overview -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <BaseCard class="p-5">
          <h2 class="text-sm text-neutral-500 mb-1">Total Entities</h2>
          <p class="text-2xl font-bold">{{ totalRecords }}</p>
        </BaseCard>

        <BaseCard class="p-5">
          <h2 class="text-sm text-neutral-500 mb-1">Entity Types</h2>
          <p class="text-2xl font-bold">{{ entityTypes.length }}</p>
        </BaseCard>

        <BaseCard class="p-5">
          <h2 class="text-sm text-neutral-500 mb-1">Tasks Assigned</h2>
          <p class="text-2xl font-bold">{{ assignedTasks }}</p>
        </BaseCard>

        <BaseCard class="p-5">
          <h2 class="text-sm text-neutral-500 mb-1">Recent Status Changes</h2>
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
          <div class="flex items-center mb-3">
            <BaseIcon
              :name="resolveIcon(entityType.icon)"
              class="h-10 w-10 bg-primary-100 text-primary-600 rounded-md mr-3 flex items-center justify-center"
            />
            <h3 class="text-lg font-semibold text-neutral-800">{{ entityType.name }}</h3>
          </div>
          <p class="text-sm text-neutral-600 mb-4 min-h-[40px]">
            {{ entityType.description || `Manage ${entityType.name.toLowerCase()}` }}
          </p>
          <div class="flex justify-between items-center text-sm text-neutral-500">
            <span>{{ entityType.recordCount || 0 }} records</span>
            <span class="text-primary-600 font-medium">View all →</span>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/entities/create"
          class="card border border-dashed hover:border-primary-300 flex items-center justify-center text-primary-600 text-sm font-medium py-8"
        >
          <div class="flex flex-col items-center">
            <BaseIcon name="heroicons:plus" class="h-10 w-10 mb-3" />
            Create New Entity
          </div>
        </NuxtLink>
      </div>

      <!-- Recent Activity -->
      <BaseCard class="mb-12">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-neutral-800">Recent Activity</h2>
          <BaseButton variant="link" size="sm">View all</BaseButton>
        </div>

        <div v-if="recentActivity.length === 0" class="text-center py-8 text-neutral-500">
          No recent activity yet.
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="(activity, index) in recentActivity"
            :key="index"
            class="flex items-start pb-4 border-b border-neutral-100 last:border-0"
          >
            <BaseIcon :name="`heroicons:${activity.icon}`" class="h-8 w-8 bg-primary-100 text-primary-600 rounded-full mr-3" />
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
import { ref, onMounted, computed } from 'vue';
import { useEntityTypesStore } from '~/stores/entityTypes';
import { useSupabaseUser, useSupabaseClient } from '#imports';

const user = useSupabaseUser();
const supabase = useSupabaseClient();
const entityTypesStore = useEntityTypesStore();

const loading = ref(true);
const hasError = ref(false);
const entityTypes = ref([]);
const totalRecords = ref(0);
const assignedTasks = ref(0);
const recentStatusUpdates = ref(0);

const recentActivity = ref([
  { icon: 'document-plus', message: 'New lead "Acme Corp" created', time: '2 hours ago' },
  { icon: 'user-plus', message: 'Contact "John Smith" added', time: '5 hours ago' },
  { icon: 'document-check', message: 'Deal "Redesign" marked as won', time: 'Yesterday' }
]);

const resolveIcon = (icon) => `heroicons:${icon || 'squares-2x2'}`;

onMounted(async () => {
  try {
    await entityTypesStore.fetchEntityTypes();
    entityTypes.value = entityTypesStore.entityTypes;

    const { count: recordCount } = await supabase
      .from('entity_records')
      .select('*', { count: 'exact', head: true });

    const { count: taskCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', user.value.id);

    const { count: statusCount } = await supabase
      .from('entity_status_history')
      .select('*', { count: 'exact', head: true })
      .gte('changed_at', new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString());

    totalRecords.value = recordCount || 0;
    assignedTasks.value = taskCount || 0;
    recentStatusUpdates.value = statusCount || 0;
  } catch (err) {
    console.error('Error loading dashboard:', err);
    hasError.value = true;
  } finally {
    loading.value = false;
  }
});
</script>
