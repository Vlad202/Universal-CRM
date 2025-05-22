<template>
  <div class="container mx-auto px-4 py-8" v-if="entityType">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <BaseCard class="p-4">
        <p class="text-sm text-neutral-600">Всього записів</p>
        <h2 class="text-2xl font-bold">{{ records.length }}</h2>
      </BaseCard>
      <BaseCard class="p-4">
        <p class="text-sm text-neutral-600">Унікальних авторів</p>
        <h2 class="text-2xl font-bold">{{ uniqueUserCount }}</h2>
      </BaseCard>
      <BaseCard class="p-4">
        <p class="text-sm text-neutral-600">Створено сьогодні</p>
        <h2 class="text-2xl font-bold">{{ todayCount }}</h2>
      </BaseCard>
      <BaseCard class="p-4">
        <p class="text-sm text-neutral-600">За {{ currentMonthLabel }}</p>
        <h2 class="text-2xl font-bold">{{ currentMonthCount }}</h2>
      </BaseCard>
    </div>
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
    >
      <div>
        <h1 class="text-3xl font-bold text-neutral-900">
          {{ entityType?.name || "Entity" }}
        </h1>
        <p class="text-neutral-600 mt-1" v-if="entityType?.description">
          {{ entityType.description }}
        </p>
      </div>
      <div
        class="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto"
      >
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Пошук..."
          class="input w-full sm:w-64"
          @input="debouncedSearch"
        />
        <BaseSelect
          v-model="viewMode"
          :options="viewModeOptions"
          class="w-full sm:w-40"
        />
        <NuxtLink
          :to="`/entities/${entityType.slug}/records/create`"
          class="btn btn-sm btn-primary w-full sm:w-auto"
        >
          + Додати
        </NuxtLink>
      </div>
    </div>

    <BaseLoader v-if="loading || searchLoading" />

    <BaseCard v-else-if="hasError" class="text-center text-red-600 py-12">
      <h2 class="text-xl font-semibold mb-4">Помилка завантаження запису.</h2>
      <p class="text-sm">
        Не вдалося отримати записи. Будь ласка, спробуйте пізніше.
      </p>
    </BaseCard>

    <BaseCard v-else-if="records.length === 0" class="text-center py-12">
      <BaseIcon name="heroicons:inbox" size="lg" class="mb-4 mx-auto" />
      <h2 class="text-xl font-semibold mb-4">Записи не знайдено</h2>
      <p class="text-neutral-500 text-sm mb-4">Ця сутність ще не має записів</p>
      <NuxtLink
        :to="`/entities/${entityType.slug}/records/create`"
        class="btn btn-sm btn-primary flex-1"
      >
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
            <div
              class="px-4 py-3 text-sm font-semibold text-white rounded-t-md flex justify-between items-center"
              :style="{ backgroundColor: status.color }"
            >
              <span>{{ status.name }}</span>
              <NuxtLink
                :to="`/entities/${slug}/records/create?status_id=${status.id}`"
                class="text-white text-sm"
                >+ Додати ({{ recordsByStatus[status.id]?.length || 0 }})
              </NuxtLink>
            </div>
            <div class="p-3 space-y-3 min-h-[150px] flex-1">
              <div
                v-for="record in recordsByStatus[status.id]"
                :key="record.id"
                class="bg-white p-4 rounded-lg shadow text-sm border border-neutral-200 hover:border-primary-500 cursor-pointer transition"
                draggable="true"
                @dragstart="onDragStart($event, record)"
                @click="openRecordDetails(record.id)"
              >
                <p class="font-medium truncate">
                  {{
                    record.data?.name ||
                    record.data?.title ||
                    record.data?.label ||
                    entityType.name
                  }}
                </p>
                <p class="text-sm text-neutral-600">
                  Створено: {{ formatDate(record.created_at) }}
                </p>
                <p class="text-sm text-neutral-600">
                  Автор: {{ record.ownerName }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="grid gap-4">
        <BaseCard
          v-for="record in paginatedRecords"
          :key="record.id"
          class="p-4 flex justify-between items-start hover:bg-neutral-50 cursor-pointer transition"
          @click="openRecordDetails(record.id)"
        >
          <div>
            <h3 class="text-lg font-semibold">
              {{ record.data?.name || "Untitled" }}
            </h3>
            <p class="text-sm text-neutral-600">
              Створено: {{ formatDate(record.created_at) }} |
              {{ record.ownerName }}
            </p>
          </div>
          <div class="flex flex-col items-end gap-2">
            <span
              v-if="record.status"
              class="text-sm font-medium px-3 py-1 rounded-full"
              :style="{
                backgroundColor: record.status.color || '#ccc',
                color: 'white',
              }"
            >
              {{ record.status.name }}
            </span>
            <NuxtLink
              v-if="canEdit(record)"
              :to="`/entities/${slug}/records/${record.id}/edit`"
              class="text-sm text-primary-600 hover:underline"
              >Редагувати</NuxtLink
            >
          </div>
        </BaseCard>

        <div v-if="hasMore" class="text-center mt-6">
          <button class="btn btn-sm btn-outline" @click="loadMore">
            Завантажити ще
          </button>
        </div>
      </div>

      <EntityRecordDetailModal
        v-model="showDetails"
        :record-id="selectedRecordId"
        :entity-type="entityType"
      />
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { useSupabaseClient, useSupabaseUser } from "#imports";
import { format } from "date-fns";

