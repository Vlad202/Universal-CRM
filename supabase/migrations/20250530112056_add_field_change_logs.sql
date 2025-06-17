-- Таблица изменений полей записей
create table public.field_change_logs (
  id uuid primary key default gen_random_uuid(),
  entity_record_id uuid references public.entity_records(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null,
  field_name text not null,         -- Название поля (текстом)
  old_value text,                   -- Предыдущее значение
  new_value text,                   -- Новое значение
  changed_at timestamptz default now()
);

-- Включение RLS
alter table public.field_change_logs enable row level security;

-- Политики доступа
-- Автор может вставлять записи
create policy "Users can insert field change logs" on public.field_change_logs
  for insert with check (auth.uid() = user_id);

-- Все могут читать
create policy "All users can read field change logs" on public.field_change_logs
  for select using (true);
