/* ===== Punto Pádel Franck — demo con datos en localStorage ===== */
const CFG={precio:28000,ptsTurno:10,canjes:{descuento:{pts:100,pct:10},gratis:{pts:300},pelotitas:{pts:150,n:3}},
 canchas:3,horario:'08:00 – 23:00',slots:['08:00','09:30','11:00','12:30','14:00','15:30','17:00','18:30','20:00','21:30'],
 whatsapp:'5493420000000',insta:'@puntopadel_franck',dir:'Franck, Santa Fe',apertura:'[Fecha de apertura]'};
const $=s=>document.querySelector(s),app=$('#app');
const money=n=>'$ '+Math.round(n).toLocaleString('es-AR');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0'),iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const pd=s=>{const[a,b,c]=s.split('-');return new Date(+a,b-1,+c)};
const DS=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],MS=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const MF=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const fd=s=>{const d=pd(s);return `${DS[d.getDay()]} ${d.getDate()}/${d.getMonth()+1}`};
const endT=t=>{let[h,m]=t.split(':').map(Number);m+=90;h+=m/60|0;m%=60;return pad(h)+':'+pad(m)};
const start=b=>{const d=pd(b.date);const[h,m]=b.slot.split(':');d.setHours(+h,+m);return d};
const total=b=>b.price-b.discount;
/* store: estado que viene de la API (Neon) */
const TK={get(){try{return localStorage.getItem('pp_tok')}catch{return null}},set(v){try{v?localStorage.setItem('pp_tok',v):localStorage.removeItem('pp_tok')}catch{}}};
let DB={users:[],bk:[],red:[],me:null};
async function api(path,body){
 const h={'Content-Type':'application/json'};if(TK.get())h.Authorization='Bearer '+TK.get();
 const r=await fetch('/api/'+path,body?{method:'POST',headers:h,body:JSON.stringify(body)}:{headers:h});
 const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Error de conexión');return d}
async function load(){try{const d=await api('state');DB={users:d.users||[],bk:d.bk||[],red:d.red||[],me:d.me};if(!d.me&&TK.get())TK.set(null)}catch(e){toast('No se pudo conectar con el servidor')}}
const me=()=>DB.me;
const isBusy=(date,slot,court)=>DB.bk.some(b=>b.date===date&&b.slot===slot&&b.court===court&&b.status!=='cancelled');
function toast(m){const t=document.createElement('div');t.className='toast';t.textContent=m;document.body.append(t);setTimeout(()=>t.remove(),2600)}
/* chrome */
const LOGO=`<svg width="34" height="38" viewBox="0 0 34 38" fill="none"><circle cx="13" cy="14" r="10" stroke="#f3f6f9" stroke-width="3"/><circle cx="5" cy="6" r="4.5" fill="#1ad6e8"/><path d="M19 22l-8 14" stroke="#f3f6f9" stroke-width="3.5" stroke-linecap="round"/></svg>`;
const logo=`<a class="logo" href="#/">${LOGO}<span><b>Punto Pádel</b><small>FRANCK</small></span></a>`;
const footer=()=>`<footer><div class="wrap">${logo}<span>${CFG.dir} · ${CFG.insta} · <a href="https://wa.me/${CFG.whatsapp}" target="_blank" rel="noopener">WhatsApp</a></span></div></footer>`;
function nav(){const u=me();
 return `<header class="nav"><div class="wrap">${logo}<nav><a href="#/">Inicio</a><a href="#/reservar">Reservar</a><a href="#/cuenta">Mi cuenta</a><a href="#contacto" data-go="contacto">Contacto</a>
 ${u?`<span class="muted">Hola, ${esc(u.name)}</span>${u.role==='admin'?'<a href="#/admin">Admin</a>':''}${u.role==='owner'?'<a href="#/dueno">Ganancias</a>':''}<button class="btn" data-act="logout">Cerrar sesión</button>`:'<a class="btn" href="#/ingresar">Ingresar</a>'}
 <a class="btn pri" href="#/reservar">Reservar turno</a></nav></div></header>`}
const shell=h=>nav()+h+footer();
/* views */
function vInicio(){return shell(`<div class="ticker"><div>${'<span>Próximamente</span>◆<span>Franck, Santa Fe</span>◆<span>Un punto de encuentro</span>◆<span>Reservá tu turno online</span>◆<span>Sumá puntos y canjealos por premios</span>◆'.repeat(4)}</div></div>
<section class="hero"><div class="wrap"><div><span class="pill">Próximamente · ${CFG.apertura}</span><h1>Un punto de encuentro</h1><p>Canchas de pádel en Franck, Santa Fe. Reservá tu turno online y sumá puntos.</p><a class="btn pri" href="#/reservar">Reservar turno</a><a class="btn" href="#como">Cómo funciona</a></div>
<div class="court"><svg viewBox="0 0 300 380" fill="#0e5c85" stroke="#fff" stroke-width="3"><rect x="10" y="10" width="280" height="360"/><path d="M10 95h280M10 285h280M150 10v85M150 285v85M10 190h280" fill="none"/><path d="M10 190h280" stroke="#ccd" stroke-width="6"/></svg></div></div></section>
<section class="light" id="como"><div class="wrap"><div class="eyebrow">Cómo funciona</div><h2>Reservá en 3 pasos</h2><p>Podés cancelar cuando quieras, salvo en las 24 hs previas a tu turno.</p>
<div class="steps"><div><span class="disp">01</span><b>Elegí día y horario</b><p>Cada turno dura 1 hora y 30 minutos.</p></div><div><span class="disp">02</span><b>Elegí tu cancha</b><p>${CFG.canchas} canchas disponibles.</p></div><div><span class="disp">03</span><b>Elegí cómo pagar</b><p>Efectivo o transferencia. Te llevamos a WhatsApp con tu reserva.</p></div></div></div></section>
<section class="dark"><div class="wrap"><div class="two"><div><div class="eyebrow">Puntos</div><h2>Jugá más, ganá más</h2><p class="muted" style="margin:16px 0 24px">Cada turno que sacás suma puntos. Cuando juntás ${CFG.canjes.descuento.pts} puntos, los canjeás por descuentos, turnos gratis o pelotitas.</p><a class="btn pri" href="#/ingresar">Crear mi cuenta</a></div>
<div><div class="card rew"><div><small>Descuento</small>${CFG.canjes.descuento.pts} puntos</div><span class="disp">-${CFG.canjes.descuento.pct}%</span></div><div class="card rew"><div><small>Turno gratis</small>${CFG.canjes.gratis.pts} puntos</div><span class="disp">1:30</span></div><div class="card rew"><div><small>Pelotitas</small>${CFG.canjes.pelotitas.pts} puntos</div><span class="disp">x${CFG.canjes.pelotitas.n}</span></div></div></div>
<div class="stats"><div class="card"><div class="disp">1:30 hs</div><span class="muted">por turno</span></div><div class="card"><div class="disp">${CFG.canchas}</div><span class="muted">canchas</span></div><div class="card"><div class="disp">${CFG.horario.replace('–','a')} hs</div><span class="muted">horario de atención</span></div></div>
<div class="two" id="contacto" style="margin-top:80px"><div><div class="eyebrow">Dónde estamos</div><h2>Franck, Santa Fe</h2><p class="muted" style="margin:12px 0 18px">${CFG.dir}</p><a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=Franck,+Santa+Fe">Cómo llegar</a></div>
<div class="map"><iframe loading="lazy" title="Mapa" src="https://maps.google.com/maps?q=Franck,Santa+Fe,Argentina&z=13&output=embed"></iframe></div></div></div></section>`)}
let R={date:null,court:1,slot:null};
function days(){return[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()+i);return d})}
function slotPast(date,slot){return start({date,slot})<new Date()}
function vReservar(){
 const ds=days();R.date=R.date||iso(ds[0]);const d=pd(R.date);
 const sl=CFG.slots.map(s=>{const off=isBusy(R.date,s,R.court)||slotPast(R.date,s);return `<button class="opt ${off?'off':''} ${R.slot===s?'on':''}" ${off?'disabled':''} data-act="slot" data-v="${s}">${s}</button>`}).join('');
 return shell(`<div class="wrap page"><div class="eyebrow">Paso 1 de 2</div><h1>Reservá tu turno</h1><div class="grid"><div>
 <div class="lbl">1 · Elegí el día</div><div class="days">${ds.map(x=>`<button class="opt day ${iso(x)===R.date?'on':''}" data-act="date" data-v="${iso(x)}"><small>${DS[x.getDay()]}</small><b>${x.getDate()}</b></button>`).join('')}</div>
 <div class="lbl">2 · Elegí la cancha</div><div class="row">${[...Array(CFG.canchas)].map((_,i)=>`<button class="opt ${R.court===i+1?'on':''}" data-act="court" data-v="${i+1}">Cancha ${i+1}</button>`).join('')}</div>
 <div class="lbl" style="display:flex;justify-content:space-between">3 · Elegí el horario (1 h 30 min)<span class="muted" style="font-weight:400;font-size:14px">Libre · Elegido · Ocupado</span></div><div class="slots">${sl}</div></div>
 <aside class="card sum"><h4>Tu turno</h4><div class="l">Fecha<b>${fd(R.date)}</b></div><div class="l">Horario<b>${R.slot?R.slot+' a '+endT(R.slot):'—'}</b></div><div class="l">Cancha<b>Cancha ${R.court}</b></div><div class="l">Duración<b>1 h 30 min</b></div>
 <div class="tot"><span>Precio del turno</span><span class="disp">${money(CFG.precio)}</span></div><div class="pts">Sumás +${CFG.ptsTurno} puntos con este turno</div>
 <button class="btn pri block" data-act="continuar" ${R.slot?'':'disabled'}>Continuar</button><small>Pagás en efectivo o por transferencia. Podés cancelar hasta 24 hs antes del turno.</small></aside></div></div>`)}
