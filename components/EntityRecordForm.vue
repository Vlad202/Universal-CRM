<template>
  <form @submit.prevent="onSubmit" class="space-y-6">
    <div
      v-for="field in entityType.fields"
      :key="field.id"
    >
      <component
        v-if="field.type !== 'relation'"
        :is="resolveFieldComponent(field)"
        v-model="form[field.name]"
        :label="field.label"
        :placeholder="field.placeholder"
        :options="field.type === 'select' ? field.options : undefined"
        :required="field.required"
        :type="resolveFieldType(field.type)"
      />
      <BaseSelect
        v-else
        v-model="form[field.name]"
        :label="field.label"
        :required="field.required"
        :options="relationOptions[field.name] || []"
        placeholder="Оберіть залежну сутність"
      />
    </div>

    <BaseSelect
      v-if="statuses.length"
      v-model="form.status_id"
      label="Статус"
      :options="statuses.map(s => ({ label: s.name, value: s.id }))"
    />

    <div class="pt-4 border-t flex justify-end">
      <BaseButton type="submit" variant="primary" :loading="loading">{{ submitLabel }}</BaseButton>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseTextarea from '@/components/ui/BaseTextarea.vue';
import BaseCheckbox from '@/components/ui/BaseCheckbox.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { useSupabaseClient } from '#imports';
import { useEntityForm } from '~/composables/useEntityForm';

const props = defineProps({
  form: Object,
  entityType: Object,
  statuses: Array,
  loading: Boolean,
  submitLabel: String
});

const emit = defineEmits(['submit']);
const { fieldTypes } = useEntityForm();
const supabase = useSupabaseClient();
const relationOptions = ref({});

function onSubmit() {
  emit('submit');
}

function resolveFieldComponent(field) {
  switch (field.type) {
    case 'select': return BaseSelect;
    case 'boolean': return BaseCheckbox;
    case 'textarea': return BaseTextarea;
    default: return BaseInput;
  }
}

function resolveFieldType(type) {
  switch (type) {
    case 'email': return 'email';
    case 'url': return 'url';
    case 'date': return 'date';
    case 'time': return 'time';
    case 'datetime': return 'datetime-local';
    case 'number': return 'number';
    case 'phone': return 'tel';
    default: return 'text';
  }
}

onMounted(async () => {
  for (const field of props.entityType.fields) {
    if (field.type === 'relation' && field.entityTypeId) {
      const { data, error } = await supabase
        .from('entity_records')
        .select('id, data')
        .eq('entity_type_id', field.entityTypeId);

      if (!error && data) {
        relationOptions.value[field.name] = data.map(r => ({
          label: r.data?.name || r.id.slice(0, 6),
          value: r.id
        }));
      }
    }
  }
});
</script>
