-- Opcional: la API crea estas tablas sola en el primer uso. Sirve como referencia.
CREATE TABLE IF NOT EXISTS users (
  email text PRIMARY KEY, name text NOT NULL, pass_hash text NOT NULL,
  pts int NOT NULL DEFAULT 0, created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS bookings (
  id text PRIMARY KEY, date date NOT NULL, slot text NOT NULL, court int NOT NULL,
  name text, phone text, pay text, status text NOT NULL DEFAULT 'pending',
  price int NOT NULL, discount int NOT NULL DEFAULT 0, user_email text, spent int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now());
CREATE UNIQUE INDEX IF NOT EXISTS bookings_slot_uq ON bookings (date, slot, court) WHERE status <> 'cancelled';
CREATE TABLE IF NOT EXISTS redemptions (
  id serial PRIMARY KEY, date date NOT NULL DEFAULT current_date, user_email text NOT NULL, type text NOT NULL, cost int NOT NULL);