let C={redeem:'none',pay:'Efectivo'};
function vConfirmar(){
 if(!R.slot)return location.hash='#/reservar',''; const u=me();let desc=0;
 if(C.redeem==='descuento')desc=CFG.precio*CFG.canjes.descuento.pct/100;if(C.redeem==='gratis')desc=CFG.precio;
 const dOk=u&&u.pts>=CFG.canjes.descuento.pts,gOk=u&&u.pts>=CFG.canjes.gratis.pts;
 const nm=u?.name||'',msg=()=>`Hola! Quiero reservar un turno:\n• Cancha ${R.court} · ${fd(R.date)} · ${R.slot} a ${endT(R.slot)}\nNombre: ${$('#nm')?.value||nm||'[Nombre y apellido]'}\nPrecio: ${money(CFG.precio-desc)}\nForma de pago: ${C.pay}`;
 const ch=(k,t,s,ok)=>`<label class="choice ${C.redeem===k?'on':''}" ${ok?'':'style="opacity:.45"'}><input type="radio" name="rd" ${C.redeem===k?'checked':''} ${ok?'':'disabled'} data-act="redeem" data-v="${k}"><div><b>${t}</b><small>${s}</small></div></label>`;
 return shell(`<div class="wrap page"><div class="eyebrow">Paso 2 de 2</div><h1>Confirmá tu turno</h1><div class="grid" style="grid-template-columns:1.4fr 1fr"><div>
 <div class="lbl">Tus datos</div><label class="f" for="nm">Nombre y apellido</label><input id="nm" value="${esc(nm)}" placeholder="Nombre y apellido" data-act="wa"><label class="f" for="ph">Teléfono (WhatsApp)</label><input id="ph" placeholder="Ej: 342 5123456" inputmode="tel">
 <div class="lbl">Tus puntos</div>${u?ch('none','No canjear puntos',`Tenés ${u.pts} puntos`,true)+ch('descuento',`Canjear descuento del ${CFG.canjes.descuento.pct}%`,`Usás ${CFG.canjes.descuento.pts} de tus ${u.pts} puntos`,dOk)+ch('gratis','Canjear turno gratis',`Usás ${CFG.canjes.gratis.pts} de tus ${u.pts} puntos`,gOk):`<div class="note muted">Reservá sin cuenta o <a href="#/ingresar">ingresá</a> para sumar puntos.</div>`}
 <div class="lbl">Forma de pago</div>${[['Efectivo','Pagás en la cancha antes de jugar'],['Transferencia','Te pasamos el alias por WhatsApp']].map(([k,s])=>`<label class="choice ${C.pay===k?'on':''}"><input type="radio" name="pg" ${C.pay===k?'checked':''} data-act="pay" data-v="${k}"><div><b>${k}</b><small>${s}</small></div></label>`).join('')}
 <div class="note"><b>Cómo sigue</b><ul><li>Tu turno queda pendiente hasta que el administrador confirme tu pago.</li><li>Podés cancelarlo hasta 24 hs antes del horario.</li></ul></div><p class="muted" style="font-size:14px">Usamos tus datos solo para gestionar el turno.</p></div>
 <div><aside class="card sum"><h4>Resumen</h4><div class="l">Fecha<b>${fd(R.date)}</b></div><div class="l">Horario<b>${R.slot} a ${endT(R.slot)}</b></div><div class="l">Cancha<b>Cancha ${R.court}</b></div><div class="l">Turno<b>${money(CFG.precio)}</b></div>${desc?`<div class="l" style="color:var(--cy)">Descuento por puntos<b style="color:var(--cy)">-${money(desc)}</b></div>`:''}
 <div class="tot"><b>Total</b><span class="disp">${money(CFG.precio-desc)}</span></div><button class="btn pri block" data-act="reservar">Reservar y enviar por WhatsApp</button><small>${u?`Sumás +${CFG.ptsTurno} puntos cuando se confirme el pago.`:'Sin cuenta no sumás puntos.'}</small></aside>
 <aside class="card sum" style="margin-top:20px"><h4>Así le llega a las canchas</h4><div class="wa" id="wa">${esc(msg())}</div></aside></div></div></div>`)}