import BaseSelect from "@/components/ui/BaseSelect.vue";
import BaseCard from "@/components/ui/BaseCard.vue";
import BaseIcon from "@/components/ui/BaseIcon.vue";
import EntityRecordDetailModal from "@/components/EntityRecordDetailModal.vue";

import { isToday, isSameMonth, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import { format as fnsFormat } from "date-fns";

const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient();
const user = useSupabaseUser();

const slug = route.params.slug;
const loading = ref(true);
const searchLoading = ref(false);
const hasError = ref(false);
const entityType = ref(null);
const records = ref([]);
const statuses = ref([]);
const usersMap = ref({});
const draggedRecord = ref(null);
const viewMode = ref("kanban");
const searchQuery = ref("");
const showDetails = ref(false);
const selectedRecordId = ref(null);
const page = ref(1);
const pageSize = 10;

const hasMore = computed(
  () => filteredRecords.value.length > page.value * pageSize
);
const paginatedRecords = computed(() =>
  filteredRecords.value.slice(0, page.value * pageSize)
);

function loadMore() {
  page.value++;
}

function openRecordDetails(id) {
  selectedRecordId.value = id;
  showDetails.value = true;
}

const viewModeOptions = [
  { label: "Список", value: "list" },
  { label: "Канбан", value: "kanban" },
];

const recordsByStatus = computed(() => {
  const grouped = {};
  for (const status of statuses.value) grouped[status.id] = [];
  for (const record of filteredRecords.value) {
    const sid = record.data?.status_id;
    if (sid && grouped[sid]) grouped[sid].push(record);
  }
  return grouped;
});

const filteredRecords = computed(() => {
  if (!searchQuery.value) return records.value;
  const q = searchQuery.value.toLowerCase();
  return records.value.filter((record) => {
    return Object.values(record.data || {}).some(
      (val) => typeof val === "string" && val.toLowerCase().includes(q)
    );
  });
});

function canEdit(record) {
  const isOwner = record.user_id === user.value?.id;
  const isAdmin = user.value?.user_metadata?.role === "admin";
  return isOwner || isAdmin;
}

function onDragStart(event, record) {
  draggedRecord.value = record;
}

async function onDrop(event, targetStatusId) {
  if (!draggedRecord.value || !targetStatusId) return;

  const updated = {
    ...draggedRecord.value,
    data: {
      ...draggedRecord.value.data,
      status_id: targetStatusId,
    },
  };

  const { error } = await supabase
    .from("entity_records")
    .update({ data: updated.data, updated_at: new Date().toISOString() })
    .eq("id", draggedRecord.value.id);

  if (!error) {
    draggedRecord.value.data.status_id = targetStatusId;
  }
  draggedRecord.value = null;
}

onMounted(async () => {
  try {
    const { data: type, error: typeError } = await supabase
      .from("entity_types")
      .select("*")
      .eq("slug", slug)
      .single();

    if (typeError || !type) throw typeError;
    entityType.value = type;

    const [statusData, recordData, usersData] = await Promise.all([
      supabase
        .from("status_definitions")
        .select("*")
        .eq("entity_type_id", type.id),
      supabase.from("entity_records").select("*").eq("entity_type_id", type.id),
      supabase.auth.admin.listUsers(),
    ]);

    statuses.value = statusData.data || [];

    usersMap.value = (usersData?.data?.users || []).reduce((map, u) => {
      const meta = u.user_metadata || {};
      const fullName =
        meta.first_name && meta.last_name
          ? `${meta.first_name} ${meta.last_name}`
          : u.email;
      map[u.id] = fullName;
      return map;
    }, {});

    records.value = (recordData.data || []).map((r) => {
      r.status = statuses.value.find((s) => s.id === r.data?.status_id);
      r.ownerName = usersMap.value[r.user_id] || "—";
      return r;
    });
  } catch (e) {
    console.error("Failed to load records:", e);
    hasError.value = true;
  } finally {
    loading.value = false;
  }
});

function formatDate(dateStr) {
  return format(new Date(dateStr), "dd.MM.yyyy HH:mm");
}

const uniqueUserCount = computed(() => {
  const ids = new Set(records.value.map((r) => r.user_id));
  return ids.size;
});

const todayCount = computed(() => {
  return records.value.filter((r) => isToday(parseISO(r.created_at))).length;
});

const currentMonthCount = computed(() => {
  const now = new Date();
  return records.value.filter((r) => isSameMonth(parseISO(r.created_at), now))
    .length;
});

const currentMonthLabel = computed(() => {
  return fnsFormat(new Date(), "LLLL yyyy", { locale: uk });
});

function sumByStatus(statusId) {
  return recordsByStatus.value[statusId]?.length || 0;
}
</script>
