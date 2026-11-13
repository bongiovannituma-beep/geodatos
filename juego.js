// Geodatos — motor del juego. Sin librerías: mapa dibujado a mano sobre <canvas>.
(() => {
'use strict';
const $ = s => document.querySelector(s);
const PREG = window.PREGUNTAS, MAP = window.MAPAS;
const TZ = 'America/Argentina/Buenos_Aires';
const MULT = [1, 1, 2, 2, 4];           // las últimas preguntas valen más: ronda perfecta = 1.000
const TEMAS_ICONO = { 'Lugares históricos': '🏛️', 'Ciudades': '🏙️', 'Naturaleza': '🏞️', 'Fútbol y deportes': '⚽', 'Tradiciones y comidas': '🧉', 'Capitales': '⭐', 'Ciencia y naturaleza': '🔭' };
const C = { agua1: '#d6ecff', agua2: '#b9dcf5', lago: '#a9d3f2', rio: '#7fb8e3', vecino: '#efe3c2', vecinoLinea: '#c9b98a', costa: '#4c8a3a', linea: '#fffaf0', texto: '#1c2b4a', azul: '#2e86de', amarillo: '#ffc93c' };
const TINTAS = ['#b9dd9b', '#cfe6a8', '#a8d8a6', '#c4e3b4', '#d8e8ae', '#b2dbb8'];

// ---------- utilidades ----------
const fmt = n => Math.round(n).toLocaleString('es-AR');
const hoyClave = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ });
const ayerClave = () => new Date(new Date(hoyClave() + 'T12:00:00').getTime() - 864e5).toLocaleDateString('en-CA');
const fechaCorta = (k = hoyClave()) => new Date(k + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function semilla(txt) { let h = 1779033703 ^ txt.length; for (let i = 0; i < txt.length; i++) { h = Math.imul(h ^ txt.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; } return () => { h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); return (h ^= h >>> 16) >>> 0; }; }
function azar(sem) { let a = sem(); return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function mezclar(arr, rnd) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const km = (a, b, c, d) => { const r = Math.PI / 180, p = (c - a) * r, l = (d - b) * r; const h = Math.sin(p / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(l / 2) ** 2; return 12742 * Math.asin(Math.sqrt(h)); };
function dentro(lon, lat, ring) { let d = false; for (let i = 0, j = ring.length - 2; i < ring.length; i += 2) { const xi = ring[i], yi = ring[i + 1], xj = ring[j], yj = ring[j + 1]; if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) d = !d; j = i; } return d; }
function kmAlBorde(lon, lat, ring) {
  const kx = Math.cos(lat * Math.PI / 180) * 111.32, ky = 110.57; let mejor = Infinity;
  for (let i = 0, j = ring.length - 2; i < ring.length; i += 2) {
    const ax = (ring[j] - lon) * kx, ay = (ring[j + 1] - lat) * ky, bx = (ring[i] - lon) * kx, by = (ring[i + 1] - lat) * ky;
    const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy; let t = L ? -(ax * dx + ay * dy) / L : 0; t = Math.max(0, Math.min(1, t));
    mejor = Math.min(mejor, Math.hypot(ax + t * dx, ay + t * dy)); j = i;
  }
  return mejor;
}

// ---------- guardado ----------
const CLAVE = 'geoplay.v2';
const base0 = () => ({ racha: 0, mejorRacha: 0, ultima: '', mejor: 0, jugadas: 0, hoy: null, hist: {}, sonido: true, sat: false, yo: '', grupos: {} });
function cargar() { try { return Object.assign(base0(), JSON.parse(localStorage.getItem(CLAVE)) || {}); } catch { return base0(); } }
function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(est)); } catch {} }
const est = cargar();

// ---------- sonido (sintetizado, sin archivos) ----------
let audio = null;
function tono(f, dur = .13, vol = .06, retraso = 0, tipo = 'sine') {
  if (!est.sonido) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain(), t = audio.currentTime + retraso;
    o.type = tipo; o.frequency.value = f; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(audio.destination); o.start(t); o.stop(t + dur + .02);
  } catch {}
}
const sonidoPin = () => tono(740, .07, .04);
function sonidoResultado(base) {
  if (base >= 90) [523, 659, 784, 1047].forEach((f, i) => tono(f, .18, .07, i * .09));
  else if (base >= 50) [523, 659].forEach((f, i) => tono(f, .16, .06, i * .1));
  else if (base >= 1) tono(330, .2, .05); else tono(196, .3, .05, 0, 'triangle');
}

// ---------- puntaje ----------
const clase = base => base >= 90 ? 'v' : base >= 50 ? 'a' : base >= 1 ? 'r' : 'n';
const emoji = base => ({ v: '🟢', a: '🟡', r: '🔴', n: '⚫' })[clase(base)];
const baseDe = (d, esc) => Math.round(100 / (1 + Math.max(0, d - esc * 0.1) / (esc * 0.6)));
function puntaje(p, lon, lat) {
  if (p.tipo === 'punto') { const d = km(lat, lon, p.lat, p.lon); return { d, base: baseDe(d, p.esc) }; }
  const capa = (p.tipo === 'provincia' ? MAP.prov : MAP.mundo).filter(x => x.n === p.zona);
  if (capa.some(x => x.r.some(r => dentro(lon, lat, r)))) return { d: 0, base: 100 };
  const d = Math.min(...capa.flatMap(x => x.r.map(r => kmAlBorde(lon, lat, r))));
  return { d, base: Math.min(90, baseDe(d, p.esc)) };
}

// ---------- rondas ----------
function rondaDiaria(fecha) {
  const rnd = azar(semilla('geoplay-' + fecha)), out = [];
  for (const [sec, n] of [['ar', 3], ['mu', 2]]) {
    const temas = mezclar([...new Set(PREG.filter(p => p.sec === sec).map(p => p.tema))], rnd).slice(0, n);
    for (const t of temas) { const pool = PREG.filter(p => p.sec === sec && p.tema === t); out.push(pool[Math.floor(rnd() * pool.length)]); }
  }
  return mezclar(out, rnd);
}
const rondaTema = (sec, tema) => mezclar(PREG.filter(p => p.sec === sec && p.tema === tema), Math.random).slice(0, 5);
const totalDe = res => res.reduce((a, r) => a + r.pts, 0);

