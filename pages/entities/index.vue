<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-neutral-900">Entities</h1>
        <p class="text-neutral-600 mt-2">Manage your custom entity types.</p>
      </div>
      <NuxtLink to="/entities/create" class="btn btn-primary">
        <Icon icon="heroicons:plus" class="h-4 w-4 mr-2" />
        New Entity
      </NuxtLink>
    </div>
    
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
    
    <div v-else-if="entityTypes.length === 0" class="card text-center py-12">
      <div class="mb-6">
        <div class="mx-auto h-16 w-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
          <Icon icon="heroicons:squares-plus" class="h-8 w-8" />
        </div>
      </div>
      <h2 class="text-2xl font-semibold mb-4">Get started by creating your first entity</h2>
      <p class="text-neutral-600 mb-6 max-w-md mx-auto">
        Entities are the building blocks of your CRM. Create custom entities like Leads, Contacts, or Projects.
      </p>
      <NuxtLink to="/entities/create" class="btn btn-primary">
        Create Your First Entity
      </NuxtLink>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="entityType in entityTypes" 
        :key="entityType.id"
        class="card hover:shadow-md transition-shadow border border-neutral-200"
      >
        <div class="flex justify-between">
          <div class="flex items-center mb-4">
            <div class="h-10 w-10 rounded-md bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
              <Icon :icon="`heroicons:${entityType.icon || 'squares-2x2'}`" class="h-6 w-6" />
            </div>
            <h3 class="text-lg font-semibold">{{ entityType.name }}</h3>
          </div>
          <div class="relative" ref="menuRefs">
            <button @click="() => toggleMenu(entityType.id)" class="text-neutral-400 hover:text-neutral-600">
              <Icon icon="heroicons:ellipsis-vertical" class="h-5 w-5" />
            </button>
            <div 
              v-show="openMenu === entityType.id" 
              class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
            >
              <NuxtLink :to="`/entities/${entityType.slug}/edit`" class="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                Edit
              </NuxtLink>
              <button 
                @click="() => handleDeleteEntity(entityType.id, entityType.name)" 
                class="block w-full text-left px-4 py-2 text-sm text-error-600 hover:bg-neutral-100"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
        
        <p class="text-neutral-600 text-sm mb-4">
          {{ entityType.description || `Manage your ${entityType.name.toLowerCase()}` }}
        </p>
        
        <div class="border-t border-neutral-100 pt-4 mt-2">
          <div class="flex items-center text-sm text-neutral-500 mb-2">
            <Icon icon="heroicons:rectangle-stack" class="h-4 w-4 mr-2" />
            {{ (entityType.fields || []).length }} fields
          </div>
          <div class="flex items-center text-sm text-neutral-500">
            <Icon icon="heroicons:document-text" class="h-4 w-4 mr-2" />
            {{ entityType.recordCount || 0 }} records
          </div>
        </div>
        
        <div class="flex mt-6 space-x-2">
          <NuxtLink :to="`/entities/${entityType.slug}/records`" class="btn btn-sm btn-primary flex-1">
            View Records
          </NuxtLink>
          <NuxtLink :to="`/entities/${entityType.slug}/records/create`" class="btn btn-sm btn-outline flex-grow-0">
            <Icon icon="heroicons:plus" class="h-4 w-4" />
          </NuxtLink>
        </div>
      </div>
      
      <NuxtLink 
        to="/entities/create" 
        class="card hover:shadow-md transition-shadow border border-neutral-200 border-dashed flex flex-col items-center justify-center"
      >
        <div class="h-12 w-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mb-3">
          <Icon icon="heroicons:plus" class="h-6 w-6" />
        </div>
        <p class="text-primary-600 font-medium">Create New Entity</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useEntityTypesStore } from '~/stores/entityTypes';
import { Icon } from '@iconify/vue';
import { toast } from 'vue3-toastify';

definePageMeta({
  middleware: ['auth']
});

const entityTypesStore = useEntityTypesStore();
const loading = ref(true);
const entityTypes = ref([]);
const openMenu = ref(null);
const menuRefs = ref([]);

const toggleMenu = (id) => {
  openMenu.value = openMenu.value === id ? null : id;
};

const handleClickOutside = (event) => {
  if (openMenu.value && !menuRefs.value.some(ref => ref && ref.contains(event.target))) {
    openMenu.value = null;
  }
};

const handleDeleteEntity = async (id, name) => {
  if (confirm(`Are you sure you want to delete the "${name}" entity? This will delete all associated records and cannot be undone.`)) {
    try {
      await entityTypesStore.deleteEntityType(id);
      toast.success(`"${name}" entity type deleted successfully`);
      entityTypes.value = entityTypes.value.filter(et => et.id !== id);
    } catch (error) {
      toast.error('Error deleting entity type: ' + error.message);
    }
  }
};

onMounted(async () => {
  document.addEventListener('click', handleClickOutside);
  
  try {
    await entityTypesStore.fetchEntityTypes();
    entityTypes.value = entityTypesStore.entityTypes;
  } catch (error) {
    console.error('Error fetching entity types:', error);
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>