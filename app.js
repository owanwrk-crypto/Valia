// PROTECCIÓN DE RUTA
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