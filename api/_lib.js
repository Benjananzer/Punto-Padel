const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');
const sql = neon(process.env.DATABASE_URL);
const CFG = { precio: 28000, ptsTurno: 10, canchas: 3, descPct: 10, descPts: 100, gratisPts: 300, pelotitasPts: 150,
  slots: ['08:00','09:30','11:00','12:30','14:00','15:30','17:00','18:30','20:00','21:30'] };
let ready;
function init() {
  return (ready ||= (async () => {
    await sql`CREATE TABLE IF NOT EXISTS users (email text PRIMARY KEY, name text NOT NULL, pass_hash text NOT NULL, pts int NOT NULL DEFAULT 0, created_at timestamptz DEFAULT now())`;
    await sql`CREATE TABLE IF NOT EXISTS bookings (id text PRIMARY KEY, date date NOT NULL, slot text NOT NULL, court int NOT NULL, name text, phone text, pay text, status text NOT NULL DEFAULT 'pending', price int NOT NULL, discount int NOT NULL DEFAULT 0, user_email text, spent int NOT NULL DEFAULT 0, created_at timestamptz DEFAULT now())`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS bookings_slot_uq ON bookings (date, slot, court) WHERE status <> 'cancelled'`;
    await sql`CREATE TABLE IF NOT EXISTS redemptions (id serial PRIMARY KEY, date date NOT NULL DEFAULT current_date, user_email text NOT NULL, type text NOT NULL, cost int NOT NULL)`;
  })());
}
const SECRET = () => process.env.AUTH_SECRET || 'dev-secret';
const b64 = s => Buffer.from(s).toString('base64url');
const sign = p => crypto.createHmac('sha256', SECRET()).update(p).digest('base64url');
const makeToken = email => { const p = b64(JSON.stringify({ e: email, x: Date.now() + 30 * 864e5 })); return p + '.' + sign(p); };
function hash(pw) { const s = crypto.randomBytes(16).toString('hex'); return s + ':' + crypto.scryptSync(pw, s, 32).toString('hex'); }
function check(pw, h) { const [s, k] = h.split(':'); const a = Buffer.from(k, 'hex'), b = crypto.scryptSync(pw, s, 32); return a.length === b.length && crypto.timingSafeEqual(a, b); }
const roleOf = e => e === (process.env.ADMIN_EMAIL || '').toLowerCase() ? 'admin' : e === (process.env.OWNER_EMAIL || '').toLowerCase() ? 'owner' : 'client';
async function getUser(req) {
  const t = (req.headers.authorization || '').replace('Bearer ', ''); const [p, s] = t.split('.');
  if (!p || !s || sign(p) !== s) return null;
  try { const d = JSON.parse(Buffer.from(p, 'base64url')); if (d.x < Date.now()) return null;
    const [u] = await sql`SELECT email, name, pts FROM users WHERE email = ${d.e}`; return u ? { ...u, role: roleOf(u.email) } : null; } catch { return null; }
}
const ok = (res, d) => res.status(200).json(d);
const fail = (res, c, m) => res.status(c).json({ error: m });
const startOf = (date, slot) => new Date(`${date}T${slot}:00-03:00`); // hora Argentina
const todayAR = () => new Date(Date.now() - 3 * 36e5).toISOString().slice(0, 10);
module.exports = { sql, CFG, init, makeToken, hash, check, roleOf, getUser, ok, fail, startOf, todayAR };
