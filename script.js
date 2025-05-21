// script.js

// --- 0. Utilidades y Selectores Comunes ---
/**
 * Helper para seleccionar un solo elemento del DOM.
 * @param {string} selector - El selector CSS del elemento.
 * @returns {Element | null} El primer elemento que coincide o null.
 */
const $ = (selector) => document.querySelector(selector);

/**
 * Helper para seleccionar múltiples elementos del DOM.
 * @param {string} selector - El selector CSS de los elementos.
 * @returns {NodeListOf<Element>} Una NodeList de todos los elementos que coinciden.
 */
const $$ = (selector) => document.querySelectorAll(selector);

/**
 * Muestra un mensaje temporal en un elemento del DOM.
 * @param {HTMLElement} element - El elemento donde se mostrará el mensaje (ej. div con clase .message-area).
 * @param {string} message - El texto del mensaje.
 * @param {'success' | 'error'} type - El tipo de mensaje, para aplicar estilos y roles de accesibilidad.
 */
const showMessage = (element, message, type) => {
    element.textContent = message; // Establece el texto del mensaje en el elemento.
    // Remueve clases previas y añade la correcta
    element.classList.remove('text-success-color', 'text-error-color'); // Elimina clases de estilo anteriores.
    element.classList.add(`text-${type}-color`); // Añade la clase de estilo según el tipo de mensaje (éxito o error).
    element.style.display = 'block'; // Hace visible el elemento del mensaje.

    // Establece el rol de accesibilidad para que los lectores de pantalla lo anuncien.
    element.setAttribute('role', 'status'); // Indica que el elemento es un área de estado.
    element.setAttribute('aria-live', 'polite'); // Le dice a los lectores de pantalla que anuncien los cambios de forma no intrusiva.

    // Oculta el mensaje después de 5 segundos.
    setTimeout(() => {
        element.textContent = ''; // Borra el texto del mensaje.
        element.style.display = 'none'; // Oculta el elemento del mensaje.
        element.classList.remove(`text-${type}-color`); // Remueve la clase de estilo.
        element.removeAttribute('role'); // Elimina el atributo role.
        element.removeAttribute('aria-live'); // Elimina el atributo aria-live.
    }, 5000); // El mensaje se ocultará después de 5000 milisegundos (5 segundos).
};

// --- 1. Enrutamiento Simulado (Navegación entre Secciones) ---
const sections = $$('.page-section'); // Selecciona todos los elementos con la clase 'page-section', que representan las diferentes vistas o páginas.
const navLinks = $$('.nav-link');     // Selecciona todos los enlaces de navegación con la clase 'nav-link'.

/**
 * Muestra la sección de la página correspondiente al ID y actualiza la URL en el historial.
 * También actualiza el estado activo de los enlaces de navegación.
 * @param {string} targetSectionId - El ID de la sección a mostrar (ej. 'home', 'explore').
 */
const navigateTo = (targetSectionId) => {
    // Oculta todas las secciones
    sections.forEach(section => {
        section.classList.remove('active'); // Remueve la clase 'active' de todas las secciones.
        section.style.display = 'none'; // Oculta visualmente todas las secciones para que solo una esté visible.
    });

    // Muestra la sección objetivo
    const targetSection = $(`#${targetSectionId}-section`); // Selecciona la sección específica que debe mostrarse.
    if (targetSection) { // Si la sección objetivo existe:
        targetSection.classList.add('active'); // Añade la clase 'active' a la sección objetivo.
        targetSection.style.display = 'block'; // Muestra visualmente la sección objetivo.

        // Actualiza la URL en el historial del navegador para simular navegación.
        // Esto permite usar los botones de "atrás" y "adelante" del navegador.
        history.pushState(null, '', `#${targetSectionId}`); // Cambia la URL en la barra de direcciones sin recargar la página.
        window.scrollTo(0, 0); // Desplaza la vista al inicio de la página para la nueva sección.
    } else { // Si la sección objetivo no se encuentra:
        console.warn(`Sección '${targetSectionId}-section' no encontrada. Redirigiendo a inicio.`); // Muestra una advertencia en la consola.
        navigateTo('home'); // Redirige a la sección de inicio por defecto.
        return; // Detener la ejecución para evitar errores.
    }

    // Actualiza la clase 'active-nav-link' para resaltar el enlace de la página actual.
    navLinks.forEach(link => { // Itera sobre todos los enlaces de navegación.
        link.classList.remove('active-nav-link'); // Remueve la clase 'active-nav-link' de todos los enlaces.
        link.removeAttribute('aria-current'); // Quita el atributo aria-current de los enlaces no activos.
        if (link.dataset.section === targetSectionId) { // Si el atributo 'data-section' del enlace coincide con el ID de la sección objetivo:
            link.classList.add('active-nav-link'); // Añade la clase 'active-nav-link' para resaltarlo.
            link.setAttribute('aria-current', 'page'); // Indica que este es el enlace a la página actual para lectores de pantalla.
        }
        // Cerrar el menú móvil si está abierto después de hacer clic en un enlace.
        const mainNav = $('#main-nav'); // Selecciona el elemento de navegación principal.
        if (mainNav && mainNav.classList.contains('active')) { // Si el menú móvil está activo (abierto):
            mainNav.classList.remove('active'); // Cierra el menú móvil.
            $('#menu-toggle').setAttribute('aria-expanded', 'false'); // Actualiza el estado de accesibilidad del botón del menú.
            $('#menu-toggle').textContent = '☰'; // Restaura el ícono de la hamburguesa.
        }
    });

    // Cargar contenido específico de la sección si es necesario.
    switch (targetSectionId) { // Ejecuta código específico dependiendo de la sección a la que se navegó.
        case 'explore':
            loadEvents('events-grid'); // Si es la sección 'explore', carga los eventos en la cuadrícula principal.
            break;
        case 'ranking':
            loadRanking(); // Si es la sección 'ranking', carga el ranking de eventos.
            break;
        case 'profile':
            loadProfile(); // Si es la sección 'profile', carga la información del perfil.
            break;
        // Otras secciones se cargarán bajo demanda o solo contienen formularios estáticos.
    }
};

