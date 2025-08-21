-- Allow updates on reservations so admin actions work
create policy if not exists "Anyone can update reservations"
on public.reservations
for update
using (true)
with check (true);