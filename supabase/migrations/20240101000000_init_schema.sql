-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. Profiles (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- 2. Workspaces
create table if not exists workspaces (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  owner_id uuid references auth.users(id) not null,
  stripe_customer_id text,
  subscription_status text default 'free', -- free, active, past_due
  subscription_plan text default 'starter', -- starter, pro, max
  created_at timestamptz default now()
);

-- 3. Workspace Members
create table if not exists workspace_members (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text default 'member', -- owner, admin, member, viewer
  created_at timestamptz default now(),
  unique(workspace_id, user_id)
);

-- 4. Tables (The "Mesa" aka Session)
create table if not exists tables (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  template_id text not null, -- marketing, product, career, etc.
  title text not null,
  status text default 'active', -- active, archived
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. Messages (Chat functionality)
create table if not exists messages (
  id uuid default uuid_generate_v4() primary key,
  table_id uuid references tables(id) on delete cascade not null,
  role text not null, -- user, assistant, system
  content text not null,
  persona_id text, -- dev, pm, marketer (if role is assistant)
  created_at timestamptz default now()
);

-- 6. Artifacts (The Output)
create table if not exists artifacts (
  id uuid default uuid_generate_v4() primary key,
  table_id uuid references tables(id) on delete cascade not null,
  type text not null, -- plan, checklist, summary
  title text,
  content_json jsonb not null,
  version int default 1,
  is_public boolean default false,
  public_share_id uuid default uuid_generate_v4(),
  created_at timestamptz default now()
);

-- 7. Memory Cards (Editable Context)
create table if not exists memory_cards (
  id uuid default uuid_generate_v4() primary key,
  table_id uuid references tables(id) on delete cascade not null,
  category text not null, -- constraint, goal, preference
  content text not null,
  created_at timestamptz default now()
);

-- 8. Events (Telemetry)
create table if not exists events (
  id uuid default uuid_generate_v4() primary key,
  event_name text not null,
  payload jsonb,
  user_id uuid references auth.users(id),
  workspace_id uuid references workspaces(id),
  created_at timestamptz default now()
);

-- RLS POLICIES ----------------------------------------------------------------

alter table profiles enable row level security;
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table tables enable row level security;
alter table messages enable row level security;
alter table artifacts enable row level security;
alter table memory_cards enable row level security;

-- Profiles: Users can view/edit their own
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Users can view own profile' and tablename = 'profiles') then
    create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Users can update own profile' and tablename = 'profiles') then
    create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
  end if;
end $$;

-- Workspaces: Access via membership
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Members can view workspaces' and tablename = 'workspaces') then
    create policy "Members can view workspaces" on workspaces for select using (
      exists (select 1 from workspace_members where workspace_id = workspaces.id and user_id = auth.uid())
    );
  end if;
end $$;
  
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Owners can update workspaces' and tablename = 'workspaces') then
    create policy "Owners can update workspaces" on workspaces for update using (owner_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Users can create workspaces' and tablename = 'workspaces') then
    create policy "Users can create workspaces" on workspaces for insert with check (auth.uid() = owner_id);
  end if;
end $$;

-- Workspace Members
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Members can view other members' and tablename = 'workspace_members') then
    create policy "Members can view other members" on workspace_members for select using (
      exists (select 1 from workspace_members wm where wm.workspace_id = workspace_members.workspace_id and wm.user_id = auth.uid())
    );
  end if;
end $$;

-- Tables: Access via workspace membership
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Members can view tables' and tablename = 'tables') then
    create policy "Members can view tables" on tables for select using (
      exists (select 1 from workspace_members where workspace_id = tables.workspace_id and user_id = auth.uid())
    );
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Members can insert tables' and tablename = 'tables') then
    create policy "Members can insert tables" on tables for insert with check (
      exists (select 1 from workspace_members where workspace_id = tables.workspace_id and user_id = auth.uid())
    );
  end if;
end $$;
  
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Members can update tables' and tablename = 'tables') then
    create policy "Members can update tables" on tables for update using (
      exists (select 1 from workspace_members where workspace_id = tables.workspace_id and user_id = auth.uid())
    );
  end if;
end $$;

-- Messages & Artifacts & Memory: Inherit from Table -> Workspace
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Access messages via table' and tablename = 'messages') then
    create policy "Access messages via table" on messages for all using (
      exists (select 1 from tables t
        join workspace_members wm on wm.workspace_id = t.workspace_id
        where t.id = messages.table_id and wm.user_id = auth.uid())
    );
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Access artifacts via table' and tablename = 'artifacts') then
    create policy "Access artifacts via table" on artifacts for all using (
      exists (select 1 from tables t
        join workspace_members wm on wm.workspace_id = t.workspace_id
        where t.id = artifacts.table_id and wm.user_id = auth.uid())
    );
  end if;
end $$;

-- Public Artifacts (Read-only for everyone)
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Public artifacts are viewable by everyone' and tablename = 'artifacts') then
    create policy "Public artifacts are viewable by everyone" on artifacts for select using (is_public = true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Access memory via table' and tablename = 'memory_cards') then
    create policy "Access memory via table" on memory_cards for all using (
      exists (select 1 from tables t
        join workspace_members wm on wm.workspace_id = t.workspace_id
        where t.id = memory_cards.table_id and wm.user_id = auth.uid())
    );
  end if;
end $$;

-- Triggers for Profile Creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
  end if;
end $$;
