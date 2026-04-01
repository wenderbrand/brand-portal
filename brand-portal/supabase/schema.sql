-- ─── TABELAS ────────────────────────────────────────────────────

create table if not exists projects (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  logo_url     text,
  slug         text unique,
  is_published boolean not null default false,
  created_at   timestamptz not null default now()
);

create table if not exists project_content (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  section    text not null,
  content    jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  unique(project_id, section)
);

create table if not exists assets (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  file_url   text not null,
  file_name  text not null,
  created_at timestamptz not null default now()
);

-- ─── RLS ─────────────────────────────────────────────────────────

alter table projects        enable row level security;
alter table project_content enable row level security;
alter table assets          enable row level security;

-- projects: dono vê/edita os próprios; portal público lê publicados
create policy "owner_all" on projects
  for all using (auth.uid() = user_id);

create policy "public_read_published" on projects
  for select using (is_published = true);

-- project_content: dono edita; público lê se projeto publicado
create policy "owner_all" on project_content
  for all using (
    exists (select 1 from projects where id = project_id and user_id = auth.uid())
  );

create policy "public_read_published" on project_content
  for select using (
    exists (select 1 from projects where id = project_id and is_published = true)
  );

-- assets: mesma lógica
create policy "owner_all" on assets
  for all using (
    exists (select 1 from projects where id = project_id and user_id = auth.uid())
  );

create policy "public_read_published" on assets
  for select using (
    exists (select 1 from projects where id = project_id and is_published = true)
  );

-- ─── STORAGE ─────────────────────────────────────────────────────
-- Execute no painel Storage > New bucket:
-- 1. Bucket: "logos"   — public: true
-- 2. Bucket: "assets"  — public: true
--
-- Policies (para cada bucket, em Storage > Policies):

-- INSERT: só usuários autenticados
-- (name: "auth_upload", operation: INSERT)
-- using: (auth.role() = 'authenticated')

-- SELECT: público
-- (name: "public_read", operation: SELECT)
-- using: (true)
