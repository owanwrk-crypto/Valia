// VERIFICACIÓN DE SESIÓN
const usuarioLogueado = JSON.parse(localStorage.getItem('valia_user'));

if (!usuarioLogueado) {
    window.location.href = 'index.html';
}

// Opcional: Mostrar nombre en la interfaz
document.addEventListener('DOMContentLoaded', () => {
    const headerP = document.querySelector('header p');
    if(headerP) headerP.innerText = `Sesión iniciada: ${usuarioLogueado.nombre}`;
});

function logout() {
    localStorage.removeItem('valia_user');
    window.location.href = 'index.html';
}// PROTECCIÓN DE RUTA
(function() {
    const session = localStorage.getItem('valia_token');
    if (!session) {
        window.location.href = 'index.html';
    }
})();

// BOTÓN CERRAR SESIÓN (Añadir esta función para usarla en un botón si quieres)
function cerrarSesion() {
    localStorage.removeItem('valia_token');
    window.location.href = 'index.html';
}