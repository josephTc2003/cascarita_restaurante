// js/app.js

document.addEventListener('DOMContentLoaded', () => {
  const loginPage = document.getElementById('login-page');
  const dashboard = document.getElementById('dashboard');
  const form = document.getElementById('login-form');
  const tituloModulo = document.getElementById('modulo-titulo');
  const contenidoModulo = document.getElementById('modulo-contenido');

  const insumos = [
    "Pan de hamburguesa", "Gaseosa Coca-Cola", "Papas congeladas", "Alitas crudas",
    "Vasos desechables", "Platos biodegradables", "Salsas", "Queso cheddar", "Servilletas",
    "Mayonesa", "Kétchup", "Cucharas", "Bandejas térmicas", "Empaques para delivery"
  ];

  const proveedores = [
    "Proveedor A", "Distribuidora B", "Alimentos Cía Ltda", "Empaques Express", 
    "Bebidas Ecuador", "LogísticaFood", "Pack&Go", "Sabor Natural S.A.", "Condimentos D&G"
  ];

  const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
  let inventario = JSON.parse(localStorage.getItem('inventario')) || [];
  const compras = JSON.parse(localStorage.getItem('compras')) || [];

  // Mantener sesión activa
  if (localStorage.getItem('sesionActiva')) {
    loginPage.classList.remove('active');
    dashboard.classList.add('active');
  }

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const user = document.getElementById('usuario').value.trim();
  const pass = document.getElementById('contrasena').value.trim();
  const errorMsg = document.getElementById('error-msg');

  if (user === 'Admin' && pass === 'Admin') {
    localStorage.setItem('sesionActiva', true);
    loginPage.classList.remove('active');
    dashboard.classList.add('active');
    errorMsg.style.display = 'none'; // Oculta el mensaje si estaba visible
  } else {
    errorMsg.style.display = 'block';
  }
});


  window.cerrarSesion = function () {
    localStorage.removeItem('sesionActiva');
    dashboard.classList.remove('active');
    loginPage.classList.add('active');
    tituloModulo.textContent = 'Bienvenido';
    contenidoModulo.innerHTML = '<p>Seleccione un módulo del menú lateral para comenzar.</p>';
  };

  window.mostrarModulo = function (modulo) {
    tituloModulo.textContent = modulo.charAt(0).toUpperCase() + modulo.slice(1);

    if (modulo === 'inventario') {
      contenidoModulo.innerHTML = `
        <h3>Inventario</h3>
        <form id="form-inventario">
          <input type="text" placeholder="Nombre del producto" required />
          <input type="number" placeholder="Cantidad" required min="1" />
          <input type="date" required />
          <button type="submit">Agregar</button>
        </form>
        <table id="tabla-inventario">
          <thead><tr><th>Producto</th><th>Cantidad</th><th>Vencimiento</th></tr></thead>
          <tbody></tbody>
        </table>`;

      const tbody = document.querySelector('#tabla-inventario tbody');

      function renderInventario() {
        tbody.innerHTML = '';
        inventario.forEach(item => {
          const row = `<tr><td>${item.producto}</td><td>${item.cantidad}</td><td>${item.vencimiento}</td></tr>`;
          tbody.insertAdjacentHTML('beforeend', row);
        });
      }

      renderInventario();

      document.getElementById('form-inventario').addEventListener('submit', function (e) {
        e.preventDefault();
        const inputs = e.target.querySelectorAll('input');
        const nuevoProducto = {
          producto: inputs[0].value.trim(),
          cantidad: Number(inputs[1].value),
          vencimiento: inputs[2].value
        };
        inventario.push(nuevoProducto);
        localStorage.setItem('inventario', JSON.stringify(inventario));
        renderInventario();
        e.target.reset();
      });

    } else if (modulo === 'compras') {
      contenidoModulo.innerHTML = `
        <h3>Gestión de Compras</h3>
        <form id="form-compras">
          <label>Proveedor:</label>
          <select required>${proveedores.map(p => `<option>${p}</option>`).join('')}</select>
          <label>Producto:</label>
          <select required>${insumos.map(i => `<option>${i}</option>`).join('')}</select>
          <label>Cantidad:</label>
          <input type="number" required min="1" />
          <button type="submit">Registrar Compra</button>
        </form>
        <ul id="lista-compras"></ul>`;

      const lista = document.getElementById('lista-compras');

      function renderCompras() {
        lista.innerHTML = '';
        compras.forEach(c => {
          lista.innerHTML += `<li>${c.fecha} - ${c.proveedor}: ${c.cantidad} x ${c.producto}</li>`;
        });
      }

      renderCompras();

      document.getElementById('form-compras').addEventListener('submit', function (e) {
        e.preventDefault();
        const datos = e.target.querySelectorAll('select, input');
        const nuevaCompra = {
          proveedor: datos[0].value,
          producto: datos[1].value,
          cantidad: parseInt(datos[2].value),
          fecha: new Date().toLocaleDateString()
        };

        compras.push(nuevaCompra);
        localStorage.setItem('compras', JSON.stringify(compras));
        renderCompras();
        e.target.reset();

        const fechaVencimiento = new Date();
        fechaVencimiento.setDate(fechaVencimiento.getDate() + 5);

        inventario.push({
          producto: nuevaCompra.producto,
          cantidad: nuevaCompra.cantidad,
          vencimiento: fechaVencimiento.toISOString().split('T')[0]
        });

        localStorage.setItem('inventario', JSON.stringify(inventario));
      });

    } else if (modulo === 'reportes') {
      contenidoModulo.innerHTML = `
        <h3>Reportes</h3>
        <div id="reporte-inventario"></div>
        <div id="reporte-compras"></div>`;

      const reporteInv = document.getElementById('reporte-inventario');
      const total = inventario.reduce((a, b) => a + b.cantidad, 0);
      reporteInv.innerHTML = `<p>📦 Total productos en inventario: <strong>${total}</strong></p>`;

      const reporteCom = document.getElementById('reporte-compras');
      if (compras.length === 0) {
        reporteCom.innerHTML = '<p>No hay compras registradas.</p>';
      } else {
        reporteCom.innerHTML = '<ul>' + compras.map(c => `<li>${c.fecha} - ${c.proveedor}: ${c.cantidad} x ${c.producto}</li>`).join('') + '</ul>';
      }

    } else if (modulo === 'cocina') {
      const platos = ["Hamburguesa Clásica", "Hamburguesa Doble", "Papas Fritas", "Alitas BBQ", "Hotdog", "Gaseosa"];
      contenidoModulo.innerHTML = `
        <h3>Pedidos de Cocina</h3>
        <form id="form-pedidos">
          <select required>${platos.map(p => `<option>${p}</option>`).join('')}</select>
          <button type="submit">Agregar Pedido</button>
        </form>
        <ul id="lista-pedidos"></ul>`;

      const lista = document.getElementById('lista-pedidos');
      renderPedidos(lista);

      document.getElementById('form-pedidos').addEventListener('submit', function (e) {
        e.preventDefault();
        const input = e.target.querySelector('select');
        pedidos.push(input.value);
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        renderPedidos(lista);
        e.target.reset();
      });
    }
  };

  function renderPedidos(lista) {
    lista.innerHTML = '';
    pedidos.forEach((pedido, index) => {
      const li = document.createElement('li');
      li.innerHTML = `${pedido} <button data-index="${index}">Listo</button>`;
      lista.appendChild(li);
    });

    lista.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', function () {
        const i = this.dataset.index;
        pedidos.splice(i, 1);
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        renderPedidos(lista);
      });
    });
  }
});
