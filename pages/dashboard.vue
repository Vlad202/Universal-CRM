<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-neutral-900">Dashboard</h1>
      <p class="text-neutral-600 mt-2">Welcome to your custom CRM dashboard.</p>
    </div>

    <BaseLoader v-if="loading" />

    <BaseCard v-else-if="hasError" class="text-center text-red-600 py-12">
      <h2 class="text-xl font-semibold mb-4">Something went wrong</h2>
      <p class="text-sm">Failed to load your entity types. Please try again later.</p>
    </BaseCard>

    <template v-else>
      <BaseCard v-if="entityTypes.length === 0" class="text-center py-12">
        <BaseIcon name="heroicons:squares-plus" size="lg" class="mb-4 mx-auto" />
        <h2 class="text-2xl font-semibold mb-4">Get started by creating your first entity</h2>
        <p class="text-neutral-600 mb-6 max-w-md mx-auto">
          Entities are the building blocks of your CRM. Create custom entities like Leads, Contacts, or Projects.
        </p>
        <NuxtLink to="/entities/create" class="btn btn-primary">Create Your First Entity</NuxtLink>
      </BaseCard>

      <div v-else>
        <!-- Entity Types Summary -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <NuxtLink
            v-for="entityType in entityTypes.slice(0, 6)"
            :key="entityType.id"
            :to="`/entities/${entityType.id}/records`"
            class="card hover:shadow-md transition-shadow border border-neutral-200"
          >
            <div class="flex items-center mb-4">
              <BaseIcon
                :name="`heroicons:${entityType.icon || 'squares-2x2'}`"
                class="h-10 w-10 bg-primary-100 text-primary-600 rounded-md flex items-center justify-center mr-3"
              />
              <h3 class="text-lg font-semibold">{{ entityType.name }}</h3>
            </div>
            <p class="text-neutral-600 text-sm mb-4">
              {{ entityType.description || `Manage your ${entityType.name.toLowerCase()}` }}
            </p>
            <div class="flex justify-between items-center">
              <span class="text-sm text-neutral-500">{{ entityType.recordCount || 0 }} records</span>
              <span class="text-primary-600 text-sm font-medium">View all →</span>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/entities/create"
            class="card hover:shadow-md transition-shadow border border-dashed border-neutral-200 flex flex-col items-center justify-center"
          >
            <BaseIcon name="heroicons:plus" class="h-12 w-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mb-3" />
            <p class="text-primary-600 font-medium">Create New Entity</p>
          </NuxtLink>
        </div>

        <!-- Recent Activity -->
        <BaseCard class="mb-8">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold">Recent Activity</h2>
            <BaseButton variant="link" size="sm">View all</BaseButton>
          </div>

          <div v-if="recentActivity.length === 0" class="text-center py-8 text-neutral-500">
            No recent activity
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="(activity, index) in recentActivity"
              :key="index"
              class="flex items-start pb-4 border-b border-neutral-100 last:border-0"
            >
              <BaseIcon :name="`heroicons:${activity.icon}`" class="h-8 w-8 bg-primary-100 text-primary-600 rounded-full mr-3" />
              <div>
                <p class="text-sm font-medium">{{ activity.message }}</p>
                <p class="text-xs text-neutral-500">{{ activity.time }}</p>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useEntityTypesStore } from '~/stores/entityTypes';
import { useSupabaseUser } from '#imports';

definePageMeta({ middleware: ['auth'] });

const user = useSupabaseUser();
const entityTypesStore = useEntityTypesStore();

const loading = ref(true);
const hasError = ref(false);
const entityTypes = ref([]);

const recentActivity = ref([
  {
    icon: 'document-plus',
    message: 'New lead "Acme Corp" was created',
    time: '2 hours ago'
  },
  {
    icon: 'user-plus',
    message: 'New contact "John Smith" was added',
    time: '5 hours ago'
  },
  {
    icon: 'document-check',
    message: 'Deal "Website Redesign" was marked as won',
    time: 'Yesterday'
  }
]);

onMounted(async () => {
  try {
    await entityTypesStore.fetchEntityTypes();
    entityTypes.value = entityTypesStore.entityTypes || [];
  } catch (err) {
    console.error('Failed to fetch entity types:', err);
    hasError.value = true;
  } finally {
    loading.value = false;
  }
});
</script>
  