function vIngresar(){return `<div class="auth"><div class="l"><a class="logo" href="#/" style="color:#04282d">${LOGO.replaceAll('#f3f6f9','#04282d')}<span><b>Punto Pádel</b><small style="color:#04282d">FRANCK</small></span></a><div><h1>Tu cuenta, tus puntos</h1><p style="margin-top:20px">Sumá puntos con cada turno que sacás.<br>Canjealos por descuentos, turnos gratis o pelotitas.<br>Mirá tus turnos y cancelalos desde acá.</p></div><small>Tener cuenta es opcional: podés reservar sin cuenta, pero no sumás puntos.</small></div>
 <div class="r"><div class="card box"><div class="tabs"><button class="btn ${A.m==='in'?'pri':''}" data-act="amode" data-v="in">Ingresar</button><button class="btn ${A.m==='new'?'pri':''}" data-act="amode" data-v="new">Crear cuenta</button></div>
 <form id="af">${A.m==='new'?'<label class="f">Nombre</label><input id="an" required placeholder="Tu nombre">':''}<label class="f">Correo electrónico</label><input id="ae" type="email" required placeholder="nombre@correo.com"><label class="f">Contraseña</label><input id="ap" type="password" required minlength="4" placeholder="Tu contraseña"><br><br><button class="btn pri block">${A.m==='in'?'Ingresar':'Crear cuenta'}</button></form>
 <p class="muted" style="font-size:13px;margin-top:14px">Usamos tu correo solo para tu cuenta y tus puntos.</p></div></div></div>`}
