export interface FieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'date' | 'time' | 'datetime' | 'email' | 'phone' | 'url' | 'relation';
  label: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: any;
  options?: { label: string; value: string }[];
  entityTypeId?: string; // For relation type
}

export interface EntityType {
  id: string;
  name: string;
  description?: string;
  slug: string;
  fields: FieldDefinition[];
  icon?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface EntityRecord {
  id: string;
  entityTypeId: string;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export const useEntityForm = () => {
  const defaultFieldsByType = computed(() => ({
    text: { type: 'text', defaultValue: '' },
    number: { type: 'number', defaultValue: 0 },
    boolean: { type: 'boolean', defaultValue: false },
    select: { type: 'select', defaultValue: '', options: [] },
    date: { type: 'date', defaultValue: '' },
    time: { type: 'time', defaultValue: '' },
    datetime: { type: 'datetime', defaultValue: '' },
    email: { type: 'email', defaultValue: '' },
    phone: { type: 'phone', defaultValue: '' },
    url: { type: 'url', defaultValue: '' },
    relation: { type: 'relation', defaultValue: null, entityTypeId: '' }
  }));

  const fieldTypes = computed(() => [
    { label: 'Текст', value: 'text' },
    { label: 'Число', value: 'number' },
    { label: 'Логічний', value: 'boolean' },
    { label: 'Список', value: 'select' },
    { label: 'Дата', value: 'date' },
    { label: 'Час', value: 'time' },
    { label: 'Дата та час', value: 'datetime' },
    { label: 'Пошта', value: 'email' },
    { label: 'Телефон', value: 'phone' },
    { label: 'URL', value: 'url' },
    { label: "Зв'язок з іншою сутністю", value: 'relation' }
  ]);

  const createEmptyField = (type = 'text'): FieldDefinition => {
    const defaults = defaultFieldsByType.value[type] || defaultFieldsByType.value.text;
    
    return {
      id: crypto.randomUUID(),
      name: '',
      type: defaults.type,
      label: '',
      required: false,
      defaultValue: defaults.defaultValue,
      ...(type === 'select' ? { options: [] } : {}),
      ...(type === 'relation' ? { entityTypeId: '' } : {})
    };
  };

  const validateField = (field: FieldDefinition): string | null => {
    if (!field.name) return 'Field name is required';
    if (!field.label) return 'Field label is required';
    
    // Validate field name format (alphanumeric and underscore only)
    if (!/^[a-zA-Z0-9_]+$/.test(field.name)) {
      return 'Field name can only contain letters, numbers, and underscores';
    }
    
    // Type-specific validations
    if (field.type === 'select' && (!field.options || field.options.length === 0)) {
      return 'Select field must have at least one option';
    }
    
    if (field.type === 'relation' && !field.entityTypeId) {
      return 'Relation field must reference an entity type';
    }
    
    return null;
  };

  const getFieldComponent = (fieldType: string): string => {
    const componentMap: Record<string, string> = {
      text: 'BaseInput',
      number: 'BaseInput',
      boolean: 'BaseCheckbox',
      select: 'BaseSelect',
      date: 'BaseInput',
      time: 'BaseInput',
      datetime: 'BaseInput',
      email: 'BaseInput',
      phone: 'BaseInput',
      url: 'BaseInput',
      relation: 'EntityRelationSelect'
    };
    
    return componentMap[fieldType] || 'BaseInput';
  };

  const getFieldProps = (field: FieldDefinition): Record<string, any> => {
    const commonProps = {
      label: field.label,
      placeholder: field.placeholder || '',
      required: field.required
    };
    
    const typeSpecificProps: Record<string, Record<string, any>> = {
      text: { type: 'text' },
      number: { type: 'number' },
      boolean: {},
      select: { options: field.options || [] },
      date: { type: 'date' },
      time: { type: 'time' },
      datetime: { type: 'datetime-local' },
      email: { type: 'email' },
      phone: { type: 'tel' },
      url: { type: 'url' },
      relation: { entityTypeId: field.entityTypeId }
    };
    
    return { ...commonProps, ...(typeSpecificProps[field.type] || {}) };
  };

  return {
    fieldTypes,
    createEmptyField,
    validateField,
    getFieldComponent,
    getFieldProps
  };
};