const apiUrl = 'http://localhost:8080/productos';
let productosCache = [];


const form = document.getElementById('form-producto');
const inputId = document.getElementById('producto-id');
const inputNombre = document.getElementById('nombre');
const inputPrecio = document.getElementById('precio');
const inputStock = document.getElementById('stock');
const inputImagenURL = document.getElementById('imagenURL');
const inputDescripcion = document.getElementById('descripcion');
const selectCategoria = document.getElementById('categoria');

const tituloForm = document.getElementById('form-titulo');
const btnGuardar = document.getElementById('btn-guardar');
const btnCancelar = document.getElementById('btn-cancelar');
const tbody = document.getElementById('tabla-productos-body');


async function fetchProductos() {
    try {
        const response = await fetch(apiUrl);
        if (response.ok) {
            productosCache = await response.json();
            renderTabla();
        }
    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}


function renderTabla() {
    tbody.innerHTML = '';
    productosCache.forEach(prod => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${prod.id}</td>
            <td><strong>${prod.nombre}</strong></td>
            <td>${prod.categoria.nombre}</td>
            <td>$${prod.precio.toLocaleString('es-AR')}</td>
            <td>${prod.stock} un.</td>
            <td>
                <button class="btn-icon" onclick="prepararEdicion('${prod.id}')" title="Editar">✏️</button>
                <button class="btn-icon" onclick="eliminarProducto('${prod.id}')" title="Eliminar">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}


form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        nombre: inputNombre.value,
        precio: parseFloat(inputPrecio.value), 
        stock: parseInt(inputStock.value), 
        descripcion: inputDescripcion.value,
        categoria: { id: selectCategoria.value },
        imagenURL: inputImagenURL.value 
    };
    const idActual = inputId.value;

    try {
        let response;
        if (idActual) {
            response = await fetch(`${apiUrl}/${idActual}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        if (response.ok) {
            alert("Producto guardado correctamente.");
            limpiarForm();
            fetchProductos(); 
        } else {
            alert("Hubo un error al guardar el producto.");
        }
    } catch (error) {
        console.error("Error en la petición:", error);
    }
});


window.eliminarProducto = async function(id) {
    if (confirm(`¿Eliminar definitivamente el producto #${id}?`)) {
        try {
            const response = await fetch(`${apiUrl}/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchProductos(); 
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    }
};

window.prepararEdicion = function(id) {
    const prod = productosCache.find(p => p.id == id);
    if (prod) {
        inputId.value = prod.id;
        inputNombre.value = prod.nombre;
        inputPrecio.value = prod.precio;
        inputStock.value = prod.stock;
        inputImagenURL.value = prod.imagenURL;
        inputDescripcion.value = prod.descripcion;
        selectCategoria.value = prod.categoria;

        tituloForm.textContent = "Editar Producto";
        btnGuardar.textContent = "Actualizar";
        btnCancelar.classList.remove('hidden');
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};


btnCancelar.addEventListener('click', limpiarForm);

function limpiarForm() {
    form.reset();
    inputId.value = "";
    tituloForm.textContent = "Crear Nuevo Producto";
    btnGuardar.textContent = "Guardar Producto";
    btnCancelar.classList.add('hidden');
}


fetchProductos();