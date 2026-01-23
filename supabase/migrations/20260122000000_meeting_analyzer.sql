-- Migration: Meeting Analyzer v1.3
-- Adds tables for meetings, transcripts, insights, and shares

-- 1. Meetings Table
create type meeting_status as enum ('created', 'uploaded', 'transcribing', 'analyzing', 'done', 'error');

create table meetings (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  created_by uuid references auth.users(id) not null,
  title text not null,
  consent_confirmed boolean default false,
  jurisdiction text,
  audio_object_path text,
  duration_seconds int,
  status meeting_status default 'created',
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Meeting Transcripts
create table meeting_transcripts (
  id uuid default uuid_generate_v4() primary key,
  meeting_id uuid references meetings(id) on delete cascade not null unique,
  transcript_text text not null,
  transcript_json jsonb, -- structured timestamps/speakers
  model_used text,
  created_at timestamptz default now()
);

-- 3. Meeting Insights
create table meeting_insights (
  id uuid default uuid_generate_v4() primary key,
  meeting_id uuid references meetings(id) on delete cascade not null unique,
  insights_json jsonb not null, -- schema check via Zod in application layer
  model_used text,
  created_at timestamptz default now()
);

-- 4. Meeting Shares
create table meeting_shares (
  id uuid default uuid_generate_v4() primary key,
  meeting_id uuid references meetings(id) on delete cascade not null,
  public_id text unique not null, -- nanoid or similar generated in app
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- RLS POLICIES ----------------------------------------------------------------

alter table meetings enable row level security;
alter table meeting_transcripts enable row level security;
alter table meeting_insights enable row level security;
alter table meeting_shares enable row level security;

-- Meetings: Access via workspace membership
create policy "Members can view meetings" on meetings
  for select using (
    exists (select 1 from workspace_members where workspace_id = meetings.workspace_id and user_id = auth.uid())
  );

create policy "Members can insert meetings" on meetings
  for insert with check (
    exists (select 1 from workspace_members where workspace_id = meetings.workspace_id and user_id = auth.uid())
  );

create policy "Members can update meetings" on meetings
  for update using (
    exists (select 1 from workspace_members where workspace_id = meetings.workspace_id and user_id = auth.uid())
  );

-- Transcripts & Insights: Inherit from Meeting -> Workspace
create policy "Access transcripts via meeting" on meeting_transcripts
  for all using (
    exists (select 1 from meetings m
      join workspace_members wm on wm.workspace_id = m.workspace_id
      where m.id = meeting_transcripts.meeting_id and wm.user_id = auth.uid())
  );

create policy "Access insights via meeting" on meeting_insights
  for all using (
    exists (select 1 from meetings m
      join workspace_members wm on wm.workspace_id = m.workspace_id
      where m.id = meeting_insights.meeting_id and wm.user_id = auth.uid())
  );

-- Shares: Public access ONLY via public_id in specific app routes (service role usually)
-- But we enable read for creators/members
create policy "Members can view shares" on meeting_shares
  for select using (
    exists (select 1 from meetings m
      join workspace_members wm on wm.workspace_id = m.workspace_id
      where m.id = meeting_shares.meeting_id and wm.user_id = auth.uid())
  );

-- STORAGE CONFIGURATION (Manual instruction since we can't run SQL on storage directly via this tool easily, but naming it)
/*
  Bucket: meeting-audio
  Public: false
  Policies:
  1. Insert: authenticated users can upload if they are members of the workspace in the path (workspace/<workspace_id>/...)
  2. Select: authenticated users can read if they are members of the workspace
*/

-- Indexes
create index idx_meetings_workspace_id on meetings(workspace_id);
create index idx_meeting_shares_public_id on meeting_shares(public_id);
