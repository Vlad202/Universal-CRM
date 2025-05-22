<template>
  <BaseModal :model-value="modelValue" @update:model-value="close" class="max-w-6xl w-full">
    <template #title>
      <span class="font-medium"> Редагувати запис "{{ displayTitle }}" </span>
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
                    v-if="record.createdById"
                    :to="`/users/${record.createdById}/profile`"
                    class="text-blue-600 underline"
                  >
                    {{ record.ownerName || record.email || "—" }}
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
              :key="entry.timestamp"
              class="border-l-2 border-primary-500 pl-3"
            >
              <p class="font-medium">
                {{ entry.field }}:
                <span class="text-neutral-800"
                  >{{ entry.old }} → {{ entry.new }}</span
                >
              </p>
              <p class="text-neutral-500">{{ formatDate(entry.timestamp) }}</p>
            </li>
          </ul>
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
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { useSupabaseClient } from "#imports";

import BaseModal from "@/components/ui/BaseModal.vue";
import BaseLoader from "@/components/ui/BaseLoader.vue";

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
const showConfirmDelete = ref(false);

const displayTitle = computed(
  () =>
    record.value?.data?.name ||
    record.value?.data?.title ||
    record.value?.data?.label ||
    `ID ${record.value?.id}`
);

function close() {
  emit("update:modelValue", false);
}

async function fetchRecord() {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from("entity_records")
      .select("*")
      .eq("id", props.recordId)
      .single();

    if (error) throw error;
    record.value = data;

    // Fetch user info
    if (record.value?.user_id) {
      const { data: userData, error: userError } =
        await supabase.auth.admin.getUserById(record.value.user_id);
      if (userData && userData.user) {
        const meta = userData.user?.user_metadata || {};
        record.value.createdById = userData.user.id;
        record.value.email = userData.user.email;
        record.value.ownerName =
          meta.first_name && meta.last_name
            ? `${meta.first_name} ${meta.last_name}`
            : userData.email;
      } else {
        record.value.ownerName = "—";
      }
    } else {
      record.value.ownerName = "—";
    }

    history.value = [
      {
        field: "status_id",
        old: "Новий",
        new: "У роботі",
        timestamp: "2025-05-19T10:12:00Z",
      },
    ];
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
