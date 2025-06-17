<template>
  <BaseModal
    :model-value="modelValue"
    @update:model-value="close"
    class="max-w-6xl w-full"
  >
    <template #title>
      <span class="font-medium">Редагувати запис "{{ displayTitle }}"</span>
    </template>

    <template #default>
      <div v-if="loading" class="text-center py-6">
        <BaseLoader />
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Дані полів -->
        <div class="grid gap-4">
          <div
            v-for="field in entityType?.fields || []"
            :key="field.name"
            class="border-b pb-2"
          >
            <p class="text-sm text-neutral-500">
              {{ field.label || field.name }}
            </p>
            <p class="text-base font-medium text-neutral-900">
              <template v-if="getFieldType(field) === 'relation'">
                <template v-if="record.data?.[field.name]">
                  <NuxtLink
                    :to="`/entities/${
                      field.reference_slug || field.relationSlug
                    }/records/${record.data?.[field.name]}`"
                    class="underline text-blue-600"
                  >
                    ID: {{ record.data?.[field.name] }}
                  </NuxtLink>
                </template>
                <template v-else>—</template>
              </template>
              <template v-else-if="getFieldType(field) === 'date'">
                {{ formatDate(record.data?.[field.name]) }}
              </template>
              <template v-else-if="getFieldType(field) === 'number'">
                {{ formatNumber(record.data?.[field.name]) }}
              </template>
              <template v-else-if="getFieldType(field) === 'boolean'">
                {{ record.data?.[field.name] ? "✅ Так" : "❌ Ні" }}
              </template>
              <template v-else>
                {{ record?.data?.[field?.name] || "—" }}
              </template>
            </p>
          </div>

          <!-- Інфо про автора -->
          <div
            class="mt-6 border border-neutral-200 rounded p-4 bg-neutral-50 text-sm text-neutral-700"
          >
            <div class="flex justify-between items-center">
              <div>
                <p class="font-semibold">Автор:</p>
                <p class="text-neutral-800">
                  <NuxtLink
                    v-if="record.user_id"
                    :to="`/users/${record.user_id}/profile`"
                    class="text-blue-600 underline"
                  >
                    {{ authorName }}
                  </NuxtLink>
                </p>
              </div>
              <div>
                <p class="font-semibold">Дата створення:</p>
                <p class="text-neutral-800">
                  {{ formatDate(record.created_at) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Історія змін -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Історія змін</h3>
          <ul class="space-y-3 text-sm">
            <li
              v-for="entry in history"
              :key="entry.timestamp + entry.field + entry.old + entry.new"
              class="border-l-2 border-primary-500 pl-3"
            >
              <p class="font-medium">
                <span class="text-neutral-600">
                  {{ fieldLabels[entry.field] || entry.field }}:
                </span>
                <span class="text-neutral-800">
                  <template v-if="statusMap[entry.old] || statusMap[entry.new]">
                    {{ statusMap[entry.old] || entry.old }}
                    <span class="text-neutral-400">→</span>
                    {{ statusMap[entry.new] || entry.new }}
                  </template>
                  <template v-else>
                    {{ entry.old }} <span class="text-neutral-400">→</span> {{ entry.new }}
                  </template>
                </span>
              </p>
              <div class="flex items-center gap-2 text-neutral-500 text-xs mt-0.5">
                <span>{{ formatDate(entry.timestamp) }}</span>
                <span v-if="entry.user_id">•</span>
                <span v-if="entry.user_id">
                  <NuxtLink
                    :to="`/users/${entry.user_id}/profile`"
                    class="text-blue-600 underline italic"
                  >
                    {{
                      userMap[entry.user_id]?.name ||
                      userMap[entry.user_id]?.email ||
                      "Невідомий користувач"
                    }}
                  </NuxtLink>
                </span>
              </div>
            </li>
          </ul>
          <!-- Кнопка підвантаження -->
          <div v-if="historyHasMore && !loading" class="flex justify-center mt-4">
            <button
              @click="fetchHistoryChunk()"
              class="btn btn-outline"
              :disabled="historyLoadingMore"
            >
              <span v-if="!historyLoadingMore">Завантажити ще</span>
              <span v-else class="animate-pulse">Завантаження…</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Confirm Deletion Modal -->
      <div
        v-if="showConfirmDelete"
        class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      >
        <div class="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
          <h2 class="text-lg font-semibold mb-4">Підтвердити видалення</h2>
          <p class="mb-6 text-sm text-neutral-700">
            Ви впевнені, що хочете видалити цей запис? Це дію неможливо
            скасувати.
          </p>
          <div class="flex justify-end gap-2">
            <button @click="showConfirmDelete = false" class="btn btn-sm">
              Скасувати
            </button>
            <button
              @click="confirmDelete"
              class="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 text-sm"
            >
              Видалити
            </button>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex flex-col sm:flex-row gap-2 w-full mt-4">
        <NuxtLink
          :to="`/entities/${entityType.slug}/records/${recordId}/edit`"
          class="btn btn-sm bg-blue-600 text-white hover:bg-blue-700 flex-1 text-center"
        >
          ✏️ Редагувати
        </NuxtLink>
        <button
          class="btn btn-sm flex-1 text-white bg-red-600 hover:bg-red-700"
          @click="showConfirmDelete = true"
        >
          🗑️ Видалити
        </button>
        <button class="btn btn-sm flex-1" @click="close">Закрити</button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { useSupabaseClient } from "#imports";

import BaseModal from "@/components/ui/BaseModal.vue";
import BaseLoader from "@/components/ui/BaseLoader.vue";

const userMap = ref({});
const statusMap = ref({});

const props = defineProps({
  modelValue: Boolean,
  recordId: [String, Number],
  entityType: Object,
});
const emit = defineEmits(["update:modelValue"]);

const router = useRouter();
const supabase = useSupabaseClient();

const loading = ref(false);
const record = ref(null);

const history = ref([]);
const historyPage = ref(0);
const historyPageSize = 5;
const historyHasMore = ref(true);
const historyLoadingMore = ref(false);

const showConfirmDelete = ref(false);

const displayTitle = computed(
  () =>
    record.value?.data?.name ||
    record.value?.data?.title ||
    record.value?.data?.label ||
    `ID ${record.value?.id}`
);

const authorName = ref("—");

async function fetchAuthor(id) {
  if (!id) return;
  const { data } = await supabase.auth.admin.getUserById(id);
  if (data?.user) {
    const meta = data.user.user_metadata || {};
    authorName.value =
      meta.first_name && meta.last_name
        ? `${meta.first_name} ${meta.last_name}`
        : data.user.email;
  } else {
    authorName.value = "Невідомий користувач";
  }
}

async function fetchStatuses() {
  if (!props.entityType?.id) return;
  const { data, error } = await supabase
    .from('status_definitions')
    .select('id, name')
    .eq('entity_type_id', props.entityType.id);

  if (!error && data) {
    const map = {};
    data.forEach(status => {
      map[status.id] = status.name;
    });
    statusMap.value = map;
  }
}

async function fetchUsersInfo(userIds) {
  if (!userIds.length) return;
  const map = {};
  for (const id of userIds) {
    const { data, error } = await supabase.auth.admin.getUserById(id);
    if (!error && data?.user) {
      const meta = data.user.user_metadata || {};
      map[data.user.id] = {
        name:
          meta.first_name && meta.last_name
            ? `${meta.first_name} ${meta.last_name}`
            : data.user.email,
        email: data.user.email,
      };
    }
  }
  userMap.value = map;
}

function close() {
  emit("update:modelValue", false);
}

const fieldLabels = computed(() => {
  const map = {};
  (props.entityType?.fields || []).forEach((f) => {
    map[f.name] = f.label || f.name;
  });
  // Явно підміняємо назву для status_id
  map["status_id"] = "Статус";
  return map;
});

// ======= NEW PAGINATED HISTORY LOADER =======
async function fetchHistoryChunk({ reset = false } = {}) {
  if (reset) {
    history.value = [];
    historyPage.value = 0;
    historyHasMore.value = true;
  }
  if (!historyHasMore.value) return;

  historyLoadingMore.value = true;
  // Імітація затримки (600 мс)
  await new Promise(r => setTimeout(r, 600));

  const start = historyPage.value * historyPageSize;
  const end = start + historyPageSize - 1;

  const { data: logData, error } = await supabase
    .from("field_change_logs")
    .select("*")
    .eq("entity_record_id", props.recordId)
    .order("changed_at", { ascending: false })
    .range(start, end);

  if (!error && logData && logData.length) {
    const chunk = logData.map((log) => ({
      field: log.field_name,
      old: log.old_value,
      new: log.new_value,
      timestamp: log.changed_at,
      user_id: log.user_id,
    }));
    history.value.push(...chunk);
    historyPage.value += 1;
    if (logData.length < historyPageSize) historyHasMore.value = false;
  } else {
    historyHasMore.value = false;
  }

  historyLoadingMore.value = false;
}

// ========================

async function fetchRecord() {
  loading.value = true;
  try {
    // 1. Сама сутність
    const { data, error } = await supabase
      .from("entity_records")
      .select("*")
      .eq("id", props.recordId)
      .single();
    if (error) throw error;
    record.value = data;

    // 2. Підтягуємо статуси
    await fetchStatuses();

    // 3. Підтягуємо першу порцію історії
    await fetchHistoryChunk({ reset: true });

    // 4. Підтягуємо userMap по унікальних user_id
    const uniqueUserIds = Array.from(
      new Set((history.value || []).map((e) => e.user_id).filter(Boolean))
    );
    await fetchUsersInfo(uniqueUserIds);

    // 5. Автор
    await fetchAuthor(record.value.user_id);

  } catch (e) {
    console.error("Помилка завантаження:", e);
    alert("Не вдалося завантажити запис");
    close();
  } finally {
    loading.value = false;
  }
}

async function confirmDelete() {
  try {
    const { error } = await supabase
      .from("entity_records")
      .delete()
      .eq("id", props.recordId);

    if (error) throw error;

    alert("Запис видалено");
    showConfirmDelete.value = false;
    close();
    router.push(`/entities/${props.entityType.slug}/records`);
  } catch (e) {
    console.error("Помилка видалення:", e);
    alert("Не вдалося видалити запис");
    showConfirmDelete.value = false;
  }
}

watch(
  () => props.modelValue,
  (val) => {
    if (val && props.recordId) fetchRecord();
  }
);

function formatDate(date) {
  if (!date) return "—";
  return format(new Date(date), "dd.MM.yyyy HH:mm", { locale: uk });
}

function formatNumber(value) {
  if (typeof value !== "number") return value;
  return value.toLocaleString("uk-UA");
}

function getFieldType(field) {
  if (field.type === "relation" || field.type === "reference")
    return "relation";
  if (field.type === "date" || field.name.toLowerCase().includes("date"))
    return "date";
  if (field.type === "number") return "number";
  if (field.type === "boolean") return "boolean";
  return "text";
}
</script>