// ---------- datos del mapa ----------
const mx = lon => (lon + 180) / 360;
const my = lat => { const s = Math.sin(Math.max(-85, Math.min(85, lat)) * Math.PI / 180); return 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI); };
const ux = x => x * 360 - 180;
const uy = y => { const n = Math.PI * (1 - 2 * y); return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))); };
function bordes(flat) { const p = new Float32Array(flat.length); let x0 = 9, y0 = 9, x1 = -9, y1 = -9; for (let i = 0; i < flat.length; i += 2) { const x = mx(flat[i]), y = my(flat[i + 1]); p[i] = x; p[i + 1] = y; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return { p, b: [x0, y0, x1, y1], flat }; }
function colorear(capa) { // colores distintos para zonas vecinas
  const celdas = capa.map(z => { const s = new Set(); for (const r of z.r) for (let i = 0; i < r.length; i += 2) s.add(Math.floor(r[i] / .3) + ',' + Math.floor(r[i + 1] / .3)); return s; });
  const col = [];
  capa.forEach((_, i) => { const veci = new Set(); for (let j = 0; j < i; j++) { const [a, b] = celdas[i].size < celdas[j].size ? [celdas[i], celdas[j]] : [celdas[j], celdas[i]]; for (const k of a) if (b.has(k)) { veci.add(col[j]); break; } } let c = 0; while (veci.has(c)) c++; col[i] = c % TINTAS.length; });
  return col;
}
function prepararCapa(capa) { capa = capa.filter(c => c.r.length); const cols = colorear(capa); return capa.map((c, i) => { const r = c.r.map(bordes); let g = r[0]; for (const q of r) if ((q.b[2] - q.b[0]) * (q.b[3] - q.b[1]) > (g.b[2] - g.b[0]) * (g.b[3] - g.b[1])) g = q; return { n: c.n, r, color: TINTAS[cols[i]], cx: (g.b[0] + g.b[2]) / 2, cy: (g.b[1] + g.b[3]) / 2, w: g.b[2] - g.b[0] }; }); }
const CAPAS = { mundo: prepararCapa(MAP.mundo), detalle: prepararCapa(MAP.detalle), prov: prepararCapa(MAP.prov) };
const LAGOS = MAP.lagos.map(l => ({ n: l.n, r: l.r.map(bordes) }));
const RIOS = MAP.rios.map(bordes);
const CIUDADES = MAP.ciudades.map(c => ({ n: c[0], nn: norm(c[0]), x: mx(c[1]), y: my(c[2]), pop: c[3], tipo: c[4], ar: c[5] }));
const VISTAS = { ar: [-73.8, -55.8, -53.2, -21.3], mu: [-180, -58, 180, 78] };
const ETQ_AR = [['Chile', -71.3, -34.5], ['Bolivia', -64.6, -17.2], ['Paraguay', -58.4, -23.3], ['Brasil', -53.8, -23.4], ['Uruguay', -55.9, -32.7]];
const ETQ_MAR = { ar: [['Océano Atlántico', -57.5, -43.5], ['Océano Pacífico', -77, -42]], mu: [['Océano Atlántico', -35, 28], ['Océano Pacífico', -150, 22], ['Océano Pacífico', -130, -28], ['Océano Índico', 80, -22], ['Océano Atlántico', -15, -22], ['Océano Glacial Ártico', 30, 78]] };

// ---------- mapa ----------
const cv = $('#mapa'), g = cv.getContext('2d');
let W = 0, H = 0, dpr = 1, S = 300, cx = .5, cy = .5, mapaTipo = 'ar', anim = 0, pendiente = false;
let pin = null, solucion = null, ocultas = [], tipoPreg = 'punto'; // pin = {lon,lat}
const aPantalla = (x, y) => [(x - cx) * S + W / 2, (y - cy) * S + H / 2];
const aMundo = (px, py) => [(px - W / 2) / S + cx, (py - H / 2) / S + cy];
const zoomNivel = () => Math.log2(S / 256);
function limitar() { S = Math.max(Math.max(W, 200) * 0.95, Math.min(S, 524288)); cx = Math.max(0, Math.min(1, cx)); cy = Math.max(0, Math.min(1, cy)); }
function ajustar(l0, a0, l1, a1, relleno = 40) { const x0 = mx(l0), x1 = mx(l1), y0 = my(a1), y1 = my(a0); S = Math.min((W - 2 * relleno) / (x1 - x0), (H - 2 * relleno) / (y1 - y0)); cx = (x0 + x1) / 2; cy = (y0 + y1) / 2; limitar(); }
function animarA(l0, a0, l1, a1, relleno = 50) {
  const s0 = S, x0 = cx, y0 = cy; ajustar(l0, a0, l1, a1, relleno); const s1 = S, x1 = cx, y1 = cy, t0 = performance.now(), id = ++anim;
  const paso = t => { if (id !== anim) return; let k = Math.min(1, (t - t0) / 800); k = 1 - (1 - k) ** 3; S = s0 * (s1 / s0) ** k; cx = x0 + (x1 - x0) * k; cy = y0 + (y1 - y0) * k; pintar(); if (k < 1) requestAnimationFrame(paso); };
  S = s0; cx = x0; cy = y0; requestAnimationFrame(paso);
}
function redimensionar() { const r = cv.getBoundingClientRect(); if (!r.width) return; dpr = window.devicePixelRatio || 1; W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); limitar(); dibujar(); }
function dibujar() { if (pendiente) return; pendiente = true; requestAnimationFrame(() => { pendiente = false; pintar(); }); }
const vistaInicial = () => { const v = VISTAS[mapaTipo]; ajustar(v[0], v[1], v[2], v[3], 12); };

