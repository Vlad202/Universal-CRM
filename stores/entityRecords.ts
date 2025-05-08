import { defineStore } from 'pinia';
// import { useSupabaseClient } from '#imports';
// import { EntityRecord } from '~/composables/useEntityForm';

export const useEntityRecordsStore = defineStore('entityRecords', () => {
  const supabase = useSupabaseClient();
  const loading = ref(false);
  const error = ref<string | null>(null);
  const records = ref<EntityRecord[]>([]);
  
  async function fetchRecordsByEntityType(entityTypeId: string) {
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: fetchError } = await supabase
        .from('entity_records')
        .select('*')
        .eq('entity_type_id', entityTypeId)
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      records.value = data as EntityRecord[];
      return data;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch records';
      console.error('Error fetching records:', err);
      return [];
    } finally {
      loading.value = false;
    }
  }
  
  async function getRecord(id: string): Promise<EntityRecord | null> {
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: fetchError } = await supabase
        .from('entity_records')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      return data as EntityRecord;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch record';
      console.error('Error fetching record:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }
  
  async function createRecord(record: Omit<EntityRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) {
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: createError } = await supabase
        .from('entity_records')
        .insert({
          entity_type_id: record.entityTypeId,
          data: record.data
        })
        .select()
        .single();
      
      if (createError) throw createError;
      
      records.value.unshift(data as EntityRecord);
      return data as EntityRecord;
    } catch (err: any) {
      error.value = err.message || 'Failed to create record';
      console.error('Error creating record:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }
  
  async function updateRecord(id: string, updates: Partial<EntityRecord>) {
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: updateError } = await supabase
        .from('entity_records')
        .update({
          data: updates.data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      // Update in local state
      const index = records.value.findIndex(r => r.id === id);
      if (index !== -1) {
        records.value[index] = { ...records.value[index], ...data };
      }
      
      return data as EntityRecord;
    } catch (err: any) {
      error.value = err.message || 'Failed to update record';
      console.error('Error updating record:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }
  
  async function deleteRecord(id: string) {
    loading.value = true;
    error.value = null;
    
    try {
      const { error: deleteError } = await supabase
        .from('entity_records')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      // Remove from local state
      records.value = records.value.filter(r => r.id !== id);
      return true;
    } catch (err: any) {
      error.value = err.message || 'Failed to delete record';
      console.error('Error deleting record:', err);
      return false;
    } finally {
      loading.value = false;
    }
  }
  
  return {
    loading,
    error,
    records,
    fetchRecordsByEntityType,
    getRecord,
    createRecord,
    updateRecord,
    deleteRecord
  };
});