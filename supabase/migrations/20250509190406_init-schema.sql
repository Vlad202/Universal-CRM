drop table if exists public.entity_records cascade;
drop table if exists public.entity_types cascade;

-- Таблица типов сущностей (entity_types)
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

-- Таблица записей сущностей (entity_records)
create table public.entity_records (
  id uuid primary key default gen_random_uuid(),
  entity_type_id uuid references public.entity_types(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  data jsonb not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Включить RLS
alter table public.entity_types enable row level security;
alter table public.entity_records enable row level security;

-- Разрешить владельцу управлять entity_types
create policy "Users can manage own entity types" on public.entity_types
  for all using (auth.uid() = user_id);

-- Разрешить владельцу управлять entity_records
create policy "Users can manage own entity records" on public.entity_records
  for all using (auth.uid() = user_id);
