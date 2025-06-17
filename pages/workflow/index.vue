<template>
  <div class="container mx-auto px-4 py-8 max-w-5xl">
    <h1 class="text-2xl font-bold mb-6">Автоматизації</h1>

    <div v-if="loading" class="py-16 text-center">
      <BaseLoader />
    </div>

    <div v-else-if="automations.length === 0" class="text-center text-neutral-500 py-12">
      <p class="text-lg">Автоматизації ще не створено.</p>
      <NuxtLink to="/workflow/create" class="btn btn-primary mt-4">+ Додати автоматизацію</NuxtLink>
    </div>

    <div v-else class="grid gap-4">
      <BaseCard
        v-for="automation in automations"
        :key="automation.id"
        class="p-4 hover:bg-neutral-50 transition cursor-pointer border border-neutral-200"
        @click="goToAutomation(automation.id)"
      >
        <div class="flex justify-between items-start">
          <div>
            <div class="flex flex-wrap gap-4 mb-2">
              <span class="inline-block text-xs rounded bg-neutral-100 px-2 py-1 text-neutral-600">
                Тип сутності: <b>{{ entityTypeMap[automation.entity_type_id] || automation.entity_type_id }}</b>
              </span>
              <span class="inline-block text-xs rounded bg-blue-100 px-2 py-1 text-blue-700">
                Тригер: <b>{{ formatTrigger(automation.trigger) }}</b>
              </span>
            </div>
            <p class="text-sm text-neutral-600 mb-2">
              <span class="font-medium">Умов:</span> {{ automation.conditions.length }} |
              <span class="font-medium">Дій:</span> {{ automation.actions.length }}
            </p>
            <div v-if="automation.conditions.length > 0" class="text-xs text-neutral-500 mb-1">
              <span v-for="(c, i) in automation.conditions" :key="i" class="mr-2">
                <b>{{ getFieldLabel(c.field) }}</b>
                {{ getOperatorLabel(c.operator, c.field) }}
                <span class="font-mono">{{ c.value }}</span>
              </span>
            </div>
            <div v-if="automation.actions.length > 0" class="text-xs text-neutral-500">
              <span v-for="(a, i) in automation.actions" :key="i" class="mr-2">
                <b>{{ formatAction(a) }}</b>
              </span>
            </div>
          </div>
          <div class="text-right min-w-[120px]">
            <span
              class="text-xs px-3 py-1 rounded-full"
              :class="automation.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
            >
              {{ automation.is_active !== false ? 'Активна' : 'Неактивна' }}
            </span>
            <p class="text-xs text-neutral-400 mt-1">Оновлено: {{ formatDate(automation.updated_at) }}</p>
          </div>
        </div>
      </BaseCard>
      <div class="flex justify-end mt-4">
        <NuxtLink to="/workflow/create" class="btn btn-primary">+ Додати автоматизацію</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSupabaseClient } from '#imports';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseLoader from '@/components/ui/BaseLoader.vue';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

const router = useRouter();
const supabase = useSupabaseClient();

const loading = ref(true);
const automations = ref([]);
const entityTypes = ref([]);
const entityTypeMap = ref({});

onMounted(async () => {
  loading.value = true;

  // Підтягуємо entity types для назв
  const { data: entityTypesData } = await supabase.from('entity_types').select('id, name, fields');
  entityTypes.value = entityTypesData || [];
  entityTypes.value.forEach(e => entityTypeMap.value[e.id] = e.name);

  // Підтягуємо автоматизації
  const { data, error } = await supabase.from('automation_rules').select('*').order('updated_at', { ascending: false });
  automations.value = data || [];
  loading.value = false;
});

const goToAutomation = (id) => {
  router.push(`/workflow/${id}`);
};

const formatTrigger = (value) => {
  switch (value) {
    case 'on_create': return 'При створенні';
    case 'on_update': return 'При зміні запису';
    case 'on_status_change': return 'При зміні статусу';
    default: return value;
  }
};

const formatDate = (dateStr) => {
  return format(new Date(dateStr), 'dd.MM.yyyy HH:mm', { locale: uk });
};

// Отримати читабельну назву поля (з entityTypeMap і fields)
function getFieldLabel(fieldName) {
  for (const et of entityTypes.value) {
    const f = (et.fields || []).find(f => f.name === fieldName);
    if (f) return f.label || f.name;
  }
  return fieldName;
}

// Оператори для відображення
const operatorLabels = {
  equals: ' дорівнює ',
  contains: ' містить ',
  not_contains: ' не містить ',
  greater_than: ' більше ',
  less_than: ' менше ',
  after: ' після ',
  before: ' до ',
  // інше за потребою
};
function getOperatorLabel(op, fieldName) {
  return operatorLabels[op] || op;
}

// Відображення дій
function formatAction(action) {
  if (action.type === 'webhook') return 'Вебхук';
  if (action.type === 'status_update') return 'Оновити статус';
  if (action.type === 'field_update') return `Оновити поле "${getFieldLabel(action.field)}"`;
  return action.type;
}
</script>
