-- Restore pre-auth behavior: open up RLS to allow public (anon) operations needed by the app UI

-- CLOSED_DAYS: allow full manage by anyone
alter table public.closed_days enable row level security;

drop policy if exists "Only admins can manage closed days" on public.closed_days;
drop policy if exists "Closed days are viewable by everyone" on public.closed_days;

create policy "Closed days are viewable by everyone"
  on public.closed_days for select to public
  using (true);

create policy "Anyone can insert closed days"
  on public.closed_days for insert to public
  with check (true);

create policy "Anyone can update closed days"
  on public.closed_days for update to public
  using (true) with check (true);

create policy "Anyone can delete closed days"
  on public.closed_days for delete to public
  using (true);

-- EQUIPMENT: keep select for all, allow updates for maintenance without auth
alter table public.equipment enable row level security;

drop policy if exists "Only admins can manage equipment" on public.equipment;
drop policy if exists "Equipment is viewable by everyone" on public.equipment;

create policy "Equipment is viewable by everyone"
  on public.equipment for select to public
  using (true);

create policy "Anyone can update equipment"
  on public.equipment for update to public
  using (true) with check (true);

-- RESERVATIONS: allow view and updates for all so admin panel (password local) works without Supabase Auth
alter table public.reservations enable row level security;

drop policy if exists "Only admins can view all reservations" on public.reservations;
drop policy if exists "Only admins can update reservations" on public.reservations;

create policy "Anyone can view reservations"
  on public.reservations for select to public
  using (true);

create policy "Anyone can update reservations"
  on public.reservations for update to public
  using (true) with check (true);
