-- Удаление на случай повторной миграции
drop table if exists public.entity_status_history cascade;
drop table if exists public.tasks cascade;
drop table if exists public.entity_records cascade;
drop table if exists public.entity_types cascade;
drop table if exists public.status_definitions cascade;

-- Таблица типов сущностей
create table public.entity_types (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  fields jsonb not null default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Таблица универсальных сущностей
create table public.entity_records (
  id uuid primary key default gen_random_uuid(),
  entity_type_id uuid references public.entity_types(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  data jsonb not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Таблица статусов
create table public.status_definitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text default 'gray',
  is_default boolean default false,
  created_at timestamptz default now()
);

-- История смены статусов для сущностей
create table public.entity_status_history (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid references public.entity_records(id) on delete cascade not null,
  status_id uuid references public.status_definitions(id) on delete set null,
  changed_by uuid references auth.users(id) on delete set null,
  changed_at timestamptz default now()
);

-- Таблица задач
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid references public.entity_records(id) on delete cascade,
  assigned_to uuid references auth.users(id) on delete set null,
  title text not null,
  description text,
  status_id uuid references public.status_definitions(id) on delete set null,
  due_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Включение RLS
alter table public.entity_types enable row level security;
alter table public.entity_records enable row level security;
alter table public.status_definitions enable row level security;
alter table public.entity_status_history enable row level security;
alter table public.tasks enable row level security;

-- Политики доступа

-- Управление своими типами сущностей
create policy "Users can manage own entity types" on public.entity_types
  for all using (auth.uid() = user_id);

-- Управление своими сущностями
create policy "Users can manage own entity records" on public.entity_records
  for all using (auth.uid() = user_id);

-- Все пользователи могут читать статусы
create policy "All users can read statuses" on public.status_definitions
  for select using (true);

-- История статусов: только автор может писать, все могут читать
create policy "Users can insert their entity status history" on public.entity_status_history
  for insert using (auth.uid() = changed_by);

create policy "All users can read status history" on public.entity_status_history
  for select using (true);

-- Управление задачами, если назначены
create policy "Users can manage their tasks" on public.tasks
  for all using (auth.uid() = assigned_to);

create policy "Users can read their tasks" on public.tasks
  for select using (auth.uid() = assigned_to);