let A={m:'in'};
function mine(){const u=me();return DB.bk.filter(b=>b.userId===u.email)}
function vCuenta(){const u=me();if(!u)return location.hash='#/ingresar','';
 const cj=CFG.canjes,next=[cj.descuento.pts,cj.gratis.pts,cj.pelotitas.pts].filter(p=>p>u.pts).sort((a,b)=>a-b)[0],pct=Math.min(100,u.pts/(next||cj.gratis.pts)*100);
 const up=mine().filter(b=>b.status!=='cancelled'&&start(b)>new Date()-5400000).sort((a,b)=>start(a)-start(b));
 const hist=[...mine().filter(b=>b.status==='paid').map(b=>({d:b.date,t:`Turno · Cancha ${b.court}`,h:`${b.slot} a ${endT(b.slot)}`,p:CFG.ptsTurno})),...DB.red.filter(r=>r.userId===u.email).map(r=>({d:r.date,t:'Canje: '+r.type,h:'—',p:-r.cost}))].sort((a,b)=>b.d.localeCompare(a.d));
 const rw=(k,t,sub,big)=>{const c=k==='descuento'?cj.descuento.pts:k==='gratis'?cj.gratis.pts:cj.pelotitas.pts,ok=u.pts>=c;return `<div class="card ${ok&&k==='descuento'?'':''}" style="margin-bottom:14px;${ok?'border-color:var(--cy)':''}"><div class="rew" style="margin:0 0 12px"><div><b>${t}</b><br><span class="muted">${c} puntos</span></div><span class="disp">${big}</span></div>${ok?`<button class="btn pri block" data-act="canje" data-v="${k}">Canjear</button>`:`<button class="btn block" disabled>Te faltan ${c-u.pts} puntos</button>`}</div>`};
 return shell(`<div class="wrap page"><div class="eyebrow">Mi cuenta</div><h1>Hola, ${esc(u.name)}</h1><div class="grid" style="grid-template-columns:1fr 1.7fr"><div><div class="card"><div class="eyebrow">Tus puntos</div><div class="big">${u.pts}</div><div class="bar"><i style="width:${pct}%"></i></div><p class="muted" style="font-size:14px">${next?`Te faltan ${next-u.pts} puntos para tu próximo canje.`:'¡Podés canjear cualquier premio!'} Cada turno suma +${CFG.ptsTurno}.</p></div>
 <div class="lbl" style="margin-top:28px">Canjear puntos</div>${rw('descuento','Descuento','',`-${cj.descuento.pct}%`)}${rw('gratis','Turno gratis','','1:30')}${rw('pelotitas','Pelotitas','',`x${cj.pelotitas.n}`)}</div>
 <div><div class="note" style="margin-top:0">Podés cancelar un turno cuando quieras, salvo si faltan menos de 24 hs para el horario.</div><h2 style="margin:24px 0 16px">Próximos turnos</h2>
 ${up.length?up.map(b=>{const can=start(b)-new Date()>=864e5;return `<div class="card turno"><div><h3>${fd(b.date)} · ${b.slot} a ${endT(b.slot)}</h3><span class="muted">Cancha ${b.court} · </span><span class="badge ${b.status==='paid'?'b-ok':'b-pend'}">${b.status==='paid'?'Pago confirmado':'Pendiente de pago'}</span>${can?'':'<div class="neg" style="font-size:13px">Faltan menos de 24 hs: ya no se puede cancelar.</div>'}</div><button class="btn" ${can?'':'disabled'} data-act="cancel" data-v="${b.id}">Cancelar</button></div>`}).join(''):'<p class="muted">No tenés turnos próximos. <a href="#/reservar" style="color:var(--cy)">Reservá uno</a>.</p>'}
 <h2 style="margin:36px 0 16px">Historial de puntos</h2><div class="tw"><table><tr><th>Fecha</th><th>Detalle</th><th>Horario</th><th>Puntos</th></tr>${hist.map(h=>`<tr><td>${fd(h.d)}</td><td>${esc(h.t)}</td><td>${h.h}</td><td class="${h.p>0?'pos':'neg'}">${h.p>0?'+':''}${h.p}</td></tr>`).join('')||'<tr><td colspan=4 class="muted">Todavía no hay movimientos.</td></tr>'}</table></div></div></div></div>`)}
