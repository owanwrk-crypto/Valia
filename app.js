// Credenciales de Supabase
const URL_VALIA = "https://ietudbyosupknisbfhlj.supabase.co"; 
const KEY_VALIA = "sb_publishable_wzDzxlSwdpKw4ok4J1qPPA_1eabsV4P";
const _sb = supabase.createClient(URL_VALIA, KEY_VALIA);

// --- ESTADO GLOBAL ---
let materialesData = []; // Para almacenar los datos cargados y facilitar filtrado
let currentFilter = localStorage.getItem('filtro_categoria') || 'all';
let currentSearch = ""; // Para el filtro por texto

// --- UTILIDADES ---

// Formatear moneda: $1,234.56
function formatCurrency(value) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2
    }).format(value);
}

// Formatear fecha y hora
function formatDateTime(date) {
    return new Intl.DateTimeFormat('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(date);
}

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

// Cálculo en tiempo real del costo unitario
function calcularCostoUnitario() {
    const costoLote = parseFloat(document.getElementById('matCostoLote').value) || 0;
    const cantidad = parseFloat(document.getElementById('matStock').value) || 0;
    const displayUnitario = document.getElementById('matCostoUnitario');

    if (costoLote < 0 || cantidad < 0) {
        displayUnitario.value = "Error: Negativo";
        displayUnitario.style.color = "#ff4444";
        return;
    }

    if (cantidad > 0) {
        const unitario = costoLote / cantidad;
        displayUnitario.value = unitario.toFixed(2);
        displayUnitario.style.color = "var(--accent)";
    } else {
        displayUnitario.value = "0.00";
        displayUnitario.style.color = "var(--accent)";
    }
}

// Cargar materiales desde Supabase
async function cargarMateriales() {
    console.log("Cargando materiales y calculando totales...");
    const tableBody = document.getElementById('materialesTableBody');
    const tableFoot = document.getElementById('inventoryTableFoot');
    const filterSelect = document.getElementById('filterCategoria');
    
    // Sincronizar select con estado guardado
    if (filterSelect) filterSelect.value = currentFilter;

    try {
        const { data, error } = await _sb
            .from('materiales')
            .select('*')
            .order('categoria', { ascending: true })
            .order('nombre', { ascending: true });

        if (error) throw error;

        materialesData = data || []; // Guardamos copia en estado global
        renderTablaMateriales(); // Llamamos a la función de renderizado
        
    } catch (err) {
        console.error("Error al cargar materiales:", err.message);
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #ff4444; padding: 20px;">Error al cargar datos.</td></tr>`;
    }
}

// Función para renderizar la tabla con filtrado aplicado (Texto + Categoría)
function renderTablaMateriales() {
    const tableBody = document.getElementById('materialesTableBody');
    const tableFoot = document.getElementById('inventoryTableFoot');
    
    // 1. Filtrar por Categoría
    let filteredData = currentFilter === 'all' 
        ? materialesData 
        : materialesData.filter(m => m.categoria === currentFilter);

    // 2. Filtrar por Texto (Nombre)
    if (currentSearch) {
        const searchLower = currentSearch.toLowerCase();
        filteredData = filteredData.filter(m => 
            m.nombre.toLowerCase().includes(searchLower) || 
            m.categoria.toLowerCase().includes(searchLower)
        );
    }

    if (filteredData.length > 0) {
        tableBody.innerHTML = '';
        tableFoot.innerHTML = '';

        let currentCategory = "";
        let categorySubtotal = 0;
        let totalGeneral = 0;
        let totalSkus = filteredData.length;
        let uniqueCategories = new Set();

        filteredData.forEach((mat, index) => {
            const lineTotal = (mat.costo_compra || 0) * (mat.stock_actual || 0);
            totalGeneral += lineTotal;
            uniqueCategories.add(mat.categoria);

            if (currentCategory !== "" && currentCategory !== mat.categoria) {
                renderSubtotalRow(tableBody, currentCategory, categorySubtotal);
                categorySubtotal = 0;
            }

            currentCategory = mat.categoria;
            categorySubtotal += lineTotal;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${mat.nombre}</strong></td>
                <td><span class="badge">${mat.categoria}</span></td>
                <td>${formatCurrency(mat.costo_compra)}</td>
                <td>${mat.unidad_medida}</td>
                <td style="color: ${mat.stock_actual <= mat.stock_minimo ? '#ff4444' : '#00ff88'}">
                    ${mat.stock_actual}
                </td>
                <td>${formatCurrency(lineTotal)}</td>
                <td>
                    <button class="btn-delete" onclick="eliminarMaterial(${mat.id}, '${mat.nombre.replace(/'/g, "\\'")}')" title="Eliminar registro">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);

            if (index === filteredData.length - 1) {
                renderSubtotalRow(tableBody, currentCategory, categorySubtotal);
            }
        });

        const footRow = document.createElement('tr');
        footRow.className = "total-row";
        footRow.innerHTML = `
            <td colspan="5" style="text-align: right;">TOTAL FILTRADO:</td>
            <td>${formatCurrency(totalGeneral)}</td>
            <td></td>
        `;
        tableFoot.appendChild(footRow);

        // Actualizar Dashboard con datos filtrados o globales (usamos filtrados para el contexto)
        document.getElementById('totalSkus').innerText = filteredData.length;
        document.getElementById('totalCategories').innerText = uniqueCategories.size;
        document.getElementById('totalInventoryValue').innerText = formatCurrency(totalGeneral);
        document.getElementById('lastUpdate').innerText = formatDateTime(new Date());

    } else {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 40px; color: rgba(255,255,255,0.3);">No hay materiales que coincidan con el filtro.</td></tr>`;
        tableFoot.innerHTML = '';
        document.getElementById('totalSkus').innerText = "0";
        document.getElementById('totalCategories').innerText = "0";
        document.getElementById('totalInventoryValue').innerText = "$0.00";
    }
}

