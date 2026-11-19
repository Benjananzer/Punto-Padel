const L = require('./_lib');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return L.fail(res, 405, 'Método no permitido');
  try {
    await L.init();
    const { mode, pass, name } = req.body || {}; const email = String(req.body?.email || '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email) || String(pass || '').length < 4) return L.fail(res, 400, 'Datos inválidos');
    let u;
    if (mode === 'new') {
      if ((await L.sql`SELECT 1 FROM users WHERE email=${email}`).length) return L.fail(res, 409, 'Ese correo ya tiene cuenta');
      u = { email, name: String(name || email.split('@')[0]).slice(0, 60), pts: 0 };
      await L.sql`INSERT INTO users (email, name, pass_hash) VALUES (${email}, ${u.name}, ${L.hash(pass)})`;
    } else {
      const [r] = await L.sql`SELECT email, name, pts, pass_hash FROM users WHERE email=${email}`;
      if (!r || !L.check(pass, r.pass_hash)) return L.fail(res, 401, 'Correo o contraseña incorrectos');
      u = { email: r.email, name: r.name, pts: r.pts };
    }
    L.ok(res, { token: L.makeToken(email), user: { ...u, role: L.roleOf(email) } });
  } catch (e) { console.error(e); L.fail(res, 500, 'Error del servidor'); }
};
