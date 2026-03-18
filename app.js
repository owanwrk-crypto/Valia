// Credenciales de Supabase
const URL_VALIA = "https://ietudbyosupknisbfhlj.supabase.co"; 
const KEY_VALIA = "sb_publishable_wzDzxlSwdpKw4ok4J1qPPA_1eabsV4P";
const _sb = supabase.createClient(URL_VALIA, KEY_VALIA);
// --- ESTADO GLOBAL ---
let materialesData = []; // Para almacenar los datos cargados y facilitar filtrado
let serviciosData = []; // Nuevos: servicios (diseño, planchado, etc)
let currentFilter = localStorage.getItem('filtro_categoria') || 'all';
let currentSearch = ""; // Para el filtro por texto
let cotizacionActual = []; // Para la pestaña de cotizaciones
let ventasDelDia = []; // Nuevas: ventas guardadas hoy
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
// NUEVO: Cargar servicios desde Supabase
async function cargarServicios() {
    console.log("Cargando servicios...");
    try {
        const { data, error } = await _sb
            .from('servicios')
            .select('*')
            .order('categoria', { ascending: true })
            .order('nombre', { ascending: true });
        if (error && error.code !== 'PGRST116') throw error; // Ignorar si tabla no existe
        serviciosData = data || [];
        console.log(`✅ Servicios cargados: ${serviciosData.length} items`);
    } catch (err) {
        console.warn("Servicios no disponibles:", err.message);
        serviciosData = [];
    }
}
// NUEVO: Variables globales para productos
let productosData = [];
let currentFilterProducto = 'all';
let currentSearchProducto = '';
// NUEVO: Cargar productos con costos detallados
async function cargarProductos() {
    console.log("Cargando productos con costos detallados...");
    const tableBody = document.getElementById('productosTableBody');
    const tableFoot = document.getElementById('productosTableFoot');
    const filterSelect = document.getElementById('filterCategoriaProducto');
    // Sincronizar select con estado guardado
    if (filterSelect) filterSelect.value = currentFilterProducto;
    try {
        const { data, error } = await _sb
            .from('productos')
            .select('*')
            .order('categoria', { ascending: true })
            .order('nombre', { ascending: true });
        if (error && error.code !== 'PGRST116') throw error; // Ignorar si tabla no existe
        productosData = data || [];
        renderTablaProductos();
        actualizarEstadisticasProductos();
    } catch (err) {
        console.warn("Productos no disponibles:", err.message);
        productosData = [];
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: rgba(255,255,255,0.3); padding: 40px;">Tabla de productos no disponible.</td></tr>`;
    }
}
// NUEVO: Renderizar tabla de productos con filtrado
function renderTablaProductos() {
    const tableBody = document.getElementById('productosTableBody');
    const tableFoot = document.getElementById('productosTableFoot');
    // Aplicar filtros
    let productosFiltrados = productosData.filter(producto => {
        const matchCategoria = currentFilterProducto === 'all' || producto.categoria === currentFilterProducto;
        const matchSearch = currentSearchProducto === '' || 
            producto.nombre.toLowerCase().includes(currentSearchProducto.toLowerCase()) ||
            (producto.descripcion && producto.descripcion.toLowerCase().includes(currentSearchProducto.toLowerCase()));
        return matchCategoria && matchSearch;
    });
    if (productosFiltrados.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: rgba(255,255,255,0.3); padding: 40px;">No se encontraron productos.</td></tr>`;
        tableFoot.innerHTML = '';
        return;
    }
    // Renderizar filas
    let html = '';
    let totalCosto = 0;
    let totalPrecio = 0;
    productosFiltrados.forEach(producto => {
        const costoFormato = new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(producto.costo_total || 0);
        const precioFormato = new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(producto.precio_venta || 0);
        const margen = producto.precio_venta && producto.costo_total ? 
            ((producto.precio_venta - producto.costo_total) / producto.costo_total * 100).toFixed(1) : 0;
        const margenColor = margen > 0 ? '#00ff88' : margen < 0 ? '#ff4444' : '#ffffff';
        html += `
            <tr>
                <td>
                    <strong>${producto.nombre}</strong>
                    ${producto.descripcion ? `<br><small style="color: rgba(255,255,255,0.5);">${producto.descripcion}</small>` : ''}
                </td>
                <td><span class="badge">${producto.categoria}</span></td>
                <td style="color: var(--accent); font-weight: 600;">${costoFormato}</td>
                <td>${precioFormato}</td>
                <td style="color: ${margenColor};">${margen}%</td>
                <td>${producto.unidad_medida || 'pza'}</td>
                <td>
                    <button class="btn-delete" onclick="eliminarProducto(${producto.id})" title="Eliminar producto">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
        totalCosto += producto.costo_total || 0;
        totalPrecio += producto.precio_venta || 0;
    });
    tableBody.innerHTML = html;
    // Footer con totales
    const costoTotalFormato = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(totalCosto);
    const precioTotalFormato = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(totalPrecio);
    tableFoot.innerHTML = `
        <tr style="background: rgba(0, 242, 255, 0.1);">
            <td colspan="2" style="text-align: right; font-weight: 600;">TOTALES (${productosFiltrados.length} productos):</td>
            <td style="color: var(--accent); font-weight: 700;">${costoTotalFormato}</td>
            <td style="font-weight: 700;">${precioTotalFormato}</td>
            <td colspan="3"></td>
        </tr>
    `;
}
// NUEVO: Filtrar productos por texto y categoría
function filtrarProductos() {
    const searchInput = document.getElementById('searchProducto');
    const filterSelect = document.getElementById('filterCategoriaProducto');
    currentSearchProducto = searchInput ? searchInput.value : '';
    currentFilterProducto = filterSelect ? filterSelect.value : 'all';
    renderTablaProductos();
}
// NUEVO: Calcular costo total del producto
function calcularCostoTotalProducto() {
    const materiaPrima = parseFloat(document.getElementById('prodCostoMateriaPrima').value) || 0;
    const manoObra = parseFloat(document.getElementById('prodCostoManoObra').value) || 0;
    const indirectos = parseFloat(document.getElementById('prodGastosIndirectos').value) || 0;
    const administrativos = parseFloat(document.getElementById('prodGastosAdministrativos').value) || 0;
    const otros = parseFloat(document.getElementById('prodOtrosCostos').value) || 0;
    const costoTotal = materiaPrima + manoObra + indirectos + administrativos + otros;
    const costoTotalInput = document.getElementById('prodCostoTotal');
    costoTotalInput.value = costoTotal.toFixed(2);
}
// NUEVO: Guardar nuevo producto con costos detallados
async function guardarNuevoProducto() {
    const nombre = document.getElementById('prodNombre').value.trim();
    const categoria = document.getElementById('prodCategoria').value;
    const descripcion = document.getElementById('prodDescripcion').value.trim();
    const costoMateriaPrima = parseFloat(document.getElementById('prodCostoMateriaPrima').value) || 0;
    const costoManoObra = parseFloat(document.getElementById('prodCostoManoObra').value) || 0;
    const gastosIndirectos = parseFloat(document.getElementById('prodGastosIndirectos').value) || 0;
    const gastosAdministrativos = parseFloat(document.getElementById('prodGastosAdministrativos').value) || 0;
    const otrosCostos = parseFloat(document.getElementById('prodOtrosCostos').value) || 0;
    const costoTotal = parseFloat(document.getElementById('prodCostoTotal').value) || 0;
    const precioVenta = parseFloat(document.getElementById('prodPrecioVenta').value) || 0;
    const unidadMedida = document.getElementById('prodUnidad').value;
    if (!nombre) {
        alert('⚠️ Ingresa el nombre del producto');
        return;
    }
    if (costoTotal <= 0) {
        alert('⚠️ El costo total debe ser mayor a cero');
        return;
    }
    const producto = {
        nombre,
        categoria,
        descripcion,
        costo_materia_prima: costoMateriaPrima,
        costo_mano_obra: costoManoObra,
        gastos_indirectos: gastosIndirectos,
        gastos_administrativos: gastosAdministrativos,
        otros_costos: otrosCostos,
        costo_total: costoTotal,
        precio_venta: precioVenta,
        unidad_medida: unidadMedida,
        activo: true
    };
    try {
        const { data, error } = await _sb
            .from('productos')
            .insert([producto])
            .select();
        if (error) throw error;
        // Limpiar formulario
        document.getElementById('prodNombre').value = '';
        document.getElementById('prodDescripcion').value = '';
        document.getElementById('prodCostoMateriaPrima').value = '';
        document.getElementById('prodCostoManoObra').value = '';
        document.getElementById('prodGastosIndirectos').value = '';
        document.getElementById('prodGastosAdministrativos').value = '';
        document.getElementById('prodOtrosCostos').value = '';
        document.getElementById('prodCostoTotal').value = '';
        document.getElementById('prodPrecioVenta').value = '';
        // Recargar productos
        await cargarProductos();
        alert('✅ Producto guardado exitosamente');
        // Registrar auditoría
        registrarLogAuditoria('PRODUCTO_CREADO', {
            id: data[0].id,
            nombre: nombre,
            costo_total: costoTotal
        });
    } catch (error) {
        console.error('Error al guardar producto:', error);
        alert('❌ Error al guardar el producto: ' + error.message);
    }
}
// NUEVO: Eliminar producto
async function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) {
        return;
    }
    try {
        const { error } = await _sb
            .from('productos')
            .delete()
            .eq('id', id);
        if (error) throw error;
        await cargarProductos();
        alert('✅ Producto eliminado');
        // Registrar auditoría
        registrarLogAuditoria('PRODUCTO_ELIMINADO', { id });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert('❌ Error al eliminar el producto');
    }
}
// NUEVO: Actualizar estadísticas de productos
function actualizarEstadisticasProductos() {
    const totalProductos = productosData.length;
    const categorias = [...new Set(productosData.map(p => p.categoria))].length;
    const costoPromedio = productosData.length > 0 ? 
        productosData.reduce((sum, p) => sum + (p.costo_total || 0), 0) / productosData.length : 0;
    document.getElementById('totalProductos').textContent = totalProductos;
    document.getElementById('totalCategoriasProductos').textContent = categorias;
    document.getElementById('costoPromedioProductos').textContent = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(costoPromedio);
    document.getElementById('lastUpdateProductos').textContent = new Date().toLocaleTimeString('es-MX');
}
// NUEVO: Exportar productos a Excel
function exportarProductosExcel() {
    if (productosData.length === 0) {
        alert('No hay productos para exportar');
        return;
    }
    const datosExportar = productosData.map(producto => ({
        'Nombre': producto.nombre,
        'Categoría': producto.categoria,
        'Descripción': producto.descripcion || '',
        'Costo Materia Prima': producto.costo_materia_prima || 0,
        'Costo Mano de Obra': producto.costo_mano_obra || 0,
        'Gastos Indirectos': producto.gastos_indirectos || 0,
        'Gastos Administrativos': producto.gastos_administrativos || 0,
        'Otros Costos': producto.otros_costos || 0,
        'Costo Total': producto.costo_total || 0,
        'Precio Venta': producto.precio_venta || 0,
        'Unidad': producto.unidad_medida || 'pza',
        'Fecha Creación': producto.created_at ? new Date(producto.created_at).toLocaleDateString('es-MX') : ''
    }));
    const ws = XLSX.utils.json_to_sheet(datosExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');
    XLSX.writeFile(wb, `productos_${new Date().toISOString().split('T')[0]}.xlsx`);
    registrarLogAuditoria('EXPORTAR_PRODUCTOS_EXCEL', {
        cantidad: productosData.length
    });
}
// Función para renderizar la tabla con filtrado aplicado (Texto + Categoría)
function renderTablaMateriales() {
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
// --- MÓDULO DE AUDITORÍA Y LOGS ---
// Crear log de cotización
async function registrarLogAuditoria(tipo, detalles) {
    const usuario = JSON.parse(localStorage.getItem('valia_user') || '{}');
    const timestamp = new Date().toISOString();
    const logData = {
        tipo,
        usuario: usuario.nombre || 'Desconocido',
        detalles,
        timestamp,
        ip: 'local' // En producción, obtener IP del servidor
    };
    console.log('[AUDITORÍA]', logData);
    try {
        // Aquí puedes almacenar en Supabase si es necesario
        // await _sb.from('logs_auditoria').insert([logData]);
    } catch (error) {
        console.error('Error al registrar auditoría:', error);
    }
}
// --- MÓDULO DE COTIZACIONES AVANZADO ---
// Estado global para cotizaciones
let cotizacionesHistorial = [];
let configuracionImpuestos = {
    tasa_iva: 16, // IVA en México
    descuentoVolumen: [
        { cantidad: 100, porcentaje: 5 },
        { cantidad: 500, porcentaje: 10 },
        { cantidad: 1000, porcentaje: 15 }
    ]
};
// NUEVO: Cargar materiales Y servicios en dropdown (carga dual)
async function cargarMaterialesYServiciosEnCotizacion() {
    const select = document.getElementById('cotMaterial');
    if (!select) return;
    // Limpiar opciones anteriores (excepto la first)
    while (select.options.length > 1) {
        select.remove(1);
    }
    // Cargar si no están cargados
    if (materialesData.length === 0) {
        await cargarMateriales();
    }
    if (serviciosData.length === 0) {
        await cargarServicios();
    }
    // Combinar materiales y servicios
    let categoryMap = {};
    // Agregar materiales
    materialesData.forEach(material => {
        if (!material.costo_compra) {
            console.warn(`Material sin precio: ${material.nombre}`);
            return;
        }
        const cat = material.categoria || 'General';
        if (!categoryMap[cat]) {
            categoryMap[cat] = [];
        }
        categoryMap[cat].push({
            ...material,
            tipo: 'material'
        });
    });
    // Agregar servicios
    serviciosData.forEach(servicio => {
        if (!servicio.precio) {
            console.warn(`Servicio sin precio: ${servicio.nombre}`);
            return;
        }
        const cat = servicio.categoria || 'Servicios';
        if (!categoryMap[cat]) {
            categoryMap[cat] = [];
        }
        categoryMap[cat].push({
            ...servicio,
            tipo: 'servicio',
            costo_compra: servicio.precio, // Normalizar campo
            unidad_medida: servicio.unidad || 'servicio'
        });
    });
    // Crear optgroup por categoría
    Object.keys(categoryMap).sort().forEach(categoria => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = `${categoria} ${categoryMap[categoria].some(i => i.tipo === 'servicio') ? '🎨' : '📦'}`;
        categoryMap[categoria].forEach(item => {
            const option = document.createElement('option');
            const tipo = item.tipo === 'servicio' ? '🎨' : '📦';
            option.value = `${item.tipo}-${item.id}`;
            option.textContent = `${tipo} ${item.nombre} - ${formatCurrency(item.costo_compra || item.precio)} / ${item.unidad_medida}`;
            option.dataset.precio = item.costo_compra || item.precio;
            option.dataset.nombre = item.nombre;
            option.dataset.unidad = item.unidad_medida;
            option.dataset.tipo = item.tipo;
            option.dataset.id = item.id;
            optgroup.appendChild(option);
        });
        select.appendChild(optgroup);
    });
    console.log(`✅ Cargados: ${materialesData.length} materiales + ${serviciosData.length} servicios`);
}
// Obtener descuento por volumen
function obtenerDescuentoVolumen(cantidad) {
    const descuentoAplicable = configuracionImpuestos.descuentoVolumen
        .filter(d => cantidad >= d.cantidad)
        .sort((a, b) => b.cantidad - a.cantidad)[0];
    return descuentoAplicable ? descuentoAplicable.porcentaje : 0;
}
// Actualizar precio unitario en cotización
function actualizarPrecioUnitarioCot() {
    const select = document.getElementById('cotMaterial');
    const precioInput = document.getElementById('cotPrecioUnit');
    if (!select.value) {
        precioInput.value = '';
        return;
    }
    const option = select.options[select.selectedIndex];
    const precio = parseFloat(option.dataset.precio) || 0;
    precioInput.value = formatCurrency(precio);
    precioInput.dataset.precio = precio;
    // Limpiar campos de cantidad para nueva cotización
    document.getElementById('cotCantidad').value = '';
    document.getElementById('cotMargen').value = '30';
    calcularTotalCot();
}
// Validar cantidad
function validarCantidad(cantidad) {
    const num = parseFloat(cantidad);
    if (isNaN(num) || num <= 0) {
        return { valido: false, error: 'La cantidad debe ser un número positivo' };
    }
    if (!Number.isFinite(num)) {
        return { valido: false, error: 'Cantidad inválida' };
    }
    return { valido: true };
}
// Calcular total de cotización con todos los detalles
function calcularTotalCot() {
    const cantidadInput = document.getElementById('cotCantidad');
    const margenInput = document.getElementById('cotMargen');
    const precioUnitInput = document.getElementById('cotPrecioUnit');
    const cantidad = parseFloat(cantidadInput.value) || 0;
    const margen = parseFloat(margenInput.value) || 0;
    const precioUnit = parseFloat(precioUnitInput.dataset.precio) || 0;
    // Limpiar desglose inicial
    document.getElementById('costSubtotal').innerText = '$0.00';
    document.getElementById('costDescuento').innerText = '-$0.00';
    document.getElementById('costSubtotalDesc').innerText = '$0.00';
    document.getElementById('costConMargen').innerText = '$0.00';
    document.getElementById('costIVA').innerText = '$0.00';
    document.getElementById('cotPrecioFinal').innerText = '$0.00';
    // Validación
    const validacion = validarCantidad(cantidad);
    if (!validacion.valido) {
        document.getElementById('descuentoVolumenInfo').innerText = validacion.error;
        return;
    }
    // Calcular subtotal (costo base)
    const subtotal = precioUnit * cantidad;
    // Obtener descuento por volumen
    const descuentoVolumen = obtenerDescuentoVolumen(cantidad);
    const montoDescuento = subtotal * (descuentoVolumen / 100);
    // Aplicar descuento al subtotal
    const subtotalConDescuento = subtotal - montoDescuento;
    // Precio con margen (sin IVA inicialmente)
    const precioConMargen = subtotalConDescuento * (1 + margen / 100);
    // Precio final con IVA
    const ivaFinal = precioConMargen * (configuracionImpuestos.tasa_iva / 100);
    const precioFinal = precioConMargen + ivaFinal;
    // Actualizar UI con desglose detallado
    document.getElementById('costSubtotal').innerText = formatCurrency(subtotal);
    const descuentoRow = document.getElementById('descuentoRow');
    if (descuentoVolumen > 0) {
        document.getElementById('costDescuento').innerText = `-${formatCurrency(montoDescuento)}`;
        descuentoRow.style.display = 'flex';
    } else {
        descuentoRow.style.display = 'none';
    }
    document.getElementById('costSubtotalDesc').innerText = formatCurrency(subtotalConDescuento);
    document.getElementById('costConMargen').innerText = formatCurrency(precioConMargen);
    document.getElementById('costIVA').innerText = formatCurrency(ivaFinal);
    document.getElementById('cotPrecioFinal').innerText = formatCurrency(precioFinal);
    // Mostrar información de descuento
    if (descuentoVolumen > 0) {
        document.getElementById('descuentoVolumenInfo').innerText = `🎁 Descuento por volumen: ${descuentoVolumen}% aplicado`;
        document.getElementById('descuentoVolumenInfo').style.color = '#00ff88';
    } else {
        document.getElementById('descuentoVolumenInfo').innerText = `Cantidad: ${cantidad} unidades para próximo descuento (+100)`;
        document.getElementById('descuentoVolumenInfo').style.color = 'rgba(255,255,255,0.4)';
    }
    // Guardar desglose en dataset para referencia posterior
    document.getElementById('cotMaterial').dataset.desglose = JSON.stringify({
        cantidad,
        precioUnit,
        subtotal,
        descuentoVolumen,
        montoDescuento,
        subtotalConDescuento,
        margen,
        precioConMargen,
        tasa_iva: configuracionImpuestos.tasa_iva,
        iva: ivaFinal,
        precioFinal,
        timestamp: new Date().toISOString()
    });
}
// Agregar material a cotización actual
function agregarMaterialACotizacion() {
    const select = document.getElementById('cotMaterial');
    const cantidadInput = document.getElementById('cotCantidad');
    const cantidad = parseFloat(cantidadInput.value);
    // Validaciones
    if (!select.value) {
        alert('⚠️ Selecciona un material');
        return;
    }
    const validacion = validarCantidad(cantidad);
    if (!validacion.valido) {
        alert(`❌ ${validacion.error}`);
        return;
    }
    const option = select.options[select.selectedIndex];
    const precioUnit = parseFloat(option.dataset.precio);
    const nombre = option.dataset.nombre;
    const unidad = option.dataset.unidad;
    const materialId = select.value;
    // Obtener desglose
    let desglose = {};
    try {
        desglose = JSON.parse(select.dataset.desglose || '{}');
    } catch (e) {
        calcularTotalCot();
        desglose = JSON.parse(select.dataset.desglose || '{}');
    }
    // Agregar a historial
    const itemCotizacion = {
        id: Date.now(),
        materialId,
        nombre,
        cantidad,
        precioUnit,
        unidad,
        desglose
    };
    cotizacionActual.push(itemCotizacion);
    // Actualizar tabla de resumen
    actualizarTablaCotizacion();
    // Limpiar formulario
    select.value = '';
    cantidadInput.value = '';
    document.getElementById('cotPrecioUnit').value = '';
    document.getElementById('cotMargen').value = '30';
    document.getElementById('cotCostoTotal').innerText = '$0.00';
    document.getElementById('cotPrecioFinal').innerText = '$0.00';
}
// Actualizar tabla de cotización actual
function actualizarTablaCotizacion() {
    const tbody = document.getElementById('cotTableBody');
    if (cotizacionActual.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: rgba(255,255,255,0.3); padding: 40px;">Agrega materiales para ver el desglose.</td></tr>`;
        document.getElementById('cotResumenCosto').innerText = '$0.00';
        document.getElementById('cotResumenPrecio').innerText = '$0.00';
        return;
    }
    let totalGeneral = 0;
    let totalCosto = 0;
    let html = '';
    cotizacionActual.forEach(item => {
        const subtotal = item.desglose.precioFinal || (item.precioUnit * item.cantidad);
        const costo = item.desglose.subtotalConDescuento || (item.precioUnit * item.cantidad);
        totalGeneral += subtotal;
        totalCosto += costo;
        html += `
            <tr>
                <td><strong>${item.nombre}</strong></td>
                <td>${item.cantidad} ${item.unidad}</td>
                <td>${formatCurrency(item.precioUnit)}</td>
                <td>${formatCurrency(subtotal)}</td>
                <td>
                    <button class="btn-delete" onclick="removerMaterialDeCotizacion(${item.id})" title="Eliminar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    });
    html += `
        <tr class="total-row">
            <td colspan="3" style="text-align: right;">TOTAL COTIZACIÓN:</td>
            <td colspan="2">${formatCurrency(totalGeneral)}</td>
        </tr>
    `;
    tbody.innerHTML = html;
    // Actualizar resumen
    document.getElementById('cotResumenCosto').innerText = formatCurrency(totalCosto);
    document.getElementById('cotResumenPrecio').innerText = formatCurrency(totalGeneral);
}
// Remover material de cotización
function removerMaterialDeCotizacion(itemId) {
    const index = cotizacionActual.findIndex(item => item.id === itemId);
    if (index !== -1) {
        cotizacionActual.splice(index, 1);
        actualizarTablaCotizacion();
    }
}
// Guardar cotización
async function guardarCotizacion() {
    if (cotizacionActual.length === 0) {
        alert('⚠️ Agrega al menos un material a la cotización');
        return;
    }
    const usuario = JSON.parse(localStorage.getItem('valia_user') || '{}');
    const timestamp = new Date();
    // Calcular totales
    let totalCosto = 0;
    let totalPrecio = 0;
    cotizacionActual.forEach(item => {
        totalCosto += item.desglose.subtotalConDescuento || (item.precioUnit * item.cantidad);
        totalPrecio += item.desglose.precioFinal || (item.precioUnit * item.cantidad);
    });
    const cotizacion = {
        id: `COT-${Date.now()}`,
        usuario: usuario.nombre,
        email: usuario.email,
        fecha: timestamp.toISOString(),
        materiales: cotizacionActual,
        totalCosto,
        totalPrecio,
        estado: 'generada',
        descargada: false
    };
    // Guardar en Supabase si existe la tabla
    try {
        const { error } = await _sb
            .from('cotizaciones')
            .insert([{
                id: cotizacion.id,
                usuario: cotizacion.usuario,
                email: cotizacion.email,
                fecha: cotizacion.fecha,
                materiales: JSON.stringify(cotizacion.materiales),
                total_costo: totalCosto,
                total_precio: totalPrecio,
                estado: 'generada'
            }]);
        if (error && error.code !== 'PGRST116') { // Ignorar si tabla no existe
            throw error;
        }
    } catch (error) {
        console.warn('No se pudo guardar en BD (tabla puede no existir):', error.message);
    }
    // Guardar en localStorage como respaldo
    cotizacionesHistorial.push(cotizacion);
    localStorage.setItem('cotizaciones_historial', JSON.stringify(cotizacionesHistorial));
    // Generar PDF automáticamente
    descargarPDFCotizacionActual();
    // Registrar auditoría
    registrarLogAuditoria('COTIZACION_GENERADA', {
        id: cotizacion.id,
        items: cotizacionActual.length,
        total: totalPrecio
    });
    alert('✅ Cotización guardada y PDF generado');
    // Limpiar cotización
    cotizacionActual = [];
    document.getElementById('cotMaterial').value = '';
    document.getElementById('cotCantidad').value = '';
    document.getElementById('cotMargen').value = '30';
    document.getElementById('cotPrecioUnit').value = '';
    actualizarTablaCotizacion();
}
// Guardar venta diaria (con date y user_id)
async function guardarVentaDelDia(detalles = {}) {
    if (cotizacionActual.length === 0) {
        console.warn('No hay items para guardar como venta');
        return;
    }
    const usuario = JSON.parse(localStorage.getItem('valia_user') || '{}');
    const ahora = new Date();
    const fechaISO = ahora.toISOString();
    // Calcular totales
    let totalCosto = 0;
    let totalPrecio = 0;
    let descuentoTotal = 0;
    cotizacionActual.forEach(item => {
        totalCosto += item.desglose.subtotalConDescuento || (item.precioUnit * item.cantidad);
        totalPrecio += item.desglose.precioFinal || (item.precioUnit * item.cantidad);
        descuentoTotal += (item.desglose.monto_descuento || 0);
    });
    const ventaDelDia = {
        id: `VENTA-${Date.now()}`,
        user_id: usuario.email || usuario.id || 'unknown',
        usuario: usuario.nombre || 'Sin nombre',
        email: usuario.email,
        date_created: fechaISO,
        fecha: ahora,
        items: cotizacionActual.map(item => ({
            nombre: item.nombre,
            cantidad: item.cantidad,
            precioUnit: item.precioUnit,
            margen: item.margen,
            subtotal: item.desglose.subtotal,
            descuento: item.desglose.monto_descuento,
            subtotalConDescuento: item.desglose.subtotalConDescuento,
            iva: item.desglose.iva,
            precioFinal: item.desglose.precioFinal
        })),
        totalCosto,
        totalPrecio,
        descuentoTotal,
        ivaTotal: totalPrecio - totalCosto - descuentoTotal,
        estado: 'completada',
        ...detalles
    };
    // Guardar en Supabase tabla ventas_hoy
    try {
        const { error } = await _sb
            .from('ventas_hoy')
            .insert([{
                id: ventaDelDia.id,
                user_id: ventaDelDia.user_id,
                usuario: ventaDelDia.usuario,
                email: ventaDelDia.email,
                date_created: ventaDelDia.date_created,
                items: JSON.stringify(ventaDelDia.items),
                total_costo: ventaDelDia.totalCosto,
                total_precio: ventaDelDia.totalPrecio,
                descuento_total: ventaDelDia.descuentoTotal,
                iva_total: ventaDelDia.ivaTotal,
                estado: ventaDelDia.estado
            }]);
        if (error && error.code !== 'PGRST116') { // Ignorar si tabla no existe
            throw error;
        }
    } catch (error) {
        console.warn('No se pudo guardar venta en BD:', error.message);
    }
    // Agregar a array de ventas del día
    ventasDelDia.push(ventaDelDia);
    // Mantener solo últimas 10 en memoria
    if (ventasDelDia.length > 10) {
        ventasDelDia = ventasDelDia.slice(-10);
    }
    // Guardar en localStorage
    localStorage.setItem('ventas_hoy', JSON.stringify(ventasDelDia));
    // Registrar auditoría
    registrarLogAuditoria('VENTA_COMPLETADA', {
        id: ventaDelDia.id,
        items: ventaDelDia.items.length,
        total: ventaDelDia.totalPrecio,
        user_id: ventaDelDia.user_id
    });
    // Actualizar display de ventas
    actualizarHistorialVentas();
    return ventaDelDia;
}
// Cargar últimas 5 ventas del día desde Supabase
async function cargarUltimasVentasDelDia() {
    try {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaInicio = hoy.toISOString();
        const { data, error } = await _sb
            .from('ventas_hoy')
            .select('*')
            .gte('date_created', fechaInicio)
            .order('date_created', { ascending: false })
            .limit(5);
        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        ventasDelDia = (data || []).map(venta => ({
            id: venta.id,
            user_id: venta.user_id,
            usuario: venta.usuario,
            email: venta.email,
            date_created: venta.date_created,
            fecha: new Date(venta.date_created),
            items: JSON.parse(venta.items || '[]'),
            totalCosto: venta.total_costo,
            totalPrecio: venta.total_precio,
            descuentoTotal: venta.descuento_total,
            ivaTotal: venta.iva_total,
            estado: venta.estado
        }));
        actualizarHistorialVentas();
    } catch (error) {
        console.warn('No se pudieron cargar ventas:', error.message);
        // Intentar cargar del localStorage
        const ventasGuardadas = localStorage.getItem('ventas_hoy');
        if (ventasGuardadas) {
            ventasDelDia = JSON.parse(ventasGuardadas);
            actualizarHistorialVentas();
        }
    }
}
// Actualizar tabla/display de historial de ventas
function actualizarHistorialVentas() {
    const contenedorHistorial = document.getElementById('historialVentas');
    if (!contenedorHistorial) return;
    if (ventasDelDia.length === 0) {
        contenedorHistorial.innerHTML = '<p class="texto-gris">Sin ventas el día de hoy</p>';
        return;
    }
    let html = '<div class="tabla-responsiva"><table class="tabla-ventas">';
    html += '<thead><tr>';
    html += '<th>Hora</th>';
    html += '<th>Producto/Servicio</th>';
    html += '<th>Cantidad</th>';
    html += '<th>P. Unit.</th>';
    html += '<th>Total</th>';
    html += '<th>Usuario</th>';
    html += '</tr></thead><tbody>';
    ventasDelDia.forEach(venta => {
        const fecha = new Date(venta.date_created || venta.fecha);
        const hora = fecha.toLocaleTimeString('es-MX', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        venta.items.forEach(item => {
            const precioFormato = new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN'
            }).format(item.precioUnit);
            const totalFormato = new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN'
            }).format(item.precioFinal);
            html += '<tr>';
            html += `<td>${hora}</td>`;
            html += `<td><strong>${item.nombre}</strong></td>`;
            html += `<td>${item.cantidad}</td>`;
            html += `<td>${precioFormato}</td>`;
            html += `<td class="precio-total"><strong>${totalFormato}</strong></td>`;
            html += `<td><small>${venta.usuario}</small></td>`;
            html += '</tr>';
        });
    });
    html += '</tbody></table></div>';
    contenedorHistorial.innerHTML = html;
}
// Generar PDF de cotización
function generarPDFCotizacion(cotizacion) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const usuario = JSON.parse(localStorage.getItem('valia_user') || '{}');
    const fechaFormato = new Intl.DateTimeFormat('es-MX', {
        dateStyle: 'long',
        timeStyle: 'short'
    }).format(new Date(cotizacion.fecha));
    // Encabezado
    doc.setFontSize(24);
    doc.text('COTIZACIÓN', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`ID: ${cotizacion.id}`, 14, 30);
    doc.text(`Fecha: ${fechaFormato}`, 14, 37);
    doc.text(`Usuario: ${cotizacion.usuario}`, 14, 44);
    // Tabla de detalles
    const tableData = cotizacion.materiales.map(item => [
        item.nombre,
        item.cantidad,
        item.unidad,
        formatMXN(item.precioUnit),
        formatMXN(item.desglose.precioFinal || (item.precioUnit * item.cantidad))
    ]);
    doc.autoTable({
        head: [['Material', 'Cantidad', 'Unidad', 'Precio Unit.', 'Subtotal']],
        body: tableData,
        startY: 55,
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
    });
    // Obtener posición Y después de tabla
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = doc.lastAutoTable.finalY + 10;
    // Totales
    doc.setFontSize(11);
    doc.setTextColor(0);
    let totalCosto = 0;
    let totalPrecio = 0;
    let totalDescuento = 0;
    let totalIVA = 0;
    cotizacion.materiales.forEach(item => {
        totalCosto += item.desglose.subtotal || (item.precioUnit * item.cantidad);
        totalDescuento += item.desglose.montoDescuento || 0;
        totalIVA += item.desglose.iva || 0;
        totalPrecio += item.desglose.precioFinal || (item.precioUnit * item.cantidad);
    });
    doc.text(`Subtotal Bruto: ${formatMXN(totalCosto)}`, 130, yPosition);
    yPosition += 8;
    doc.text(`Descuento: -${formatMXN(totalDescuento)}`, 130, yPosition);
    yPosition += 8;
    doc.text(`IVA (16%): ${formatMXN(totalIVA)}`, 130, yPosition);
    yPosition += 12;
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(99, 102, 241);
    doc.text(`TOTAL: ${formatMXN(totalPrecio)}`, 130, yPosition);
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Cotización generada automáticamente por Valia Pro', 14, pageHeight - 10);
    doc.text(`${new Date().toLocaleString('es-MX')}`, 14, pageHeight - 5);
    // Descargar
    doc.save(`Cotizacion_${cotizacion.id}.pdf`);
    // Registrar auditoría
    registrarLogAuditoria('PDF_DESCARGADO', {
        cotizacion_id: cotizacion.id,
        archivo: `Cotizacion_${cotizacion.id}.pdf`
    });
}
// Helper para formatear MXN en PDF
function formatMXN(value) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(value);
}
// Descargar PDF de la cotización actual (sin guardar)
function descargarPDFCotizacionActual() {
    if (cotizacionActual.length === 0) {
        alert('⚠️ Agrega al menos un material a la cotización');
        return;
    }
    const usuario = JSON.parse(localStorage.getItem('valia_user') || '{}');
    // Crear cotización temporal
    let totalCosto = 0;
    let totalPrecio = 0;
    cotizacionActual.forEach(item => {
        totalCosto += item.desglose.subtotalConDescuento || (item.precioUnit * item.cantidad);
        totalPrecio += item.desglose.precioFinal || (item.precioUnit * item.cantidad);
    });
    const cotizacionTemp = {
        id: `TEMP-${Date.now()}`,
        usuario: usuario.nombre,
        email: usuario.email,
        fecha: new Date().toISOString(),
        materiales: cotizacionActual,
        totalCosto,
        totalPrecio,
        estado: 'temporal'
    };
    generarPDFCotizacion(cotizacionTemp);
    registrarLogAuditoria('PDF_DESCARGADO_PROVISIONAL', {
        items: cotizacionActual.length,
        total: totalPrecio
    });
}
// Limpiar cotización actual
function limpiarCotizacion() {
    if (cotizacionActual.length === 0) {
        alert('No hay cotización para limpiar');
        return;
    }
    if (confirm('¿Descartar cotización actual? Esta acción no se puede deshacer.')) {
        cotizacionActual = [];
        document.getElementById('cotMaterial').value = '';
        document.getElementById('cotCantidad').value = '';
        document.getElementById('cotMargen').value = '30';
        document.getElementById('cotPrecioUnit').value = '';
        actualizarTablaCotizacion();
        alert('Cotización descartada');
    }
}
// Inicializar el sistema de cotizaciones cuando se carga la aplicación
function inicializarCotizaciones() {
    console.log('Inicializando sistema de cotizaciones...');
    cargarMaterialesYServiciosEnCotizacion(); // Carga materiales Y servicios
    cargarHistorialCotizaciones();
    cargarUltimasVentasDelDia(); // Cargar historial de ventas
    cargarProductos(); // Cargar productos con costos detallados
}
// Cargar historial de cotizaciones desde localStorage
function cargarHistorialCotizaciones() {
    const historial = localStorage.getItem('cotizaciones_historial');
    if (historial) {
        cotizacionesHistorial = JSON.parse(historial);
    }
}
// Exportar funciones si es necesario
window.switchTab = switchTab;
window.cargarMateriales = cargarMateriales;
window.cargarServicios = cargarServicios;
window.cargarProductos = cargarProductos;
window.guardarNuevoMaterial = guardarNuevoMaterial;
window.guardarNuevoProducto = guardarNuevoProducto;
window.calcularCostoUnitario = calcularCostoUnitario;
window.calcularCostoTotalProducto = calcularCostoTotalProducto;
window.exportarExcel = exportarExcel;
window.exportarProductosExcel = exportarProductosExcel;
window.exportarPDF = exportarPDF;
window.filtrarInventario = filtrarInventario;
window.filtrarProductos = filtrarProductos;
window.eliminarMaterial = eliminarMaterial;
window.eliminarProducto = eliminarProducto;
window.cargarMaterialesEnCotizacion = cargarMaterialesEnCotizacion;
window.cargarMaterialesYServiciosEnCotizacion = cargarMaterialesYServiciosEnCotizacion;
window.actualizarPrecioUnitarioCot = actualizarPrecioUnitarioCot;
window.calcularTotalCot = calcularTotalCot;
window.agregarMaterialACotizacion = agregarMaterialACotizacion;
window.removerMaterialDeCotizacion = removerMaterialDeCotizacion;
window.guardarCotizacion = guardarCotizacion;
window.guardarVentaDelDia = guardarVentaDelDia;
window.cargarUltimasVentasDelDia = cargarUltimasVentasDelDia;
window.actualizarHistorialVentas = actualizarHistorialVentas;
window.generarPDFCotizacion = generarPDFCotizacion;
window.descargarPDFCotizacionActual = descargarPDFCotizacionActual;
window.limpiarCotizacion = limpiarCotizacion;
window.cargarHistorialCotizaciones = cargarHistorialCotizaciones;
window.inicializarCotizaciones = inicializarCotizaciones;
w i n d o w . i n i c i a l i z a r C o t i z a c i o n e s   =   i n i c i a l i z a r C o t i z a c i o n e s ; 
window.inicializarCotizaciones = inicializarCotizaciones;
