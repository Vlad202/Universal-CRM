<template>
  <BaseModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #title>Створити користувача</template>

    <template #default>
      <form class="grid gap-4" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-sm mb-1">Імʼя</label>
          <input
            v-model="form.first_name"
            type="text"
            class="input w-full"
            required
          />
        </div>
        <div>
          <label class="block text-sm mb-1">Прізвище</label>
          <input
            v-model="form.last_name"
            type="text"
            class="input w-full"
            required
          />
        </div>
        <div>
          <label class="block text-sm mb-1">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="input w-full"
            required
          />
        </div>
        <div>
          <label class="block text-sm mb-1">Пароль</label>
          <input
            v-model="form.password"
            type="password"
            class="input w-full"
            required
            minlength="6"
          />
        </div>
        <div>
          <label class="block text-sm mb-1">Роль</label>
          <select v-model="form.role" class="input w-full">
            <option value="user">Користувач</option>
            <option value="admin">Адміністратор</option>
          </select>
        </div>
      </form>
    </template>

    <template #footer>
      <div class="flex gap-2 justify-end">
        <button class="btn" @click="$emit('update:modelValue', false)">
          Скасувати
        </button>
        <button class="btn btn-primary" @click="handleSubmit">Створити</button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref } from "vue";
import { useSupabaseClient } from "#imports";
import BaseModal from "@/components/ui/BaseModal.vue";

const props = defineProps({
  modelValue: Boolean,
});
const emit = defineEmits(["update:modelValue", "created"]);

const supabase = useSupabaseClient();

const form = ref({
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  role: "user",
});

async function handleSubmit() {
  const fullName = `${form.value.first_name} ${form.value.last_name}`.trim();

  const { data, error } = await supabase.auth.admin.createUser({
    email: form.value.email,
    password: form.value.password,
    email_confirm: false,
    user_metadata: {
      first_name: form.value.first_name,
      last_name: form.value.last_name,
      name: fullName,
      role: form.value.role,
    },
  });

  if (error) {
    alert("Помилка при створенні користувача");
    console.error(error);
    return;
  }

  alert("Користувача створено");
  emit("created");
  emit("update:modelValue", false);
}
</script>