// Maneja los clics en los enlaces de navegación.
navLinks.forEach(link => { // Itera sobre cada enlace de navegación.
    link.addEventListener('click', (e) => { // Añade un "escuchador" de eventos para el clic.
        e.preventDefault(); // Previene el comportamiento por defecto del enlace (evita que la página se recargue).
        const sectionId = e.target.dataset.section; // Obtiene el ID de la sección a la que se debe navegar desde el atributo 'data-section'.
        if (sectionId) { // Si se encontró un ID de sección:
            navigateTo(sectionId); // Llama a la función de navegación.
        }
    });
});

// Maneja la navegación con los botones de "atrás" y "adelante" del navegador.
window.addEventListener('popstate', () => { // Escucha el evento 'popstate', que se dispara cuando cambia el historial del navegador (ej. botones atrás/adelante).
    const currentHash = window.location.hash.slice(1); // Obtiene el fragmento de la URL (hash) sin el '#' inicial.
    if (currentHash) { // Si hay un hash en la URL:
        navigateTo(currentHash); // Navega a la sección correspondiente al hash.
    } else { // Si no hay hash (ej. se vuelve al inicio sin hash):
        navigateTo('home'); // Va a la página de inicio por defecto.
    }
});

// --- 2. Navbar y Funcionalidad de Modo Oscuro ---
const menuToggle = $('#menu-toggle');         // Selecciona el botón del menú hamburguesa.
const mainNav = $('#main-nav');               // Selecciona el elemento de navegación principal.
const darkModeToggle = $('#dark-mode-toggle'); // Selecciona el botón para alternar el modo oscuro.

// Maneja el clic en el botón de menú para móviles.
menuToggle.addEventListener('click', () => { // Añade un "escuchador" de eventos para el clic en el botón del menú.
    mainNav.classList.toggle('active'); // Alterna la clase 'active' en el menú principal para mostrarlo u ocultarlo.
    const isExpanded = mainNav.classList.contains('active'); // Verifica si el menú está ahora expandido.
    menuToggle.setAttribute('aria-expanded', isExpanded); // Actualiza el atributo 'aria-expanded' para la accesibilidad.
    menuToggle.textContent = isExpanded ? '✕' : '☰'; // Cambia el ícono del botón entre una 'X' y las tres barras.
});

// Maneja el clic en el botón de modo oscuro.
darkModeToggle.addEventListener('click', () => { // Añade un "escuchador" de eventos para el clic en el botón de modo oscuro.
    document.body.classList.toggle('dark-mode'); // Alterna la clase 'dark-mode' en el <body> para aplicar los estilos de modo oscuro.
    const isDarkMode = document.body.classList.contains('dark-mode'); // Verifica si el modo oscuro está activo.
    localStorage.setItem('darkMode', isDarkMode); // Guarda la preferencia del usuario (true/false) en el almacenamiento local del navegador.
    darkModeToggle.setAttribute('aria-label', isDarkMode ? 'Activar modo claro' : 'Activar modo oscuro'); // Actualiza la etiqueta de accesibilidad del botón.
    darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙'; // Cambia el ícono del botón entre un sol y una luna.
});

// --- 3. Inicialización al Cargar la Página (DOM Content Loaded) ---
document.addEventListener('DOMContentLoaded', () => { // Se ejecuta cuando todo el contenido del DOM ha sido cargado.
    // Carga la preferencia de modo oscuro desde el almacenamiento local al inicio.
    if (localStorage.getItem('darkMode') === 'true') { // Comprueba si la preferencia 'darkMode' está guardada como 'true'.
        document.body.classList.add('dark-mode'); // Si es true, añade la clase 'dark-mode' al body.
        darkModeToggle.textContent = '☀️'; // Cambia el ícono a sol.
    } else { // Si no está guardado como 'true' (es null o 'false'):
        darkModeToggle.textContent = '🌙'; // Cambia el ícono a luna.
    }

    // Establece el año actual en el pie de página.
    $('#current-year').textContent = new Date().getFullYear(); // Obtiene el año actual y lo inserta en el elemento con ID 'current-year'.

    // *** CAMBIO CLAVE 1: Cargar eventos desde localStorage al inicio ***
    // Intenta obtener los eventos guardados. Si no hay, usa los eventos iniciales definidos.
    const storedEvents = localStorage.getItem('events'); // Intenta recuperar la cadena JSON de eventos desde localStorage.
    if (storedEvents) { // Si se encontraron eventos guardados:
        // Si hay eventos guardados, los parseamos de JSON a objeto JavaScript.
        events = JSON.parse(storedEvents); // Convierte la cadena JSON de vuelta a un array de objetos JavaScript y lo asigna a la variable 'events'.
    } else { // Si no hay eventos guardados (primera visita o localStorage limpio):
        // Si no hay eventos guardados, inicializamos localStorage con los eventos de ejemplo.
        // Esto solo ocurrirá la primera vez que se carga la página o si localStorage se limpia.
        saveEventsToLocalStorage(); // Llama a la función para guardar el array 'events' (que contendrá los datos de ejemplo iniciales) en localStorage.
    }


    // Determina la sección inicial a mostrar.
    const initialHash = window.location.hash.slice(1); // Obtiene el fragmento de la URL (hash) sin el '#' inicial (ej. 'explore' de '#explore').
    if (initialHash) { // Si hay un hash inicial en la URL:
        navigateTo(initialHash); // Navega a la sección indicada por ese hash.
    } else { // Si no hay hash:
        navigateTo('home'); // Navega a la sección de inicio por defecto.
    }

    // Configura la validación en tiempo real para el formulario de creación de eventos.
    setupRealtimeValidation(); // Llama a la función para configurar la validación en el formulario de creación de eventos.
});

