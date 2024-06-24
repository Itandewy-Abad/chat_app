document.addEventListener('DOMContentLoaded', () => {
    const socket = io('http://localhost:3000');
    const formularioChat = document.getElementById('chatForm');
    const cajaChat = document.getElementById('chatBox');
    const campoUsuario = document.getElementById('user');
    const campoMensaje = document.getElementById('message');

    formularioChat.addEventListener('submit', (evento) => {
        evento.preventDefault();
        const usuario = campoUsuario.value;
        const mensaje = campoMensaje.value;

        if (usuario && mensaje) {
            fetch('http://localhost:3000/api/mensajes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usuario, mensaje })
            })
            .then(respuesta => respuesta.json())
            .then(data => {
                socket.emit('nuevoMensaje', { usuario, mensaje, id: data.id });
                campoMensaje.value = '';
            })
            .catch(error => console.error('Error al enviar mensaje:', error));
        }
    });

    // Escucha doble clic en el chatBox para editar mensajes
    cajaChat.addEventListener('dblclick', (evento) => {
        const elementoMensaje = evento.target;
        if (elementoMensaje.tagName === 'DIV' && elementoMensaje.classList.contains('mensaje')) {
            const textoOriginal = elementoMensaje.textContent.trim();
            const nuevoMensaje = prompt('Editar mensaje:', textoOriginal);

            if (nuevoMensaje !== null && nuevoMensaje !== textoOriginal) {
                const idMensaje = elementoMensaje.dataset.id; // Asume que el ID está en el atributo data-id
                fetch(`http://localhost:3000/api/mensajes/${idMensaje}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ mensaje: nuevoMensaje })
                })
                .then(respuesta => {
                    if (respuesta.ok) {
                        // Actualización exitosa, actualiza el mensaje en la interfaz
                        elementoMensaje.textContent = nuevoMensaje; // Solo actualiza el contenido del mensaje
                    } else {
                        // Manejar error
                        console.error('Error al editar mensaje');
                    }
                })
                .catch(error => console.error('Error en la solicitud:', error));
            }
        }
    });

    // Escucha triple clic en el chatBox para eliminar mensajes
    cajaChat.addEventListener('click', (evento) => {
        const elementoMensaje = evento.target;
        if (elementoMensaje.tagName === 'DIV' && elementoMensaje.classList.contains('mensaje')) {
            const idMensaje = elementoMensaje.dataset.id; // Asume que el ID está en el atributo data-id

            // Marca visualmente el mensaje seleccionado
            if (elementoMensaje.classList.contains('mensaje-seleccionado')) {
                elementoMensaje.classList.remove('mensaje-seleccionado');
            } else {
                // Remueve la clase 'mensaje-seleccionado' de todos los elementos de mensajes
                const mensajes = document.querySelectorAll('.mensaje');
                mensajes.forEach(mensaje => mensaje.classList.remove('mensaje-seleccionado'));
                // Añade la clase 'mensaje-seleccionado' al mensaje actual
                elementoMensaje.classList.add('mensaje-seleccionado');
            }

            // Contar los clics
            const clicks = elementoMensaje.dataset.clicks ? parseInt(elementoMensaje.dataset.clicks) + 1 : 1;
            elementoMensaje.dataset.clicks = clicks;

            // Si se han dado tres clics, eliminar el mensaje
            if (clicks === 3) {
                fetch(`http://localhost:3000/api/mensajes/${idMensaje}`, {
                    method: 'DELETE'
                })
                .then(respuesta => {
                    if (respuesta.ok) {
                        // Eliminación exitosa, quitar el mensaje de la interfaz
                        elementoMensaje.remove();
                    } else {
                        // Manejar error
                        console.error('Error al eliminar mensaje');
                    }
                })
                .catch(error => console.error('Error en la solicitud:', error));
            }
        }
    });

    socket.on('mensaje', (msg) => {
        const elementoMensaje = document.createElement('div');
        elementoMensaje.textContent = `${msg.usuario}: ${msg.mensaje}`;
        elementoMensaje.classList.add('mensaje'); // Agrega la clase 'mensaje' para identificar los elementos
        elementoMensaje.dataset.id = msg.id; // Guarda el ID del mensaje en data-id
        cajaChat.appendChild(elementoMensaje);
    });

    fetch('http://localhost:3000/api/mensajes')
        .then(respuesta => respuesta.json())
        .then(mensajes => {
            mensajes.forEach(msg => {
                const elementoMensaje = document.createElement('div');
                elementoMensaje.textContent = `${msg.usuario}: ${msg.mensaje}`;
                elementoMensaje.classList.add('mensaje'); // Agrega la clase 'mensaje'
                elementoMensaje.dataset.id = msg.id; // Guarda el ID del mensaje en data-id
                cajaChat.appendChild(elementoMensaje);
            });
        })
        .catch(error => console.error('Error al obtener mensajes:', error));
});
