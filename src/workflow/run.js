import { useSupabaseClient } from '#imports';

/**
 * Підставляє {{field}} у url/body на відповідні значення з entityData.
 */
function applyTemplate(str, entityData) {
  return str.replace(/\{\{(\w+)\}\}/g, (_, field) => entityData[field] ?? '');
}

/**
 * Відправляє вебхук із підставленими значеннями.
 */
async function sendWebhook({ url, method = 'POST', body, entityData }) {
  const fetchUrl = applyTemplate(url, entityData);
  let fetchOpts = { method };

  if (method === 'POST' && body) {
    // Якщо body — це строка із масками (наприклад, JSON-stringify з масками)
    const finalBody = applyTemplate(body, entityData);
    try {
      // Перевіряємо, чи це JSON
      fetchOpts.headers = { 'Content-Type': 'application/json' };
      fetchOpts.body = JSON.stringify(JSON.parse(finalBody));
    } catch {
      // Не JSON — відправляємо як є
      fetchOpts.body = finalBody;
    }
  }

  try {
    const res = await fetch(fetchUrl, fetchOpts);
    return await res.text();
  } catch (e) {
    console.error('Webhook error:', e);
    return null;
  }
}

export async function handleAutomationsClient({ entityTypeId, entityId, triggerType, entityData }) {
  const supabase = useSupabaseClient();

  // 1. Отримати всі активні автоматизації для типу сутності і тригера
  const { data: rules, error } = await supabase
    .from('automation_rules')
    .select('*')
    .eq('entity_type_id', entityTypeId)
    .eq('trigger', triggerType);

  if (error) {
    console.error('Помилка отримання автоматизацій:', error);
    return;
  }

  for (const rule of rules) {
    let allConditionsPassed = true;
    for (const cond of rule.conditions || []) {
      const fieldVal = entityData?.[cond.field];
      switch (cond.operator) {
        case 'equals':
          if (String(fieldVal) !== String(cond.value)) allConditionsPassed = false;
          break;
        case 'greater_than':
          if (!(Number(fieldVal) > Number(cond.value))) allConditionsPassed = false;
          break;
        case 'less_than':
          if (!(Number(fieldVal) < Number(cond.value))) allConditionsPassed = false;
          break;
        case 'contains':
          if (!String(fieldVal).includes(String(cond.value))) allConditionsPassed = false;
          break;
        case 'not_contains':
          if (String(fieldVal).includes(String(cond.value))) allConditionsPassed = false;
          break;
        case 'after':
          if (!(new Date(fieldVal) > new Date(cond.value))) allConditionsPassed = false;
          break;
        case 'before':
          if (!(new Date(fieldVal) < new Date(cond.value))) allConditionsPassed = false;
          break;
        default:
          allConditionsPassed = false;
      }
      if (!allConditionsPassed) break;
    }

    if (!allConditionsPassed) continue;

    // === Виконуємо всі дії автоматизації ===
    for (const action of rule.actions || []) {
      if (action.type === 'status_update' && action.status) {
        entityData.status_id = action.status;
        await supabase.from('entity_records').update({
          data: entityData,
          updated_at: new Date().toISOString()
        }).eq('id', entityId);
      }
      if (action.type === 'field_update' && action.field && typeof action.value !== 'undefined') {
        entityData[action.field] = action.value;
        await supabase.from('entity_records').update({
          data: entityData,
          updated_at: new Date().toISOString()
        }).eq('id', entityId);
      }
      if (action.type === 'webhook' && action.url) {
        // Підтримка підстановки у url та body (JSON чи text)
        await sendWebhook({
          url: action.url,
          method: action.method || 'POST',
          body: action.body || '',
          entityData
        });
      }
    }
  }
}
