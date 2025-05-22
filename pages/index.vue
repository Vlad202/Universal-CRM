<template>
  <div class="bg-gradient-to-b from-primary-50 to-white">
    <!-- Hero Section -->
    <section class="py-20 px-4 max-w-7xl mx-auto">
      <div class="text-center">
        <h1 class="text-4xl md:text-6xl font-bold text-primary-800 mb-6">
          Створіть власну <span class="text-primary-600">CRM</span> систему з
          легкістю
        </h1>
        <p class="text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto mb-10">
          Створюйте власні сутності, визначайте поля і керуйте бізнес-даними
          так, як вам зручно. Без програмування.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink to="/auth/register" class="btn btn-primary btn-lg">
            Почати безкоштовно
          </NuxtLink>
          <a href="#features" class="btn btn-outline btn-lg">
            Дізнатися більше
          </a>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-16 px-4 max-w-7xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-3xl font-bold text-neutral-800 mb-4">
          Потужні можливості
        </h2>
        <p class="text-lg text-neutral-600 max-w-2xl mx-auto">
          Усе необхідне для створення повністю кастомізованої CRM-системи під
          ваш бізнес.
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Feature 1 -->
        <div class="card border border-neutral-200">
          <div
            class="h-12 w-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4"
          >
            <Icon icon="heroicons:squares-plus" class="h-6 w-6" />
          </div>
          <h3 class="text-xl font-semibold mb-2">Користувацькі сутності</h3>
          <p class="text-neutral-600">
            Створюйте власні типи сутностей, такі як Клієнти, Угоди, Проєкти або
            будь-що інше для вашого бізнесу.
          </p>
        </div>

        <!-- Feature 2 -->
        <div class="card border border-neutral-200">
          <div
            class="h-12 w-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4"
          >
            <Icon icon="heroicons:document-text" class="h-6 w-6" />
          </div>
          <h3 class="text-xl font-semibold mb-2">Динамічні поля</h3>
          <p class="text-neutral-600">
            Визначайте поля для кожної сутності з різними типами: текст, число,
            дата, список тощо.
          </p>
        </div>

        <!-- Feature 3 -->
        <div class="card border border-neutral-200">
          <div
            class="h-12 w-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4"
          >
            <Icon icon="heroicons:link" class="h-6 w-6" />
          </div>
          <h3 class="text-xl font-semibold mb-2">Зв'язки між сутностями</h3>
          <p class="text-neutral-600">
            З'єднуйте різні сутності між собою, створюючи логічні зв’язки між
            бізнес-даними.
          </p>
        </div>

        <!-- Feature 4 -->
        <div class="card border border-neutral-200">
          <div
            class="h-12 w-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4"
          >
            <Icon icon="heroicons:user-group" class="h-6 w-6" />
          </div>
          <h3 class="text-xl font-semibold mb-2">Управління користувачами</h3>
          <p class="text-neutral-600">
            Керуйте доступом до CRM за допомогою безпечної аутентифікації та
            управління користувачами.
          </p>
        </div>

        <!-- Feature 5 -->
        <div class="card border border-neutral-200">
          <div
            class="h-12 w-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4"
          >
            <Icon icon="heroicons:device-phone-mobile" class="h-6 w-6" />
          </div>
          <h3 class="text-xl font-semibold mb-2">
            Підтримка мобільних пристроїв
          </h3>
          <p class="text-neutral-600">
            Отримуйте доступ до вашої CRM з будь-якого пристрою: комп’ютера,
            планшета або телефону.
          </p>
        </div>

        <!-- Feature 6 -->
        <div class="card border border-neutral-200">
          <div
            class="h-12 w-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4"
          >
            <Icon icon="heroicons:chart-bar" class="h-6 w-6" />
          </div>
          <h3 class="text-xl font-semibold mb-2">Звіти та аналітика</h3>
          <p class="text-neutral-600">
            Отримуйте аналітику та звіти на основі даних вашої CRM — гнучко та
            зрозуміло.
          </p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 px-4 bg-primary-600 text-white">
      <div class="max-w-5xl mx-auto text-center">
        <h2 class="text-3xl font-bold mb-6">Готові створити власну CRM?</h2>
        <p class="text-lg mb-8 text-primary-50">
          Почніть вже сьогодні і переконайтесь, як легко створити систему, що
          ідеально підходить саме вам.
        </p>
        <NuxtLink
          to="/auth/register"
          class="btn bg-white text-primary-600 hover:bg-primary-50 btn-lg"
        >
          Зареєструватися
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
definePageMeta({
  layout: "default",
});
</script>
