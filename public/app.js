document.addEventListener('DOMContentLoaded', () => {
  // --- Estado en memoria ---
  let inventario = JSON.parse(localStorage.getItem('inventario')) || [];
  let compras = JSON.parse(localStorage.getItem('compras')) || [];
  let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];

  // Datos estáticos
  const insumos = [
    "Pan de hamburguesa", "Gaseosa", "Papas congeladas", "Alitas crudas",
    "Vasos desechables", "Platos biodegradables", "Salsas", "Queso cheddar", "Servilletas",
    "Mayonesa", "Kétchup", "Cucharas", "Bandejas térmicas", "Empaques para delivery"
  ];

  const proveedores = [
    "Proveedor A", "Distribuidora B", "Alimentos Cía Ltda", "Empaques Express",
    "Bebidas Ecuador", "LogísticaFood", "Pack&Go", "Sabor Natural S.A.", "Condimentos D&G"
  ];

  const platos = ["Hamburguesa Clásica", "Hamburguesa Doble", "Papas Fritas", "Alitas BBQ", "Hotdog", "Gaseosa"];
  const marcasGaseosa = ["Coca-Cola", "Pepsi", "Fanta", "Sprite", "Inca Kola"];

  // Unidades para productos - centralizadas para todo el código
  const unidadesProductos = {
    // Compras / inventario
    "Pan de hamburguesa": "unidades",
    "Gaseosa": "litros",
    "Papas congeladas": "libras",
    "Alitas crudas": "libras",
    "Vasos desechables": "unidades",
    "Platos biodegradables": "unidades",
    "Salsas": "botellas",
    "Queso cheddar": "libras",
    "Servilletas": "paquetes",
    "Mayonesa": "botellas",
    "Kétchup": "botellas",
    "Cucharas": "paquetes",
    "Bandejas térmicas": "unidades",
    "Empaques para delivery": "unidades",
    // Cocina
    "carne": "libras",
    "pollo": "libras",
    "arroz": "libras",
    "pescado": "libras",
    "azúcar": "libras",
    "sal": "libras",
    "aceite": "litros",
    "agua": "litros",
    "gaseosa": "litros",
    "leche": "litros",
    "huevos": "unidades",
    "pan": "unidades",
    "fideos": "paquetes",
    "hamburguesa clásica": "unidades",
    "hamburguesa doble": "unidades",
    "papas fritas": "porciones",
    "alitas bbq": "porciones",
    "hotdog": "unidades"
  };

  // Templates para módulos (sin fetch)
  const TEMPLATES = {
    inicio: `<p>Seleccione un módulo del menú lateral para comenzar.</p>`,

    inventario: `
      <h3>Inventario</h3>
      <form id="form-inventario" aria-label="Formulario de inventario">
        <label for="inv-producto">Producto</label>
        <input type="text" id="inv-producto" placeholder="Nombre del producto" required autocomplete="off" />
        <label for="inv-cantidad">Cantidad</label>
        <input type="number" id="inv-cantidad" placeholder="Cantidad" required min="1" />
        <label for="inv-vencimiento">Fecha de vencimiento</label>
        <input type="date" id="inv-vencimiento" required />
        <button type="submit">Agregar</button>
      </form>
      <table id="tabla-inventario" aria-live="polite">
        <thead><tr><th>Producto</th><th>Cantidad</th><th>Vencimiento</th></tr></thead>
        <tbody></tbody>
      </table>
    `,

    compras: `
      <h3>Gestión de Compras</h3>
      <form id="form-compras" aria-label="Formulario de compras">
        <label for="comp-proveedor">Proveedor:</label>
        <select id="comp-proveedor" required>
          ${proveedores.map(p => `<option value="${p}">${p}</option>`).join('')}
        </select>

        <label for="comp-producto">Producto:</label>
        <select id="comp-producto" required>
          ${insumos.map(i => `<option value="${i}">${i}</option>`).join('')}
        </select>

        <label for="comp-cantidad" id="label-cantidad">Cantidad:</label>
        <input type="number" id="comp-cantidad" required min="1" placeholder="Cantidad" autocomplete="off" />

        <button type="submit">Registrar Compra</button>
        <div id="comp-feedback" role="alert" aria-live="assertive" style="color: green; margin-top: 8px;"></div>
      </form>
      <ul id="lista-compras" aria-live="polite" style="margin-top: 15px;"></ul>
    `,

    reportes: `
      <h3>Reportes</h3>
      <div id="reporte-inventario"></div>
      <div id="reporte-compras"></div>
    `,

    cocina: `
      <h3>Pedidos de Cocina</h3>
      <form id="formulario" aria-label="Formulario de pedidos de cocina">
        <label for="producto-select">Producto</label>
        <select id="producto-select" required>
          <option value="">Seleccione un plato</option>
          ${platos.map(p => `<option value="${p}">${p}</option>`).join('')}
        </select>

        <div id="marca-gaseosa-container" style="display:none; margin-top: 10px;">
          <label for="marca">Marca de Gaseosa</label>
          <select id="marca">
            <option value="">Seleccione una marca</option>
            ${marcasGaseosa.map(m => `<option value="${m}">${m}</option>`).join('')}
          </select>
        </div>

        <label id="cantidad-label" for="cantidad">Cantidad (unidades)</label>
        <input type="number" id="cantidad" min="1" value="1" required autocomplete="off" />

        <button type="submit">Agregar Pedido</button>
      </form>

      <ul id="lista-pedidos" aria-live="polite" style="margin-top: 15px;"></ul>
    `
  };

  // --- Login simple ---
  const loginForm = document.getElementById('login-form');
  const errorMsg = document.getElementById('error-msg');
  const loginPage = document.getElementById('login-page');
  const dashboard = document.getElementById('dashboard');

  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const usuario = document.getElementById('usuario').value.trim();
      const contrasena = document.getElementById('contrasena').value.trim();

      if (usuario === 'admin' && contrasena === 'admin') {
        loginPage.style.display = 'none';
        dashboard.style.display = 'flex';
        cargarModulo('inicio');
      } else {
        errorMsg.style.display = 'block';
      }
    });
  }

  document.getElementById('cerrar-sesion')?.addEventListener('click', () => {
    loginPage.style.display = 'block';
    dashboard.style.display = 'none';
    loginForm.reset();
    document.getElementById('modulo-titulo').textContent = 'Bienvenido';
    document.getElementById('modulo-contenido').innerHTML = TEMPLATES.inicio;
  });

  // --- Router ---
  const menuItems = document.querySelectorAll('#menu-lateral li[data-modulo]');
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      cargarModulo(item.getAttribute('data-modulo'));
    });
  });

  function cargarModulo(modulo) {
    const titulo = modulo === 'inicio'
      ? 'Bienvenido'
      : modulo.charAt(0).toUpperCase() + modulo.slice(1);

    document.getElementById('modulo-titulo').textContent = titulo;
    document.getElementById('modulo-contenido').innerHTML = TEMPLATES[modulo] || '<p>Módulo no encontrado.</p>';

    switch (modulo) {
      case 'inventario': initInventario(); break;
      case 'compras': initCompras(); break;
      case 'reportes': initReportes(); break;
      case 'cocina': initCocina(); break;
      default: break;
    }
  }

  // ========== Inventario ==========
  function initInventario() {
    const tbody = document.querySelector('#tabla-inventario tbody');
    const form = document.getElementById('form-inventario');

    function renderInventario() {
      tbody.innerHTML = inventario.map(item =>
        `<tr><td>${item.producto}</td><td>${item.cantidad}</td><td>${item.vencimiento}</td></tr>`
      ).join('');
    }

    renderInventario();

    form.addEventListener('submit', e => {
      e.preventDefault();
      const producto = document.getElementById('inv-producto').value.trim();
      const cantidad = Number(document.getElementById('inv-cantidad').value);
      const vencimiento = document.getElementById('inv-vencimiento').value;

      if (!producto || isNaN(cantidad) || cantidad <= 0 || !vencimiento) {
        alert('Complete todos los campos correctamente');
        return;
      }

      inventario.push({ producto, cantidad, vencimiento });
      localStorage.setItem('inventario', JSON.stringify(inventario));
      renderInventario();
      form.reset();
    });
  }

  // ========== Compras ==========
  function initCompras() {
    const lista = document.getElementById('lista-compras');
    const form = document.getElementById('form-compras');
    const cantidadInput = document.getElementById('comp-cantidad');
    const productoSelect = document.getElementById('comp-producto');
    const feedback = document.getElementById('comp-feedback');

    // Actualiza placeholder y label de cantidad con unidad
    function actualizarLabelCantidad() {
      const producto = productoSelect.value;
      const unidad = unidadesProductos[producto] || "unidades";
      cantidadInput.setAttribute('placeholder', `Cantidad (${unidad})`);
      document.getElementById('label-cantidad').textContent = `Cantidad (${unidad}):`;
    }

    actualizarLabelCantidad();

    productoSelect.addEventListener('change', () => {
      actualizarLabelCantidad();
      feedback.textContent = '';
    });

    function renderCompras() {
      if (!lista) return;
      lista.innerHTML = compras.map(c => {
        const unidad = unidadesProductos[c.producto] || "unidades";
        return `<li>${c.fecha} - ${c.proveedor}: ${c.cantidad} ${unidad} de ${c.producto}</li>`;
      }).join('');
    }

    renderCompras();

    form.addEventListener('submit', e => {
      e.preventDefault();
      feedback.textContent = '';
      const proveedor = document.getElementById('comp-proveedor').value.trim();
      const producto = productoSelect.value;
      const cantidad = parseInt(cantidadInput.value, 10);
      const fecha = new Date().toLocaleDateString();

      if (!proveedor) {
        feedback.style.color = 'red';
        feedback.textContent = 'Seleccione un proveedor.';
        return;
      }
      if (!producto) {
        feedback.style.color = 'red';
        feedback.textContent = 'Seleccione un producto.';
        return;
      }
      if (isNaN(cantidad) || cantidad <= 0) {
        feedback.style.color = 'red';
        feedback.textContent = 'Ingrese una cantidad válida mayor que cero.';
        return;
      }

      const nuevaCompra = { proveedor, producto, cantidad, fecha };
      compras.push(nuevaCompra);
      localStorage.setItem('compras', JSON.stringify(compras));
      renderCompras();
      form.reset();
      actualizarLabelCantidad();

      // Actualizar inventario automáticamente
      const fechaVencimiento = new Date();
      fechaVencimiento.setDate(fechaVencimiento.getDate() + 5);
      inventario.push({
        producto,
        cantidad,
        vencimiento: fechaVencimiento.toISOString().split('T')[0]
      });
      localStorage.setItem('inventario', JSON.stringify(inventario));

      feedback.style.color = 'green';
      feedback.textContent = 'Compra registrada con éxito.';
    });
  }

  // ========== Reportes ==========
  function initReportes() {
    const reporteInv = document.getElementById('reporte-inventario');
    const reporteCom = document.getElementById('reporte-compras');

    if (reporteInv) {
      const total = inventario.reduce((acc, item) => acc + item.cantidad, 0);
      reporteInv.innerHTML = `<p>📦 Total productos en inventario: <strong>${total}</strong></p>`;
    }

    if (reporteCom) {
      if (compras.length === 0) {
        reporteCom.innerHTML = '<p>No hay compras registradas.</p>';
      } else {
        reporteCom.innerHTML = '<ul>' + compras.map(c => {
          const unidad = unidadesProductos[c.producto] || "unidades";
          return `<li>${c.fecha} - ${c.proveedor}: ${c.cantidad} ${unidad} de ${c.producto}</li>`;
        }).join('') + '</ul>';
      }
    }
  }

  // ========== Cocina ==========
  function initCocina() {
    const formulario = document.getElementById('formulario');
    const listaPedidos = document.getElementById('lista-pedidos');
    const selectProducto = document.getElementById('producto-select');
    const cantidadInput = document.getElementById('cantidad');
    const marcaInputContainer = document.getElementById('marca-gaseosa-container');
    const marcaInput = document.getElementById('marca');
    const cantidadLabel = document.getElementById('cantidad-label');

    // Unidades para cocina (usamos mismas que en unidadesProductos pero con key lowercase)
    const unidadesCocina = {};
    for (const key in unidadesProductos) {
      unidadesCocina[key.toLowerCase()] = unidadesProductos[key];
    }

    function actualizarLabelCantidad() {
      const producto = selectProducto.value.toLowerCase();
      const unidad = unidadesCocina[producto] || "unidades";
      cantidadLabel.textContent = `Cantidad (${unidad})`;
    }

    selectProducto.addEventListener('change', () => {
      actualizarLabelCantidad();
      if (selectProducto.value === 'Gaseosa') {
        marcaInputContainer.style.display = 'block';
        marcaInput.setAttribute('required', 'required');
      } else {
        marcaInputContainer.style.display = 'none';
        marcaInput.removeAttribute('required');
        marcaInput.value = '';
      }
    });

    function renderPedidos() {
      if (!listaPedidos) return;
      listaPedidos.innerHTML = '';
      pedidos.forEach((pedido, i) => {
        const unidad = unidadesCocina[pedido.nombre.toLowerCase()] || "unidades";
        const li = document.createElement('li');
        li.textContent = `${pedido.nombre}${pedido.marca ? ' - ' + pedido.marca : ''} - ${pedido.cantidad} ${unidad}`;

        const btnEliminar = document.createElement('button');
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.setAttribute('aria-label', `Eliminar pedido ${pedido.nombre}`);
        btnEliminar.onclick = () => {
          if (confirm(`¿Eliminar pedido de ${pedido.nombre}?`)) {
            pedidos.splice(i, 1);
            localStorage.setItem('pedidos', JSON.stringify(pedidos));
            renderPedidos();
          }
        };

        li.appendChild(btnEliminar);
        listaPedidos.appendChild(li);
      });
    }

    formulario.addEventListener('submit', e => {
      e.preventDefault();
      const nombre = selectProducto.value;
      const cantidad = parseInt(cantidadInput.value, 10);
      let marca = null;

      if (nombre === 'Gaseosa') {
        marca = marcaInput.value;
        if (!marca) {
          alert('Seleccione una marca de gaseosa');
          return;
        }
      }
      if (!nombre) {
        alert('Seleccione un producto');
        return;
      }
      if (isNaN(cantidad) || cantidad <= 0) {
        alert('Ingrese una cantidad válida');
        return;
      }

      pedidos.push({ nombre, cantidad, marca });
      localStorage.setItem('pedidos', JSON.stringify(pedidos));

      formulario.reset();
      marcaInputContainer.style.display = 'none';
      marcaInput.removeAttribute('required');
      actualizarLabelCantidad();
      renderPedidos();
    });

    renderPedidos();
    actualizarLabelCantidad();
  }

  // Carga inicial (si está logueado)
  // cargarModulo('inicio');
});
