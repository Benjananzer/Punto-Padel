# Punto Pádel Franck — web de turnos

Reservas de canchas de pádel con cuentas, puntos, panel de administrador y panel del dueño.
Front estático (HTML/CSS/JS) + funciones serverless en `/api` + base de datos Postgres en **Neon**, desplegado en **Vercel**.

## Puesta en marcha
1. **Neon**: creá un proyecto en https://neon.tech y copiá la *connection string* (pooled).
2. **GitHub**: subí este repo.
3. **Vercel**: *Add New → Project* → importá el repo (sin build, Framework "Other"). En *Environment Variables* cargá:
   - `DATABASE_URL` — la de Neon
   - `AUTH_SECRET` — texto largo aleatorio (`openssl rand -hex 32`)
   - `ADMIN_EMAIL` y `OWNER_EMAIL` — correos del administrador y del dueño
   (también podés usar la integración Neon desde el Marketplace de Vercel, que crea `DATABASE_URL` sola).
4. Deploy. Las tablas se crean solas en el primer uso (`db/schema.sql` queda como referencia).
5. Entrá a `/#/ingresar` → **Crear cuenta** con el correo del admin / dueño: esa cuenta queda con ese rol.

## Configuración
- Precio, puntos, canjes, canchas y horarios: `CFG` en `api/_lib.js` (**manda el servidor**) y `CFG` en `public/js/app.js` (lo que se muestra). Mantenelos iguales.
- Número de WhatsApp, Instagram y dirección: `CFG` en `public/js/app.js`.

## Desarrollo local
```
npm i -g vercel && npm i
cp .env.example .env   # completá los valores
vercel dev
```

## Estructura
`public/` front · `api/auth.js` login/registro · `api/state.js` lectura · `api/action.js` reservar, cancelar, canjear, confirmar pago, bloquear.
