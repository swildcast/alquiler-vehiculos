/* ==========================================================================
   DriveNow - app.js
   Autenticación real contra PostgreSQL (POST /api/login, /api/registro) y
   catálogo de vehículos leído directamente de la API Express/Sequelize
   (http://localhost:3000). Ejecuta `npm run seed` en el backend para
   poblar la base de datos con los usuarios y vehículos de demostración.
   ========================================================================== */

const API_URL = 'http://localhost:3000';
const LS_SESSION = 'drivenow_sesion';

/* --------------------------------------------------------------------
   1. SESIÓN (token + datos de usuario devueltos por la API)
   -------------------------------------------------------------------- */

function getSesion() {
  return JSON.parse(localStorage.getItem(LS_SESSION) || 'null');
}

function guardarSesion({ token, usuario }) {
  localStorage.setItem(LS_SESSION, JSON.stringify({ token, usuario }));
}

function cerrarSesion() {
  localStorage.removeItem(LS_SESSION);
  window.location.href = 'login.html';
}

function requireSesion() {
  const sesion = getSesion();
  if (!sesion) {
    window.location.href = 'login.html';
    return null;
  }
  return sesion;
}

/* --------------------------------------------------------------------
   2. INTEGRACIÓN CON LA API - VEHÍCULOS Y ALQUILERES
   -------------------------------------------------------------------- */

let vehiculosActuales = [];

// Adapta el registro de Sequelize (precioPorDia, imagenUrl) a los nombres
// que usa la UI (precioDia, imagen).
function mapearVehiculoApi(v) {
  return {
    id: v.id,
    marca: v.marca,
    modelo: v.modelo,
    tipo: v.tipo,
    transmision: v.transmision,
    pasajeros: v.pasajeros,
    combustible: v.combustible,
    maletas: v.maletas,
    precioDia: Number(v.precioPorDia),
    imagen: v.imagenUrl,
    disponible: v.disponible
  };
}

async function obtenerVehiculos() {
  try {
    const resp = await fetch(`${API_URL}/vehiculos`);
    if (!resp.ok) throw new Error('Respuesta no válida de la API');
    const datos = await resp.json();
    return Array.isArray(datos) ? datos.map(mapearVehiculoApi) : [];
  } catch (error) {
    console.error('[DriveNow] No se pudo cargar el catálogo desde la API:', error.message);
    mostrarToast('No se pudo conectar con el servidor. ¿Está corriendo el backend?', 'error');
    return [];
  }
}

async function crearAlquilerEnApi({ idVehiculo, fechaInicio, dias }) {
  const sesion = requireSesion();
  if (!sesion) throw new Error('Debes iniciar sesión');

  const resp = await fetch(`${API_URL}/alquileres`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idVehiculo, idCliente: sesion.usuario.id, fechaInicio, dias })
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(data.mensaje || 'No se pudo registrar la reserva');
  }
  return data;
}

/* --------------------------------------------------------------------
   3. RENDERIZADO DEL CATÁLOGO
   -------------------------------------------------------------------- */

const ICONOS_TIPO = {
  'Sedán': '🚗', 'SUV': '🚙', 'Deportivo': '🏎️', 'Lujo': '🚘',
  'Eléctrico': '⚡', 'Pickup': '🛻', 'Hatchback': '🚗'
};

function formatoMoneda(valor) {
  return '$' + Number(valor).toFixed(0);
}

function crearTarjetaVehiculo(v) {
  const disponible = v.disponible;
  const icono = ICONOS_TIPO[v.tipo] || '🚗';

  return `
    <article class="vehicle-card" data-id="${v.id}">
      <div class="vehicle-photo" id="photo-${v.id}">
        <img src="${v.imagen || ''}" alt="${v.marca} ${v.modelo}"
             onerror="document.getElementById('photo-${v.id}').classList.add('broken')">
        <div class="img-fallback">${icono}</div>
        <span class="status-badge ${disponible ? 'disponible' : 'alquilado'}">
          ${disponible ? 'Disponible' : 'Alquilado'}
        </span>
        <span class="price-badge">${formatoMoneda(v.precioDia)}/día</span>
      </div>
      <div class="vehicle-body">
        <div>
          <div class="vehicle-title">${v.marca} ${v.modelo}</div>
          <div class="vehicle-subtitle">${v.tipo}</div>
        </div>
        <div class="vehicle-specs">
          <div><span class="spec-icon">⚙️</span> ${v.transmision}</div>
          <div><span class="spec-icon">👥</span> ${v.pasajeros} pasajeros</div>
          <div><span class="spec-icon">⛽</span> ${v.combustible}</div>
          <div><span class="spec-icon">🧳</span> ${v.maletas} maletas</div>
        </div>
        <div class="vehicle-footer">
          <button class="btn btn-primary btn-block" ${disponible ? '' : 'disabled'}
                  onclick="abrirModalReserva(${v.id})">
            ${disponible ? 'Reservar ahora' : 'No disponible'}
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderizarCatalogo(lista) {
  const grid = document.getElementById('catalogGrid');
  const info = document.getElementById('resultsInfo');
  if (!grid) return;

  if (lista.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <span class="emoji">🔍</span>
        No encontramos vehículos con esos filtros. Intenta ajustarlos.
      </div>`;
  } else {
    grid.innerHTML = lista.map(crearTarjetaVehiculo).join('');
  }

  if (info) {
    info.textContent = `${lista.length} vehículo${lista.length === 1 ? '' : 's'} encontrado${lista.length === 1 ? '' : 's'}`;
  }
}

