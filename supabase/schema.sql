-- ════════════════════════════════════════════════════════════════════════════
--  ModelClic — full database (v2)
--  Supabase → SQL Editor → New query → paste this whole file → Run.
--  Safe to run on a fresh project. Roles: admin · host · talent
-- ════════════════════════════════════════════════════════════════════════════


-- ── Enums ───────────────────────────────────────────────────────────────────
create type public.user_role      as enum ('admin', 'host', 'talent');
create type public.kyc_status     as enum ('unverified', 'pending', 'verified', 'rejected');
create type public.event_status   as enum ('draft', 'pending', 'active', 'filled', 'completed', 'rejected', 'cancelled');
create type public.bid_status     as enum ('bid', 'offered', 'booked', 'declined', 'not_selected', 'withdrawn', 'completed', 'no_show');
create type public.tx_type        as enum ('deposit', 'escrow_hold', 'escrow_release', 'earning', 'withdrawal', 'fee', 'refund', 'bid_purchase');
create type public.tx_status      as enum ('pending', 'held', 'completed', 'failed', 'cancelled');
create type public.case_status    as enum ('open', 'in_progress', 'resolved');

-- ── Platform settings (single row) ──────────────────────────────────────────
create table public.app_settings (
  id                  boolean primary key default true check (id),
  fee_pct             numeric(5,2) not null default 10,
  monthly_points      int not null default 20,
  bid_cost            int not null default 3,
  auto_release_hours  int not null default 12,
  sos_sla_minutes     int not null default 2,
  topup_bank          text not null default 'Set in Admin → Settings',
  topup_account_name  text not null default 'ModelClic Escrow',
  topup_account_no    text not null default '0000000000',
  support_email       text not null default 'support@modelclic.com',
  updated_at          timestamptz not null default now()
);
insert into public.app_settings default values;

-- ── Catalog: skills and job types (admin-managed) ───────────────────────────
create table public.catalog_items (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('skill', 'job_type')),
  label       text not null,
  grp         text not null,
  typical_pay int,
  created_at  timestamptz not null default now(),
  unique (kind, label)
);

-- ── Profiles (public to signed-in members) ──────────────────────────────────
create table public.profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  role               public.user_role not null default 'talent',
  sides              public.user_role[] not null default '{talent}',
  first_name         text not null default '',
  last_name          text not null default '',
  full_name          text generated always as (trim(first_name || ' ' || last_name)) stored,
  company_name       text,
  staff_title        text,
  avatar_url         text,
  photos             text[] not null default '{}',
  bio                text,
  gender             text,
  skin_tone          text,
  body_type          text,
  height_cm          int,
  weight_kg          int,
  state              text,
  city               text,
  skills             text[] not null default '{}',
  job_prefs          text[] not null default '{}',
  availability       jsonb not null default '{}',
  available_for_work boolean not null default true,
  profile_done       boolean not null default false,
  kyc                public.kyc_status not null default 'unverified',
  host_kyc           public.kyc_status not null default 'unverified',
  bid_points         int not null default 20,
  rating_avg         numeric(3,2),
  rating_count       int not null default 0,
  gigs_completed     int not null default 0,
  no_shows           int not null default 0,
  created_at         timestamptz not null default now()
);
create index profiles_role_idx on public.profiles (role);

-- ── Private details (owner + admin only) ────────────────────────────────────
create table public.private_details (
  id                uuid primary key references public.profiles (id) on delete cascade,
  phone             text,
  email             text,
  dob               date,
  nin               text,
  cac               text,
  registered_name   text,
  address           text,
  ec_name           text,
  ec_relationship   text,
  ec_phone          text,
  bank_name         text,
  account_number    text,
  account_verified  boolean not null default false,
  notify_prefs      jsonb not null default '{"jobs":{"push":true,"email":true,"sms":false},"bids":{"push":true,"email":true,"sms":true},"payments":{"push":true,"email":true,"sms":true},"messages":{"push":true,"email":false,"sms":false}}',
  privacy_prefs     jsonb not null default '{"show_photos":true,"share_location_on_shift":true}'
);

-- ── Identity checks (KYC submissions) ───────────────────────────────────────
create table public.verifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  side          public.user_role not null check (side in ('talent', 'host')),
  nin           text not null,
  cac           text,
  selfie_path   text,
  id_doc_path   text,
  liveness      boolean not null default false,
  consent       boolean not null check (consent),
  status        public.kyc_status not null default 'pending',
  reviewer_id   uuid references public.profiles (id),
  notes         text,
  created_at    timestamptz not null default now(),
  reviewed_at   timestamptz
);

-- ── Events (posted by hosts) ────────────────────────────────────────────────
create table public.events (
  id                uuid primary key default gen_random_uuid(),
  host_id           uuid not null references public.profiles (id) on delete cascade,
  name              text not null check (char_length(name) between 3 and 140),
  type              text not null,
  description       text,
  staff_needed      int not null check (staff_needed between 1 and 500),
  state             text not null,
  city              text not null,
  venue             text,
  starts_at         timestamptz not null,
  ends_at           timestamptz not null,
  pay_ngn           int not null check (pay_ngn >= 1000),
  dress_code        text,
  gender_req        text,
  checkin_location  text,
  instructions      text,
  status            public.event_status not null default 'draft',
  review_note       text,
  created_at        timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index events_status_idx on public.events (status, starts_at);
create index events_host_idx on public.events (host_id);

-- Check-in codes: host-only
create table public.event_secrets (
  event_id      uuid primary key references public.events (id) on delete cascade,
  checkin_code  text not null default lpad((floor(random() * 10000))::int::text, 4, '0')
);

-- ── Bids / offers / bookings ────────────────────────────────────────────────
create table public.bids (
  id             uuid primary key default gen_random_uuid(),
  event_id       uuid not null references public.events (id) on delete cascade,
  talent_id      uuid not null references public.profiles (id) on delete cascade,
  status         public.bid_status not null default 'bid',
  invited        boolean not null default false,
  points_spent   int not null default 0,
  note           text,
  checked_in_at  timestamptz,
  arrived_at     timestamptz,
  completed_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (event_id, talent_id)
);
create index bids_talent_idx on public.bids (talent_id);

create table public.saved_events (
  user_id   uuid references public.profiles (id) on delete cascade,
  event_id  uuid references public.events (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

create table public.favorites (
  host_id    uuid references public.profiles (id) on delete cascade,
  talent_id  uuid references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (host_id, talent_id)
);

-- ── Messaging ───────────────────────────────────────────────────────────────
create table public.conversations (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('booking', 'support')),
  event_id    uuid references public.events (id) on delete cascade,
  a_id        uuid not null references public.profiles (id) on delete cascade, -- talent / requester
  b_id        uuid references public.profiles (id) on delete cascade,          -- host (null for support)
  last_at     timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  unique (kind, event_id, a_id, b_id)
);
create table public.messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations (id) on delete cascade,
  sender_id        uuid not null references public.profiles (id) on delete cascade,
  body             text not null check (char_length(body) between 1 and 2000),
  read_at          timestamptz,
  created_at       timestamptz not null default now()
);
create index messages_conv_idx on public.messages (conversation_id, created_at);

-- ── Notifications ───────────────────────────────────────────────────────────
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  text        text not null,
  link        text,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);

