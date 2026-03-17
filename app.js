// Credenciales de Supabase
const URL_VALIA = "https://ietudbyosupknisbfhlj.supabase.co"; 
const KEY_VALIA = "sb_publishable_wzDzxlSwdpKw4ok4J1qPPA_1eabsV4P";
const _sb = supabase.createClient(URL_VALIA, KEY_VALIA);

// FUNCIÓN PARA CAMBIAR DE PESTAÑA
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// --- LÓGICA DE INVENTARIO ---

// Cargar materiales desde Supabase
async function cargarMateriales() {
    console.log("Cargando materiales...");
    const tableBody = document.getElementById('materialesTableBody');
    
    try {
        const { data, error } = await _sb
            .from('materiales')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
            tableBody.innerHTML = '';
            data.forEach(mat => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><strong>${mat.nombre}</strong></td>
                    <td><span class="badge">${mat.categoria}</span></td>
                    <td>$${parseFloat(mat.costo_compra).toFixed(2)}</td>
                    <td>${mat.unidad_medida}</td>
                    <td style="color: ${mat.stock_actual <= mat.stock_minimo ? '#ff4444' : '#00ff88'}">
                        ${mat.stock_actual}
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 40px; color: rgba(255,255,255,0.3);">No hay materiales registrados.</td></tr>`;
        }
    } catch (err) {
        console.error("Error al cargar materiales:", err.message);
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #ff4444; padding: 20px;">Error al cargar datos.</td></tr>`;
    }
}

// Guardar nuevo material
async function guardarNuevoMaterial() {
    const nombre = document.getElementById('matNombre').value.trim();
    const categoria = document.getElementById('matCategoria').value;
    const costo = parseFloat(document.getElementById('matCosto').value) || 0;
    const unidad = document.getElementById('matUnidad').value;
    const stock = parseFloat(document.getElementById('matStock').value) || 0;

    if (!nombre) {
        alert("⚠️ Por favor ingresa el nombre del material.");
        return;
    }

    const btn = event.target;
    btn.disabled = true;
    btn.innerText = "GUARDANDO...";

    try {
        const { error } = await _sb
            .from('materiales')
            .insert([{
                nombre,
                categoria,
                costo_compra: costo,
                unidad_medida: unidad,
                stock_actual: stock,
                stock_minimo: 5 // Valor por defecto
            }]);

        if (error) throw error;

        alert("✅ Material guardado correctamente");
        
        // Limpiar formulario
        document.getElementById('matNombre').value = '';
        document.getElementById('matCosto').value = '';
        document.getElementById('matStock').value = '';
        
        // Recargar tabla
        cargarMateriales();

    } catch (err) {
        console.error("Error al guardar:", err.message);
        alert("❌ Error al guardar el material: " + err.message);
    } finally {
        btn.disabled = false;
        btn.innerText = "GUARDAR MATERIAL";
    }
}

// Exportar funciones si es necesario
window.switchTab = switchTab;
window.cargarMateriales = cargarMateriales;
window.guardarNuevoMaterial = guardarNuevoMaterial;