/* admin */
let AD={date:iso(new Date()),tab:'hoy',view:'turnos'};
const lbl={paid:['Pago confirmado','b-ok'],pending:['Pendiente de pago','b-pend'],cancelled:['Cancelado','b-x'],blocked:['Bloqueado','b-done'],played:['Jugado','b-done']};
function gate(role){const u=me();if(!u||u.role!==role){location.hash='#/ingresar';return false}return true}
function vAdmin(){if(!gate('admin'))return'';const now=new Date(),today=iso(now),all=DB.bk.filter(b=>b.status!=='cancelled');
 const played=b=>start(b)<now&&b.status!=='pending';
 const rows=all.filter(b=>AD.tab==='hoy'?b.date===AD.date:AD.tab==='prox'?b.date>today:b.date<today).sort((a,b)=>AD.tab==='pas'?(b.date+b.slot).localeCompare(a.date+a.slot):(a.date+a.slot).localeCompare(b.date+b.slot)).slice(0,80);
 const tb=all.filter(b=>b.date===today);
 const side=`<aside class="side"><div class="lg">${logo}</div><small class="t">ADMINISTRADOR</small>${[['turnos','Turnos'],['clientes','Clientes'],['canjes','Canjes de puntos']].map(([k,t])=>`<button class="${AD.view===k?'on':''}" data-act="aview" data-v="${k}">${t}</button>`).join('')}<button data-act="logout">Cerrar sesión</button></aside>`;
 let body;
 if(AD.view==='clientes'){const us=DB.users.filter(u=>u.role==='client');body=`<div class="head"><div><div class="eyebrow">Administrador</div><h1>Clientes</h1></div></div><div class="tw"><table><tr><th>Nombre</th><th>Correo</th><th>Puntos</th><th>Turnos</th></tr>${us.map(u=>`<tr><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${u.pts}</td><td>${DB.bk.filter(b=>b.userId===u.email&&b.status==='paid').length}</td></tr>`).join('')||'<tr><td colspan=4 class="muted">Sin clientes registrados.</td></tr>'}</table></div>`}
 else if(AD.view==='canjes'){body=`<div class="head"><div><div class="eyebrow">Administrador</div><h1>Canjes de puntos</h1></div></div><div class="tw"><table><tr><th>Fecha</th><th>Cliente</th><th>Premio</th><th>Puntos</th></tr>${DB.red.slice().reverse().map(r=>`<tr><td>${fd(r.date)}</td><td>${esc(r.userId)}</td><td>${esc(r.type)}</td><td class="neg">-${r.cost}</td></tr>`).join('')||'<tr><td colspan=4 class="muted">Sin canjes todavía.</td></tr>'}</table></div>`}
 else body=`<div class="head"><div><div class="eyebrow">Administrador</div><h1>Turnos</h1></div><div class="ctl"><button class="btn" data-act="dnav" data-v="-1">‹</button><span class="btn">${fd(AD.date)}</span><button class="btn" data-act="dnav" data-v="1">›</button><button class="btn pri" data-act="block">Bloquear horario</button></div></div>
 <div class="kp"><div class="card"><span>Ya pasaron hoy</span><b class="disp">${tb.filter(played).length}</b></div><div class="card"><span>Faltan hoy</span><b class="disp">${tb.filter(b=>!played(b)).length}</b></div><div class="card"><span>Pendientes de pago</span><b class="disp">${all.filter(b=>b.status==='pending').length}</b></div><div class="card"><span>Próximos días</span><b class="disp">${all.filter(b=>b.date>today).length}</b></div></div>
 <div class="tabs2">${[['hoy','Hoy'],['prox','Próximos'],['pas','Pasados']].map(([k,t])=>`<button class="btn ${AD.tab===k?'pri':''}" data-act="atab" data-v="${k}">${t}</button>`).join('')}</div>
 <div class="tw"><table><tr><th>Hora</th><th>Cancha</th><th>Cliente</th><th>Forma de pago</th><th>Estado</th><th></th></tr>${rows.map(b=>{const l=b.status==='blocked'?lbl.blocked:played(b)?lbl.played:lbl[b.status];return `<tr><td><b>${AD.tab==='hoy'?'':fd(b.date)+' '}${b.slot}</b></td><td class="muted">Cancha ${b.court}</td><td>${esc(b.name)}</td><td>${b.status==='blocked'?'—':b.pay}</td><td><span class="badge ${l[1]}">${l[0]}</span></td><td style="white-space:nowrap">${b.status==='pending'?`<button class="btn pri sm" data-act="confirmpay" data-v="${b.id}">Confirmar pago</button> `:''}${!played(b)?`<button class="btn sm" data-act="acancel" data-v="${b.id}">${b.status==='blocked'?'Liberar':'Cancelar'}</button>`:''}</td></tr>`}).join('')||'<tr><td colspan=6 class="muted">No hay turnos para mostrar.</td></tr>'}</table></div><p class="muted" style="margin-top:14px;font-size:14px">Confirmá el pago antes de que el cliente entre a la cancha. Al confirmar, el cliente con cuenta suma sus puntos.</p>`;
 return `<div class="adm">${side}<main class="main">${body}</main></div>`}
