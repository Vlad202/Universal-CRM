create table public.automation_rules (
  id uuid primary key default gen_random_uuid(),
  entity_type_id uuid references public.entity_types(id) on delete cascade not null,
  trigger text not null,                              -- 'on_create', 'on_update', 'on_status_change'
  conditions jsonb not null default '[]',             -- масив умов
  actions jsonb not null default '[]',                -- масив дій
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Додатково: індекс для швидкого вибору по типу та тригеру
create index automation_rules_entity_type_trigger_idx
  on public.automation_rules(entity_type_id, trigger);

-- Включення RLS
alter table public.automation_rules enable row level security;

-- Доступ: користувач може бачити та змінювати тільки свої автоматизації
create policy "Users can manage own automation rules" on public.automation_rules
  for all using (auth.uid() = created_by);
