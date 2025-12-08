const contactForm = document.querySelector('form');

if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault(); 
        
        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const mensaje = document.getElementById('mensaje').value.trim();

        let Velidacion = true;

        // para limpiar estilos de errores previos
        document.querySelectorAll('.error-message').forEach(el => el.remove());

        // Función para mostrar mensajes de error
        const mensajeError = (inputElement, message) => {
            const errorDiv = document.createElement('div');
            errorDiv.classList.add('error-message');
            errorDiv.style.color = 'red';
            errorDiv.style.fontSize = '0.9em';
            errorDiv.style.marginTop = '-10px';
            errorDiv.textContent = message;
            inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
        };
        
        // 1. Validación del Nombre
        if (nombre === '' || nombre.length < 3) {
            mensajeError(document.getElementById('nombre'), 'El nombre es obligatorio y debe tener al menos 3 caracteres.');
            Velidacion = false;
        }

        // 2. Validación del Email 
        const estructuraCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!estructuraCorreo.test(email)) {
            mensajeError(document.getElementById('email'), 'Por favor, introduce un correo electrónico válido (ej: correo@dominio.com).');
            Velidacion = false;
        }

        // 3. Validación del Mensaje
        if (mensaje === '' || mensaje.length < 15) {
            mensajeError(document.getElementById('mensaje'), 'El mensaje es obligatorio y debe tener al menos 15 caracteres.');
            Velidacion = false;
        }

        if (Velidacion) {
            alert('Formulario validado correctamente. ¡Mensaje enviado con éxito!');
            contactForm.submit();
        }
    });
}