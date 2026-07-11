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
        const categoriaHTML = `<li><a href="./${categoria.nombre.toLowerCase().replace(/\s+/g, '-')}.html">${categoria.nombre}</a></li>`;
        lista.innerHTML += categoriaHTML;
    });
};

fetchCategorias();