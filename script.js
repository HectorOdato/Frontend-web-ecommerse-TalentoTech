
// --- CONSUMO DE API EXTERNA Y RENDERIZADO DE PRODUCTOS ---

const seccionArticulos = document.getElementById('seccionArticulos');
const apiUrl = 'http://localhost:8080/productos'; 


const boton = document.getElementById("btnCategorias");
const lista = document.getElementById("listaCategorias");

boton.addEventListener("click", () => {
    lista.classList.toggle("mostrar");
});

// Cerrar el menú al hacer clic fuera
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
        const categoriaHTML = `<li><a href="./pages/category/${categoria.nombre.toLowerCase().replace(/\s+/g, '-')}.html">${categoria.nombre}</a></li>`;
        lista.innerHTML += categoriaHTML;
    });
};

let productsData = [];

async function fetchProducts() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        productsData = data;
        renderProductos(productsData);
    } catch (error) {
        console.error('Error al obtener productos:', error);
    }
}

function renderProductos(productos) {
    if (!seccionArticulos) return;
    seccionArticulos.innerHTML = '';
    productos.forEach(productos => {
        const productHTML = 
            `<div class="contenedor-articulo">` +
            `<img src="${productos.imagenURL}" alt="${productos.nombre}">` +
            `<p class="art-precio">$${productos.precio.toLocaleString('es-AR')}</p>` +
            `<p class="art-nombre">${productos.nombre}</p>` +
            `<button type="button" class="art-boton" data-id="${productos.id}">Añadir al carrito</button>` +
            `</div>`;
        seccionArticulos.innerHTML += productHTML;
    });
    carritoEventListener();
};


// --- GESTIÓN DEL CARRITO (CONTADOR Y ALMACENAMIENTO) ---

const carrito = 'zstridecarrito';
const contador = document.getElementById('contador-carrito'); 
let storageCarrito = JSON.parse(localStorage.getItem(carrito)) || []; 

function actualizarContador() {
    if (contador) {
        const totalProductos = storageCarrito.reduce((total, item) => total + item.quantity, 0);
        contador.textContent = totalProductos;
    }
}

function guardarCarrito() {
    localStorage.setItem(carrito, JSON.stringify(storageCarrito));
    actualizarContador();
}

actualizarContador(); 

// --- GESTIÓN DE EVENTOS Y LÓGICA DE CARRITO ---

function carritoEventListener() {
    if (seccionArticulos) {
        seccionArticulos.removeEventListener('click', handleAddToCart); 
        seccionArticulos.addEventListener('click', handleAddToCart);
    }
}

function handleAddToCart(event) {
    if (event.target.classList.contains('art-boton')) {
        const productId = String(event.target.dataset.id);
        agregarCarrito(productId);
    }
}

function agregarCarrito(productId) {
    const productoExistente = storageCarrito.find(item => String(item.id) === productId);
    
    if (productoExistente) {
        productoExistente.quantity += 1;
    } else {
        const producto = productsData.find(p => String(p.id) === productId);
        if (producto) {
            storageCarrito.push({ id: productId, quantity: 1, title: producto.nombre, price: producto.price, image: producto.imagen });
        }
    }
    alert(`Producto agregado al carrito. Items totales: ${storageCarrito.reduce((total, item) => total + item.quantity, 0)}`);
    guardarCarrito();
}

function borrarCarrito(productId) {
    const length = storageCarrito.length;
    storageCarrito = storageCarrito.filter(item => String(item.id) !== String(productId));    
    if (storageCarrito.length < length) {
        alert('Producto eliminado del carrito');
    } else {
        alert('Producto no encontrado en el carrito');
    }
    guardarCarrito();
} 

// --- VIZUALIZACION DE PRODUCTOS EN EL CARRITO ---

const contenedorCarrito = document.getElementById('contenedor-carrito');
const totalProductos = document.getElementById('total-productos');


function renderCarritoProduct() {
    contenedorCarrito.innerHTML = '';

    if (storageCarrito.length === 0) {
        contenedorCarrito.innerHTML = '<p style="text-align: center; color: white;">Tu carrito está vacío. ¡Ve a la <a href="../index.html" style="color:#FFD700;">página de inicio</a> para agregar productos!</p>';
        totalProductos.textContent = '$0.00';
        return;
    }

    let total = 0;

    storageCarrito.forEach(item => {

        const itemPrice = item.price * item.quantity;
        total += itemPrice;

        const carritoHTML = `
            <div class="carrito-item" data-id="${item.id}">
                <div class="item-detalles">
                    <img src="${item.image}" alt="${item.title}">
                    <div>
                        <p class="item-nombre">${item.title}</p>
                        <p class="item-pricio">$${item.price.toLocaleString('es-AR')} x <span class="item-cantidad">${item.quantity}</span></p>
                    </div>
                </div>
                <div>
                    <p>Subtotal: <strong>$${itemPrice.toLocaleString('es-AR')}</strong></p>
                    <button class="boton-eliminar" data-id="${item.id}">Eliminar</button>
                </div>
            </div>
        `;
        contenedorCarrito.innerHTML += carritoHTML;
    });

    totalProductos.textContent = `$${total.toLocaleString('es-AR')}`;

    eliminarEventListener();
}


function eliminarEventListener() {
    const botonEliminar = document.querySelectorAll('.boton-eliminar');
    botonEliminar.forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.target.dataset.id;
            borrarCarrito(productId); 
            renderCarritoProduct(); 
        });
    });
}
if (contenedorCarrito) {
    renderCarritoProduct();
    finalizarCompra()
}

// --- FINALIZAR COMPRA ---
function finalizarCompra() {
    const botonFinalizar = document.getElementById('boton-finalizar-compra');
    
    if (botonFinalizar) {
        botonFinalizar.addEventListener('click', () => {
            if (storageCarrito.length > 0) {
                alert('¡Gracias por tu compra! Tu pedido en ZStride ha sido procesado.');

                storageCarrito = []; 
                guardarCarrito(); 

                renderCarritoProduct(); 
            } else {
                alert('Tu carrito está vacío. ¡No hay nada que comprar!');
            }
        });
    }
}

// --- INICIO DEL SCRIPT ---
fetchProducts();
fetchCategorias();