/* --------------------------------------------------------------------
   4. FILTROS
   -------------------------------------------------------------------- */

function poblarFiltroMarcas(lista) {
  const select = document.getElementById('filtroMarca');
  if (!select) return;
  const marcas = [...new Set(lista.map((v) => v.marca))].sort();
  select.innerHTML = '<option value="">Todas las marcas</option>' +
    marcas.map((m) => `<option value="${m}">${m}</option>`).join('');
}

function poblarFiltroTipos(lista) {
  const select = document.getElementById('filtroTipo');
  if (!select) return;
  const tipos = [...new Set(lista.map((v) => v.tipo))].sort();
  select.innerHTML = '<option value="">Todos los tipos</option>' +
    tipos.map((t) => `<option value="${t}">${t}</option>`).join('');
}

function aplicarFiltros() {
  const marca = document.getElementById('filtroMarca').value;
  const tipo = document.getElementById('filtroTipo').value;
  const disponibilidad = document.getElementById('filtroDisponibilidad').value;
  const precioMin = Number(document.getElementById('precioMin').value) || 0;
  const precioMax = Number(document.getElementById('precioMax').value) || Infinity;

  const filtrados = vehiculosActuales.filter((v) => {
    if (marca && v.marca !== marca) return false;
    if (tipo && v.tipo !== tipo) return false;
    if (disponibilidad === 'disponible' && !v.disponible) return false;
    if (disponibilidad === 'alquilado' && v.disponible) return false;
    if (v.precioDia < precioMin || v.precioDia > precioMax) return false;
    return true;
  });

  renderizarCatalogo(filtrados);
}

function reiniciarFiltros() {
  document.getElementById('filtroMarca').value = '';
  document.getElementById('filtroTipo').value = '';
  document.getElementById('filtroDisponibilidad').value = '';
  document.getElementById('precioMin').value = '';
  document.getElementById('precioMax').value = '';
  renderizarCatalogo(vehiculosActuales);
}

/* --------------------------------------------------------------------
   5. MODAL DE RESERVA
   -------------------------------------------------------------------- */

let vehiculoSeleccionadoId = null;

function abrirModalReserva(id) {
  const vehiculo = vehiculosActuales.find((v) => v.id === id);
  if (!vehiculo) return;

  vehiculoSeleccionadoId = id;

  document.getElementById('modalVehiculoImg').src = vehiculo.imagen || '';
  document.getElementById('modalVehiculoNombre').textContent = `${vehiculo.marca} ${vehiculo.modelo}`;
  document.getElementById('modalVehiculoPrecio').textContent = `${formatoMoneda(vehiculo.precioDia)} / día`;

  const hoy = new Date().toISOString().split('T')[0];
  const fechaInput = document.getElementById('reservaFechaInicio');
  fechaInput.min = hoy;
  fechaInput.value = hoy;
  document.getElementById('reservaDias').value = 1;

  actualizarTotalReserva();
  document.getElementById('modalReserva').classList.add('show');
}

function cerrarModalReserva() {
  document.getElementById('modalReserva').classList.remove('show');
  vehiculoSeleccionadoId = null;
}

function actualizarTotalReserva() {
  const vehiculo = vehiculosActuales.find((v) => v.id === vehiculoSeleccionadoId);
  if (!vehiculo) return;
  const dias = Math.max(1, Number(document.getElementById('reservaDias').value) || 1);
  const total = dias * vehiculo.precioDia;
  document.getElementById('modalTotalAmount').textContent = formatoMoneda(total);
}

async function confirmarReserva() {
  const vehiculo = vehiculosActuales.find((v) => v.id === vehiculoSeleccionadoId);
  if (!vehiculo) return;

  const fechaInicio = document.getElementById('reservaFechaInicio').value;
  const dias = Math.max(1, Number(document.getElementById('reservaDias').value) || 1);
  const btnConfirmar = document.getElementById('btnConfirmarReserva');

  btnConfirmar.disabled = true;
  btnConfirmar.textContent = 'Procesando...';

  try {
    await crearAlquilerEnApi({ idVehiculo: vehiculo.id, fechaInicio, dias });
    vehiculo.disponible = false;
    mostrarToast(`Reserva confirmada: ${vehiculo.marca} ${vehiculo.modelo}`, 'success');
    cerrarModalReserva();
    renderizarCatalogo(vehiculosActuales);
    aplicarFiltros();
  } catch (error) {
    mostrarToast(error.message, 'error');
  }

  btnConfirmar.disabled = false;
  btnConfirmar.textContent = 'Confirmar reserva';
}

