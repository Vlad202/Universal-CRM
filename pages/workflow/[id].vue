<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <h1 class="text-2xl font-bold mb-6">{{ isEditMode ? 'Редагування автоматизації' : 'Створення автоматизації' }}</h1>

    <BaseLoader v-if="loading" />

    <form v-else @submit.prevent="handleSubmit">
      <!-- Вибір типу сутності -->
      <BaseCard class="mb-6 p-4">
        <h2 class="text-lg font-semibold mb-2">Сутність</h2>
        <BaseSelect
          v-model="selectedEntityTypeId"
          :options="entityTypeOptions"
          class="w-full"
          placeholder="Оберіть тип сутності"
          :disabled="isEditMode"
        />
      </BaseCard>

      <!-- Тригер -->
      <BaseCard class="mb-6 p-4">
        <h2 class="text-lg font-semibold mb-2">Тригер</h2>
        <BaseSelect v-model="trigger" :options="triggerOptions" class="w-full" />
      </BaseCard>

<!-- Умови -->
<BaseCard class="mb-6 p-4">
  <h2 class="text-lg font-semibold mb-2">Умови</h2>
  <div v-for="(cond, index) in conditions" :key="index" class="mb-4 border p-4 rounded relative">
    <button
      v-if="conditions.length > 1"
      @click="removeCondition(index)"
      class="absolute top-2 right-2 text-red-600 hover:text-red-800"
      title="Видалити умову"
      type="button"
    >
      ×
    </button>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Вибір поля -->
      <BaseSelect
        v-model="cond.field"
        :options="extendedConditionFieldOptions"
        placeholder="Поле"
      />

      <!-- Оператор -->
      <BaseSelect
        v-model="cond.operator"
        :options="getOperatorOptionsForCondition(cond.field)"
        placeholder="Оператор"
        :disabled="!cond.field"
      />

      <!-- Значення: якщо статус — select, якщо інше — як раніше -->
      <BaseSelect
        v-if="cond.field === 'status_id'"
        v-model="cond.value"
        :options="statusOptions"
        placeholder="Виберіть статус"
        :disabled="!cond.field"
      />
      <BaseInput
        v-else
        v-model="cond.value"
        placeholder="Значення"
        :type="getInputType(cond.field)"
        :disabled="!cond.field"
      />
    </div>
  </div>
  <button class="btn btn-sm btn-outline" @click="addCondition" type="button">+ Додати умову</button>
</BaseCard>

      <!-- Дії -->
      <BaseCard class="mb-6 p-4">
        <h2 class="text-lg font-semibold mb-2">Дії</h2>
        <div v-for="(act, index) in actions" :key="index" class="mb-4 border p-4 rounded relative">
          <button
            v-if="actions.length > 1"
            @click="removeAction(index)"
            class="absolute top-2 right-2 text-red-600 hover:text-red-800"
            title="Видалити дію"
            type="button"
          >
            ×
          </button>
          <BaseSelect v-model="act.type" :options="actionOptions" class="w-full mb-3" />

          <div v-if="act.type === 'webhook'">
            <BaseInput v-model="act.url" placeholder="URL webhook'а" label="Webhook URL" />
          </div>
          <div v-else-if="act.type === 'status_update'">
            <BaseSelect v-model="act.status" :options="statusOptions" label="Новий статус" />
          </div>
          <div v-else-if="act.type === 'field_update'">
            <BaseSelect
              v-model="act.field"
              :options="primitiveFieldOptions"
              label="Поле для оновлення"
            />
            <BaseInput
              v-model="act.value"
              placeholder="Нове значення"
              :type="getInputType(act.field)"
              :disabled="!act.field"
            />
          </div>
        </div>
        <button class="btn btn-sm btn-outline" @click="addAction" type="button">+ Додати дію</button>
      </BaseCard>

      <div class="flex justify-between mt-4 gap-3">
        <button class="btn btn-primary" :disabled="!selectedEntityTypeId" type="submit">
          {{ isEditMode ? 'Зберегти зміни' : 'Створити автоматизацію' }}
        </button>
        <button v-if="isEditMode" class="btn btn-outline text-red-700" type="button" @click="deleteAutomation">
          Видалити автоматизацію
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSupabaseClient, useSupabaseUser } from '#imports';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseInput from '@/components/ui/BaseInput.vue';

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const route = useRoute();
const router = useRouter();

