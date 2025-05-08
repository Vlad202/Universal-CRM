<template>
  <div class="bg-gradient-to-b from-primary-50 to-white">
    <!-- Hero Section -->
    <section class="py-20 px-4 max-w-7xl mx-auto">
      <div class="text-center">
        <h1 class="text-4xl md:text-6xl font-bold text-primary-800 mb-6">
          Build your own <span class="text-primary-600">CRM</span> system with ease
        </h1>
        <p class="text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto mb-10">
          Create custom entities, define your own fields, and manage your business data exactly how you need it.
          No coding required.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink to="/auth/register" class="btn btn-primary btn-lg">
            Get Started Free
          </NuxtLink>
          <a href="#features" class="btn btn-outline btn-lg">
            Learn More
          </a>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-16 px-4 max-w-7xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-3xl font-bold text-neutral-800 mb-4">Powerful Features</h2>
        <p class="text-lg text-neutral-600 max-w-2xl mx-auto">
          Everything you need to create a completely customized CRM system tailored to your business needs.
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Feature 1 -->
        <div class="card border border-neutral-200">
          <div class="h-12 w-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4">
            <Icon icon="heroicons:squares-plus" class="h-6 w-6" />
          </div>
          <h3 class="text-xl font-semibold mb-2">Custom Entities</h3>
          <p class="text-neutral-600">
            Create your own custom entity types such as Leads, Deals, Projects, or anything else your business needs.
          </p>
        </div>

        <!-- Feature 2 -->
        <div class="card border border-neutral-200">
          <div class="h-12 w-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4">
            <Icon icon="heroicons:document-text" class="h-6 w-6" />
          </div>
          <h3 class="text-xl font-semibold mb-2">Dynamic Fields</h3>
          <p class="text-neutral-600">
            Define custom fields for each entity type with a variety of field types like text, number, date, select, and more.
          </p>
        </div>

        <!-- Feature 3 -->
        <div class="card border border-neutral-200">
          <div class="h-12 w-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4">
            <Icon icon="heroicons:link" class="h-6 w-6" />
          </div>
          <h3 class="text-xl font-semibold mb-2">Entity Relations</h3>
          <p class="text-neutral-600">
            Connect different entities together to create meaningful relationships between your business data.
          </p>
        </div>

        <!-- Feature 4 -->
        <div class="card border border-neutral-200">
          <div class="h-12 w-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4">
            <Icon icon="heroicons:user-group" class="h-6 w-6" />
          </div>
          <h3 class="text-xl font-semibold mb-2">User Management</h3>
          <p class="text-neutral-600">
            Control who has access to your CRM with secure authentication and user management.
          </p>
        </div>

        <!-- Feature 5 -->
        <div class="card border border-neutral-200">
          <div class="h-12 w-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4">
            <Icon icon="heroicons:device-phone-mobile" class="h-6 w-6" />
          </div>
          <h3 class="text-xl font-semibold mb-2">Mobile Friendly</h3>
          <p class="text-neutral-600">
            Access your CRM from any device with a responsive design that works on desktop, tablet, and mobile.
          </p>
        </div>

        <!-- Feature 6 -->
        <div class="card border border-neutral-200">
          <div class="h-12 w-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4">
            <Icon icon="heroicons:chart-bar" class="h-6 w-6" />
          </div>
          <h3 class="text-xl font-semibold mb-2">Reports & Analytics</h3>
          <p class="text-neutral-600">
            Get insights into your business with customizable reports and analytics based on your CRM data.
          </p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 px-4 bg-primary-600 text-white">
      <div class="max-w-5xl mx-auto text-center">
        <h2 class="text-3xl font-bold mb-6">Ready to build your custom CRM?</h2>
        <p class="text-lg mb-8 text-primary-50">
          Get started today and discover how easy it is to create a CRM system that fits your exact needs.
        </p>
        <NuxtLink to="/auth/register" class="btn bg-white text-primary-600 hover:bg-primary-50 btn-lg">
          Sign Up Now
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
definePageMeta({
  layout: 'default'
});
</script>