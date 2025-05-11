import { defineStore } from 'pinia';
import { useSupabaseClient } from '#imports';
import type { EntityType } from '~/composables/useEntityForm';
import type { Database } from '~/types/supabase'

export const useEntityTypesStore = defineStore('entityTypes', () => {
  const supabase = useSupabaseClient<Database>();
  const loading = ref(false);
  const error = ref<string | null>(null);
  const entityTypes = ref<EntityType[]>([]);
  
  async function fetchEntityTypes() {
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: fetchError } = await supabase
        .from('entity_types')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      entityTypes.value = data as EntityType[];
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch entity types';
      console.error('Error fetching entity types:', err);
    } finally {
      loading.value = false;
    }
  }
  
  async function getEntityType(id: string): Promise<EntityType | null> {
    loading.value = true;
    error.value = null;
  
    try {
      const { data, error: fetchError } = await supabase
        .from('entity_types')
        .select('*')
        .eq('id', id)
        .single();
  
      if (fetchError || !data) throw fetchError || new Error('Entity type not found');
  
      const { data: statuses, error: statusError } = await supabase
        .from('status_definitions')
        .select('*')
        .eq('entity_type_id', data.id);
  
      if (statusError) throw statusError;
  
      return { ...data, statuses } as EntityType;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch entity type';
      console.error('Error fetching entity type:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }
  
  async function getEntityTypeBySlug(slug: string): Promise<EntityType | null> {
    loading.value = true;
    error.value = null;
  
    try {
      const { data, error: fetchError } = await supabase
        .from('entity_types')
        .select('*')
        .eq('slug', slug)
        .single();
  
      if (fetchError || !data) throw fetchError || new Error('Entity type not found');
  
      const { data: statuses, error: statusError } = await supabase
        .from('status_definitions')
        .select('*')
        .eq('entity_type_id', data.id);
  
      if (statusError) throw statusError;
  
      return { ...data, statuses } as EntityType;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch entity type';
      console.error('Error fetching entity type by slug:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }
  
  
  async function createEntityType(entityType: Omit<EntityType, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) {
    loading.value = true;
    error.value = null;
  
    try {
      const user = useSupabaseUser();
  
      const { statuses = [], ...cleanEntity } = entityType;
  
      const { data, error: createError } = await supabase
        .from('entity_types')
        .insert({
          ...cleanEntity,
          user_id: user.value?.id,
          icon: cleanEntity.icon || 'box'
        })
        .select()
        .single();
  
      if (createError) throw createError;
  
      // Сохраняем статусы
      await Promise.all(
        statuses.map(status =>
          supabase.from('status_definitions').insert({
            ...status,
            entity_type_id: data.id
          })
        )
      );
  
      entityTypes.value.unshift(data as EntityType);
      return data as EntityType;
    } catch (err: any) {
      error.value = err.message || 'Failed to create entity type';
      console.error('Error creating entity type:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updateEntityType(id: string, updates: Partial<EntityType>) {
    loading.value = true;
    error.value = null;
  
    try {
      const { statuses = [], ...cleanUpdates } = updates;
  
      const { data, error: updateError } = await supabase
        .from('entity_types')
        .update({
          ...cleanUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
  
      if (updateError) throw updateError;
  
      // Удалим старые и вставим новые статусы
      await supabase.from('status_definitions').delete().eq('entity_type_id', id);
  
      await Promise.all(
        statuses.map(status =>
          supabase.from('status_definitions').insert({
            ...status,
            entity_type_id: id
          })
        )
      );
  
      const index = entityTypes.value.findIndex(et => et.id === id);
      if (index !== -1) {
        entityTypes.value[index] = { ...entityTypes.value[index], ...data };
      }
  
      return data as EntityType;
    } catch (err: any) {
      error.value = err.message || 'Failed to update entity type';
      console.error('Error updating entity type:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }  
  
  async function deleteEntityType(id: string) {
    loading.value = true;
    error.value = null;
    
    try {
      const { error: deleteError } = await supabase
        .from('entity_types')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      // Remove from local state
      entityTypes.value = entityTypes.value.filter(et => et.id !== id);
      return true;
    } catch (err: any) {
      error.value = err.message || 'Failed to delete entity type';
      console.error('Error deleting entity type:', err);
      return false;
    } finally {
      loading.value = false;
    }
  }
  
  return {
    loading,
    error,
    entityTypes,
    fetchEntityTypes,
    getEntityType,
    createEntityType,
    updateEntityType,
    deleteEntityType,
    getEntityTypeBySlug,
  };
});