const id = route.params.id;
const isEditMode = computed(() => !!id && id !== 'create');
const loading = ref(true);

// ===== Стан =====
const entityTypes = ref([]);
const entityTypeOptions = computed(() =>
  entityTypes.value.map(et => ({
    label: et.name,
    value: et.id
  }))
);
const selectedEntityTypeId = ref(null);

const trigger = ref('on_create');
const conditions = ref([{ field: '', operator: 'equals', value: '' }]);
const actions = ref([{ type: 'webhook', url: '', status: '', field: '', value: '' }]);

const triggerOptions = [
  { label: 'При створенні', value: 'on_create' },
  { label: 'При зміні запису', value: 'on_update' },
  { label: 'При зміні статусу', value: 'on_status_change' }
];

// Додаємо "Статус" до списку полів умов
const extendedConditionFieldOptions = computed(() => [
  { label: 'Статус', value: 'status_id', type: 'status' },
  ...primitiveFieldOptions.value // як раніше
]);

// Оператори для статусу — тільки "Дорівнює"
function getOperatorOptionsForCondition(fieldName) {
  if (fieldName === 'status_id') {
    return [{ label: 'Дорівнює', value: 'equals' }];
  }
  return getOperatorOptions(fieldName);
}


const fields = ref([]);
const primitiveFieldOptions = computed(() =>
  fields.value
    .filter(f => ['text', 'number', 'boolean', 'date'].includes(getFieldType(f)))
    .map(f => ({
      label: f.label || f.name,
      value: f.name,
      type: getFieldType(f)
    }))
);

const statusList = ref([]);
const statusOptions = computed(() =>
  statusList.value.map(s => ({
    label: s.name,
    value: s.id
  }))
);

const actionOptions = [
  { label: 'Виклик Webhook', value: 'webhook' },
  { label: 'Оновити статус', value: 'status_update' },
  { label: 'Оновити поле', value: 'field_update' }
];

// ===== Оператори =====
const operatorsByType = {
  text: [
    { label: 'Дорівнює', value: 'equals' },
    { label: 'Містить', value: 'contains' },
    { label: 'Не містить', value: 'not_contains' }
  ],
  number: [
    { label: 'Дорівнює', value: 'equals' },
    { label: 'Більше', value: 'greater_than' },
    { label: 'Менше', value: 'less_than' }
  ],
  boolean: [
    { label: 'Дорівнює', value: 'equals' }
  ],
  date: [
    { label: 'Рівна', value: 'equals' },
    { label: 'Після', value: 'after' },
    { label: 'До', value: 'before' }
  ]
};
function getOperatorOptions(fieldName) {
  const field = primitiveFieldOptions.value.find(f => f.value === fieldName);
  if (!field) return [];
  return operatorsByType[field.type] || [];
}
function getInputType(fieldName) {
  const field = primitiveFieldOptions.value.find(f => f.value === fieldName);
  if (!field) return 'text';
  switch (field.type) {
    case 'number': return 'number';
    case 'date': return 'date';
    case 'boolean': return 'checkbox';
    default: return 'text';
  }
}

// ===== Додавання/видалення =====
const addCondition = () => {
  conditions.value.push({ field: '', operator: 'equals', value: '' });
};
const removeCondition = idx => {
  conditions.value.splice(idx, 1);
};

const addAction = () => {
  actions.value.push({ type: 'webhook', url: '', status: '', field: '', value: '' });
};
const removeAction = idx => {
  actions.value.splice(idx, 1);
};