/* dueño */
let OW={y:new Date().getFullYear(),m:new Date().getMonth()};
function vDueno(){if(!gate('owner'))return'';const u=me(),now=new Date(),paid=DB.bk.filter(b=>b.status==='paid');
 const sum=f=>{const l=paid.filter(f);return[l.reduce((s,b)=>s+total(b),0),l.length]};
 const yr=sum(b=>pd(b.date).getFullYear()===OW.y),td=sum(b=>b.date===iso(now));
 const w0=new Date(now);w0.setDate(now.getDate()-((now.getDay()+6)%7));const wk=sum(b=>{const d=pd(b.date);return d>=new Date(w0.getFullYear(),w0.getMonth(),w0.getDate())&&d<=now}),
 mo=sum(b=>{const d=pd(b.date);return d.getFullYear()===OW.y&&d.getMonth()===now.getMonth()});
 const ms=MS.map((_,i)=>sum(b=>{const d=pd(b.date);return d.getFullYear()===OW.y&&d.getMonth()===i}));const mx=Math.max(...ms.map(x=>x[0]),1);
 const dim=new Date(OW.y,OW.m+1,0).getDate(),dv=[...Array(dim)].map((_,i)=>sum(b=>b.date===`${OW.y}-${pad(OW.m+1)}-${pad(i+1)}`)),dmx=Math.max(...dv.map(x=>x[0]),1);
 const sel=ms[OW.m],cur=OW.y===now.getFullYear()&&OW.m===now.getMonth(),fut=i=>new Date(OW.y,OW.m,i+1)>now;
 const past=dv.filter((_,i)=>!fut(i)),best=dv.reduce((a,x,i)=>x[0]>dv[a][0]?i:a,0),avg=past.length?sel[0]/past.length:0;
 const wks=[[1,7],[8,14],[15,21],[22,28],[29,dim]].filter(([a])=>a<=dim);
 return `<header class="nav"><div class="wrap">${logo}<nav><span class="muted">Dueño · ${esc(u.name)}</span><button class="btn" data-act="logout">Cerrar sesión</button></nav></div></header><div class="wrap page"><div class="head"><div><div class="eyebrow">Panel del dueño</div><h1 style="margin:0">Ganancias</h1></div><div class="ctl"><button class="btn" data-act="oy" data-v="-1">‹</button><b class="disp" style="font-size:32px">${OW.y}</b><button class="btn" data-act="oy" data-v="1">›</button></div></div>
 <div class="own"><div class="card hl">Ganancia general de ${OW.y}<span class="disp">${money(yr[0])}</span>${yr[1]} turnos en el año</div>${[['Hoy',td],['Esta semana',wk],['Este mes',mo]].map(([t,x])=>`<div class="card"><span class="muted">${t}</span><span class="disp">${money(x[0])}</span><span class="muted">${x[1]} turnos</span></div>`).join('')}</div>
 <div style="display:flex;justify-content:space-between;align-items:baseline"><h2 style="font-size:38px">Mes a mes</h2><span class="muted" style="font-size:14px">Tocá un mes para ver su detalle</span></div>
 <div class="months">${ms.map((x,i)=>`<button class="m ${OW.m===i?'on':''}" data-act="om" data-v="${i}"><div class="bc"><i style="height:${x[0]/mx*100}%"></i></div><b>${MS[i]}</b>${money(x[0]).replace('$ ','$')}</button>`).join('')}</div>
 <h2 style="font-size:38px;margin-bottom:16px">${MF[OW.m]} ${OW.y}</h2><div class="grid" style="grid-template-columns:1.6fr 1fr"><div class="card"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><b>Ganancia por día</b><span class="muted" style="font-size:13px">Hoy resaltado · los días que faltan, en línea punteada</span></div>
 <div class="chart">${dv.map((x,i)=>`<i class="${fut(i)?'fut':cur&&now.getDate()===i+1?'today':''}" title="${i+1}: ${money(x[0])}" style="height:${fut(i)?14:x[0]/dmx*100}%"></i>`).join('')}</div><div class="ax">${dv.map((_,i)=>`<span>${i%5===0||i===dim-1?i+1:''}</span>`).join('')}</div></div>
 <div><div class="card" style="margin-bottom:12px"><span class="muted">Ganancia del mes</span><div class="disp" style="font-size:38px;margin-top:6px">${money(sel[0])}</div></div>${[['Turnos del mes',sel[1]],['Promedio por día',money(avg)],['Mejor día',dv[best][0]?`${best+1}/${OW.m+1}`:'—']].map(([k,v])=>`<div class="card kv"><span class="muted">${k}</span><b>${v}</b></div>`).join('')}</div></div>
 <div class="tw" style="margin-top:24px"><table><tr><th>Semana</th><th>Turnos</th><th>Ganancia</th></tr>${wks.map(([a,b],i)=>{let t=0,n=0;for(let d=a;d<=b;d++){t+=dv[d-1][0];n+=dv[d-1][1]}return `<tr><td>Semana ${i+1} (${a}–${b})</td><td>${n}</td><td><b>${money(t)}</b></td></tr>`}).join('')}</table></div>
 <p class="muted" style="margin:14px 0;font-size:14px">Solo cuentan los turnos con el pago confirmado por el administrador. </p></div>${footer()}`}