-- ── Wallet ledger ───────────────────────────────────────────────────────────
create table public.wallet_tx (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  type         public.tx_type not null,
  amount       int not null,                 -- naira, signed (+ in, − out)
  status       public.tx_status not null default 'pending',
  description  text not null,
  event_id     uuid references public.events (id) on delete set null,
  bid_id       uuid references public.bids (id) on delete set null,
  reference    text,
  created_at   timestamptz not null default now(),
  settled_at   timestamptz
);
create index wallet_tx_user_idx on public.wallet_tx (user_id, created_at desc);

-- ── Ratings (revealed together) ─────────────────────────────────────────────
create table public.ratings (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events (id) on delete cascade,
  rater_id    uuid not null references public.profiles (id) on delete cascade,
  ratee_id    uuid not null references public.profiles (id) on delete cascade,
  scores      jsonb not null,
  overall     numeric(3,2) not null,
  comment     text,
  created_at  timestamptz not null default now(),
  unique (event_id, rater_id, ratee_id)
);

-- ── Safety & support ────────────────────────────────────────────────────────
create table public.sos_alerts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  event_id     uuid references public.events (id) on delete set null,
  lat          double precision,
  lng          double precision,
  status       public.case_status not null default 'open',
  handled_by   uuid references public.profiles (id),
  created_at   timestamptz not null default now(),
  resolved_at  timestamptz
);
create table public.disputes (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid references public.events (id) on delete set null,
  raised_by    uuid not null references public.profiles (id) on delete cascade,
  against_id   uuid references public.profiles (id) on delete set null,
  kind         text not null default 'payment',   -- payment | no_show | conduct | other
  details      text not null,
  status       public.case_status not null default 'open',
  resolution   text,
  created_at   timestamptz not null default now()
);
create table public.tickets (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  subject      text not null,
  body         text not null,
  status       public.case_status not null default 'open',
  reply        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════════════
--  Helpers
-- ════════════════════════════════════════════════════════════════════════════
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.my_role() returns public.user_role
language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.settings() returns public.app_settings
language sql stable security definer set search_path = '' as $$
  select * from public.app_settings limit 1;
$$;

create or replace function public.notify(uid uuid, msg text, href text default null) returns void
language sql security definer set search_path = '' as $$
  insert into public.notifications (user_id, text, link) values (uid, msg, href);
$$;
revoke execute on function public.notify(uuid, text, text) from public, anon, authenticated;

-- Wallet balances. wallet_balance() is internal; wallet_summary() is what the app calls.
create or replace function public.wallet_balance(uid uuid)
returns table (available int, escrow int, pending_in int, total_earned int, total_withdrawn int, total_deposits int, fees int)
language sql stable security definer set search_path = '' as $$
  select
    coalesce(sum(amount) filter (where status = 'completed'), 0)::int
      + coalesce(sum(amount) filter (where status in ('pending', 'held') and amount < 0), 0)::int,
    coalesce(-sum(amount) filter (where type = 'escrow_hold' and status = 'held'), 0)::int,
    coalesce(sum(amount) filter (where type = 'earning' and status = 'held'), 0)::int,
    coalesce(sum(amount) filter (where type = 'earning' and status = 'completed'), 0)::int,
    coalesce(-sum(amount) filter (where type = 'withdrawal' and status = 'completed'), 0)::int,
    coalesce(sum(amount) filter (where type = 'deposit' and status = 'completed'), 0)::int,
    coalesce(-sum(amount) filter (where type = 'fee' and status = 'completed'), 0)::int
  from public.wallet_tx where user_id = uid;
$$;
revoke execute on function public.wallet_balance(uuid) from public, anon, authenticated;

create or replace function public.wallet_summary(uid uuid default null)
returns table (available int, escrow int, pending_in int, total_earned int, total_withdrawn int, total_deposits int, fees int)
language sql stable security definer set search_path = '' as $$
  select * from public.wallet_balance(case when public.is_admin() then coalesce(uid, auth.uid()) else auth.uid() end)
  where auth.uid() is not null;
$$;

-- Mask phone numbers, emails and handles in chat
create or replace function public.mask_contacts(t text) returns text
language sql immutable as $$
  select regexp_replace(
           regexp_replace(
             regexp_replace(t, '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', '[email hidden]', 'g'),
             '(\+?\d[\d\s-]{8,}\d)', '[number hidden]', 'g'),
           '(^|\s)@[A-Za-z0-9_.]{3,}', '\1[handle hidden]', 'g');
$$;

-- ════════════════════════════════════════════════════════════════════════════
--  New user → profile
-- ════════════════════════════════════════════════════════════════════════════
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}');
  r public.user_role := case when meta ->> 'role' = 'host' then 'host' else 'talent' end;
  fn text := coalesce(nullif(meta ->> 'first_name', ''), split_part(coalesce(meta ->> 'full_name', meta ->> 'name', ''), ' ', 1));
  ln text := coalesce(nullif(meta ->> 'last_name', ''), nullif(regexp_replace(coalesce(meta ->> 'full_name', meta ->> 'name', ''), '^\S+\s*', ''), ''));
