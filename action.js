const L = require('./_lib'); const { sql, CFG } = L;
const DAY = 864e5, STAFF = u => u && u.role === 'admin';
module.exports = async (req, res) => {
  if (req.method !== 'POST') return L.fail(res, 405, 'Método no permitido');
  try {
    await L.init(); const u = await L.getUser(req); const b = req.body || {}; const t = L.todayAR();
    const get = async id => (await sql`SELECT id, to_char(date,'YYYY-MM-DD') AS date, slot, status, spent, user_email FROM bookings WHERE id=${id}`)[0];
    switch (b.type) {
      case 'reserve': {
        const court = +b.court, name = String(b.name || '').trim().slice(0, 80), phone = String(b.phone || '').trim().slice(0, 30);
        const max = new Date(Date.parse(t) + 6 * DAY).toISOString().slice(0, 10);
        if (!/^\d{4}-\d\d-\d\d$/.test(b.date) || b.date < t || b.date > max || !CFG.slots.includes(b.slot) || !(court >= 1 && court <= CFG.canchas) || !name || phone.length < 6) return L.fail(res, 400, 'Datos inválidos');
        if (L.startOf(b.date, b.slot) < new Date()) return L.fail(res, 400, 'Ese horario ya pasó');
        let disc = 0, cost = 0, tipo = '';
        if (u && b.redeem === 'descuento') { disc = CFG.precio * CFG.descPct / 100; cost = CFG.descPts; tipo = 'descuento'; }
        if (u && b.redeem === 'gratis') { disc = CFG.precio; cost = CFG.gratisPts; tipo = 'turno gratis'; }
        const id = 'b' + Date.now() + Math.random().toString(36).slice(2, 6);
        try { await sql`INSERT INTO bookings (id,date,slot,court,name,phone,pay,status,price,discount,user_email,spent) VALUES (${id},${b.date},${b.slot},${court},${name},${phone},${b.pay === 'Transferencia' ? 'Transferencia' : 'Efectivo'},'pending',${CFG.precio},${disc},${u?.email || null},${cost})`; }
        catch (e) { if (e.code === '23505') return L.fail(res, 409, 'Ese horario ya se ocupó'); throw e; }
        if (cost) {
          const r = await sql`UPDATE users SET pts = pts - ${cost} WHERE email=${u.email} AND pts >= ${cost} RETURNING pts`;
          if (!r.length) { await sql`DELETE FROM bookings WHERE id=${id}`; return L.fail(res, 400, 'No tenés puntos suficientes'); }
          await sql`INSERT INTO redemptions (user_email,type,cost) VALUES (${u.email},${tipo},${cost})`;
        }
        return L.ok(res, { id, total: CFG.precio - disc });
      }
      case 'cancel': {
        if (!u) return L.fail(res, 401, 'Ingresá a tu cuenta');
        const x = await get(b.id); if (!x) return L.fail(res, 404, 'No existe');
        const own = x.user_email === u.email;
        if (!(own || STAFF(u)) || x.status === 'cancelled') return L.fail(res, 403, 'No permitido');
        if (!STAFF(u) && L.startOf(x.date, x.slot) - Date.now() < DAY) return L.fail(res, 400, 'Faltan menos de 24 hs');
        await sql`UPDATE bookings SET status='cancelled' WHERE id=${x.id}`;
        if (x.spent && x.user_email) await sql`UPDATE users SET pts = pts + ${x.spent} WHERE email=${x.user_email}`;
        return L.ok(res, {});
      }
      case 'canje': {
        if (!u || b.kind !== 'pelotitas') return L.fail(res, 400, 'Canje inválido');
        const r = await sql`UPDATE users SET pts = pts - ${CFG.pelotitasPts} WHERE email=${u.email} AND pts >= ${CFG.pelotitasPts} RETURNING pts`;
        if (!r.length) return L.fail(res, 400, 'No tenés puntos suficientes');
        await sql`INSERT INTO redemptions (user_email,type,cost) VALUES (${u.email},'pelotitas',${CFG.pelotitasPts})`;
        return L.ok(res, {});
      }
      case 'confirmpay': {
        if (!STAFF(u)) return L.fail(res, 403, 'No permitido');
        const r = await sql`UPDATE bookings SET status='paid' WHERE id=${b.id} AND status='pending' RETURNING user_email`;
        if (r[0]?.user_email) await sql`UPDATE users SET pts = pts + ${CFG.ptsTurno} WHERE email=${r[0].user_email}`;
        return L.ok(res, {});
      }
      case 'block': {
        if (!STAFF(u)) return L.fail(res, 403, 'No permitido');
        if (!CFG.slots.includes(b.slot) || !(+b.court >= 1 && +b.court <= CFG.canchas)) return L.fail(res, 400, 'Datos inválidos');
        try { await sql`INSERT INTO bookings (id,date,slot,court,name,status,price) VALUES (${'x' + Date.now()},${b.date},${b.slot},${+b.court},'Bloqueado','blocked',0)`; }
        catch (e) { if (e.code === '23505') return L.fail(res, 409, 'Ese horario ya está ocupado'); throw e; }
        return L.ok(res, {});
      }
      case 'unblock': {
        if (!STAFF(u)) return L.fail(res, 403, 'No permitido');
        await sql`DELETE FROM bookings WHERE id=${b.id} AND status='blocked'`; return L.ok(res, {});
      }
      default: return L.fail(res, 400, 'Acción desconocida');
    }
  } catch (e) { console.error(e); L.fail(res, 500, 'Error del servidor'); }
};
