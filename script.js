
const apiUrl = 'http://localhost:8080';
const CACHE_KEY = 'zstridecarrito';
let productsData = [];
let storageCarrito = JSON.parse(localStorage.getItem(CACHE_KEY)) || [];


// Funciones de categorías

const boton = document.getElementById("btnCategorias");
const lista = document.getElementById("listaCategorias");

boton.addEventListener("click", () => {
    lista.classList.toggle("mostrar");
});

document.addEventListener("click", (e) => {
    if (!boton.contains(e.target) && !lista.contains(e.target)) {
        lista.classList.remove("mostrar");
    }
});


let categoriasData = [];

async function fetchCategorias() {
    try {
        const response = await fetch('http://localhost:8080/categorias');
        const data = await response.json();
        categoriasData = data;
        renderCategorias(categoriasData);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
    }
}

function renderCategorias(categorias){
    if (!lista) return;
    lista.innerHTML = '';
    categorias.forEach(categoria => {
        const categoriaHTML = `<li><a href="pages/category/${categoria.nombre.toLowerCase().replace(/\s+/g, '-')}.html">${categoria.nombre}</a></li>`;
        lista.innerHTML += categoriaHTML;
    });
};

fetchCategorias();




// Funciones de carrito

function actualizarContador() {
    const contador = document.getElementById('contador-carrito');
    if (contador) {
        const total = storageCarrito.reduce((acc, item) => acc + item.quantity, 0);
        contador.textContent = total;
    }
}

function guardarCarrito() {
    localStorage.setItem(CACHE_KEY, JSON.stringify(storageCarrito));
    actualizarContador();
    if (document.getElementById('contenedor-carrito')) renderCarrito();
}

function agregarAlCarrito(productId) {
    const producto = productsData.find(p => String(p.id) === String(productId));
    if (!producto) return;

    const existe = storageCarrito.find(item => String(item.id) === String(productId));
    if (existe) {
        existe.quantity += 1;
    } else {
        storageCarrito.push({ 
            id: producto.id, 
            quantity: 1, 
            title: producto.nombre, 
            price: producto.precio, 
            image: producto.imagenURL 
        });
    }
    guardarCarrito();
    alert("Producto añadido al carrito");
}

window.eliminarDelCarrito = (id) => {
    storageCarrito = storageCarrito.filter(item => String(item.id) !== String(id));
    guardarCarrito();
};


// Funciones de productos

async function fetchProducts() {
    try {
        const response = await fetch(`${apiUrl}/productos`);
        productsData = await response.json();
        // Si estamos en el index, renderizamos productos
        const seccionArticulos = document.getElementById('seccionArticulos');
        if (seccionArticulos) {
            seccionArticulos.innerHTML = productsData.map(prod => `
                <div class="contenedor-articulo">
                    <img src="${prod.imagenURL}" alt="${prod.nombre}">
                    <p class="art-precio">$${prod.precio.toLocaleString('es-AR')}</p>
                    <p class="art-nombre">${prod.nombre}</p>
                    <button type="button" class="art-boton" data-id="${prod.id}">Añadir al carrito</button>
                </div>`).join('');
            
            document.querySelectorAll('.art-boton').forEach(btn => {
                btn.addEventListener('click', (e) => agregarAlCarrito(e.target.dataset.id));
            });
        }
    } catch (error) { console.error('Error:', error); }
}

async function crearPedidoEnBackend() {
    const pedidoPayload = {
        usuarioId: "user-default", 
        lineas: storageCarrito.map(item => ({
            producto: { id: item.id },
            cantidad: item.quantity
        }))
    };

    try {
        const response = await fetch(`${apiUrl}/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedidoPayload)
        });

        if (response.ok) {
            alert("¡Pedido creado exitosamente!");
            storageCarrito = [];
            guardarCarrito();
        } else {
            const err = await response.json();
            alert("Error: " + (err.mensaje || "Stock insuficiente o error en pedido"));
        }
    } catch (e) { alert("No se pudo conectar con el servidor"); }
}


// Funciones de renderizado del carrito


function renderCarrito() {
    const contenedor = document.getElementById('contenedor-carrito');
    const totalEl = document.getElementById('total-productos');
    if (!contenedor) return;

    contenedor.innerHTML = storageCarrito.map(item => `
        <div class="carrito-item">
            <p>${item.title} - $${item.price} x ${item.quantity}</p>
            <button onclick="eliminarDelCarrito('${item.id}')">Eliminar</button>
        </div>`).join('');
    
    const total = storageCarrito.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    if (totalEl) totalEl.textContent = `$${total.toLocaleString('es-AR')}`;
}


document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    actualizarContador();
    if (document.getElementById('contenedor-carrito')) {
        renderCarrito();
        document.getElementById('boton-finalizar-compra').addEventListener('click', crearPedidoEnBackend);
    }
});