begin
  insert into public.profiles (id, role, sides, first_name, last_name, company_name, gender, state, city, avatar_url)
  values (new.id, r, array[r], coalesce(nullif(fn, ''), split_part(new.email, '@', 1)), coalesce(ln, ''),
          nullif(meta ->> 'company', ''), nullif(meta ->> 'gender', ''), nullif(meta ->> 'state', ''),
          nullif(meta ->> 'city', ''), nullif(meta ->> 'avatar_url', ''));
  insert into public.private_details (id, phone, email, dob, nin, cac, registered_name, address)
  values (new.id, nullif(meta ->> 'phone', ''), new.email, nullif(meta ->> 'dob', '')::date,
          nullif(meta ->> 'nin', ''), nullif(meta ->> 'cac', ''), nullif(meta ->> 'registered_name', ''),
          nullif(meta ->> 'address', ''));
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ════════════════════════════════════════════════════════════════════════════
--  Guard rails
-- ════════════════════════════════════════════════════════════════════════════
create or replace function public.guard_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or public.is_admin() or current_setting('mc.trusted', true) = '1' then return new; end if;
  if new.kyc is distinct from old.kyc or new.host_kyc is distinct from old.host_kyc
     or new.bid_points is distinct from old.bid_points or new.rating_avg is distinct from old.rating_avg
     or new.rating_count is distinct from old.rating_count or new.gigs_completed is distinct from old.gigs_completed
     or new.no_shows is distinct from old.no_shows or new.staff_title is distinct from old.staff_title then
    raise exception 'That field is managed by ModelClic';
  end if;
  if 'admin' = any(new.sides) and not ('admin' = any(old.sides)) then raise exception 'Not allowed'; end if;
  if new.role is distinct from old.role and not (new.role = any(new.sides)) then
    raise exception 'Add that side to your account first';
  end if;
  return new;
end;
$$;
create trigger profiles_guard before update on public.profiles
  for each row execute function public.guard_profile();

create or replace function public.guard_event() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or public.is_admin() then return new; end if;
  if tg_op = 'INSERT' then
    if new.status not in ('draft', 'pending') then new.status := 'pending'; end if;
    return new;
  end if;
  if new.host_id is distinct from old.host_id then raise exception 'Cannot change event owner'; end if;
  -- hosts may: draft→pending (publish), any→cancelled, active→completed (after end). Approvals are admin-only.
  if new.status is distinct from old.status and not (
       (old.status = 'draft' and new.status = 'pending')
    or (new.status = 'cancelled')
    or (old.status in ('active', 'filled') and new.status = 'completed' and old.ends_at < now())
  ) then
    raise exception 'Only ModelClic can approve events';
  end if;
  if old.status not in ('draft', 'rejected') and (new.pay_ngn < old.pay_ngn) then
    raise exception 'Pay cannot be lowered after publishing';
  end if;
  if old.status = 'rejected' and new.status = 'rejected' then new.status := 'pending'; end if;
  return new;
end;
$$;
create trigger events_guard before insert or update on public.events
  for each row execute function public.guard_event();

create or replace function public.make_event_secret() returns trigger
language plpgsql security definer set search_path = '' as $$
begin insert into public.event_secrets (event_id) values (new.id); return new; end;
$$;
create trigger events_secret after insert on public.events
  for each row execute function public.make_event_secret();

-- Cancelling an event returns escrow, refunds bid points and tells everyone
create or replace function public.on_event_cancelled() returns trigger
language plpgsql security definer set search_path = '' as $$
declare b record;
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    perform set_config('mc.trusted', '1', true);
    update public.wallet_tx set status = 'cancelled', settled_at = now() where event_id = new.id and status = 'held';
    for b in select * from public.bids where event_id = new.id and status in ('bid', 'offered', 'booked') loop
      update public.profiles set bid_points = bid_points + b.points_spent where id = b.talent_id;
      perform public.notify(b.talent_id, new.name || ' was cancelled by the host' ||
        case when b.points_spent > 0 then ' — your bid points are refunded' else '' end, '/talent/gigs');
    end loop;
    update public.bids set status = 'withdrawn', updated_at = now() where event_id = new.id and status in ('bid', 'offered', 'booked');
  end if;
  return new;
end;
$$;
create trigger events_cancelled after update on public.events
  for each row execute function public.on_event_cancelled();

-- Bids are changed through functions only (below)
create or replace function public.guard_bid() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or public.is_admin() or current_setting('mc.trusted', true) = '1' then return new; end if;
  if tg_op = 'UPDATE' and auth.uid() = old.talent_id and new.status = 'withdrawn' and old.status = 'bid'
     and new.event_id = old.event_id and new.talent_id = old.talent_id then
    new.updated_at := now(); return new;
  end if;
  raise exception 'Use the app actions to change bids';
end;
$$;
create trigger bids_guard before insert or update on public.bids
  for each row execute function public.guard_bid();

-- ════════════════════════════════════════════════════════════════════════════
--  Actions (called from the app with supabase.rpc)
-- ════════════════════════════════════════════════════════════════════════════

-- Talent bids on an active event (costs bid points)
create or replace function public.place_bid(p_event uuid, p_note text default null) returns uuid
language plpgsql security definer set search_path = '' as $$
declare me public.profiles; ev public.events; cost int := (public.settings()).bid_cost; bid_id uuid;
begin
  select * into me from public.profiles where id = auth.uid();
  if me.role <> 'talent' then raise exception 'Switch to your talent side to bid'; end if;
  if not me.profile_done then raise exception 'Complete your profile before bidding'; end if;
  if me.kyc = 'unverified' or me.kyc = 'rejected' then raise exception 'Verify your identity before bidding'; end if;
  select * into ev from public.events where id = p_event;
  if ev.status <> 'active' or ev.starts_at < now() then raise exception 'This job is no longer open'; end if;
  if me.bid_points < cost then raise exception 'Not enough bid points'; end if;
  perform set_config('mc.trusted', '1', true);
  insert into public.bids (event_id, talent_id, points_spent, note) values (p_event, me.id, cost, p_note)
    on conflict (event_id, talent_id) do update set status = 'bid', points_spent = public.bids.points_spent + cost,
      note = excluded.note, updated_at = now()
    where public.bids.status = 'withdrawn'
    returning id into bid_id;
  if bid_id is null then raise exception 'You already bid on this job'; end if;
  update public.profiles set bid_points = bid_points - cost where id = me.id;
  perform public.notify(ev.host_id, 'New bid on ' || ev.name, '/host/events/' || ev.id);
  return bid_id;
end;
$$;