// --- 4. Simulación de Datos (Backend Mock) ---
// Array de eventos simulados. En una aplicación real, estos datos vendrían de una API REST.
// NOTA: Este array será sobrescrito por los datos de localStorage si existen.
let events = [ // Declara un array global 'events' que contiene objetos de eventos de ejemplo.
    {
        id: '1',
        title: 'Conferencia de Inteligencia Artificial 2025',
        description: 'Explorando los últimos avances en inteligencia artificial, machine learning y el futuro de la automatización. Únete a expertos de la industria.',
        imageUrl: 'PROYECTO/Imagenes/Conferencia_ai.jpg', // Ruta de la imagen del evento.
        votes: 120,
        category: 'tecnologia',
        date: '2025-07-15',
        comments: [
            { author: 'Juan Perez', text: '¡Muy emocionado por esta conferencia!', date: '2025-05-18T10:00:00Z' },
            { author: 'Maria Gomez', text: 'Espero que haya sesiones sobre IA ética.', date: '2025-05-18T11:30:00Z' }
        ]
    },
    {
        id: '2',
        title: 'Festival de Música en el Parque',
        description: 'Un fin de semana lleno de los mejores artistas de la escena independiente local e internacional. Habrá food trucks y actividades recreativas.',
        imageUrl: 'PROYECTO/Imagenes/Fiesta.jpeg',
        votes: 85,
        category: 'musica',
        date: '2025-08-22',
        comments: []
    },
    {
        id: '3',
        title: 'Exposición de Arte Moderno: "Formas del Silencio"',
        description: 'Una colección curada de obras de arte contemporáneo de artistas emergentes. Explora la expresión a través de diversas técnicas y medios.',
        imageUrl: 'PROYECTO/Imagenes/Arte.jpg',
        votes: 95,
        category: 'arte',
        date: '2025-09-05',
        comments: [
            { author: 'Carlos Lopez', text: '¡Impresionante exhibición! Me encantó la sección de escultura.', date: '2025-05-17T15:00:00Z' }
        ]
    },
    {
        id: '4',
        title: 'Carrera 10KM Ciudad Saludable',
        description: 'Únete a la carrera anual por las calles de la ciudad, promoviendo la salud y el bienestar. Abierta a corredores de todos los niveles.',
        imageUrl: 'PROYECTO/Imagenes/10KM.webp',
        votes: 60,
        category: 'deporte',
        date: '2025-10-10',
        comments: []
    },
    {
        id: '5',
        title: 'Taller de Fotografía Urbana',
        description: 'Aprende técnicas de fotografía callejera con un fotógrafo profesional. Exploraremos los rincones más fotogénicos de la ciudad.',
        imageUrl: 'PROYECTO/Imagenes/FotografiaUrbana.jpg',
        votes: 75,
        category: 'arte',
        date: '2025-07-20',
        comments: []
    }
];

// Usuario logueado simulado. En una aplicación real, esto se manejaría con sesión/token.
const loggedInUser = { // Objeto que simula un usuario logueado.
    name: 'Usuario Ejemplo',
    email: 'usuario@ejemplo.com',
    eventsCreated: [
        { id: '1', title: 'Conferencia de Inteligencia Artificial 2025' },
    ],
    eventsVoted: [
        { id: '2', title: 'Festival de Música Indie en el Parque' },
        { id: '3', title: 'Exposición de Arte Moderno: "Formas del Silencio"' }
    ]
};

// *** NUEVA FUNCIÓN: Guarda el array de eventos en localStorage ***
/**
 * Guarda el array global `events` en el localStorage del navegador.
 * Convierte el array de objetos a una cadena JSON para almacenarlo.
 */
const saveEventsToLocalStorage = () => { // Define una nueva función para guardar datos.
    localStorage.setItem('events', JSON.stringify(events)); // Almacena el array 'events' (convertido a JSON) bajo la clave 'events' en localStorage.
};

// --- 5. Componentes Dinámicos (Generación de HTML con JS) ---

/**
 * Crea y devuelve un elemento de tarjeta de evento (similar a EventoCard.jsx).
 * @param {object} event - Objeto con los datos del evento.
 * @returns {HTMLElement} El elemento HTML de la tarjeta de evento.
 */