/* router */
const routes={'':vInicio,'/':vInicio,'/reservar':vReservar,'/confirmar':vConfirmar,'/ingresar':vIngresar,'/cuenta':vCuenta,'/admin':vAdmin,'/dueno':vDueno};
function render(){const p=location.hash.replace(/^#/,'')||'/';const f=routes[p];if(!f){if(p==='contacto')return;return location.hash='#/'}
 const h=f();if(h!==''&&h!==undefined){app.innerHTML=h;scrollTo(0,0)}}
addEventListener('hashchange',render);
/* actions */
const act={
 date(v){R.date=v;R.slot=null},court(v){R.court=+v;R.slot=null},slot(v){R.slot=v},
 continuar(){location.hash='#/confirmar';return 1},
 redeem(v){C.redeem=v},pay(v){C.pay=v},amode(v){A.m=v},
 async logout(){TK.set(null);await load();location.hash='#/';render();return 1},
 async reservar(){const nm=$('#nm').value.trim(),ph=$('#ph').value.trim();if(!nm||ph.length<6)return toast('Completá nombre y teléfono'),1;
  const w=window.open('','_blank');
  try{const r=await api('action',{type:'reserve',date:R.date,slot:R.slot,court:R.court,name:nm,phone:ph,pay:C.pay,redeem:C.redeem});
   const txt=`Hola! Quiero reservar un turno:\n• Cancha ${R.court} · ${fd(R.date)} · ${R.slot} a ${endT(R.slot)}\nNombre: ${nm}\nTeléfono: ${ph}\nPrecio: ${money(r.total)}\nForma de pago: ${C.pay}`;
   if(w)w.location=`https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(txt)}`;
   R={date:null,court:1,slot:null};C={redeem:'none',pay:'Efectivo'};await load();toast('¡Turno reservado! Queda pendiente de pago');location.hash=me()?'#/cuenta':'#/';render()}
  catch(e){w&&w.close();toast(e.message);await load()}return 1},
 async cancel(v){await call({type:'cancel',id:v},'Turno cancelado')},
 async canje(v){if(v==='pelotitas')return call({type:'canje',kind:'pelotitas'},'¡Canje listo! Retiralas en la cancha');C.redeem=v;toast('Elegí tu turno y se aplica el canje');location.hash='#/reservar';return 1},
 aview(v){AD.view=v},atab(v){AD.tab=v},dnav(v){const d=pd(AD.date);d.setDate(d.getDate()+ +v);AD.date=iso(d)},
 async confirmpay(v){await call({type:'confirmpay',id:v},'Pago confirmado')},
 async acancel(v){const b=DB.bk.find(x=>x.id===v);await call({type:b.status==='blocked'?'unblock':'cancel',id:v})},
 async block(){const s=prompt('Horario a bloquear (ej: 18:30)',CFG.slots[0]);if(!s)return 1;const c=+prompt('Cancha (1-'+CFG.canchas+')','1');await call({type:'block',date:AD.date,slot:s,court:c},'Horario bloqueado')},
 oy(v){OW.y+=+v},om(v){OW.m=+v}
};
async function call(body,ok){try{await api('action',body);ok&&toast(ok)}catch(e){toast(e.message)}await load()}
document.addEventListener('click',async e=>{const t=e.target.closest('[data-act]');if(!t||t.tagName==='INPUT'&&t.type==='text')return;const r=await act[t.dataset.act]?.(t.dataset.v);if(r!==1)render()});
document.addEventListener('input',e=>{if(e.target.id==='nm'){const w=$('#wa');if(w)w.textContent=w.textContent.replace(/Nombre: .*/,'Nombre: '+(e.target.value||'[Nombre y apellido]'))}});
document.addEventListener('submit',async e=>{if(e.target.id!=='af')return;e.preventDefault();
 try{const d=await api('auth',{mode:A.m,email:$('#ae').value,pass:$('#ap').value,name:$('#an')?.value});TK.set(d.token);await load();const r=d.user.role;location.hash=r==='admin'?'#/admin':r==='owner'?'#/dueno':'#/cuenta';render()}catch(er){toast(er.message)}});
document.addEventListener('click',e=>{const a=e.target.closest('[data-go]');if(a){e.preventDefault();const go=()=>document.getElementById(a.dataset.go)?.scrollIntoView({behavior:'smooth'});location.hash!=='#/'&&location.hash!==''?(location.hash='#/',setTimeout(go,50)):go()}});
load().then(render);
