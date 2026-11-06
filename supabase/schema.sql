-- ════════════════════════════════════════════════════════════════════════
--  ModelClic — database schema
--  Run once in Supabase → SQL Editor → New query → paste → Run.
--  Roles: admin · host · talent
-- ════════════════════════════════════════════════════════════════════════

-- ── Types ───────────────────────────────────────────────────────────────
create type public.user_role as enum ('admin', 'host', 'talent');
create type public.gig_status as enum ('pending', 'open', 'closed', 'rejected');
create type public.application_status as enum ('applied', 'accepted', 'declined', 'withdrawn');

-- ── Profiles (public-facing; visible to signed-in members) ─────────────
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null,
  role        public.user_role not null default 'talent',
  city        text,
  verified    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ── Private details (only the owner and admins) ────────────────────────
create table public.private_details (
  id     uuid primary key references public.profiles (id) on delete cascade,
  phone  text
);

-- ── Gigs (shifts posted by hosts) ──────────────────────────────────────
create table public.gigs (
  id          uuid primary key default gen_random_uuid(),
  host_id     uuid not null references public.profiles (id) on delete cascade,
  title       text not null check (char_length(title) between 4 and 120),
  category    text not null,
  city        text not null,
  venue       text not null,
  event_date  timestamptz not null,
  pay_ngn     integer not null check (pay_ngn >= 1000),
  slots       integer not null default 1 check (slots between 1 and 200),
  description text,
  status      public.gig_status not null default 'pending',
  created_at  timestamptz not null default now()
);
create index gigs_open_idx on public.gigs (status, event_date);
create index gigs_host_idx on public.gigs (host_id);

-- ── Applications (talent → gig) ────────────────────────────────────────
create table public.applications (
  id          uuid primary key default gen_random_uuid(),
  gig_id      uuid not null references public.gigs (id) on delete cascade,
  talent_id   uuid not null references public.profiles (id) on delete cascade,
  message     text,
  status      public.application_status not null default 'applied',
  created_at  timestamptz not null default now(),
  unique (gig_id, talent_id)
);
create index applications_talent_idx on public.applications (talent_id);

-- ── Helpers ────────────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.my_role()
returns public.user_role language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ── New user → profile (role from signup, but never 'admin') ───────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  r public.user_role := case when new.raw_user_meta_data ->> 'role' = 'host' then 'host' else 'talent' end;
begin
  insert into public.profiles (id, full_name, role, city)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    r,
    new.raw_user_meta_data ->> 'city'
  );
  insert into public.private_details (id, phone) values (new.id, new.raw_user_meta_data ->> 'phone');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Guard rails enforced in the database ───────────────────────────────
-- Members can't change their own role or verified flag.
create or replace function public.guard_profile_update()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  -- auth.uid() is null when you run SQL in the dashboard editor — allowed.
  if auth.uid() is not null and not public.is_admin() and (new.role is distinct from old.role or new.verified is distinct from old.verified) then
    raise exception 'Only admins can change role or verification';
  end if;
  return new;
end;
$$;
create trigger profiles_guard before update on public.profiles
  for each row execute function public.guard_profile_update();

-- Hosts can't approve their own gigs; only admins set 'open' or 'rejected'.
create or replace function public.guard_gig_status()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.status := 'pending';
    elsif new.status is distinct from old.status and new.status <> 'closed' then
      raise exception 'Only admins can approve or reject shifts';
    end if;
    if tg_op = 'UPDATE' and new.host_id is distinct from old.host_id then
      raise exception 'Cannot change shift owner';
    end if;
  end if;
  return new;
end;
$$;
create trigger gigs_guard before insert or update on public.gigs
  for each row execute function public.guard_gig_status();

-- Talent may only withdraw; hosts may only accept/decline.
create or replace function public.guard_application_update()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or public.is_admin() then return new; end if;
  if new.gig_id is distinct from old.gig_id or new.talent_id is distinct from old.talent_id then
    raise exception 'Cannot move an application';
  end if;
  if auth.uid() = old.talent_id and new.status not in ('withdrawn', old.status) then
    raise exception 'Talent can only withdraw';
  end if;
  if auth.uid() <> old.talent_id and new.status not in ('accepted', 'declined') then
    raise exception 'Hosts can only accept or decline';
  end if;
  return new;
end;
$$;
create trigger applications_guard before update on public.applications
  for each row execute function public.guard_application_update();

-- ── Row Level Security ─────────────────────────────────────────────────
alter table public.profiles        enable row level security;
alter table public.private_details enable row level security;
alter table public.gigs            enable row level security;
alter table public.applications    enable row level security;

-- profiles
create policy "members can view profiles" on public.profiles
  for select to authenticated using (true);
create policy "update own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "admins update any profile" on public.profiles
  for update to authenticated using (public.is_admin());

-- private_details
create policy "own or admin can read private details" on public.private_details
  for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "update own private details" on public.private_details
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- gigs
create policy "anyone can view live gigs" on public.gigs
  for select to anon, authenticated using (status = 'open');
create policy "hosts view own gigs" on public.gigs
  for select to authenticated using (host_id = auth.uid());
create policy "admins view all gigs" on public.gigs
  for select to authenticated using (public.is_admin());
create policy "hosts create gigs" on public.gigs
  for insert to authenticated with check (host_id = auth.uid() and public.my_role() = 'host');
create policy "hosts update own gigs" on public.gigs
  for update to authenticated using (host_id = auth.uid()) with check (host_id = auth.uid());
create policy "admins update gigs" on public.gigs
  for update to authenticated using (public.is_admin());

-- applications
create policy "talent view own applications" on public.applications
  for select to authenticated using (talent_id = auth.uid());
create policy "hosts view applications to their gigs" on public.applications
  for select to authenticated
  using (exists (select 1 from public.gigs g where g.id = gig_id and g.host_id = auth.uid()));
create policy "admins view all applications" on public.applications
  for select to authenticated using (public.is_admin());
create policy "talent apply to live gigs" on public.applications
  for insert to authenticated
  with check (
    talent_id = auth.uid()
    and public.my_role() = 'talent'
    and exists (select 1 from public.gigs g where g.id = gig_id and g.status = 'open' and g.event_date > now())
  );
create policy "talent withdraw own application" on public.applications
  for update to authenticated using (talent_id = auth.uid());
create policy "hosts respond to applications" on public.applications
  for update to authenticated
  using (exists (select 1 from public.gigs g where g.id = gig_id and g.host_id = auth.uid()));

-- ════════════════════════════════════════════════════════════════════════
--  Make yourself admin (run AFTER you sign up on the site with your email):
--
--  update public.profiles set role = 'admin'
--  where id = (select id from auth.users where email = 'sarahndianekwu@gmail.com');
-- ════════════════════════════════════════════════════════════════════════