const createEventCard = (event) => { // Función que crea y devuelve una tarjeta de evento HTML.
    const card = document.createElement('article'); // Crea un nuevo elemento <article> para la tarjeta.
    card.className = 'event-card card'; // Aplica clases CSS para el estilo y diseño.
    card.setAttribute('aria-labelledby', `event-title-${event.id}`); // Mejora la accesibilidad, vinculando el título con el ID de la tarjeta.

    // Construye el HTML interno de la tarjeta.
    card.innerHTML = `
        <a href="#event-detail-${event.id}" class="event-card-link" data-event-id="${event.id}">
            <div class="event-image-wrapper">
                <img src="${event.imageUrl}" alt="Imagen del evento ${event.title}" loading="lazy">
                <span class="event-category">${event.category}</span>
            </div>
            <div class="event-card-content">
                <h3 id="event-title-${event.id}" class="event-title">${event.title}</h3>
                <p class="event-description">${event.description}</p>
            </div>
        </a>
        <div class="event-card-footer">
            <div class="event-votes">
                <span class="icon">⬆️</span> <span class="vote-count">${event.votes}</span> votos
            </div>
            <button class="btn btn-primary btn-vote" data-event-id="${event.id}" aria-label="Votar por ${event.title}">Votar</button>
        </div>
    `; // Inserta la estructura HTML de la tarjeta, usando los datos del objeto 'event'.

    // Adjunta el evento de clic al botón de votación.
    const voteButton = card.querySelector('.btn-vote'); // Selecciona el botón de votar dentro de la tarjeta.
    voteButton.addEventListener('click', (e) => handleVote(e.target.dataset.eventId)); // Añade un "escuchador" de eventos para el clic, llamando a handleVote.

    // Adjunta el evento de clic a la tarjeta para ver el detalle del evento.
    const eventLink = card.querySelector('.event-card-link'); // Selecciona el enlace principal de la tarjeta.
    eventLink.addEventListener('click', (e) => { // Añade un "escuchador" de eventos para el clic.
        e.preventDefault(); // Evita que el enlace recargue la página.
        const eventId = e.currentTarget.dataset.eventId; // Obtiene el ID del evento del atributo 'data-event-id'.
        loadEventDetail(eventId); // Carga los detalles del evento correspondiente.
        navigateTo('event-detail'); // Navega a la sección de detalle del evento.
    });

    return card; // Devuelve el elemento HTML de la tarjeta completa.
};

/**
 * Genera y devuelve un elemento skeleton loader para una tarjeta de evento.
 * @returns {HTMLElement} El elemento HTML del skeleton loader.
 */
const createEventSkeleton = () => { // Función para crear un "skeleton loader" (animación de carga).
    const skeleton = document.createElement('div'); // Crea un nuevo elemento <div>.
    skeleton.className = 'card skeleton-card'; // Asigna clases CSS para el estilo del skeleton.
    skeleton.innerHTML = `
        <div class="skeleton skeleton-image"></div>
        <div class="p-4">
            <div class="skeleton skeleton-text medium"></div>
            <div class="skeleton skeleton-text large" style="height: 2.5em;"></div>
            <div class="skeleton skeleton-text short"></div>
        </div>
    `; // Inserta el HTML para la estructura del skeleton.
    return skeleton; // Devuelve el elemento HTML del skeleton.
};


// --- 6. Funcionalidades de Eventos ---

/**
 * Carga y muestra los eventos en una cuadrícula específica.
 * @param {string} containerId - El ID del contenedor donde se mostrarán los eventos (ej. 'events-grid').
 * @param {number | null} displayCount - Opcional, el número máximo de eventos a mostrar.
 */
const loadEvents = (containerId = 'events-grid', displayCount = null) => { // Función para cargar y mostrar eventos.
    const eventsGrid = $(`#${containerId}`); // Selecciona el contenedor de la cuadrícula de eventos.
    if (!eventsGrid) return; // Si el contenedor no existe, sale de la función.

    // Muestra skeleton loaders mientras los datos "cargan".
    eventsGrid.innerHTML = ''; // Limpia cualquier contenido existente en la cuadrícula.
    const numberOfSkeletons = displayCount || (window.innerWidth >= 1024 ? 9 : (window.innerWidth >= 768 ? 6 : 3)); // Calcula cuántos skeletons mostrar según el tamaño de la pantalla.
    for (let i = 0; i < numberOfSkeletons; i++) { // Bucle para añadir los skeletons.
        eventsGrid.appendChild(createEventSkeleton()); // Añade un skeleton a la cuadrícula.
    }

    setTimeout(() => { // Simula un retraso de red para la carga de datos.
        eventsGrid.innerHTML = ''; // Limpia los skeletons después del retraso.
        // Ordena los eventos por la fecha más cercana primero (opcional, para explorar)
        const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date)); // Crea una copia de 'events' y la ordena por fecha.
        const eventsToDisplay = displayCount ? sortedEvents.slice(0, displayCount) : sortedEvents; // Limita el número de eventos a mostrar si 'displayCount' está definido.

        if (eventsToDisplay.length === 0) { // Si no hay eventos para mostrar:
            eventsGrid.innerHTML = '<p class="text-center text-medium">Aún no hay eventos disponibles. ¡Sé el primero en crear uno!</p>'; // Muestra un mensaje.
            return; // Sale de la función.
        }

        eventsToDisplay.forEach(event => { // Itera sobre los eventos a mostrar.
            eventsGrid.appendChild(createEventCard(event)); // Añade la tarjeta de cada evento a la cuadrícula.
        });
    }, 1000); // El retraso de simulación es de 1 segundo (1000 milisegundos).
};

/**
 * Maneja el incremento de votos para un evento.
 * @param {string} eventId - El ID del evento a votar.
 */
