// ... (Aquí van tus credenciales de Supabase y funciones de carga de datos) ...

// FUNCIÓN PARA CAMBIAR DE PESTAÑA
function switchTab(tabId) {
    // 1. Ocultar todos los contenidos de pestaña
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // 2. Quitar el estado 'active' de los botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // 3. Mostrar la pestaña seleccionada
    document.getElementById(tabId).classList.add('active');

    // 4. Activar el botón correspondiente
    event.currentTarget.classList.add('active');
}

// LOGICA DE LOGIN ACTUALIZADA PARA CAMBIO DE VISTA
async function intentarLogin() {
    const userTyped = document.getElementById('userInput').value.trim();
    if(!userTyped || pass.length < 4) return alert("Datos incompletos");

    const { data, error } = await _sb
        .from('usuarios')
        .select('*')
        .ilike('nombre', userTyped)
        .eq('pin', pass)
        .single();

    if (data) {
        localStorage.setItem('valia_user', JSON.stringify(data));
        mostrarApp(); // En lugar de redireccionar, cambiamos la vista
    } else {
        alert("Acceso Denegado");
        clearPin();
    }
}

function mostrarApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'block';
    document.getElementById('userNameDisplay').innerText = `Hola, ${JSON.parse(localStorage.getItem('valia_user')).nombre}`;
    // Aquí disparas la carga de materiales
    cargarMateriales(); 
}