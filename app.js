let sexo = 'mujer';
let respActivo = false;
let nasalActivo = false;
let abdomen = false;

function setSexo(s) {
  sexo = s;
  console.log('Sexo cambiado a:', sexo);
}

function toggleResp(el) {
  if (!el.classList.contains('active-resp')) {
    document.querySelectorAll('#nasal-group .check-item').forEach(e => e.classList.remove('active-nasal'));
    nasalActivo = false;
  }
  el.classList.toggle('active-resp');
  respActivo = document.querySelectorAll('#resp-group .check-item.active-resp').length > 0;
}

function toggleNasal(el) {
  if (!el.classList.contains('active-nasal')) {
    document.querySelectorAll('#resp-group .check-item').forEach(e => e.classList.remove('active-resp'));
    respActivo = false;
  }
  el.classList.toggle('active-nasal');
  nasalActivo = document.querySelectorAll('#nasal-group .check-item.active-nasal').length > 0;
}

function setAbdomen(v) {
  abdomen = v;
  console.log('Abdomen:', abdomen);
}

function calcular() {
  const talla = parseFloat(document.getElementById('talla').value);
  const peso = parseFloat(document.getElementById('peso').value);
  const orina = parseFloat(document.getElementById('orina').value) || 0;
  const horasProd = parseFloat(document.getElementById('horas-prod').value) || 24;
  const horasTurno = parseFloat(document.getElementById('horas-turno').value) || 12;

  if (!talla || !peso) {
    alert('Ingresa talla y peso del paciente.');
    return;
  }
  if (horasProd <= 0 || horasTurno <= 0) {
    alert('Las horas deben ser mayores a 0.');
    return;
  }

  // 1. Peso ideal
  const base = sexo === 'hombre' ? 50 : 45;
  const pesoIdeal = base + 0.92 * (talla - 152.4);

  // IMC
  const tallam = talla / 100;
  const imc = peso / (tallam * tallam);
  let imcCat = '', imcColor = '';
  if (imc < 18.5) { imcCat = 'Bajo peso'; imcColor = 'warn'; }
  else if (imc < 25) { imcCat = 'Normal'; imcColor = 'green'; }
  else if (imc < 30) { imcCat = 'Sobrepeso'; imcColor = 'warn'; }
  else if (imc < 35) { imcCat = 'Obesidad I'; imcColor = 'danger'; }
  else if (imc < 40) { imcCat = 'Obesidad II'; imcColor = 'danger'; }
  else { imcCat = 'Obesidad III'; imcColor = 'danger'; }

  // Superficie corporal (Mosteller)
  const sc = Math.sqrt((talla * peso) / 3600);

  // 2. Agua endógena — usa horasProd
  const aguaEndo = (5 * peso / 24) * horasProd;

  // 3/4. Pérdidas insensibles — usa horasTurno
  let factorPI = 11, labelPI = '🌫️ Pérd. Insensibles (×11)';
  if (nasalActivo) { factorPI = 15; labelPI = '🌫️ Pérd. Insensibles (×15 cánula/ambiente)'; }
  else if (respActivo) { labelPI = '🌫️ Pérd. Insensibles (×11 soporte resp.)'; }
  const perInsens = (peso * factorPI / 24) * horasTurno;

  // 5. Fiebre
  const f1h = parseFloat(document.getElementById('f1h').value) || 0;
  const f2h = parseFloat(document.getElementById('f2h').value) || 0;
  const f3h = parseFloat(document.getElementById('f3h').value) || 0;
  const f1 = peso * 0.5 * f1h;
  const f2 = peso * 1.0 * f2h;
  const f3 = peso * 1.5 * f3h;

  // Abdomen
  const perdAbdomen = abdomen ? peso * horasTurno : 0;

  // Gasto urinario — siempre en ml/kg/h
  const gastoU = orina / peso / horasProd;

  // Total pérdidas
  const total = perInsens + f1 + f2 + f3 + perdAbdomen;

  function fmt(n) { return n.toFixed(2) + ' ml'; }

  document.getElementById('r-pesoIdeal').textContent = pesoIdeal.toFixed(1) + ' kg';
  document.getElementById('r-imc').textContent = imc.toFixed(1) + ' kg/m²';
  const catEl = document.getElementById('r-imc-cat');
  catEl.textContent = imcCat;
  catEl.className = 'res-val ' + imcColor;
  document.getElementById('r-sc').textContent = sc.toFixed(2) + ' m²';

  document.getElementById('label-aguaEndo').textContent = '💧 Agua Endógena (' + horasProd + 'h)';
  document.getElementById('r-aguaEndo').textContent = fmt(aguaEndo);

  document.getElementById('label-perInsens').textContent = labelPI + ' (' + horasTurno + 'h)';
  document.getElementById('r-perInsens').textContent = fmt(perInsens);

  const hayFiebre = f1h > 0 || f2h > 0 || f3h > 0;
  document.getElementById('div-fiebre').style.display = hayFiebre ? '' : 'none';
  show('row-f1', f1h > 0); if (f1h > 0) document.getElementById('r-f1').textContent = fmt(f1);
  show('row-f2', f2h > 0); if (f2h > 0) document.getElementById('r-f2').textContent = fmt(f2);
  show('row-f3', f3h > 0); if (f3h > 0) document.getElementById('r-f3').textContent = fmt(f3);

  document.getElementById('div-abd').style.display = abdomen ? '' : 'none';
  show('row-abd', abdomen);
  if (abdomen) document.getElementById('r-abd').textContent = fmt(perdAbdomen);

  document.getElementById('label-gastoU').textContent = '🚿 Gasto Urinario (' + horasProd + 'h)';
  document.getElementById('r-gastoU').textContent = gastoU.toFixed(2) + ' ml/kg/h';
  document.getElementById('r-total').textContent = fmt(total);

  const res = document.getElementById('resultados');
  res.classList.add('visible');
  res.scrollIntoView({ behavior: 'smooth', block: 'start' });

  window._lastResult = {
    pesoIdeal, imc, imcCat, sc, aguaEndo, perInsens, factorPI,
    f1, f2, f3, perdAbdomen, gastoU, total, peso, horasProd, horasTurno, sexo, talla
  };
}