const handleVote = (eventId) => { // Función para manejar la votación de un evento.
    const event = events.find(e => e.id === eventId); // Encuentra el evento en el array 'events' por su ID.
    if (event) { // Si el evento es encontrado:
        event.votes++; // Incrementa el contador de votos del evento.
        console.log(`Voto registrado para "${event.title}". Votos actuales: ${event.votes}`); // Muestra un mensaje en la consola.

        // Actualizar la vista de la tarjeta de evento sin recargar toda la lista.
        // Esto busca el contador de votos específico en la tarjeta.
        const voteCountElements = $$(`.btn-vote[data-event-id="${eventId}"]`).forEach(button => { // Selecciona todos los botones de votar con el ID del evento.
            const voteCountSpan = button.previousElementSibling.querySelector('.vote-count'); // Encuentra el elemento <span> que muestra el conteo de votos.
            if(voteCountSpan) { // Si el span existe:
                voteCountSpan.textContent = event.votes; // Actualiza el texto del conteo de votos.
                // Pequeña animación visual para el voto (opcional)
                voteCountSpan.style.transition = 'transform 0.1s ease-in-out'; // Añade una transición CSS.
                voteCountSpan.style.transform = 'scale(1.2)'; // Escala el texto ligeramente.
                setTimeout(() => { // Retraso para la animación.
                    voteCountSpan.style.transform = 'scale(1)'; // Vuelve a la escala normal.
                }, 100); // Duración de la animación en milisegundos.
            }
        });

        // *** CAMBIO CLAVE 2: Guardar eventos después de un voto ***
        saveEventsToLocalStorage(); // Llama a la función para guardar el estado actualizado de 'events' en localStorage.
        loadRanking(); // Recarga el ranking para reflejar el cambio de votos en la lista.
    }
};

/**
 * Carga y muestra los detalles de un evento específico.
 * @param {string} eventId - El ID del evento cuyos detalles se mostrarán.
 */
