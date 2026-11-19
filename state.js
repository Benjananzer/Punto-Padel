const L = require('./_lib');
module.exports = async (req, res) => {
  try {
    await L.init(); const u = await L.getUser(req); const { sql } = L;
    const t = L.todayAR(); let bk, red = [], users = [];
    if (u && (u.role === 'admin' || u.role === 'owner')) {
      bk = await sql`SELECT id, to_char(date,'YYYY-MM-DD') AS date, slot, court, status, price, discount, name, phone, pay, user_email AS "userId", spent FROM bookings`;
    }
    if (!bk) {
      bk = await sql`SELECT id, to_char(date,'YYYY-MM-DD') AS date, slot, court, status, price, discount,
        CASE WHEN user_email = ${u?.email || ''} THEN name ELSE '' END AS name, CASE WHEN user_email = ${u?.email || ''} THEN pay ELSE '' END AS pay,
        CASE WHEN user_email = ${u?.email || ''} THEN user_email END AS "userId", CASE WHEN user_email = ${u?.email || ''} THEN spent ELSE 0 END AS spent
        FROM bookings WHERE status <> 'cancelled' AND (date >= ${t}::date - 1 OR user_email = ${u?.email || ''})`;
    }
    if (u?.role === 'admin') {
      users = await sql`SELECT email, name, pts, 'client' AS role FROM users ORDER BY created_at DESC`;
      users = users.filter(x => L.roleOf(x.email) === 'client');
      red = await sql`SELECT id, to_char(date,'YYYY-MM-DD') AS date, user_email AS "userId", type, cost FROM redemptions ORDER BY id`;
    } else if (u) {
      red = await sql`SELECT id, to_char(date,'YYYY-MM-DD') AS date, user_email AS "userId", type, cost FROM redemptions WHERE user_email=${u.email}`;
    }
    L.ok(res, { me: u, bk, red, users });
  } catch (e) { console.error(e); L.fail(res, 500, 'Error del servidor'); }
};