// ===== Завантаження =====
onMounted(async () => {
  loading.value = true;
  // Список сутностей
  const { data: etData } = await supabase.from('entity_types').select('id, name, fields');
  entityTypes.value = etData || [];
  if (!isEditMode.value) {
    loading.value = false;
    return;
  }
  // Редагування — підтягуємо автоматизацію
  const { data, error } = await supabase.from('automation_rules').select('*').eq('id', id).single();
  if (!error && data) {
    selectedEntityTypeId.value = data.entity_type_id;
    trigger.value = data.trigger;
    conditions.value = data.conditions || [{ field: '', operator: 'equals', value: '' }];
    actions.value = data.actions || [{ type: 'webhook', url: '', status: '', field: '', value: '' }];
  }
  loading.value = false;
});

// При виборі сутності — підтягуємо поля і статуси
watch(selectedEntityTypeId, async (val) => {
  if (!val) {
    fields.value = [];
    statusList.value = [];
    return;
  }
  // Підтягуємо поля для вибраної сутності
  const et = entityTypes.value.find(e => e.id === val);
  fields.value = et?.fields || [];
  // Підтягуємо статуси для сутності
  const { data: statuses, error: stErr } = await supabase
    .from('status_definitions')
    .select('id, name')
    .eq('entity_type_id', val);
  if (!stErr) statusList.value = statuses || [];
});

// ===== Визначення типу поля =====
function getFieldType(field) {
  if (field.type === 'text' || field.type === 'string') return 'text';
  if (field.type === 'number' || field.type === 'integer' || field.type === 'float') return 'number';
  if (field.type === 'boolean') return 'boolean';
  if (field.type === 'date' || field.type === 'datetime') return 'date';
  return 'other';
}

// ===== Конвертація значень до правильного типу =====
function normalizeConditionValue(fieldName, value) {
  const field = primitiveFieldOptions.value.find(f => f.value === fieldName);
  if (!field) return value;
  if (field.type === 'boolean') return value === true || value === 'true';
  if (field.type === 'number') return Number(value);
  return value;
}

// ===== Збереження =====
async function handleSubmit() {
  if (!selectedEntityTypeId.value || !user.value?.id) return;

  // Привести до типів (boolean, number і т.д.)
  const cleanConditions = conditions.value
    .filter(c => primitiveFieldOptions.value.some(f => f.value === c.field))
    .map(c => ({
      field: c.field,
      operator: c.operator,
      value: normalizeConditionValue(c.field, c.value)
    }));

  const cleanActions = actions.value.map(a => {
    if (a.type === 'field_update' && !primitiveFieldOptions.value.some(f => f.value === a.field)) {
      return null;
    }
    if (a.type === 'field_update') {
      return {
        ...a,
        value: normalizeConditionValue(a.field, a.value)
      };
    }
    return { ...a };
  }).filter(Boolean);

  const rule = {
    entity_type_id: selectedEntityTypeId.value,
    trigger: trigger.value,
    conditions: cleanConditions,
    actions: cleanActions,
    created_by: user.value.id
  };

  loading.value = true;
  if (isEditMode.value) {
    const { error } = await supabase.from('automation_rules').update(rule).eq('id', id);
    loading.value = false;
    if (!error) {
      alert('Автоматизацію оновлено!');
      router.push('/workflow');
    } else {
      alert('Помилка при оновленні!');
    }
  } else {
    const { error } = await supabase.from('automation_rules').insert([rule]);
    loading.value = false;
    if (!error) {
      alert('Автоматизацію створено!');
      router.push('/workflow');
    } else {
      alert('Помилка при створенні!');
    }
  }
}

// ===== Видалення =====
async function deleteAutomation() {
  if (!isEditMode.value) return;
  if (!confirm('Ви впевнені, що хочете видалити цю автоматизацію?')) return;
  loading.value = true;
  const { error } = await supabase.from('automation_rules').delete().eq('id', id);
  loading.value = false;
  if (!error) {
    alert('Автоматизацію видалено!');
    router.push('/workflow');
  } else {
    alert('Помилка при видаленні!');
  }
}
</script>