// Lógica de filtrado combinada
function filtrarInventario() {
    const searchInput = document.getElementById('searchMaterial');
    const categorySelect = document.getElementById('filterCategoria');

    if (searchInput) currentSearch = searchInput.value.trim();
    if (categorySelect) {
        currentFilter = categorySelect.value;
        localStorage.setItem('filtro_categoria', currentFilter);
    }

    renderTablaMateriales();
}

// Lógica de eliminación
async function eliminarMaterial(id, nombre) {
    if (!confirm(`¿Está seguro de eliminar este registro?\n\nMaterial: ${nombre}\nEsta acción es permanente.`)) {
        return;
    }

    try {
        const { error } = await _sb
            .from('materiales')
            .delete()
            .eq('id', id);

        if (error) throw error;

        alert("✅ Registro eliminado con éxito.");
        cargarMateriales(); // Recargar datos de Supabase

    } catch (err) {
        console.error("Error al eliminar:", err.message);
        alert("❌ Error al eliminar el registro: " + err.message);
    }
}

// Renderizar fila de subtotal
function renderSubtotalRow(container, category, amount) {
    const subRow = document.createElement('tr');
    subRow.style.background = "rgba(255, 255, 255, 0.02)";
    subRow.style.fontStyle = "italic";
    subRow.innerHTML = `
        <td colspan="5" style="text-align: right; color: rgba(255,255,255,0.5);">Subtotal ${category}:</td>
        <td style="color: rgba(255,255,255,0.7);">${formatCurrency(amount)}</td>
    `;
    container.appendChild(subRow);
}

// --- EXPORTACIÓN ---

function exportarExcel() {
    console.log("Exportando a Excel...");
    const table = document.getElementById('inventoryTable');
    const wb = XLSX.utils.table_to_book(table, { sheet: "Inventario" });
    XLSX.writeFile(wb, `Inventario_Valia_${new Date().toISOString().split('T')[0]}.xlsx`);
}

function exportarPDF() {
    console.log("Exportando a PDF...");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Valia Pro - Reporte de Inventario", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generado el: ${formatDateTime(new Date())}`, 14, 30);

    doc.autoTable({
        html: '#inventoryTable',
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        styles: { fontSize: 8 }
    });

    doc.save(`Inventario_Valia_${new Date().toISOString().split('T')[0]}.pdf`);
}

// Guardar nuevo material
async function guardarNuevoMaterial() {
    const nombre = document.getElementById('matNombre').value.trim();
    const categoria = document.getElementById('matCategoria').value;
    const costoLote = parseFloat(document.getElementById('matCostoLote').value) || 0;
    const unidad = document.getElementById('matUnidad').value;
    const stock = parseFloat(document.getElementById('matStock').value) || 0;
    const costoUnitario = stock > 0 ? (costoLote / stock) : 0;

    if (!nombre) {
        alert("⚠️ Por favor ingresa el nombre del material.");
        return;
    }

    if (costoLote < 0 || stock < 0) {
        alert("❌ No se permiten valores negativos.");
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
                costo_compra: costoUnitario, // Guardamos el unitario como costo de compra
                unidad_medida: unidad,
                stock_actual: stock,
                stock_minimo: 5 // Valor por defecto
            }]);

        if (error) throw error;

        alert("✅ Material guardado correctamente");
        
        // Limpiar formulario
        document.getElementById('matNombre').value = '';
        document.getElementById('matCostoLote').value = '';
        document.getElementById('matStock').value = '';
        document.getElementById('matCostoUnitario').value = '0.00';
        
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
window.calcularCostoUnitario = calcularCostoUnitario;
window.exportarExcel = exportarExcel;
window.exportarPDF = exportarPDF;
window.filtrarInventario = filtrarInventario;
window.eliminarMaterial = eliminarMaterial;