function trazar(lista, filtro) {
  const [vx0, vy0] = aMundo(0, 0), [vx1, vy1] = aMundo(W, H); g.beginPath();
  for (const c of lista) { if (filtro && !filtro(c)) continue;
    for (const r of c.r) { const b = r.b; if (b[2] < vx0 || b[0] > vx1 || b[3] < vy0 || b[1] > vy1) continue; const p = r.p;
      g.moveTo((p[0] - cx) * S + W / 2, (p[1] - cy) * S + H / 2);
      for (let i = 2; i < p.length; i += 2) g.lineTo((p[i] - cx) * S + W / 2, (p[i + 1] - cy) * S + H / 2);
      g.closePath(); } }
}
function lineas(lista) {
  const [vx0, vy0] = aMundo(0, 0), [vx1, vy1] = aMundo(W, H); g.beginPath();
  for (const r of lista) { const b = r.b; if (b[2] < vx0 || b[0] > vx1 || b[3] < vy0 || b[1] > vy1) continue; const p = r.p;
    g.moveTo((p[0] - cx) * S + W / 2, (p[1] - cy) * S + H / 2);
    for (let i = 2; i < p.length; i += 2) g.lineTo((p[i] - cx) * S + W / 2, (p[i + 1] - cy) * S + H / 2); }
}
function graticula() {
  const z = zoomNivel(), paso = z < 1.5 ? 30 : z < 3.5 ? 10 : z < 5.5 ? 5 : z < 7.5 ? 1 : .25;
  g.beginPath(); g.strokeStyle = '#ffffff55'; g.lineWidth = 1;
  const [x0, y0] = aMundo(0, 0), [x1, y1] = aMundo(W, H), l0 = ux(x0), l1 = ux(x1), a1 = uy(y0), a0 = uy(y1);
  for (let l = Math.ceil(l0 / paso) * paso; l <= l1; l += paso) { const [px] = aPantalla(mx(l), 0); g.moveTo(px, 0); g.lineTo(px, H); }
  for (let a = Math.ceil(a0 / paso) * paso; a <= a1; a += paso) { const [, py] = aPantalla(0, my(a)); g.moveTo(0, py); g.lineTo(W, py); }
  g.stroke();
}
// Satélite: mosaicos de la NASA (Blue Marble, dominio público, gratis y sin clave). Si no hay internet queda el mapa de colores.
const TEJA = (z, x, y) => `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/${z}/${y}/${x}.jpeg`;
const tejas = new Map();
function teja(z, x, y) {
  const k = z + '/' + x + '/' + y; let t = tejas.get(k);
  if (!t) { if (tejas.size > 400) tejas.delete(tejas.keys().next().value); t = { img: new Image(), ok: false }; t.img.onload = () => { t.ok = true; dibujar(); }; t.img.src = TEJA(z, x, y); tejas.set(k, t); }
  return t;
}
function satelite() {
  const z = Math.max(0, Math.min(8, Math.ceil(Math.log2(S / 256 - 1e-9)))), n = 2 ** z, lado = S / n;
  const [x0, y0] = aMundo(0, 0), [x1, y1] = aMundo(W, H);
  const i0 = Math.max(0, Math.floor(x0 * n)), i1 = Math.min(n - 1, Math.floor(x1 * n)), j0 = Math.max(0, Math.floor(y0 * n)), j1 = Math.min(n - 1, Math.floor(y1 * n));
  if ((i1 - i0 + 1) * (j1 - j0 + 1) > 80) return;
  for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) { const t = teja(z, i, j); if (t.ok) { const [px, py] = aPantalla(i / n, j / n); g.drawImage(t.img, px, py, lado + .6, lado + .6); } }
}
function pintar() {
  if (!W) return;
  g.setTransform(dpr, 0, 0, dpr, 0, 0); g.lineJoin = 'round'; g.lineCap = 'round';
  const grad = g.createLinearGradient(0, 0, 0, H); grad.addColorStop(0, C.agua1); grad.addColorStop(1, C.agua2); g.fillStyle = grad; g.fillRect(0, 0, W, H);
  const reveal = !!solucion, ar = mapaTipo === 'ar';
  if (ar) {
    trazar(CAPAS.mundo); g.fillStyle = C.vecino; g.fill();
    trazar(CAPAS.detalle, c => c.n !== 'Argentina'); g.fillStyle = C.vecino; g.fill(); g.strokeStyle = C.vecinoLinea; g.lineWidth = 1; g.stroke();
    trazar(CAPAS.detalle, c => c.n === 'Argentina'); g.fillStyle = TINTAS[0]; g.fill();
    for (const p of CAPAS.prov) { trazar([p]); g.fillStyle = p.color; g.fill(); }
    if (reveal && solucion.p.tipo === 'provincia') { trazar(CAPAS.prov, c => c.n === solucion.p.zona); g.fillStyle = C.amarillo; g.fill(); }
  } else {
    for (const p of CAPAS.mundo) { trazar([p]); g.fillStyle = p.color; g.fill(); }
    if (reveal && solucion.p.tipo === 'pais') { trazar(CAPAS.mundo, c => c.n === solucion.p.zona); g.fillStyle = C.amarillo; g.fill(); }
  }
  const sat = est.sat;
  if (sat) {
    satelite();
    const z = solucion && solucion.p.tipo !== 'punto' ? solucion.p : null;
    if (z) { g.globalAlpha = .4; trazar(z.tipo === 'provincia' ? CAPAS.prov : CAPAS.mundo, c => c.n === z.zona); g.fillStyle = C.amarillo; g.fill(); g.globalAlpha = 1; }
  } else graticula();
  if (!sat) { trazar(LAGOS); g.fillStyle = C.lago; g.fill(); g.strokeStyle = '#8fc0e6'; g.lineWidth = 1; g.stroke(); }
  if (!sat) { lineas(RIOS); g.strokeStyle = C.rio; g.lineWidth = Math.max(.8, Math.min(2.2, zoomNivel() / 3)); g.stroke(); }
  if (ar) {
    trazar(CAPAS.prov); g.strokeStyle = C.linea; g.lineWidth = 1.2; g.stroke();
    trazar(CAPAS.detalle, c => c.n === 'Argentina'); g.strokeStyle = C.costa; g.lineWidth = 1.7; g.stroke();
  } else { trazar(CAPAS.mundo); g.strokeStyle = C.linea; g.lineWidth = .8; g.stroke(); }
  if (reveal && solucion.p.tipo !== 'punto') { trazar(solucion.p.tipo === 'provincia' ? CAPAS.prov : CAPAS.mundo, c => c.n === solucion.p.zona); g.strokeStyle = C.texto; g.lineWidth = 2.2; g.stroke(); }
  etiquetas(reveal);
  if (reveal && pin && solucion.objetivo) { const a = aPantalla(mx(pin.lon), my(pin.lat)), b = aPantalla(mx(solucion.objetivo.lon), my(solucion.objetivo.lat)); g.setLineDash([7, 6]); g.strokeStyle = '#d6361f'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.setLineDash([]); }
  if (reveal && solucion.centro) marcador(solucion.centro.lon, solucion.centro.lat, '#2fb35d', solucion.p.r);
  if (pin) marcador(pin.lon, pin.lat, C.azul, null);
}
function etiquetas(reveal) {
  const cajas = [], z = zoomNivel(), ar = mapaTipo === 'ar';
  const libre = (x, y, w, h) => x > 2 && y > 2 && x + w < W - 2 && y + h < H - 2 && !cajas.some(c => x < c[0] + c[2] && x + w > c[0] && y < c[1] + c[3] && y + h > c[1]);
  const pegar = (x, y, w, h) => cajas.push([x, y, w, h]);
  g.textBaseline = 'middle'; pegar(W - 58, 6, 54, 170); // lugar de los botones de zoom
  // ciudades (las más grandes primero; la que es la respuesta se esconde hasta mostrar el resultado)
  const umbral = ar ? 300000 * 10 ** (-(z - 4) * 0.55) : 22e6 * 10 ** (-(z - .4) * .75);
  let puestas = 0;
  for (const c of CIUDADES) {
    const peso = c.pop * (c.tipo ? 3 : 1); if (peso < umbral) break;
    if (!reveal && ocultas.some(o => c.nn.length > 3 && o.includes(c.nn))) continue;
    const [x, y] = aPantalla(c.x, c.y); if (x < 0 || y < 0 || x > W || y > H) continue;
    const grande = c.pop > 1e6 || c.tipo === 2; g.font = `${grande ? 700 : 600} ${grande ? 13 : 11.5}px system-ui,sans-serif`;
    const w = g.measureText(c.n).width + 4, h = 14; let lx = x + 6;
    if (!libre(lx, y - h / 2, w, h)) { lx = x - 6 - w; if (!libre(lx, y - h / 2, w, h)) continue; }
    pegar(lx, y - h / 2, w, h); pegar(x - 4, y - 4, 8, 8);
    g.lineWidth = 3; g.strokeStyle = '#fffffff0'; g.textAlign = 'left'; g.strokeText(c.n, lx + 2, y + 1); g.fillStyle = C.texto; g.fillText(c.n, lx + 2, y + 1);
    g.beginPath(); if (c.tipo === 2) g.rect(x - 3.5, y - 3.5, 7, 7); else g.arc(x, y, c.pop > 5e5 ? 3.6 : 2.8, 0, 7); g.fillStyle = c.tipo ? '#d6361f' : C.texto; g.fill(); g.lineWidth = 1.4; g.strokeStyle = '#fff'; g.stroke();
    if (++puestas > 90) break;
  }
  // nombres de provincias / países (si no delatan la respuesta)
  g.font = 'italic 600 11px system-ui,sans-serif'; g.textAlign = 'center'; g.fillStyle = '#4a6b3e';
  const poner = (t, x, y, ancho, color) => { const w = g.measureText(t).width + 6; if (ancho !== undefined && ancho < w) return; if (!libre(x - w / 2, y - 7, w, 14)) return; pegar(x - w / 2, y - 7, w, 14); g.lineWidth = 3; g.strokeStyle = '#ffffffcc'; g.strokeText(t, x, y); g.fillStyle = color; g.fillText(t, x, y); };
  if (ar) {
    if (z >= 3.6 && (reveal || tipoPreg !== 'provincia')) for (const p of CAPAS.prov) { const [x, y] = aPantalla(p.cx, p.cy); if (x > 0 && y > 0 && x < W && y < H) poner(p.n.toUpperCase(), x, y, undefined, '#4a6b3e'); }
    g.font = 'italic 600 12px system-ui,sans-serif';
    for (const [t, lo, la] of ETQ_AR) { const [x, y] = aPantalla(mx(lo), my(la)); poner(t, x, y, undefined, '#8a7a4f'); }
  } else if (z >= .2 && (reveal || tipoPreg !== 'pais')) {
    for (const p of CAPAS.mundo) { const [x, y] = aPantalla(p.cx, p.cy); if (x < 0 || y < 0 || x > W || y > H) continue; poner(p.n, x, y, p.w * S - 4, '#3f5f33'); }
  }
  if (z < 5) { g.font = 'italic 600 12px system-ui,sans-serif'; for (const [t, lo, la] of ETQ_MAR[mapaTipo]) { const [x, y] = aPantalla(mx(lo), my(la)); poner(t, x, y, undefined, '#5f8fb8'); } }
}
function marcador(lon, lat, color, texto) {
  const [x, y] = aPantalla(mx(lon), my(lat));
  g.save(); g.shadowColor = '#0004'; g.shadowBlur = 6; g.shadowOffsetY = 2;
  g.beginPath(); g.moveTo(x, y); g.lineTo(x - 8.8, y - 9.6); g.arc(x, y - 16, 11, 2.51, 6.91, false); g.closePath();
  g.fillStyle = color; g.fill(); g.restore(); g.lineWidth = 2.2; g.strokeStyle = '#fff'; g.stroke();
  g.beginPath(); g.arc(x, y - 16, 4.2, 0, 7); g.fillStyle = '#fff'; g.fill();
  if (texto) { g.font = '800 13px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineWidth = 4.5; g.strokeStyle = '#fffffff0'; g.strokeText(texto, x, y - 33); g.fillStyle = C.texto; g.fillText(texto, x, y - 33); g.textBaseline = 'middle'; }
}

// gestos: arrastrar, pellizcar, rueda, toque para marcar
const dedos = new Map(); let movido = 0, distPrev = 0;
const zoomEn = (px, py, f) => { const [wx, wy] = aMundo(px, py); S *= f; limitar(); cx = wx - (px - W / 2) / S; cy = wy - (py - H / 2) / S; limitar(); dibujar(); };
cv.addEventListener('pointerdown', e => { anim++; cv.setPointerCapture(e.pointerId); dedos.set(e.pointerId, { x: e.offsetX, y: e.offsetY }); movido = 0; if (dedos.size === 2) { const [a, b] = [...dedos.values()]; distPrev = Math.hypot(a.x - b.x, a.y - b.y); } });
cv.addEventListener('pointermove', e => {
  const d = dedos.get(e.pointerId); if (!d) return; const dx = e.offsetX - d.x, dy = e.offsetY - d.y; d.x = e.offsetX; d.y = e.offsetY; movido += Math.abs(dx) + Math.abs(dy);
  if (dedos.size === 1) { cx -= dx / S; cy -= dy / S; limitar(); dibujar(); }
  else if (dedos.size === 2) { const [a, b] = [...dedos.values()], n = Math.hypot(a.x - b.x, a.y - b.y); if (distPrev) zoomEn((a.x + b.x) / 2, (a.y + b.y) / 2, n / distPrev); distPrev = n; }
});
const soltar = e => { const solo = dedos.size === 1; dedos.delete(e.pointerId); distPrev = 0; if (solo && movido < 8 && e.type === 'pointerup') tocar(e.offsetX, e.offsetY); };
cv.addEventListener('pointerup', soltar); cv.addEventListener('pointercancel', soltar);
cv.addEventListener('wheel', e => { e.preventDefault(); anim++; zoomEn(e.offsetX, e.offsetY, e.deltaY < 0 ? 1.3 : 1 / 1.3); }, { passive: false });
$('#mas').onclick = () => { anim++; zoomEn(W / 2, H / 2, 1.6); };
$('#menos').onclick = () => { anim++; zoomEn(W / 2, H / 2, 1 / 1.6); };
$('#centrar').onclick = () => { anim++; const v = VISTAS[mapaTipo]; animarA(v[0], v[1], v[2], v[3], 12); };
new ResizeObserver(redimensionar).observe($('.mapa-wrap'));

// ---------- partida ----------
let J = null; // {modo, preguntas, i, res:[], estado}
const PANTALLAS = ['inicio', 'juego', 'fin', 'stats', 'grupos'];
const mostrar = id => { for (const s of PANTALLAS) $('#' + s).hidden = s !== id; cerrarMenu(); };
const puntitos = (res, n, actual = -1) => Array.from({ length: n }, (_, i) => `<span class="pt ${res[i] ? clase(res[i].base) : ''} ${i === actual ? 'actual' : ''}"></span>`).join('');
function empezar(modo, preguntas, previas = []) {
  J = { modo, preguntas, i: previas.length, res: previas.slice(), estado: 'pregunta' };
  if (J.i >= preguntas.length) return terminar();
  mostrar('juego'); requestAnimationFrame(() => { redimensionar(); preguntar(); });
}
function preguntar() {
  const p = J.preguntas[J.i]; J.estado = 'pregunta'; pin = null; solucion = null; mapaTipo = p.sec; tipoPreg = p.tipo;
  ocultas = [norm(p.q), norm(p.r)].filter(Boolean);
  const m = MULT[J.i] || 1;
  $('#progreso').textContent = `${J.modo === 'diaria' ? 'Ronda de hoy · ' : J.modo === 'turnos' ? '🎲 Turno de ' + J.jug[J.t].n + ' · ' : ''}Pregunta ${J.i + 1} de ${J.preguntas.length}`;
  $('#mult').textContent = `×${m}`; $('#mult').hidden = m === 1;
  $('#puntos').textContent = fmt(totalDe(J.res)); $('#fecha-juego').textContent = fechaCorta();
  $('#pregunta').textContent = p.q; $('#pista').hidden = false;
  $('#panel').innerHTML = '<button id="confirmar" class="btn" disabled>Confirmar mi respuesta</button>';
  $('#confirmar').onclick = confirmar;
  vistaInicial(); dibujar();
}
function tocar(px, py) {
  if (!J || J.estado !== 'pregunta') return;
  const [x, y] = aMundo(px, py); pin = { lon: ux(x), lat: uy(y) }; sonidoPin();
  $('#confirmar').disabled = false; $('#pista').hidden = true; dibujar();
}
function centroRegion(p) {
  const z = (p.tipo === 'provincia' ? CAPAS.prov : CAPAS.mundo).filter(c => c.n === p.zona); let mejor = null, area = -1, caja = [180, 90, -180, -90];
  for (const c of z) for (const r of c.r) { const l0 = ux(r.b[0]), l1 = ux(r.b[2]), a0 = uy(r.b[3]), a1 = uy(r.b[1]), a = (r.b[2] - r.b[0]) * (r.b[3] - r.b[1]);
    caja = [Math.min(caja[0], l0), Math.min(caja[1], a0), Math.max(caja[2], l1), Math.max(caja[3], a1)]; if (a > area) { area = a; mejor = [(l0 + l1) / 2, (a0 + a1) / 2]; } }
  return { lon: mejor[0], lat: mejor[1], caja };
}
function confirmar() {
  if (!pin || J.estado !== 'pregunta') return; const p = J.preguntas[J.i], r = puntaje(p, pin.lon, pin.lat), m = MULT[J.i] || 1, pts = r.base * m; J.estado = 'revelado';
  let caja, objetivo = null, centro;
  if (p.tipo === 'punto') { centro = objetivo = { lon: p.lon, lat: p.lat }; caja = [Math.min(pin.lon, p.lon), Math.min(pin.lat, p.lat), Math.max(pin.lon, p.lon), Math.max(pin.lat, p.lat)]; }
  else { const c = centroRegion(p); centro = { lon: c.lon, lat: c.lat }; caja = [Math.min(c.caja[0], pin.lon), Math.min(c.caja[1], pin.lat), Math.max(c.caja[2], pin.lon), Math.max(c.caja[3], pin.lat)]; }
  solucion = { p, centro, objetivo };
  J.res.push({ id: p.id, base: r.base, mult: m, pts, d: r.d, r: p.r });
  if (J.modo === 'diaria') { est.hoy = { fecha: hoyClave(), res: J.res }; guardar(); }
  const minimo = mapaTipo === 'ar' ? 3.2 : 9, mx0 = (caja[0] + caja[2]) / 2, my0 = (caja[1] + caja[3]) / 2;
  const mw = Math.max(caja[2] - caja[0], minimo) / 2 * 1.25, mh = Math.max(caja[3] - caja[1], minimo * .7) / 2 * 1.25;
  animarA(mx0 - mw, my0 - mh, mx0 + mw, my0 + mh, 60);
  const ultPreg = J.i + 1 >= J.preguntas.length, ultJug = J.modo !== 'turnos' || J.t + 1 >= J.jug.length, ult = ultPreg && ultJug, cl = clase(r.base);
  const dist = r.d === 0 ? '¡Justo en la zona!' : `a ${fmt(r.d)} km`;
  $('#pista').hidden = true; $('#puntos').textContent = fmt(totalDe(J.res)); sonidoResultado(r.base);
  $('#panel').innerHTML = `<div class="rev ${cl}"><div class="rev-fila"><span class="moneda">●</span><span class="rev-pts">+${fmt(pts)}${m > 1 ? ` <small>(${r.base} × ${m})</small>` : ' <small>pts</small>'}</span><span class="rev-km">${dist}</span></div><h4>${p.r}</h4><p>${p.dato}</p></div><button id="sig" class="btn am">${ult ? 'Ver resultado' : !ultJug ? 'Pasar a ' + J.jug[J.t + 1].n + ' →' : 'Siguiente pregunta →'}</button>`;
  $('#sig').onclick = () => {
    if (J.modo === 'turnos') { if (!ultJug) { J.t++; J.res = J.jug[J.t].res; return preguntar(); } J.t = 0; J.res = J.jug[0].res; }
    J.i++; ult ? terminar() : preguntar();
  };
}
function terminar() {
  if (J.modo === 'turnos') return terminarTurnos();
  const total = totalDe(J.res), max = 1000;
  if (J.modo === 'diaria' && !(est.hoy && est.hoy.cerrada)) {
    est.racha = est.ultima === ayerClave() ? est.racha + 1 : est.ultima === hoyClave() ? est.racha : 1; est.mejorRacha = Math.max(est.mejorRacha || 0, est.racha);
    est.ultima = hoyClave(); est.mejor = Math.max(est.mejor, total); est.jugadas++; est.hist[hoyClave()] = total; est.hoy = { fecha: hoyClave(), res: J.res, cerrada: true };
    const claves = Object.keys(est.hist).sort(); while (claves.length > 60) delete est.hist[claves.shift()]; guardar();
  }
  mostrar('fin'); const pc = total / max; $('#fecha-fin').textContent = fechaCorta();
  $('#fin-titulo').textContent = pc >= .9 ? '¡Brújula humana! 🧭' : pc >= .7 ? '¡Muy bien, explorador! 🗺️' : pc >= .4 ? '¡Vas bien! 👏' : '¡A seguir recorriendo! 🌍';
  $('#fin-sub').textContent = J.modo === 'diaria' ? 'Ronda de hoy · ' + fechaCorta() : 'Práctica';
  $('#fin-total').innerHTML = `${fmt(total)}<small>de ${fmt(max)} puntos</small>`;
  $('#fin-puntos').innerHTML = puntitos(J.res, J.res.length);
  $('#fin-lista').innerHTML = J.res.map(r => `<div class="fila ${clase(r.base)}"><span class="pt"></span><span>${r.r}${r.d ? ` <small>· ${fmt(r.d)} km</small>` : ''}</span><b>${fmt(r.pts)}${r.mult > 1 ? ` <small>×${r.mult}</small>` : ''}</b></div>`).join('');
  $('#fin-aviso').textContent = J.modo === 'diaria' ? `🔥 Racha: ${est.racha} ${est.racha === 1 ? 'día' : 'días'}. Mañana hay ronda nueva.` : '';
  const texto = `Geodatos ${J.modo === 'diaria' ? fechaCorta() : '(práctica)'}\n${J.res.map(r => emoji(r.base)).join('')} ${fmt(total)}/${fmt(max)}`;
  $('#compartir').textContent = '📤 Compartir resultado'; $('#compartir').onclick = () => compartirTexto(texto, $('#compartir'));
  botonGrupoFin(texto);
}

// ---------- por turnos (varios jugadores en el mismo celular) ----------
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const limpiarNombre = t => String(t || '').replace(/[^\p{L}\p{N} ._-]/gu, '').trim().slice(0, 14);
let nombresTurnos = [];
function abrirTurnos() {
  cerrarMenu(); if (!nombresTurnos.length) nombresTurnos = ['', ''];
  $('#turnos-nombres').innerHTML = nombresTurnos.map((n, i) => `<input type="text" maxlength="14" placeholder="Jugador ${i + 1}" value="${esc(n)}" data-i="${i}">`).join('');
  $('#turnos-nombres').querySelectorAll('input').forEach(inp => inp.oninput = () => { nombresTurnos[+inp.dataset.i] = inp.value; });
  $('#turnos-mas').hidden = nombresTurnos.length >= 4; $('#turnos-modal').hidden = false;
}
$('#turnos-mas').onclick = () => { nombresTurnos.push(''); abrirTurnos(); };
$('#turnos-cancelar').onclick = () => { $('#turnos-modal').hidden = true; };
$('#turnos-empezar').onclick = () => {
  const jug = nombresTurnos.map((n, i) => ({ n: limpiarNombre(n) || 'Jugador ' + (i + 1), res: [] }));
  $('#turnos-modal').hidden = true;
  const preguntas = rondaDiaria('turnos-' + Math.random());
  J = { modo: 'turnos', preguntas, jug, t: 0, i: 0, res: jug[0].res, estado: 'pregunta' };
  mostrar('juego'); requestAnimationFrame(() => { redimensionar(); preguntar(); });
};
const PUESTOS = ['🥇', '🥈', '🥉', '4º'];
function terminarTurnos() {
  const orden = J.jug.map(j => ({ n: j.n, total: totalDe(j.res), res: j.res })).sort((a, b) => b.total - a.total);
  const empate = orden.length > 1 && orden[0].total === orden[1].total;
  mostrar('fin'); $('#fecha-fin').textContent = fechaCorta();
  $('#fin-titulo').textContent = empate ? '¡Empate! 🤝' : `¡Ganó ${orden[0].n}! 🏆`;
  $('#fin-sub').textContent = 'Partida por turnos · ' + orden.length + ' jugadores';
  $('#fin-total').innerHTML = `${fmt(orden[0].total)}<small>puntos del primer puesto</small>`;
  $('#fin-puntos').innerHTML = '';
  $('#fin-lista').innerHTML = orden.map((o, i) => `<div class="puesto"><span class="n">${PUESTOS[i]}</span><span>${esc(o.n)}<br><span class="puntitos">${puntitos(o.res, o.res.length)}</span></span><b>${fmt(o.total)}</b></div>`).join('');
  $('#fin-aviso').textContent = 'Cada uno jugó las mismas 5 preguntas.';
  $('#compartir-grupo').hidden = true;
  const texto = `Geodatos por turnos\n${orden.map((o, i) => `${PUESTOS[i]} ${o.n}: ${fmt(o.total)}`).join('\n')}`;
  $('#compartir').textContent = '📤 Compartir resultado'; $('#compartir').onclick = () => compartirTexto(texto, $('#compartir'));
}
async function compartirTexto(texto, boton) {
  try { if (navigator.share) await navigator.share({ text: texto }); else { await navigator.clipboard.writeText(texto); boton.textContent = '✅ Copiado'; } }
  catch (e) { if (e && e.name === 'AbortError') return; prompt('Copiá este texto:', texto); }
}

// ---------- grupos y ranking (sin servidor: se arma con los links que se mandan por WhatsApp) ----------
const codigoNuevo = () => Array.from({ length: 5 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
const FECHA_OK = /^\d{4}-\d{2}-\d{2}$/;
const base = () => location.protocol.startsWith('http') ? location.origin + location.pathname : 'https://geoplay.invalid/';
let grupoActual = null, pestana = 'hoy';
function miembrosDe(cod) { // mis puntos (siempre al día) más los que llegaron por link
  const m = Object.assign({}, est.grupos[cod].miembros);
  if (est.yo) m[est.yo] = Object.assign({}, m[est.yo], est.hist);
  return m;
}
const sumar = (d, desde) => Object.entries(d).filter(([f]) => f >= desde).reduce((a, [, v]) => a + v, 0);
function linkGrupo(cod) {
  const u = new URLSearchParams({ g: cod, gn: est.grupos[cod].nombre });
  if (est.yo) { u.set('u', est.yo); u.set('r', Object.entries(est.hist).sort().slice(-14).map(([f, v]) => f + ':' + v).join(',')); }
  return base() + '?' + u;
}
function importarLink(par) {
  const cod = (par.get('g') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8); if (cod.length < 4) return null;
  if (!est.grupos[cod]) est.grupos[cod] = { nombre: limpiarNombre(par.get('gn')) || 'Grupo ' + cod, miembros: {} };
  const u = limpiarNombre(par.get('u'));
  if (u && u !== est.yo) {
    const m = est.grupos[cod].miembros[u] = est.grupos[cod].miembros[u] || {};
    for (const x of (par.get('r') || '').split(',').slice(0, 30)) { const [f, v] = x.split(':'), n = Math.round(+v); if (FECHA_OK.test(f) && n >= 0 && n <= 1000) m[f] = n; }
  }
  guardar(); return cod;
}
function pedirNombre() {
  if (est.yo) return true;
  const n = limpiarNombre(prompt('¿Cómo te llamás? (así te ven en el ranking)')); if (!n) return false;
  est.yo = n; guardar(); return true;
}
function gruposPantalla() {
  mostrar('grupos'); grupoActual = null; const cs = Object.keys(est.grupos);
  $('#grupos-cuerpo').innerHTML = `<p class="chico">Compará tus puntos con la familia o los amigos. No hace falta registrarse: cada uno manda su link por WhatsApp y el ranking se arma en tu celular.</p>
    ${est.yo ? `<p>Jugás como <b>${esc(est.yo)}</b> · <a href="#" id="cambiar-nombre">cambiar</a></p>` : ''}
    ${cs.map(c => `<button class="grupo-item" data-c="${c}">👥 <span>${esc(est.grupos[c].nombre)}<small>${Object.keys(miembrosDe(c)).length} jugadores · código ${c}</small></span></button>`).join('') || '<p class="chico">Todavía no tenés grupos.</p>'}
    <button id="grupo-nuevo" class="btn">➕ Crear un grupo</button>
    <button id="grupo-unirse" class="btn sec">🔑 Unirme con un código</button>`;
  document.querySelectorAll('.grupo-item').forEach(b => b.onclick = () => verGrupo(b.dataset.c));
  $('#grupo-nuevo').onclick = () => {
    if (!pedirNombre()) return; const n = limpiarNombre(prompt('Nombre del grupo (ej: Familia):')); if (!n) return;
    const c = codigoNuevo(); est.grupos[c] = { nombre: n, miembros: {} }; guardar(); verGrupo(c);
  };
  $('#grupo-unirse').onclick = () => {
    if (!pedirNombre()) return; const c = (prompt('Escribí el código del grupo (5 letras y números):') || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); if (c.length < 4) return;
    if (!est.grupos[c]) est.grupos[c] = { nombre: 'Grupo ' + c, miembros: {} }; guardar(); verGrupo(c);
  };
  const cn = $('#cambiar-nombre');
  if (cn) cn.onclick = e => { e.preventDefault(); const n = limpiarNombre(prompt('Tu nombre:', est.yo)); if (n) { est.yo = n; guardar(); gruposPantalla(); } };
}
function verGrupo(cod) {
  mostrar('grupos'); grupoActual = cod; const gr = est.grupos[cod], m = miembrosDe(cod), hoy = hoyClave();
  const desde = { hoy, sem: new Date(new Date(hoy + 'T12:00:00').getTime() - 6 * 864e5).toLocaleDateString('en-CA'), tot: '0000' }[pestana];
  const filas = Object.entries(m).map(([n, d]) => ({ n, pts: sumar(d, desde), dias: Object.keys(d).filter(f => f >= desde).length })).filter(f => f.dias).sort((a, b) => b.pts - a.pts);
  const sinHoy = Object.entries(m).filter(([, d]) => d[hoy] === undefined).map(([n]) => n);
  $('#grupos-cuerpo').innerHTML = `<h2>👥 ${esc(gr.nombre)} <small class="chico">· código ${cod}</small></h2>
    <div class="pestanas">${[['hoy', 'Hoy'], ['sem', '7 días'], ['tot', 'Todo']].map(([k, t]) => `<button data-p="${k}" class="${k === pestana ? 'on' : ''}">${t}</button>`).join('')}</div>
    ${filas.map((f, i) => `<div class="puesto ${f.n === est.yo ? 'yo' : ''}"><span class="n">${PUESTOS[i] || (i + 1) + 'º'}</span><span>${esc(f.n)}<br><small class="chico">${f.dias} ${f.dias === 1 ? 'ronda' : 'rondas'}</small></span><b>${fmt(f.pts)}</b></div>`).join('') || '<p class="chico">Todavía no hay puntos en este período. Jugá la ronda de hoy y mandá tu link.</p>'}
    ${sinHoy.length ? `<p class="chico">Falta jugar hoy: ${sinHoy.map(esc).join(', ')}.</p>` : ''}
    <button id="g-invitar" class="btn">📤 Mandar mi link al grupo</button>
    <p class="chico">Tu link lleva tus puntos de los últimos días: cuando alguien lo abre, tu puntaje aparece en su ranking. Para ver los de los demás, abrí los links que te manden.</p>
    <button id="g-borrar" class="btn sec">Salir de este grupo</button>
    <button id="g-volver" class="btn sec">← Mis grupos</button>`;
  document.querySelectorAll('.pestanas button').forEach(b => b.onclick = () => { pestana = b.dataset.p; verGrupo(cod); });
  $('#g-invitar').onclick = () => { if (!pedirNombre()) return; compartirTexto(`Sumate a «${gr.nombre}» en Geodatos 🌎🗺️\nMis puntos y el grupo: ${linkGrupo(cod)}`, $('#g-invitar')); };
  $('#g-borrar').onclick = () => { if (confirm('¿Salir del grupo «' + gr.nombre + '»? Se borra de este celular.')) { delete est.grupos[cod]; guardar(); gruposPantalla(); } };
  $('#g-volver').onclick = gruposPantalla;
}
function recibirLink() { // abre un link de grupo que mandó alguien por WhatsApp
  const par = new URLSearchParams(location.search); if (!par.get('g')) return;
  const nombre = limpiarNombre(par.get('gn')) || 'un grupo', quien = limpiarNombre(par.get('u'));
  history.replaceState(null, '', location.pathname);
  const ya = est.grupos[(par.get('g') || '').toUpperCase().replace(/[^A-Z0-9]/g, '')];
  if (!ya && !confirm(`${quien ? quien + ' te invitó' : 'Te invitaron'} al grupo «${nombre}» de Geodatos. ¿Querés sumarte?`)) return;
  if (!pedirNombre()) return;
  const c = importarLink(par); if (c) verGrupo(c);
}
// Compartir la ronda de hoy con un grupo (botón en la pantalla final)
function botonGrupoFin(texto) {
  const cs = Object.keys(est.grupos), b = $('#compartir-grupo');
  b.hidden = !(J && J.modo === 'diaria');
  b.onclick = () => {
    if (!pedirNombre()) return;
    const c = cs.length === 1 ? cs[0] : (cs.length ? (prompt('¿Con qué grupo? Escribí el código:\n' + cs.map(x => x + ' = ' + est.grupos[x].nombre).join('\n')) || '').toUpperCase().trim() : '');
    if (!est.grupos[c]) { gruposPantalla(); return; }
    compartirTexto(texto + '\nRanking del grupo «' + est.grupos[c].nombre + '»: ' + linkGrupo(c), b);
  };
}

// ---------- inicio, estadísticas y menú ----------
function inicio() {
  mostrar('inicio'); J = null; $('#fecha-inicio').textContent = fechaCorta();
  const jugoHoy = est.hoy && est.hoy.fecha === hoyClave(), hecho = jugoHoy && est.hoy.cerrada, medio = jugoHoy && !est.hoy.cerrada && est.hoy.res.length;
  const res = jugoHoy ? est.hoy.res : [];
  $('#bloque-hoy').innerHTML = hecho
    ? `<h2>✅ ¡Ya jugaste hoy!</h2><p>${fmt(totalDe(res))} de 1.000 puntos · mañana hay ronda nueva</p><div class="puntitos">${puntitos(res, 5)}</div><button id="ver-hoy" class="btn sec">Ver mi resultado</button>`
    : `<h2>Ronda de hoy</h2><p>5 preguntas · igual para todos · ${fechaCorta()}</p><div class="puntitos">${puntitos(res, 5, medio ? res.length : 0)}</div><button id="jugar-hoy" class="btn">▶ ${medio ? 'Seguir la ronda' : 'Jugar la ronda de hoy'}</button>`;
  if (hecho) $('#ver-hoy').onclick = verHoy; else $('#jugar-hoy').onclick = jugarHoy;
  $('#st-racha').textContent = est.ultima === hoyClave() || est.ultima === ayerClave() ? est.racha : 0;
  $('#st-mejor').textContent = fmt(est.mejor); $('#st-jugadas').textContent = est.jugadas;
  for (const sec of ['ar', 'mu']) {
    const temas = [...new Set(PREG.filter(p => p.sec === sec).map(p => p.tema))];
    $('#temas-' + sec).innerHTML = temas.map(t => `<button class="tema" data-sec="${sec}" data-tema="${t}"><span class="ico">${TEMAS_ICONO[t] || '📍'}</span><span>${t}<small>${PREG.filter(p => p.sec === sec && p.tema === t).length} preguntas</small></span><span class="flecha">›</span></button>`).join('');
  }
  document.querySelectorAll('.tema').forEach(b => b.onclick = () => empezar('tema', rondaTema(b.dataset.sec, b.dataset.tema)));
}
function jugarHoy() { const h = est.hoy && est.hoy.fecha === hoyClave() ? est.hoy : null; if (h && h.cerrada) return verHoy(); empezar('diaria', rondaDiaria(hoyClave()), h ? h.res : []); }
function verHoy() { J = { modo: 'diaria', preguntas: rondaDiaria(hoyClave()), i: 5, res: est.hoy.res, estado: 'fin' }; terminar(); }
function estadisticas() {
  mostrar('stats');
  const hs = Object.entries(est.hist).sort(), prom = hs.length ? hs.reduce((a, [, v]) => a + v, 0) / hs.length : 0;
  const dias = Array.from({ length: 14 }, (_, i) => new Date(new Date(hoyClave() + 'T12:00:00').getTime() - (13 - i) * 864e5).toLocaleDateString('en-CA'));
  $('#stats-cuerpo').innerHTML = `<div class="tarjetas">
    <div><b>${est.ultima === hoyClave() || est.ultima === ayerClave() ? est.racha : 0}</b><small>🔥 racha actual</small></div><div><b>${est.mejorRacha || 0}</b><small>🏅 mejor racha</small></div>
    <div><b>${fmt(est.mejor)}</b><small>🏆 mejor ronda</small></div><div><b>${fmt(prom)}</b><small>📈 promedio</small></div>
    <div><b>${est.jugadas}</b><small>🎯 rondas jugadas</small></div><div><b>${hs.filter(([, v]) => v >= 800).length}</b><small>⭐ rondas de 800+</small></div></div>
    <h3>Últimos 14 días</h3><div class="hist">${dias.map(d => { const v = est.hist[d]; return `<span title="${d}"><i class="${v === undefined ? '' : v >= 800 ? 'v' : v >= 500 ? 'a' : v > 0 ? 'r' : 'n'}"></i>${d.slice(8)}</span>`; }).join('')}</div>
    <p class="chico">Los puntos de la ronda diaria se guardan en este dispositivo.</p>`;
}
const abrirMenu = () => { $('#menu').hidden = false; $('#menu-fondo').hidden = false; };
function cerrarMenu() { $('#menu').hidden = true; $('#menu-fondo').hidden = true; }
const textoSonido = () => { $('#menu-sonido').textContent = est.sonido ? '🔊 Sonido: sí' : '🔇 Sonido: no'; };
document.querySelectorAll('.btn-menu').forEach(b => b.onclick = abrirMenu);
$('#cerrar-menu').onclick = cerrarMenu; $('#menu-fondo').onclick = cerrarMenu;
document.querySelectorAll('#menu [data-ir]').forEach(b => b.onclick = () => {
  const ir = b.dataset.ir;
  if (ir === 'inicio') inicio(); else if (ir === 'hoy') jugarHoy(); else if (ir === 'stats') estadisticas(); else if (ir === 'turnos') abrirTurnos(); else if (ir === 'grupos') gruposPantalla();
  else if (ir === 'ayuda') { cerrarMenu(); $('#ayuda').hidden = false; }
  else if (ir === 'sonido') { est.sonido = !est.sonido; guardar(); textoSonido(); tono(660, .1, .05); }
});
$('#stats-volver').onclick = inicio; $('#grupos-volver').onclick = () => grupoActual ? gruposPantalla() : inicio(); $('#ir-turnos').onclick = abrirTurnos; $('#ir-grupos').onclick = gruposPantalla; $('#fin-cerrar').onclick = inicio; $('#volver').onclick = inicio;
$('#salir').onclick = () => { if (confirm('¿Salir de la partida? Tu progreso de la ronda de hoy queda guardado.')) inicio(); };
$('#cerrar-ayuda').onclick = () => { $('#ayuda').hidden = true; };
window.addEventListener('keydown', e => {
  if (!J || $('#juego').hidden) return;
  if (e.key === 'Enter') { const b = $('#confirmar') || $('#sig'); if (b && !b.disabled) b.click(); }
  else if (e.key === '+' || e.key === '=') $('#mas').click(); else if (e.key === '-') $('#menos').click();
});
const pintarBotonSat = () => $('#sat').classList.toggle('on', !!est.sat);
$('#sat').onclick = () => { est.sat = !est.sat; guardar(); pintarBotonSat(); dibujar(); };
pintarBotonSat();
textoSonido(); inicio();
const probar = new URLSearchParams(location.search).get('probar'); // ?probar=16,40,48 abre esas preguntas (para pruebas)
if (probar) empezar('tema', probar.split(',').map(i => PREG[+i]).filter(Boolean));
recibirLink();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
window.__geoplay = { colocar(lon, lat) { pin = { lon, lat }; const b = $('#confirmar'); if (b) b.disabled = false; dibujar(); }, centroZona(p) { const c = centroRegion(p); const z = (p.tipo === 'provincia' ? MAP.prov : MAP.mundo).filter(x => x.n === p.zona); for (const x of z) for (const r of x.r) { for (let k = 0; k < r.length; k += 2) { /* punto interior: promedio de un vértice y el centro */ const lon = (r[k] + c.lon) / 2, lat = (r[k + 1] + c.lat) / 2; if (z.some(y => y.r.some(rr => dentro(lon, lat, rr)))) return [lon, lat]; } } return [c.lon, c.lat]; }, rondaDiaria, puntaje, PREG, est, get J() { return J; }, recibirLink, abrirTurnos, get tejasOk() { return [...tejas.values()].filter(t => t.ok).length; }, get vista() { return { S, cx, cy, W, H, z: zoomNivel() }; }, tocarLonLat(lon, lat) { const [px, py] = aPantalla(mx(lon), my(lat)); return { px, py }; } };
})();
