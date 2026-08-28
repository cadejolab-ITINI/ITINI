create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 80),
  username text unique,
  avatar_url text,
  bio text not null default '',
  home_region text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.destinations (
  id text primary key,
  slug text unique not null,
  name text not null,
  summary text not null,
  description text not null,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  distance_km numeric(7,2) not null default 0,
  duration_minutes integer not null default 0,
  elevation_gain_m integer not null default 0,
  difficulty text not null check (difficulty in ('Fácil', 'Medio', 'Avanzado')),
  entrance_fee_cordobas numeric(10,2) not null default 0,
  capacity_daily integer not null check (capacity_daily > 0),
  sustainability_score integer not null check (sustainability_score between 0 and 100),
  community_contribution_pct integer not null check (community_contribution_pct between 0 and 100),
  impact_summary text not null,
  local_rules jsonb not null default '[]'::jsonb,
  waste_guidance jsonb not null default '[]'::jsonb,
  community_benefits jsonb not null default '[]'::jsonb,
  verification_status text not null default 'demo'
    check (verification_status in ('demo', 'community_verified', 'institution_verified')),
  published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.destination_routes (
  destination_id text primary key references public.destinations(id) on delete cascade,
  points jsonb not null check (jsonb_typeof(points) = 'array'),
  distance_m integer,
  source text not null default 'field-survey',
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.prices (
  id uuid primary key default gen_random_uuid(),
  destination_id text references public.destinations(id) on delete cascade,
  category text not null,
  label text not null,
  amount numeric(10,2) not null check (amount >= 0),
  currency text not null default 'NIO',
  verified boolean not null default false,
  valid_from date,
  valid_until date,
  source_note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.guides (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  display_name text not null,
  intur_license text,
  phone_public text,
  areas text[] not null default '{}',
  specialties text[] not null default '{}',
  verified boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.guide_destinations (
  guide_id uuid references public.guides(id) on delete cascade,
  destination_id text references public.destinations(id) on delete cascade,
  primary key (guide_id, destination_id)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  destination_id text not null references public.destinations(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  content text not null check (char_length(content) between 10 and 1500),
  status text not null default 'pending' check (status in ('pending', 'published', 'rejected')),
  visited_at date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null default 'Mi viaje',
  limit_amount numeric(10,2),
  currency text not null default 'NIO',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.budget_items (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  name text not null,
  category text not null,
  amount numeric(10,2) not null check (amount >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.sos_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  mode text not null check (mode in ('demo', 'institutional')),
  status text not null check (status in ('simulated', 'queued', 'sent', 'failed')),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  accuracy_m numeric(8,2),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index destinations_location_idx on public.destinations(latitude, longitude);
create index reviews_destination_idx on public.reviews(destination_id, created_at desc);
create index prices_destination_idx on public.prices(destination_id, verified);
create index sos_owner_created_idx on public.sos_events(owner_id, created_at desc);

create trigger profiles_set_updated_at before update on public.profiles
for each row execute procedure public.set_updated_at();
create trigger destinations_set_updated_at before update on public.destinations
for each row execute procedure public.set_updated_at();
create trigger prices_set_updated_at before update on public.prices
for each row execute procedure public.set_updated_at();
create trigger guides_set_updated_at before update on public.guides
for each row execute procedure public.set_updated_at();
create trigger reviews_set_updated_at before update on public.reviews
for each row execute procedure public.set_updated_at();
create trigger budgets_set_updated_at before update on public.budgets
for each row execute procedure public.set_updated_at();
create trigger budget_items_set_updated_at before update on public.budget_items
for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.destinations enable row level security;
alter table public.destination_routes enable row level security;
alter table public.prices enable row level security;
alter table public.guides enable row level security;
alter table public.guide_destinations enable row level security;
alter table public.reviews enable row level security;
alter table public.budgets enable row level security;
alter table public.budget_items enable row level security;
alter table public.sos_events enable row level security;

create policy "published destinations are public"
on public.destinations for select using (published = true);
create policy "published routes are public"
on public.destination_routes for select using (
  exists (select 1 from public.destinations d where d.id = destination_id and d.published = true)
);
create policy "verified prices are public"
on public.prices for select using (verified = true);
create policy "verified active guides are public"
on public.guides for select using (verified = true and active = true);
create policy "guide destination links are public"
on public.guide_destinations for select using (true);
create policy "published reviews are public"
on public.reviews for select using (status = 'published' or author_id = auth.uid());

create policy "users read own profile"
on public.profiles for select using (id = auth.uid());
create policy "users update own profile"
on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "users create own profile"
on public.profiles for insert with check (id = auth.uid());

create policy "users create own reviews"
on public.reviews for insert with check (author_id = auth.uid());
create policy "users update pending own reviews"
on public.reviews for update using (author_id = auth.uid() and status = 'pending')
with check (author_id = auth.uid() and status = 'pending');

create policy "users manage own budgets"
on public.budgets for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "users manage own budget items"
on public.budget_items for all using (
  exists (select 1 from public.budgets b where b.id = budget_id and b.owner_id = auth.uid())
) with check (
  exists (select 1 from public.budgets b where b.id = budget_id and b.owner_id = auth.uid())
);

create policy "users read own sos history"
on public.sos_events for select using (owner_id = auth.uid());
create policy "clients may only insert demo sos"
on public.sos_events for insert with check (
  owner_id = auth.uid() and mode = 'demo' and status = 'simulated'
);

comment on table public.sos_events is
'Institutional SOS rows must only be created by an audited server-side integration using service credentials. Mobile clients are restricted to demo simulations.';
