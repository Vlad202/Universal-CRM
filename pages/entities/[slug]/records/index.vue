<template>
  <div class="container mx-auto px-4 py-8" v-if="entityType">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-neutral-900">{{ entityType?.name || 'Entity' }}</h1>
        <p class="text-neutral-600 mt-1" v-if="entityType?.description">{{ entityType.description }}</p>
      </div>
      <div class="flex gap-4 items-center">
        <NuxtLink :to="`/entities/${entityType.slug}/records/create`" class="btn btn-sm btn-primary flex-1">
            + Додати
          </NuxtLink>
        <BaseSelect v-model="viewMode" :options="viewModeOptions" class="w-40" />
      </div>
    </div>

    <BaseLoader v-if="loading" />

    <BaseCard v-else-if="hasError" class="text-center text-red-600 py-12">
      <h2 class="text-xl font-semibold mb-4">Error loading records</h2>
      <p class="text-sm">Could not fetch records. Please try again later.</p>
    </BaseCard>

    <BaseCard v-else-if="records.length === 0" class="text-center py-12">
      <BaseIcon name="heroicons:inbox" size="lg" class="mb-4 mx-auto" />
      <h2 class="text-xl font-semibold mb-4">No records found</h2>
      <p class="text-neutral-500 text-sm mb-4">This entity doesn't have any records yet.</p>
          <NuxtLink :to="`/entities/${entityType.slug}/records/create`" class="btn btn-sm btn-primary flex-1">
            + Створити запис
          </NuxtLink>
    </BaseCard>

    <div v-else>
      <!-- Kanban View -->
      <div v-if="viewMode === 'kanban'" class="overflow-x-auto">
        <div class="flex gap-6 min-w-full">
          <div
            v-for="status in statuses"
            :key="status.id"
            class="flex-1 min-w-[280px] bg-neutral-50 rounded-lg shadow-sm border border-neutral-200 flex flex-col"
            @dragover.prevent
            @drop="onDrop($event, status.id)"
          >
            <div class="px-4 py-3 text-sm font-semibold text-white rounded-t-md flex justify-between items-center" :style="{ backgroundColor: status.color }">
              <span>{{ status.name }}</span>
              <NuxtLink :to="`/entities/${slug}/records/create?status_id=${status.id}`" class="text-white text-sm">+ Add</NuxtLink>
            </div>
            <div class="p-3 space-y-3 min-h-[150px] flex-1">
              <div
                v-for="record in recordsByStatus[status.id]"
                :key="record.id"
                class="bg-white p-4 rounded-lg shadow text-sm border border-neutral-200 hover:border-primary-500 cursor-move transition"
                draggable="true"
                @dragstart="onDragStart($event, record)"
              >
                <p class="font-medium truncate">{{ record.data?.name || 'Untitled' }}</p>
                <p class="text-xs text-neutral-500">{{ formatDate(record.created_at) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="grid gap-4">
        <BaseCard
          v-for="record in records"
          :key="record.id"
          class="p-4 flex items-center justify-between hover:bg-neutral-50 cursor-pointer transition"
        >
          <div>
            <h3 class="text-lg font-semibold">{{ record.data?.name || 'Untitled' }}</h3>
            <p class="text-sm text-neutral-600">Created: {{ formatDate(record.created_at) }}</p>
          </div>
          <span
            v-if="record.status"
            class="text-sm font-medium px-3 py-1 rounded-full"
            :style="{ backgroundColor: record.status.color || '#ccc', color: 'white' }"
          >
            {{ record.status.name }}
          </span>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import { useSupabaseClient, useSupabaseUser } from '#imports';
import { format } from 'date-fns';

import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseIcon from '@/components/ui/BaseIcon.vue';
import { Icon } from '@iconify/vue';

const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient();
const user = useSupabaseUser();

const slug = route.params.slug;
const loading = ref(true);
const hasError = ref(false);
const entityType = ref(null);
const records = ref([]);
const statuses = ref([]);
const draggedRecord = ref(null);
const viewMode = ref('kanban');

const viewModeOptions = [
  { label: 'List View', value: 'list' },
  { label: 'Kanban View', value: 'kanban' }
];

const recordsByStatus = computed(() => {
  const grouped = {};
  for (const status of statuses.value) grouped[status.id] = [];
  for (const record of records.value) {
    const sid = record.data?.status_id;
    if (sid && grouped[sid]) grouped[sid].push(record);
  }
  return grouped;
});

function onDragStart(event, record) {
  draggedRecord.value = record;
}

async function onDrop(event, targetStatusId) {
  if (!draggedRecord.value || !targetStatusId) return;

  const updated = {
    ...draggedRecord.value,
    data: {
      ...draggedRecord.value.data,
      status_id: targetStatusId
    }
  };

  const { error } = await supabase
    .from('entity_records')
    .update({ data: updated.data, updated_at: new Date().toISOString() })
    .eq('id', draggedRecord.value.id);

  if (!error) {
    draggedRecord.value.data.status_id = targetStatusId;
  }
  draggedRecord.value = null;
}

onMounted(async () => {
  try {
    const { data: type, error: typeError } = await supabase
      .from('entity_types')
      .select('*')
      .eq('slug', slug)
      .single();

    if (typeError || !type) throw typeError;
    entityType.value = type;

    const [statusData, recordData] = await Promise.all([
      supabase
        .from('status_definitions')
        .select('*')
        .eq('entity_type_id', type.id)
        .order('created_at'),
      supabase
        .from('entity_records')
        .select('*')
        .eq('entity_type_id', type.id)
        .order('created_at', { ascending: false })
    ]);

    statuses.value = statusData.data || [];
    records.value = (recordData.data || []).map((r) => {
      r.status = statuses.value.find(s => s.id === r.data?.status_id);
      return r;
    });
  } catch (e) {
    console.error('Failed to load records:', e);
    hasError.value = true;
  } finally {
    loading.value = false;
  }
});

function formatDate(dateStr) {
  return format(new Date(dateStr), 'PPP p');
}
</script>