/* --------------------------------------------------------------------
   6. TOAST
   -------------------------------------------------------------------- */

function mostrarToast(mensaje, tipo = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = mensaje;
  toast.className = `toast show ${tipo === 'error' ? 'error' : ''}`;
  setTimeout(() => toast.classList.remove('show'), 3500);
}

/* --------------------------------------------------------------------
   7. INICIALIZACIÓN DE LA PÁGINA DE CATÁLOGO
   -------------------------------------------------------------------- */

async function inicializarCatalogo() {
  const sesion = requireSesion();
  if (!sesion) return;

  document.getElementById('navUserName').textContent = sesion.usuario.nombre;
  document.getElementById('navUserRole').textContent = sesion.usuario.rol;
  document.getElementById('navUserAvatar').textContent = sesion.usuario.nombre.charAt(0).toUpperCase();

  vehiculosActuales = await obtenerVehiculos();
  poblarFiltroMarcas(vehiculosActuales);
  poblarFiltroTipos(vehiculosActuales);
  renderizarCatalogo(vehiculosActuales);

  document.getElementById('filtroMarca').addEventListener('change', aplicarFiltros);
  document.getElementById('filtroTipo').addEventListener('change', aplicarFiltros);
  document.getElementById('filtroDisponibilidad').addEventListener('change', aplicarFiltros);
  document.getElementById('precioMin').addEventListener('input', aplicarFiltros);
  document.getElementById('precioMax').addEventListener('input', aplicarFiltros);
  document.getElementById('btnReiniciarFiltros').addEventListener('click', reiniciarFiltros);

  document.getElementById('reservaDias').addEventListener('input', actualizarTotalReserva);
  document.getElementById('btnConfirmarReserva').addEventListener('click', confirmarReserva);
  document.getElementById('btnCerrarModal').addEventListener('click', cerrarModalReserva);
  document.getElementById('btnCerrarSesion').addEventListener('click', cerrarSesion);
}

/* --------------------------------------------------------------------
   8. LOGIN / REGISTRO (contra PostgreSQL vía /api/login y /api/registro)
   -------------------------------------------------------------------- */

function cambiarTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((el) => el.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach((el) => el.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.getElementById(`form-${tab}`).classList.add('active');
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function manejarLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  const boton = event.target.querySelector('button[type="submit"]');
  errorEl.textContent = '';

  if (!validarEmail(email)) {
    errorEl.textContent = 'Ingresa un correo válido.';
    return;
  }
  if (!password) {
    errorEl.textContent = 'Ingresa tu contraseña.';
    return;
  }

  boton.disabled = true;
  try {
    const resp = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await resp.json();

    if (!resp.ok) {
      errorEl.textContent = data.mensaje || 'No se pudo iniciar sesión.';
      return;
    }

    guardarSesion(data);
    window.location.href = 'catalogo.html';
  } catch (error) {
    errorEl.textContent = 'No se pudo conectar con el servidor. ¿Está corriendo el backend?';
  } finally {
    boton.disabled = false;
  }
}

async function manejarRegistro(event) {
  event.preventDefault();
  const nombre = document.getElementById('regNombre').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const password2 = document.getElementById('regPassword2').value;
  const errorEl = document.getElementById('regError');
  const boton = event.target.querySelector('button[type="submit"]');
  errorEl.textContent = '';

  if (nombre.length < 3) {
    errorEl.textContent = 'El nombre debe tener al menos 3 caracteres.';
    return;
  }
  if (!validarEmail(email)) {
    errorEl.textContent = 'Ingresa un correo válido.';
    return;
  }
  if (password.length < 6) {
    errorEl.textContent = 'La contraseña debe tener al menos 6 caracteres.';
    return;
  }
  if (password !== password2) {
    errorEl.textContent = 'Las contraseñas no coinciden.';
    return;
  }

  boton.disabled = true;
  try {
    const resp = await fetch(`${API_URL}/api/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });
    const data = await resp.json();

    if (!resp.ok) {
      errorEl.textContent = data.mensaje || 'No se pudo completar el registro.';
      return;
    }

    guardarSesion(data);
    window.location.href = 'catalogo.html';
  } catch (error) {
    errorEl.textContent = 'No se pudo conectar con el servidor. ¿Está corriendo el backend?';
  } finally {
    boton.disabled = false;
  }
}

function inicializarLogin() {
  if (getSesion()) {
    window.location.href = 'catalogo.html';
    return;
  }

  document.getElementById('form-login').addEventListener('submit', manejarLogin);
  document.getElementById('form-registro').addEventListener('submit', manejarRegistro);
  document.getElementById('tab-login').addEventListener('click', () => cambiarTab('login'));
  document.getElementById('tab-registro').addEventListener('click', () => cambiarTab('registro'));

  const toggleDemo = document.getElementById('toggleDemoUsers');
  if (toggleDemo) {
    toggleDemo.addEventListener('click', () => {
      document.getElementById('demoUsersList').classList.toggle('show');
    });
  }
}