-- Host sends an offer to a bidder, or invites a talent directly
create or replace function public.send_offer(p_event uuid, p_talent uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare ev public.events; avail int; committed int;
begin
  select * into ev from public.events where id = p_event and host_id = auth.uid();
  if ev.id is null then raise exception 'Event not found'; end if;
  if ev.status not in ('active') then raise exception 'Event must be live to send offers'; end if;
  select available into avail from public.wallet_balance(auth.uid());
  select coalesce(count(*), 0) * ev.pay_ngn into committed from public.bids where event_id = ev.id and status = 'offered';
  if avail < committed + ev.pay_ngn then
    raise exception 'Fund your wallet first — offers need ₦% available for escrow', committed + ev.pay_ngn;
  end if;
  perform set_config('mc.trusted', '1', true);
  insert into public.bids (event_id, talent_id, status, invited) values (ev.id, p_talent, 'offered', true)
    on conflict (event_id, talent_id) do update set status = 'offered', updated_at = now()
    where public.bids.status in ('bid', 'not_selected', 'declined');
  perform public.notify(p_talent, 'You have an offer for ' || ev.name, '/talent/gigs?tab=offers');
end;
$$;

create or replace function public.decline_bid(p_bid uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare b public.bids;
begin
  select b2.* into b from public.bids b2 join public.events e on e.id = b2.event_id
   where b2.id = p_bid and e.host_id = auth.uid();
  if b.id is null then raise exception 'Not found'; end if;
  perform set_config('mc.trusted', '1', true);
  update public.bids set status = 'not_selected', updated_at = now() where id = p_bid and status in ('bid', 'offered');
end;
$$;

-- Talent accepts or declines an offer. Accepting books the shift and moves pay into escrow.
create or replace function public.respond_offer(p_bid uuid, p_accept boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare b public.bids; ev public.events; booked int; avail int; conv uuid;
begin
  select * into b from public.bids where id = p_bid and talent_id = auth.uid() and status = 'offered';
  if b.id is null then raise exception 'Offer not found'; end if;
  select * into ev from public.events where id = b.event_id;
  perform set_config('mc.trusted', '1', true);
  if not p_accept then
    update public.bids set status = 'declined', updated_at = now() where id = b.id;
    perform public.notify(ev.host_id, 'An offer for ' || ev.name || ' was declined', '/host/events/' || ev.id);
    return;
  end if;
  select count(*) into booked from public.bids where event_id = ev.id and status in ('booked', 'completed');
  if booked >= ev.staff_needed then raise exception 'This event is already fully booked'; end if;
  select available into avail from public.wallet_balance(ev.host_id);
  if avail < ev.pay_ngn then raise exception 'The host needs to fund escrow first — we''ve let them know'; end if;
  update public.bids set status = 'booked', updated_at = now() where id = b.id;
  insert into public.wallet_tx (user_id, type, amount, status, description, event_id, bid_id)
  values (ev.host_id, 'escrow_hold', -ev.pay_ngn, 'held', 'Escrow · ' || ev.name, ev.id, b.id),
         (b.talent_id, 'earning', ev.pay_ngn, 'held', ev.name, ev.id, b.id);
  if booked + 1 >= ev.staff_needed then
    update public.events set status = 'filled' where id = ev.id;
    update public.bids set status = 'not_selected', updated_at = now() where event_id = ev.id and status = 'bid';
  end if;
  insert into public.conversations (kind, event_id, a_id, b_id) values ('booking', ev.id, b.talent_id, ev.host_id)
    on conflict do nothing;
  perform public.notify(ev.host_id, 'Booked: a talent accepted your offer for ' || ev.name, '/host/events/' || ev.id);
end;
$$;

-- Talent withdraws from a booking (before the event) — escrow returns to host
create or replace function public.cancel_booking(p_bid uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare b public.bids; ev public.events;
begin
  select * into b from public.bids where id = p_bid and talent_id = auth.uid() and status = 'booked';
  if b.id is null then raise exception 'Booking not found'; end if;
  select * into ev from public.events where id = b.event_id;
  if ev.starts_at < now() + interval '24 hours' then raise exception 'Less than 24 hours to the event — contact support'; end if;
  perform set_config('mc.trusted', '1', true);
  update public.bids set status = 'withdrawn', updated_at = now() where id = b.id;
  update public.wallet_tx set status = 'cancelled', settled_at = now() where bid_id = b.id and status = 'held';
  if ev.status = 'filled' then update public.events set status = 'active' where id = ev.id; end if;
  perform public.notify(ev.host_id, 'A booked talent cancelled for ' || ev.name, '/host/events/' || ev.id);
end;
$$;

-- Talent checks in with the host's code on the day
create or replace function public.check_in(p_bid uuid, p_code text) returns void
language plpgsql security definer set search_path = '' as $$
declare b public.bids; code text; ev public.events;
begin
  select * into b from public.bids where id = p_bid and talent_id = auth.uid() and status = 'booked';
  if b.id is null then raise exception 'Booking not found'; end if;
  select * into ev from public.events where id = b.event_id;
  if now() < ev.starts_at - interval '3 hours' then raise exception 'Check-in opens 3 hours before the start'; end if;
  select checkin_code into code from public.event_secrets where event_id = b.event_id;
  if code <> trim(p_code) then raise exception 'That code doesn''t match. Ask the host for today''s code.'; end if;
  perform set_config('mc.trusted', '1', true);
  update public.bids set checked_in_at = now(), updated_at = now() where id = b.id;
  perform public.notify(ev.host_id, 'Checked in for ' || ev.name, '/host/events/' || ev.id);
end;
$$;

-- Host marks a booked talent as arrived / no-show
create or replace function public.mark_attendance(p_bid uuid, p_arrived boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare b public.bids;
begin
  select b2.* into b from public.bids b2 join public.events e on e.id = b2.event_id
   where b2.id = p_bid and e.host_id = auth.uid() and b2.status = 'booked';
  if b.id is null then raise exception 'Booking not found'; end if;
  perform set_config('mc.trusted', '1', true);
  if p_arrived then
    update public.bids set arrived_at = now(), updated_at = now() where id = b.id;
  else
    update public.bids set status = 'no_show', updated_at = now() where id = b.id;
    update public.wallet_tx set status = 'cancelled', settled_at = now() where bid_id = b.id and status = 'held';
    update public.profiles set no_shows = no_shows + 1 where id = b.talent_id;
    insert into public.disputes (event_id, raised_by, against_id, kind, details)
      values (b.event_id, auth.uid(), b.talent_id, 'no_show', 'Host reported a no-show');
  end if;
end;
$$;

-- Release escrow for one booking (host confirms, or automatic after the event)
create or replace function public.release_booking(p_bid uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare b public.bids; ev public.events; fee int;
begin
  select * into b from public.bids where id = p_bid and status = 'booked';
  if b.id is null then return; end if;
  select * into ev from public.events where id = b.event_id;
  fee := round(ev.pay_ngn * (public.settings()).fee_pct / 100.0);
  perform set_config('mc.trusted', '1', true);
  update public.bids set status = 'completed', completed_at = now(), updated_at = now() where id = b.id;
  update public.wallet_tx set status = 'completed', settled_at = now() where bid_id = b.id and status = 'held';
  insert into public.wallet_tx (user_id, type, amount, status, description, event_id, bid_id, settled_at)
    values (ev.host_id, 'fee', -fee, 'completed', 'Service fee · ' || ev.name, ev.id, b.id, now());
  update public.profiles set gigs_completed = gigs_completed + 1 where id = b.talent_id;
  perform public.notify(b.talent_id, 'Payment released for ' || ev.name, '/talent/wallet');
end;
$$;
revoke execute on function public.release_booking(uuid) from public, anon, authenticated;

create or replace function public.confirm_completion(p_bid uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare ok boolean;
begin
  select true into ok from public.bids b join public.events e on e.id = b.event_id
   where b.id = p_bid and e.host_id = auth.uid() and e.starts_at < now();
  if not coalesce(ok, false) then raise exception 'You can confirm once the event has started'; end if;
  perform public.release_booking(p_bid);
end;
$$;

-- Scheduled job: auto-release pay N hours after events end (see supabase/cron.sql)
create or replace function public.release_due_payments() returns int
language plpgsql security definer set search_path = '' as $$
declare r record; n int := 0;
begin
  for r in
    select b.id from public.bids b join public.events e on e.id = b.event_id
     where b.status = 'booked' and e.ends_at < now() - make_interval(hours => (public.settings()).auto_release_hours)
  loop
    perform public.release_booking(r.id); n := n + 1;
  end loop;
  update public.events e set status = 'completed'
   where status in ('active', 'filled') and ends_at < now()
     and not exists (select 1 from public.bids where event_id = e.id and status = 'booked');
  return n;
end;
$$;
revoke execute on function public.release_due_payments() from public, anon, authenticated;

create or replace function public.reset_monthly_points() returns void
language sql security definer set search_path = '' as $$
  update public.profiles set bid_points = greatest(bid_points, (public.settings()).monthly_points) where role = 'talent';
$$;
revoke execute on function public.reset_monthly_points() from public, anon, authenticated;

-- Ratings (both ways). Updates the averages.
create or replace function public.rate_user(p_event uuid, p_ratee uuid, p_scores jsonb, p_comment text default null) returns void
language plpgsql security definer set search_path = '' as $$
declare allowed boolean; avg_score numeric;
begin
  select true into allowed from public.bids b join public.events e on e.id = b.event_id
   where b.event_id = p_event and b.status = 'completed'
     and ((b.talent_id = auth.uid() and e.host_id = p_ratee) or (e.host_id = auth.uid() and b.talent_id = p_ratee));
  if not coalesce(allowed, false) then raise exception 'You can rate after a completed job'; end if;
  select avg(value::numeric) into avg_score from jsonb_each_text(p_scores);
  perform set_config('mc.trusted', '1', true);
  insert into public.ratings (event_id, rater_id, ratee_id, scores, overall, comment)
    values (p_event, auth.uid(), p_ratee, p_scores, round(avg_score, 2), p_comment);
  update public.profiles p set
    rating_count = (select count(*) from public.ratings where ratee_id = p.id),
    rating_avg = (select round(avg(overall), 2) from public.ratings where ratee_id = p.id)
  where p.id = p_ratee;
end;
$$;

-- Messaging
create or replace function public.send_message(p_conversation uuid, p_body text) returns void
language plpgsql security definer set search_path = '' as $$
declare c public.conversations; other uuid;
begin
  select * into c from public.conversations where id = p_conversation;
  if c.id is null or not (auth.uid() in (c.a_id, c.b_id) or (c.kind = 'support' and public.is_admin())) then
    raise exception 'Conversation not found';
  end if;
  insert into public.messages (conversation_id, sender_id, body)
    values (c.id, auth.uid(), public.mask_contacts(trim(p_body)));
  update public.conversations set last_at = now() where id = c.id;
  other := case when auth.uid() = c.a_id then c.b_id else c.a_id end;
  if other is not null then
    perform public.notify(other, 'New message', case when c.kind = 'support' then '/messages' else '/messages/' || c.id end);
  end if;
end;
$$;

create or replace function public.mark_conversation_read(p_conversation uuid) returns void
language sql security definer set search_path = '' as $$
  update public.messages m set read_at = now()
  from public.conversations c
  where m.conversation_id = c.id and c.id = p_conversation and m.read_at is null and m.sender_id <> auth.uid()
    and (auth.uid() in (c.a_id, c.b_id) or (c.kind = 'support' and public.is_admin()));
$$;

create or replace function public.support_conversation() returns uuid
language plpgsql security definer set search_path = '' as $$
declare cid uuid;
begin
  select id into cid from public.conversations where kind = 'support' and a_id = auth.uid();
  if cid is null then
    insert into public.conversations (kind, a_id) values ('support', auth.uid()) returning id into cid;
  end if;
  return cid;
end;
$$;

-- Safety
create or replace function public.raise_sos(p_event uuid default null, p_lat double precision default null, p_lng double precision default null) returns uuid
language plpgsql security definer set search_path = '' as $$
declare sid uuid; admin_id uuid;
begin
  insert into public.sos_alerts (user_id, event_id, lat, lng) values (auth.uid(), p_event, p_lat, p_lng) returning id into sid;
  for admin_id in select id from public.profiles where role = 'admin' loop
    perform public.notify(admin_id, 'SOS alert raised', '/admin?tab=sos');
  end loop;
  return sid;
end;
$$;

-- Wallet requests (settled by an admin until a payment provider is connected)
create or replace function public.request_deposit(p_amount int) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_amount < 1000 then raise exception 'Minimum top-up is ₦1,000'; end if;
  insert into public.wallet_tx (user_id, type, amount, status, description, reference)
    values (auth.uid(), 'deposit', p_amount, 'pending', 'Wallet top-up', 'MC-' || upper(substr(md5(random()::text), 1, 8)));
end;
$$;

create or replace function public.request_withdrawal(p_amount int) returns void
language plpgsql security definer set search_path = '' as $$
declare avail int; pd public.private_details;
begin
  select * into pd from public.private_details where id = auth.uid();
  if pd.account_number is null then raise exception 'Add a payout account first'; end if;
  select available into avail from public.wallet_balance(auth.uid());
  if p_amount < 500 then raise exception 'Minimum withdrawal is ₦500'; end if;
  if p_amount > avail then raise exception 'That''s more than your available balance'; end if;
  insert into public.wallet_tx (user_id, type, amount, status, description)
    values (auth.uid(), 'withdrawal', -p_amount, 'pending', 'Withdrawal to ' || coalesce(pd.bank_name, 'bank'));
end;
$$;

create or replace function public.buy_bid_points(p_points int) returns void
language plpgsql security definer set search_path = '' as $$
declare avail int; price int := p_points * 100;  -- ₦100 per point
begin
  if p_points not in (9, 30, 60) then raise exception 'Choose a bundle'; end if;
  select available into avail from public.wallet_balance(auth.uid());
  if avail < price then raise exception 'Top up your wallet first (₦% needed)', price; end if;
  perform set_config('mc.trusted', '1', true);
  insert into public.wallet_tx (user_id, type, amount, status, description, settled_at)
    values (auth.uid(), 'bid_purchase', -price, 'completed', p_points || ' bid points', now());
  update public.profiles set bid_points = bid_points + p_points where id = auth.uid();
end;
$$;

-- Admin actions
create or replace function public.admin_review_verification(p_id uuid, p_approve boolean, p_notes text default null) returns void
language plpgsql security definer set search_path = '' as $$
declare v public.verifications; st public.kyc_status := case when p_approve then 'verified' else 'rejected' end;
begin
  if not public.is_admin() then raise exception 'Admins only'; end if;
  update public.verifications set status = st, reviewer_id = auth.uid(), notes = p_notes, reviewed_at = now()
   where id = p_id returning * into v;
  if v.side = 'talent' then update public.profiles set kyc = st where id = v.user_id;
  else update public.profiles set host_kyc = st where id = v.user_id; end if;
  perform public.notify(v.user_id, case when p_approve then 'Your identity is verified ✓' else 'Your identity check needs another try' end,
    case when v.side = 'talent' then '/talent/verify' else '/host/verify' end);
end;
$$;

create or replace function public.admin_review_event(p_id uuid, p_approve boolean, p_note text default null) returns void
language plpgsql security definer set search_path = '' as $$
declare ev public.events;
begin
  if not public.is_admin() then raise exception 'Admins only'; end if;
  update public.events set status = case when p_approve then 'active'::public.event_status else 'rejected'::public.event_status end,
         review_note = p_note where id = p_id returning * into ev;
  perform public.notify(ev.host_id, case when p_approve then ev.name || ' is live' else ev.name || ' needs changes' end, '/host/events/' || ev.id);
end;
$$;

create or replace function public.admin_settle_tx(p_id uuid, p_ok boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare t public.wallet_tx;
begin
  if not public.is_admin() then raise exception 'Admins only'; end if;
  update public.wallet_tx set status = case when p_ok then 'completed'::public.tx_status else 'failed'::public.tx_status end, settled_at = now()
   where id = p_id and status = 'pending' and type in ('deposit', 'withdrawal') returning * into t;
  if t.id is not null then
    perform public.notify(t.user_id, case when t.type = 'deposit' then 'Top-up ' else 'Withdrawal ' end ||
      case when p_ok then 'completed' else 'failed' end, '/wallet');
  end if;
end;
$$;

create or replace function public.admin_analytics() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare out jsonb;
begin
  if not public.is_admin() then raise exception 'Admins only'; end if;
  select jsonb_build_object(
    'verified_members', (select count(*) from public.profiles where kyc = 'verified' or host_kyc = 'verified'),
    'verified_14d', (select count(*) from public.verifications where status = 'verified' and reviewed_at > now() - interval '14 days'),
    'events_30d', (select count(*) from public.events where created_at > now() - interval '30 days'),
    'revenue_30d', (select coalesce(-sum(amount), 0) from public.wallet_tx where type = 'fee' and status = 'completed' and created_at > now() - interval '30 days'),
    'escrow_now', (select coalesce(-sum(amount), 0) from public.wallet_tx where type = 'escrow_hold' and status = 'held'),
    'checks_per_day', (select coalesce(jsonb_agg(jsonb_build_object('day', d::date, 'count', (
        select count(*) from public.verifications where status = 'verified' and reviewed_at::date = d::date)) order by d), '[]')
        from generate_series(current_date - 13, current_date, interval '1 day') d),
    'funnel', jsonb_build_object(
        'bids', (select count(*) from public.bids where created_at > now() - interval '30 days' and not invited),
        'offers', (select count(*) from public.bids where created_at > now() - interval '30 days' and status in ('offered', 'booked', 'completed', 'declined')),
        'booked', (select count(*) from public.bids where created_at > now() - interval '30 days' and status in ('booked', 'completed')),
        'completed', (select count(*) from public.bids where created_at > now() - interval '30 days' and status = 'completed')),
    'by_type', (select coalesce(jsonb_agg(jsonb_build_object('type', type, 'count', n) order by n desc), '[]')
        from (select type, count(*) n from public.events where created_at > now() - interval '30 days' group by type limit 8) t),
    'members', jsonb_build_object(
        'talent', (select count(*) from public.profiles where role = 'talent'),
        'hosts', (select count(*) from public.profiles where role = 'host'))
  ) into out;
  return out;
end;
$$;

-- Spots filled per event (public numbers only)
create or replace function public.event_fill(p_ids uuid[])
returns table (event_id uuid, booked int, bids int)
language sql stable security definer set search_path = '' as $$
  select e.id,
    (select count(*) from public.bids b where b.event_id = e.id and b.status in ('booked', 'completed'))::int,
    (select count(*) from public.bids b where b.event_id = e.id and b.status not in ('withdrawn'))::int
  from public.events e where e.id = any(p_ids);
$$;

-- Talent search for hosts (age shown, birth date stays private)
create or replace function public.search_talent(p_q text default null, p_gender text default null, p_min_rating numeric default null, p_skill text default null)
returns table (id uuid, full_name text, avatar_url text, gender text, age int, city text, state text, skills text[],
               rating_avg numeric, rating_count int, gigs_completed int, verified boolean, bio text)
language sql stable security definer set search_path = '' as $$
  select p.id, p.full_name, p.avatar_url, p.gender, extract(year from age(pd.dob))::int, p.city, p.state, p.skills,
         p.rating_avg, p.rating_count, p.gigs_completed, p.kyc = 'verified', p.bio
  from public.profiles p left join public.private_details pd on pd.id = p.id
  where auth.uid() is not null and p.role = 'talent' and p.profile_done and p.available_for_work
    and (p_q is null or p.full_name ilike '%' || p_q || '%' or p.city ilike '%' || p_q || '%'
         or exists (select 1 from unnest(p.skills) s where s ilike '%' || p_q || '%'))
    and (p_gender is null or p.gender = p_gender)
    and (p_min_rating is null or coalesce(p.rating_avg, 0) >= p_min_rating)
    and (p_skill is null or p_skill = any(p.skills))
  order by (p.kyc = 'verified') desc, p.rating_avg desc nulls last, p.gigs_completed desc
  limit 60;
$$;

create or replace function public.talent_age(p_id uuid) returns int
language sql stable security definer set search_path = '' as $$
  select extract(year from age(dob))::int from public.private_details where id = p_id and auth.uid() is not null;
$$;

-- Lets a brand-new Google user pick host on their first sign-in
create or replace function public.set_initial_role(p_role public.user_role) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_role not in ('host', 'talent') then raise exception 'Not allowed'; end if;
  update public.profiles set role = p_role, sides = array[p_role]
   where id = auth.uid() and created_at > now() - interval '15 minutes'
     and not exists (select 1 from public.bids where talent_id = auth.uid())
     and not exists (select 1 from public.events where host_id = auth.uid());
end;
$$;

-- Add the other side (work + hire with one account)
create or replace function public.add_side(p_side public.user_role, p_company text default null, p_cac text default null) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_side not in ('host', 'talent') then raise exception 'Not allowed'; end if;
  update public.profiles set sides = array(select distinct unnest(sides || p_side)), role = p_side,
         company_name = coalesce(p_company, company_name)
   where id = auth.uid();
  if p_cac is not null then update public.private_details set cac = p_cac where id = auth.uid(); end if;
end;
$$;



-- ════════════════════════════════════════════════════════════════════════════
--  Row Level Security
-- ════════════════════════════════════════════════════════════════════════════
-- Helpers used by policies (avoid recursive policy checks)
create or replace function public.is_event_host(p_event uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.events where id = p_event and host_id = auth.uid());
$$;
create or replace function public.has_bid_on(p_event uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.bids where event_id = p_event and talent_id = auth.uid());
$$;
create or replace function public.has_rated_back(p_event uuid, p_other uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.ratings where event_id = p_event and rater_id = auth.uid() and ratee_id = p_other);
$$;

alter table public.app_settings    enable row level security;
alter table public.catalog_items   enable row level security;
alter table public.profiles        enable row level security;
alter table public.private_details enable row level security;
alter table public.verifications   enable row level security;
alter table public.events          enable row level security;
alter table public.event_secrets   enable row level security;
alter table public.bids            enable row level security;
alter table public.saved_events    enable row level security;
alter table public.favorites       enable row level security;
alter table public.conversations   enable row level security;
alter table public.messages        enable row level security;
alter table public.notifications   enable row level security;
alter table public.wallet_tx       enable row level security;
alter table public.ratings         enable row level security;
alter table public.sos_alerts      enable row level security;
alter table public.disputes        enable row level security;
alter table public.tickets         enable row level security;

create policy "read settings" on public.app_settings for select using (true);
create policy "admin settings" on public.app_settings for update to authenticated using (public.is_admin());

create policy "read catalog" on public.catalog_items for select using (true);
create policy "admin catalog" on public.catalog_items for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "members read profiles" on public.profiles for select to authenticated using (true);
create policy "update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "admin update profiles" on public.profiles for update to authenticated using (public.is_admin());

create policy "own private" on public.private_details for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "update own private" on public.private_details for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "own verifications" on public.verifications for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "submit verification" on public.verifications for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending' and reviewer_id is null);

create policy "public live events" on public.events for select using (status in ('active', 'filled', 'completed'));
create policy "host own events" on public.events for select to authenticated using (host_id = auth.uid());
create policy "bidder sees event" on public.events for select to authenticated
  using (public.has_bid_on(id));
create policy "admin events" on public.events for select to authenticated using (public.is_admin());
create policy "host creates events" on public.events for insert to authenticated
  with check (host_id = auth.uid() and public.my_role() = 'host');
create policy "host updates events" on public.events for update to authenticated using (host_id = auth.uid()) with check (host_id = auth.uid());
create policy "admin updates events" on public.events for update to authenticated using (public.is_admin());
create policy "host deletes drafts" on public.events for delete to authenticated using (host_id = auth.uid() and status = 'draft');

create policy "host reads code" on public.event_secrets for select to authenticated
  using (public.is_event_host(event_id) or public.is_admin());

create policy "talent own bids" on public.bids for select to authenticated using (talent_id = auth.uid());
create policy "host event bids" on public.bids for select to authenticated
  using (public.is_event_host(event_id));
create policy "admin bids" on public.bids for select to authenticated using (public.is_admin());
create policy "talent withdraws" on public.bids for update to authenticated using (talent_id = auth.uid());

create policy "own saved" on public.saved_events for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own favorites" on public.favorites for all to authenticated using (host_id = auth.uid()) with check (host_id = auth.uid());

create policy "participants read conversations" on public.conversations for select to authenticated
  using (auth.uid() in (a_id, b_id) or (kind = 'support' and public.is_admin()));
create policy "participants read messages" on public.messages for select to authenticated
  using (exists (select 1 from public.conversations c where c.id = conversation_id
                 and (auth.uid() in (c.a_id, c.b_id) or (c.kind = 'support' and public.is_admin()))));

create policy "own notifications" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "mark own read" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own wallet" on public.wallet_tx for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- Ratings: you always see your own; you see ratings about you once you've rated back, or after 7 days
create policy "read ratings" on public.ratings for select to authenticated using (
  rater_id = auth.uid() or public.is_admin()
  or (ratee_id = auth.uid() and (created_at < now() - interval '7 days'
      or public.has_rated_back(event_id, rater_id))));

create policy "own sos" on public.sos_alerts for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "admin sos" on public.sos_alerts for update to authenticated using (public.is_admin());

create policy "read disputes" on public.disputes for select to authenticated using (raised_by = auth.uid() or against_id = auth.uid() or public.is_admin());
create policy "raise dispute" on public.disputes for insert to authenticated with check (raised_by = auth.uid() and status = 'open');
create policy "admin disputes" on public.disputes for update to authenticated using (public.is_admin());

create policy "own tickets" on public.tickets for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "open ticket" on public.tickets for insert to authenticated with check (user_id = auth.uid() and status = 'open' and reply is null);
create policy "admin tickets" on public.tickets for update to authenticated using (public.is_admin());

-- ════════════════════════════════════════════════════════════════════════════
--  Seed the catalog
-- ════════════════════════════════════════════════════════════════════════════
insert into public.catalog_items (kind, label, grp) values
 ('skill','Ushering','Front of house'),('skill','Wedding ushering','Front of house'),('skill','Hostess / host','Front of house'),
 ('skill','Protocol officer','Front of house'),('skill','Guest relations','Front of house'),('skill','VIP escort','Front of house'),
 ('skill','Registration desk','Front of house'),('skill','Ticketing & access control','Front of house'),('skill','Usher supervisor','Front of house'),
 ('skill','Customer service','Front of house'),('skill','Hospitality','Front of house'),('skill','Corporate events','Front of house'),
 ('skill','Brand ambassador','Promo & modelling'),('skill','Brand activations','Promo & modelling'),('skill','Product sampling','Promo & modelling'),
 ('skill','Promo modelling','Promo & modelling'),('skill','Runway modelling','Promo & modelling'),('skill','Car show model','Promo & modelling'),
 ('skill','Merchandising','Promo & modelling'),('skill','Flyer distribution','Promo & modelling'),('skill','Exhibition booth staff','Promo & modelling'),
 ('skill','Data capture & surveys','Promo & modelling'),('skill','MC / hype person','Stage & performance'),('skill','Public speaking','Stage & performance'),
 ('skill','Dancing','Stage & performance'),('skill','Kids’ activities & face painting','Stage & performance'),('skill','Sign language','Stage & performance'),
 ('skill','Photography assistant','Creative & media'),('skill','Videography assistant','Creative & media'),('skill','Social media live posting','Creative & media'),
 ('skill','Makeup artistry','Creative & media'),('skill','Hair styling','Creative & media'),('skill','Decor assistant','Creative & media'),
 ('skill','Event setup & breakdown','Operations'),('skill','Runner / logistics','Operations'),('skill','Crowd control','Operations'),
 ('skill','Cashier / POS','Operations'),('skill','Bartending','Operations'),('skill','Waiting tables','Operations'),
 ('skill','Catering assistant','Operations'),('skill','Cleaning crew','Operations'),('skill','Driving','Operations'),('skill','First aid trained','Operations'),
 ('skill','English','Languages'),('skill','Yoruba','Languages'),('skill','Igbo','Languages'),('skill','Hausa','Languages'),('skill','Pidgin','Languages'),('skill','French','Languages');

insert into public.catalog_items (kind, label, grp, typical_pay) values
 ('job_type','Weddings','Celebrations',20000),('job_type','Owambe parties','Celebrations',18000),('job_type','Birthdays','Celebrations',15000),
 ('job_type','Kids’ parties','Celebrations',12000),('job_type','Naming ceremonies','Celebrations',12000),('job_type','Anniversaries','Celebrations',15000),
 ('job_type','Burials & remembrance','Celebrations',15000),('job_type','Private dinners','Celebrations',20000),
 ('job_type','Church Events','Faith',12000),('job_type','Mosque events','Faith',12000),('job_type','Crusades & conventions','Faith',12000),
 ('job_type','Corporate Events','Corporate',30000),('job_type','Conferences','Corporate',30000),('job_type','Product launches','Corporate',30000),
 ('job_type','AGMs & board meetings','Corporate',25000),('job_type','Award nights','Corporate',30000),('job_type','Trade fairs & exhibitions','Corporate',25000),
 ('job_type','Book launches','Corporate',18000),('job_type','Real estate open houses','Corporate',18000),
 ('job_type','Brand Activations','Brand & retail',18000),('job_type','Promotions','Brand & retail',15000),('job_type','Market storms','Brand & retail',12000),
 ('job_type','Road shows','Brand & retail',15000),('job_type','Retail promotions','Brand & retail',15000),('job_type','Supermarket sampling','Brand & retail',12000),
 ('job_type','Concerts','Entertainment',22000),('job_type','Festivals','Entertainment',20000),('job_type','Fashion shows','Entertainment',40000),
 ('job_type','Pageants','Entertainment',25000),('job_type','Club & lounge events','Entertainment',18000),('job_type','Sports events','Entertainment',15000),
 ('job_type','Film & TV extras','Entertainment',15000),('job_type','Photoshoots','Entertainment',25000),('job_type','Music video shoots','Entertainment',20000),
 ('job_type','Hospitality','Hospitality',15000),('job_type','Hotel shifts','Hospitality',12000),('job_type','Restaurant shifts','Hospitality',10000),
 ('job_type','Charity galas','Hospitality',25000),('job_type','Convocations','Public & campus',10000),('job_type','Campus events','Public & campus',10000),
 ('job_type','Government & civic events','Public & campus',20000);

-- ════════════════════════════════════════════════════════════════════════════
--  Storage: avatars/photos (public) and identity documents (private)
-- ════════════════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public) values ('photos', 'photos', true), ('kyc', 'kyc', false)
  on conflict (id) do nothing;

create policy "upload own photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "replace own photos" on storage.objects for update to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "delete own photos" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "upload own kyc" on storage.objects for insert to authenticated
  with check (bucket_id = 'kyc' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "read kyc" on storage.objects for select to authenticated
  using (bucket_id = 'kyc' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- ════════════════════════════════════════════════════════════════════════════
--  Make yourself admin — run AFTER signing up on the site:
--
--  update public.profiles set role = 'admin', sides = '{admin}', staff_title = 'Founder'
--  where id = (select id from auth.users where email = 'YOUR_EMAIL');
-- ════════════════════════════════════════════════════════════════════════════