function show(id, val) {
  document.getElementById(id).style.display = val ? '' : 'none';
}

function resetAll() {
  ['talla', 'peso', 'orina'].forEach(id => document.getElementById(id).value = '');
  ['f1h', 'f2h', 'f3h'].forEach(id => document.getElementById(id).value = '0');
  document.getElementById('horas-prod').value = '24';
  document.getElementById('horas-turno').value = '12';
  document.querySelectorAll('#resp-group .check-item').forEach(e => e.classList.remove('active-resp'));
  document.querySelectorAll('#nasal-group .check-item').forEach(e => e.classList.remove('active-nasal'));
  respActivo = false;
  nasalActivo = false;

  // Reset radios nativos
  document.querySelector('input[name="sexo"][value="mujer"]').checked = true;
  document.querySelector('input[name="abdomen"][value="no"]').checked = true;
  sexo = 'mujer';
  abdomen = false;

  document.getElementById('resultados').classList.remove('visible');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function compartir() {
  const r = window._lastResult;
  if (!r) return;
  const txt = '💧 HidroNurse — Balance Hídrico
───────────────────────────
' +
    (r.sexo === 'mujer' ? '♀' : '♂') + ' | Talla: ' + r.talla + 'cm | Peso: ' + r.peso + 'kg
' +
    '⏱ Horas producción: ' + r.horasProd + 'h | Horas turno: ' + r.horasTurno + 'h
' +
    '⚖️ Peso ideal: ' + r.pesoIdeal.toFixed(1) + ' kg
' +
    '📏 IMC: ' + r.imc.toFixed(1) + ' kg/m² (' + r.imcCat + ')
' +
    '🧬 Sup. corporal: ' + r.sc.toFixed(2) + ' m²
' +
    '💧 Agua endógena: ' + r.aguaEndo.toFixed(2) + ' ml
' +
    '🌫️ Pérd. insensibles (×' + r.factorPI + '): ' + r.perInsens.toFixed(2) + ' ml
' +
    (r.f1 > 0 ? '🌡️ Fiebre 37.5-38°C: ' + r.f1.toFixed(2) + ' ml
' : '') +
    (r.f2 > 0 ? '🌡️ Fiebre 38-39°C: ' + r.f2.toFixed(2) + ' ml
' : '') +
    (r.f3 > 0 ? '🌡️ Fiebre >39°C: ' + r.f3.toFixed(2) + ' ml
' : '') +
    (r.perdAbdomen > 0 ? '🏥 Abdomen abierto: ' + r.perdAbdomen.toFixed(2) + ' ml
' : '') +
    '🚿 Gasto urinario: ' + (r.gastoU > 0 ? r.gastoU.toFixed(2) + ' ml/kg/h' : '0.00 ml/kg/h') + '
' +
    '───────────────────────────
' +
    '📊 TOTAL PÉRDIDAS: ' + r.total.toFixed(2) + ' ml

by Medishort360';

  if (navigator.share) {
    navigator.share({ title: 'HidroNurse', text: txt }).catch(() => copyText(txt));
  } else {
    copyText(txt);
  }
}

function copyText(t) {
  navigator.clipboard.writeText(t)
    .then(() => alert('✅ Copiado al portapapeles'))
    .catch(() => alert('No se pudo copiar.'));
}

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('install-banner').classList.add('show');
});

function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null;
      document.getElementById('install-banner').classList.remove('show');
    });
  } else {
    alert('📱 Android: Menú Chrome → "Agregar a pantalla de inicio"
🍎 iOS Safari: Compartir → "Añadir a inicio"');
  }
}

if ('serviceWorker' in navigator) {
  const sw = "self.addEventListener('install',e=>self.skipWaiting());" +
    "self.addEventListener('activate',e=>self.clients.claim());" +
    "self.addEventListener('fetch',e=>{e.respondWith(caches.open('hidronurse-v5').then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(nr=>{c.put(e.request,nr.clone());return nr;}))));});";
  navigator.serviceWorker.register(URL.createObjectURL(new Blob([sw], { type: 'application/javascript' }))).catch(() => {});
}