-- Team Task Board: run this file in Supabase SQL Editor.
-- The policies use the logged-in user's auth.uid(), so users can only
-- read or change projects where a membership row grants access.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

-- Upgrade a profiles table created by an earlier partial setup.
alter table public.profiles
  add column if not exists full_name text,
  add column if not exists email text,
  add column if not exists created_at timestamptz;

alter table public.profiles
  alter column created_at set default now();

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 100),
  description text not null default '',
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Upgrade project columns when an earlier partial setup already created them.
alter table public.projects
  add column if not exists name text,
  add column if not exists description text,
  add column if not exists owner_id uuid references auth.users(id),
  add column if not exists created_at timestamptz;

update public.projects
set description = ''
where description is null;

alter table public.projects
  alter column description set default '',
  alter column description set not null,
  alter column created_at set default now();

create table if not exists public.memberships (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

-- Upgrade memberships created before the timestamp column was introduced.
alter table public.memberships
  add column if not exists created_at timestamptz;

update public.memberships
set created_at = now()
where created_at is null;

alter table public.memberships
  alter column created_at set default now(),
  alter column created_at set not null;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 160),
  description text not null default '',
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  assignee_id uuid references auth.users(id) on delete set null,
  created_by uuid not null references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Upgrade an existing tasks table created before created_by was added.
alter table public.tasks
  add column if not exists created_by uuid references auth.users(id);

update public.tasks as task
set created_by = project.owner_id
from public.projects as project
where task.project_id = project.id
  and task.created_by is null;

alter table public.tasks
  alter column created_by set default auth.uid(),
  alter column created_by set not null;

create index if not exists memberships_user_id_idx on public.memberships(user_id);
create index if not exists tasks_project_id_idx on public.tasks(project_id);

-- Keep RLS helper functions outside the exposed API schema. They read
-- memberships with RLS disabled, so memberships policies never recurse.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_project_member(target_project uuid)
returns boolean
language sql
security definer
set search_path = public, pg_temp
set row_security = off
stable
as $$
  select exists (
    select 1 from public.memberships
    where project_id = target_project and user_id = auth.uid()
  );
$$;

create or replace function private.has_project_role(target_project uuid, allowed_roles text[])
returns boolean
language sql
security definer
set search_path = public, pg_temp
set row_security = off
stable
as $$
  select exists (
    select 1 from public.memberships
    where project_id = target_project
      and user_id = auth.uid()
      and role = any(allowed_roles)
  );
$$;

alter function private.is_project_member(uuid) owner to postgres;
alter function private.has_project_role(uuid, text[]) owner to postgres;
grant execute on function private.is_project_member(uuid) to authenticated;
grant execute on function private.has_project_role(uuid, text[]) to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
set row_security = off
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email)
  on conflict (id) do update
    set full_name = excluded.full_name, email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.memberships enable row level security;
alter table public.tasks enable row level security;

-- Remove policies left by earlier setup versions before recreating the
-- memberships policies below. Any remaining recursive policy can still make
-- PostgreSQL evaluate the old rule.
do $$
declare
  policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'memberships'
  loop
    execute format('drop policy if exists %I on public.memberships', policy_record.policyname);
  end loop;
end;
$$;

drop policy if exists "Users can read their profile" on public.profiles;
create policy "Users can read their profile" on public.profiles
  for select using (id = auth.uid());

drop policy if exists "Users can update their profile" on public.profiles;
create policy "Users can update their profile" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "Project members can read member profiles" on public.profiles;
create policy "Project members can read member profiles" on public.profiles
  for select using (
    exists (
      select 1
      from public.memberships mine
      join public.memberships theirs on theirs.project_id = mine.project_id
      where mine.user_id = auth.uid() and theirs.user_id = profiles.id
    )
  );

drop policy if exists "Members can read projects" on public.projects;
create policy "Members can read projects" on public.projects
  for select using (private.is_project_member(id));

drop policy if exists "Authenticated users can create projects" on public.projects;
create policy "Authenticated users can create projects" on public.projects
  for insert with check (owner_id = auth.uid());

drop policy if exists "Owners can update projects" on public.projects;
create policy "Owners can update projects" on public.projects
  for update using (private.has_project_role(id, array['owner']))
  with check (private.has_project_role(id, array['owner']));

drop policy if exists "Owners can delete projects" on public.projects;
create policy "Owners can delete projects" on public.projects
  for delete using (private.has_project_role(id, array['owner']));

drop policy if exists "Members can read memberships" on public.memberships;
create policy "Members can read memberships" on public.memberships
  for select using (private.is_project_member(project_id));

drop policy if exists "Owners can add memberships" on public.memberships;
create policy "Owners can add memberships" on public.memberships
  for insert with check (private.has_project_role(project_id, array['owner']));

drop policy if exists "Users can join projects as themselves" on public.memberships;
create policy "Users can join projects as themselves" on public.memberships
  for insert with check (user_id = auth.uid() and role = 'member');

drop policy if exists "Owners can update memberships" on public.memberships;
create policy "Owners can update memberships" on public.memberships
  for update using (private.has_project_role(project_id, array['owner']))
  with check (private.has_project_role(project_id, array['owner']));

drop policy if exists "Owners can remove memberships" on public.memberships;
create policy "Owners can remove memberships" on public.memberships
  for delete using (private.has_project_role(project_id, array['owner']));

drop policy if exists "Members can read tasks" on public.tasks;
create policy "Members can read tasks" on public.tasks
  for select using (private.is_project_member(project_id));

drop policy if exists "Editors can create tasks" on public.tasks;
create policy "Editors can create tasks" on public.tasks
  for insert with check (
    private.has_project_role(project_id, array['owner', 'member'])
    and created_by = auth.uid()
  );

drop policy if exists "Editors can update tasks" on public.tasks;
create policy "Editors can update tasks" on public.tasks
  for update using (private.has_project_role(project_id, array['owner', 'member']))
  with check (private.has_project_role(project_id, array['owner', 'member']));

drop policy if exists "Editors can delete tasks" on public.tasks;
create policy "Editors can delete tasks" on public.tasks
  for delete using (private.has_project_role(project_id, array['owner', 'member']));

create or replace function public.create_project(project_name text, project_description text default '')
returns public.projects
language plpgsql
security definer
set search_path = public, pg_temp
set row_security = off
as $$
declare
  new_project public.projects;
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'You must be signed in to create a project'
      using errcode = 'insufficient_privilege';
  end if;

  insert into public.projects (name, description, owner_id)
  values (trim(project_name), coalesce(project_description, ''), current_user_id)
  returning * into new_project;

  insert into public.memberships (project_id, user_id, role)
  values (new_project.id, current_user_id, 'owner');

  return new_project;
end;
$$;

grant execute on function public.create_project(text, text) to authenticated;