const loadEventDetail = (eventId) => { // Función para cargar los detalles de un evento.
    const eventDetailSection = $('#event-detail-section'); // Selecciona la sección donde se mostrarán los detalles.
    const event = events.find(e => e.id === eventId); // Busca el evento por su ID en el array 'events'.

    if (!event) { // Si el evento no se encuentra:
        eventDetailSection.innerHTML = '<p class="text-error-color text-center p-8">Evento no encontrado. Por favor, vuelve a la página de explorar.</p>'; // Muestra un mensaje de error.
        return; // Sale de la función.
    }

    // Formatea la fecha para mejor lectura.
    const eventDate = new Date(event.date).toLocaleDateString('es-ES', { // Formatea la fecha del evento a un formato legible.
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    eventDetailSection.innerHTML = `
        <div class="event-detail-container card">
            <h2 id="event-detail-heading" class="section-title">${event.title}</h2>
            <img src="${event.imageUrl}" alt="Imagen de ${event.title}" class="event-detail-image">
            <p class="event-detail-date"><strong>Fecha:</strong> ${eventDate}</p>
            <p class="event-detail-category"><strong>Categoría:</strong> <span class="event-category-pill">${event.category}</span></p>
            <p class="event-detail-description">${event.description}</p>

            <div class="event-detail-actions flex items-center gap-4 my-4">
                <div class="event-votes text-lg font-bold">
                    <span class="icon">⬆️</span> <span class="vote-count">${event.votes}</span> votos
                </div>
                <button class="btn btn-primary btn-vote" data-event-id="${event.id}" aria-label="Votar por ${event.title}">Votar</button>
            </div>

            <section class="comments-section" aria-labelledby="comments-heading">
                <h3 id="comments-heading">Comentarios</h3>
                <div id="comments-list" class="comments-list">
                    </div>
                <form id="comment-form" class="comment-form my-4" aria-live="polite">
                    <div class="form-group">
                        <label for="comment-author" class="sr-only">Tu nombre:</label>
                        <input type="text" id="comment-author" placeholder="Tu nombre" required aria-required="true">
                    </div>
                    <div class="form-group">
                        <label for="comment-text" class="sr-only">Tu comentario:</label>
                        <textarea id="comment-text" rows="3" placeholder="Añade un comentario..." required aria-required="true"></textarea>
                    </div>
                    <button type="submit" class="btn btn-secondary">Añadir Comentario</button>
                    <div id="comment-message" class="message-area" role="status" aria-live="polite"></div>
                </form>
            </section>
        </div>
    `; // Inserta la estructura HTML para los detalles del evento, incluyendo comentarios y formulario.

    // Renderiza los comentarios iniciales.
    renderComments(event.comments); // Llama a la función para mostrar los comentarios del evento.

    // Re-adjunta el evento de votación (importante porque el HTML se ha re-renderizado).
    const voteButton = eventDetailSection.querySelector('.btn-vote'); // Selecciona el botón de votar en la sección de detalle.
    if (voteButton) { // Si el botón existe:
        voteButton.addEventListener('click', (e) => { // Añade un "escuchador" de eventos para el clic.
            handleVote(e.target.dataset.eventId); // Llama a handleVote para procesar el voto.
            // Actualiza solo el contador de votos en la vista de detalle.
            const voteCountElement = eventDetailSection.querySelector('.vote-count'); // Selecciona el elemento del conteo de votos.
            if (voteCountElement) voteCountElement.textContent = event.votes; // Actualiza el texto del conteo de votos.
        });
    }

    // Adjunta el evento de submit para el formulario de comentarios.
    const commentForm = $('#comment-form'); // Selecciona el formulario de comentarios.
    if (commentForm) { // Si el formulario existe:
        commentForm.addEventListener('submit', (e) => { // Añade un "escuchador" de eventos para el envío del formulario.
            e.preventDefault(); // Previene el envío por defecto del formulario (recarga de página).
            const authorInput = $('#comment-author'); // Selecciona el campo de autor del comentario.
            const textInput = $('#comment-text'); // Selecciona el campo de texto del comentario.
            const commentMessageArea = $('#comment-message'); // Selecciona el área de mensajes para comentarios.

            const author = authorInput.value.trim(); // Obtiene el valor del autor y elimina espacios en blanco.
            const text = textInput.value.trim(); // Obtiene el valor del comentario y elimina espacios en blanco.

            if (author && text) { // Si el autor y el texto no están vacíos:
                const newComment = { // Crea un nuevo objeto de comentario.
                    author: author,
                    text: text,
                    date: new Date().toISOString() // Genera la fecha actual en formato ISO.
                };
                event.comments.push(newComment); // Añade el nuevo comentario al array de comentarios del evento.

                // *** CAMBIO CLAVE 3: Guardar eventos después de añadir un comentario ***
                saveEventsToLocalStorage(); // Llama a la función para guardar el estado actualizado de 'events' (con el nuevo comentario) en localStorage.

                showMessage(commentMessageArea, 'Comentario añadido exitosamente!', 'success'); // Muestra un mensaje de éxito.
                commentForm.reset(); // Limpia el formulario de comentarios.
                renderComments(event.comments); // Vuelve a renderizar la lista de comentarios para incluir el nuevo.
            } else { // Si el autor o el texto están vacíos:
                showMessage(commentMessageArea, 'Por favor, completa tu nombre y comentario.', 'error'); // Muestra un mensaje de error.
            }
        });
    }
};

/**
 * Renderiza la lista de comentarios para un evento dado.
 * @param {Array<object>} comments - Array de objetos de comentario.
 */
const renderComments = (comments) => { // Función para renderizar la lista de comentarios.
    const commentsList = $('#comments-list'); // Selecciona el contenedor de la lista de comentarios.
    if (!commentsList) return; // Si el contenedor no existe, sale de la función.

    if (comments.length === 0) { // Si no hay comentarios:
        commentsList.innerHTML = '<p class="no-comments">Sé el primero en comentar este evento.</p>'; // Muestra un mensaje.
        return; // Sale de la función.
    }

    // Ordena los comentarios por fecha, los más recientes primero.
    const sortedComments = [...comments].sort((a, b) => new Date(b.date) - new Date(a.date)); // Crea una copia y ordena los comentarios por fecha descendente.

    commentsList.innerHTML = sortedComments.map(comment => `
        <div class="comment-item">
            <p class="comment-author"><strong>${comment.author}</strong> <span class="comment-date">${new Date(comment.date).toLocaleDateString('es-ES')}</span></p>
            <p class="comment-text">${comment.text}</p>
        </div>
    `).join(''); // Mapea cada comentario a una cadena HTML y los une para formar la lista.
};


/**
 * Carga y muestra el ranking de eventos ordenados por votos.
 */
const loadRanking = () => { // Función para cargar y mostrar el ranking de eventos.
    const rankingListContainer = $('#ranking-list'); // Selecciona el contenedor de la lista de ranking.
    if (!rankingListContainer) return; // Si el contenedor no existe, sale de la función.

    // Ordena los eventos por número de votos de mayor a menor.
    const sortedEvents = [...events].sort((a, b) => b.votes - a.votes); // Crea una copia y ordena los eventos por votos descendente.

    if (sortedEvents.length === 0) { // Si no hay eventos votados:
        rankingListContainer.innerHTML = '<p class="text-center text-medium">Aún no hay eventos votados.</p>'; // Muestra un mensaje.
        return; // Sale de la función.
    }

    // Genera el HTML de la lista ordenada del ranking.
    rankingListContainer.innerHTML = `
        <ol class="ranking-ordered-list">
            ${sortedEvents.map((event, index) => `
                <li class="ranking-item card flex items-center justify-between">
                    <span class="ranking-number">${index + 1}.</span>
                    <a href="#event-detail-${event.id}" data-event-id="${event.id}" class="ranking-link">
                        ${event.title}
                    </a>
                    <span class="ranking-votes">${event.votes} votos</span>
                </li>
            `).join('')}
        </ol>
    `; // Mapea cada evento a un elemento de lista HTML para el ranking y los une.

    // Adjunta eventos de clic a los enlaces de los eventos en el ranking.
    rankingListContainer.querySelectorAll('.ranking-link').forEach(link => { // Selecciona todos los enlaces del ranking.
        link.addEventListener('click', (e) => { // Añade un "escuchador" de eventos para el clic.
            e.preventDefault(); // Evita que el enlace recargue la página.
            const eventId = e.target.dataset.eventId; // Obtiene el ID del evento.
            loadEventDetail(eventId); // Carga los detalles de ese evento.
            navigateTo('event-detail'); // Navega a la sección de detalle.
        });
    });
};

/**
 * Carga y muestra la información del perfil del usuario simulado.
 */
const loadProfile = () => { // Función para cargar la información del perfil.
    const profileContent = $('#profile-content'); // Selecciona el contenedor del contenido del perfil.
    if (!profileContent) return; // Si el contenedor no existe, sale de la función.

    // Si no hay un usuario logueado (en un caso real), mostrar un mensaje.
    if (!loggedInUser) { // Si no hay un usuario logueado simulado:
        profileContent.innerHTML = '<p class="text-center text-error-color p-8">Por favor, inicia sesión para ver tu perfil.</p>'; // Muestra un mensaje.
        return; // Sale de la función.
    }

    profileContent.innerHTML = `
        <h3 class="text-2xl font-bold mb-4">¡Hola, ${loggedInUser.name}!</h3>
        <p class="mb-2"><strong class="font-semibold">Email:</strong> ${loggedInUser.email}</p>

        <h4 class="text-xl font-semibold mt-6 mb-3">Tus Eventos Creados:</h4>
        ${loggedInUser.eventsCreated.length > 0 ? `
            <ul class="list-disc pl-5 space-y-1">
                ${loggedInUser.eventsCreated.map(event => `
                    <li><a href="#event-detail-${event.id}" data-event-id="${event.id}" class="text-primary-color hover:underline">${event.title}</a></li>
                `).join('')}
            </ul>
        ` : '<p class="text-medium italic">Aún no has creado ningún evento.</p>'}

        <h4 class="text-xl font-semibold mt-6 mb-3">Eventos por los que Has Votado:</h4>
        ${loggedInUser.eventsVoted.length > 0 ? `
            <ul class="list-disc pl-5 space-y-1">
                ${loggedInUser.eventsVoted.map(event => `
                    <li><a href="#event-detail-${event.id}" data-event-id="${event.id}" class="text-primary-color hover:underline">${event.title}</a></li>
                `).join('')}
            </ul>
        ` : '<p class="text-medium italic">Aún no has votado por ningún evento.</p>'}
    `; // Inserta el HTML con la información del perfil, eventos creados y eventos votados.

    // Adjunta eventos a los enlaces de eventos dentro del perfil.
    profileContent.querySelectorAll('[data-event-id]').forEach(link => { // Selecciona todos los enlaces de eventos en el perfil.
        link.addEventListener('click', (e) => { // Añade un "escuchador" de eventos para el clic.
            e.preventDefault(); // Evita la recarga de página.
            const eventId = e.target.dataset.eventId; // Obtiene el ID del evento.
            loadEventDetail(eventId); // Carga los detalles del evento.
            navigateTo('event-detail'); // Navega a la sección de detalle.
        });
    });
};


// --- 7. Validación de Formularios (Login, Registro, Crear Evento, Newsletter) ---

// Función genérica para validar un campo (requerido, longitud, regex, etc.)
const validateField = (inputElement, errorMessageElement, validationRules = {}) => { // Función para validar un campo de formulario.
    let isValid = true; // Bandera para el estado de validación.
    let message = ''; // Mensaje de error.

    // Remueve clases de error previas.
    inputElement.classList.remove('error'); // Elimina la clase 'error' del input.
    errorMessageElement.textContent = ''; // Borra el texto del mensaje de error.
    errorMessageElement.style.display = 'none'; // Oculta el elemento del mensaje de error.

    const value = inputElement.value.trim(); // Obtiene el valor del input y elimina espacios en blanco.

    // Regla: requerido
    if (validationRules.required && value === '') { // Si el campo es requerido y está vacío:
        isValid = false; // El campo no es válido.
        message = 'Este campo es obligatorio.'; // Establece el mensaje de error.
    }
    // Regla: longitud mínima
    else if (validationRules.minLength && value.length < validationRules.minLength) { // Si hay una longitud mínima y no se cumple:
        isValid = false; // El campo no es válido.
        message = `Debe tener al menos ${validationRules.minLength} caracteres.`; // Establece el mensaje de error.
    }
    // Regla: longitud máxima
    else if (validationRules.maxLength && value.length > validationRules.maxLength) { // Si hay una longitud máxima y se excede:
        isValid = false; // El campo no es válido.
        message = `No debe exceder ${validationRules.maxLength} caracteres.`; // Establece el mensaje de error.
    }
    // Regla: formato de email (usa la validación nativa de HTML5 para type="email")
    else if (inputElement.type === 'email' && !inputElement.checkValidity()) { // Si es un input de tipo email y no es válido según HTML5:
        isValid = false; // El campo no es válido.
        message = 'Introduce un email válido.'; // Establece el mensaje de error.
    }
    // Regla: formato de URL (usa la validación nativa de HTML5 para type="url")
    else if (inputElement.type === 'url' && value !== '' && !inputElement.checkValidity()) { // Si es un input de tipo URL, no está vacío y no es válido según HTML5:
        isValid = false; // El campo no es válido.
        message = 'Introduce una URL válida.'; // Establece el mensaje de error.
    }
    // Regla: selección de opción (para selects)
    else if (inputElement.tagName === 'SELECT' && value === '') { // Si es un <select> y no se ha seleccionado ninguna opción:
        isValid = false; // El campo no es válido.
        message = 'Por favor, selecciona una opción.'; // Establece el mensaje de error.
    }
    // Regla: fecha (solo para inputs type="date")
    else if (inputElement.type === 'date' && !inputElement.checkValidity()) { // Si es un input de tipo date y no es válido según HTML5:
        isValid = false; // El campo no es válido.
        message = 'Introduce una fecha válida.'; // Establece el mensaje de error.
    }


    if (!isValid) { // Si el campo no es válido:
        inputElement.classList.add('error'); // Añade la clase 'error' al input para aplicar estilos de error.
        errorMessageElement.textContent = message; // Muestra el mensaje de error.
        errorMessageElement.style.display = 'block'; // Hace visible el elemento del mensaje de error.
        inputElement.focus(); // Enfoca el campo con error para que el usuario lo corrija.
    }

    return isValid; // Devuelve true si el campo es válido, false en caso contrario.
};

/**
 * Configura la validación en tiempo real para el formulario de creación de eventos.
 */
const setupRealtimeValidation = () => { // Función para configurar la validación en tiempo real en el formulario de creación de eventos.
    const fieldsToValidate = [ // Define una lista de campos a validar con sus reglas.
        { id: 'event-title', rules: { required: true, minLength: 5, maxLength: 100 } },
        { id: 'event-description', rules: { required: true, minLength: 20 } },
        { id: 'event-date', rules: { required: true } }, // HTML5 handle date validation
        { id: 'event-image', rules: {} }, // HTML5 handle URL validation if not empty
        { id: 'event-category', rules: { required: true } },
    ];

    fieldsToValidate.forEach(field => { // Itera sobre cada campo a validar.
        const input = $(`#${field.id}`); // Selecciona el elemento input.
        const errorElement = $(`#error-${field.id.replace('event-', '')}`); // Selecciona el elemento donde mostrar el error.
        if (input && errorElement) { // Si el input y el elemento de error existen:
            input.addEventListener('input', () => { // Añade un "escuchador" para el evento 'input' (mientras el usuario escribe).
                validateField(input, errorElement, field.rules); // Valida el campo en tiempo real.
            });
            input.addEventListener('blur', () => { // Valida también al salir del campo (evento 'blur').
                validateField(input, errorElement, field.rules); // Valida el campo al perder el foco.
            });
        }
    });
};

// Formulario de Creación de Eventos
const createEventForm = $('#create-event-form'); // Selecciona el formulario de creación de eventos.
const formMessageArea = $('#form-message'); // Selecciona el área donde se mostrarán los mensajes del formulario.

createEventForm.addEventListener('submit', (e) => { // Añade un "escuchador" de eventos para el envío del formulario.
    e.preventDefault(); // Detiene el envío por defecto del formulario (evita la recarga de la página).

    let formIsValid = true; // Bandera para la validación general del formulario.
    const eventData = {}; // Objeto para almacenar los datos del evento.

    // Validar cada campo del formulario.
    const fields = [ // Define los campos del formulario con sus IDs, nombres y reglas de validación.
        { id: 'event-title', name: 'title', rules: { required: true, minLength: 5, maxLength: 100 } },
        { id: 'event-description', name: 'description', rules: { required: true, minLength: 20 } },
        { id: 'event-date', name: 'date', rules: { required: true } },
        { id: 'event-image', name: 'imageUrl', rules: {} },
        { id: 'event-category', name: 'category', rules: { required: true } },
    ];

    fields.forEach(field => { // Itera sobre cada campo del formulario.
        const input = $(`#${field.id}`); // Selecciona el elemento input.
        const errorElement = $(`#error-${field.name}`); // Selecciona el elemento de error asociado.
        // Si validateField devuelve false, significa que hay un error en al menos un campo.
        if (!validateField(input, errorElement, field.rules)) { // Valida el campo y actualiza 'formIsValid' si hay un error.
            formIsValid = false; // Si un campo no es válido, todo el formulario no es válido.
        }
        eventData[field.name] = input.value.trim(); // Almacena el valor del campo (sin espacios) en el objeto 'eventData'.
    });

    if (formIsValid) { // Si el formulario es completamente válido:
        // Asigna una URL de imagen por defecto si el usuario no proporciona una.
        if (!eventData.imageUrl) { // Si no se proporcionó una URL de imagen:
            eventData.imageUrl = 'public/images/event-placeholder.jpg'; // Asigna una imagen por defecto.
        }

        // *** CAMBIO CLAVE 4: Genera un ID más robusto para el nuevo evento ***
        // Usamos Date.now() y un pequeño string aleatorio para mayor unicidad
        const newEvent = { // Crea un nuevo objeto de evento con los datos del formulario.
            id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Genera un ID único basado en la marca de tiempo y un string aleatorio.
            title: eventData.title,
            description: eventData.description,
            imageUrl: eventData.imageUrl,
            votes: 0, // Inicializa los votos en 0 para un nuevo evento.
            category: eventData.category,
            date: eventData.date,
            comments: [] // Un nuevo evento no tiene comentarios al inicio.
        };
        events.push(newEvent); // Añade el nuevo evento al array global 'events'.

        // *** CAMBIO CLAVE 5: Guardar eventos después de crear uno nuevo ***
        saveEventsToLocalStorage(); // Llama a la función para guardar el array 'events' (ahora con el nuevo evento) en localStorage.

        showMessage(formMessageArea, 'Evento creado exitosamente!', 'success'); // Muestra un mensaje de éxito al usuario.
        createEventForm.reset(); // Limpia todos los campos del formulario.
        // Limpiar los mensajes de error después de un envío exitoso.
        fields.forEach(field => { // Itera sobre los campos para limpiar cualquier mensaje de error anterior.
            $(`#error-${field.name}`).textContent = ''; // Borra el texto de error.
            $(`#error-${field.name}`).style.display = 'none'; // Oculta el elemento de error.
            $(`#${field.id}`).classList.remove('error'); // Remueve la clase 'error' del input.
        });

        console.log('Nuevo evento:', newEvent); // Registra el nuevo evento en la consola.
        // Redirige al usuario a la sección de explorar eventos después de crear uno.
        setTimeout(() => navigateTo('explore'), 1500); // Espera 1.5 segundos y luego navega a la sección 'explore'.

    } else { // Si el formulario no es válido:
        showMessage(formMessageArea, 'Por favor, corrige los errores en el formulario.', 'error'); // Muestra un mensaje de error general.
    }
});

// --- FIN DEL ARCHIVO script.js ---