// CONFIGURACIÓN DE SUPABASE (Usando tus credenciales de Valia)
const URL_VALIA = "https://ietudbyosupknisbfhlj.supabase.co"; 
const KEY_VALIA = "sb_publishable_wzDzxlSwdpKw4ok4J1qPPA_1eabsV4P";
const _sb = supabase.createClient(URL_VALIA, KEY_VALIA);

// ESTADO GLOBAL DE LA COTIZACIÓN
let dbMateriales = [];
let itemsCotizados = [];

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 Sistema Valia Iniciado");
    await cargarMaterialesDesdeDB();
    actualizarFecha();
});

// 1. CARGAR MATERIALES DESDE SUPABASE
async function cargarMaterialesDesdeDB() {
    try {
        const { data, error } = await _sb
            .from('materiales')
            .select('*')
            .order('nombre', { ascending: true });

        if (error) throw error;

        dbMateriales = data;
        llenarSelectMateriales();
    } catch (err) {
        console.error("❌ Error al cargar materiales:", err.message);
    }
}

// 2. LLENAR EL SELECT DEL DOM
function llenarSelectMateriales() {
    const select = document.getElementById('selectMaterial');
    if (!select) return;

    select.innerHTML = '<option value="" disabled selected>Selecciona un insumo...</option>';
    
    dbMateriales.forEach(m => {
        const option = document.createElement('option');
        option.value = m.id;
        option.textContent = `${m.nombre} (${m.unidad_medida}) - $${m.costo_compra}`;
        select.appendChild(option);
    });
}

// 3. AGREGAR ITEM A LA LISTA
function agregarItem() {
    const id = document.getElementById('selectMaterial').value;
    const cant = parseFloat(document.getElementById('cantMat').value);

    if (!id || isNaN(cant) || cant <= 0) {
        alert("⚠️ Selecciona un material y define una cantidad válida.");
        return;
    }

    const mat = dbMateriales.find(m => m.id === id);

    // Creamos el objeto del item (similar a como manejabas los pronósticos)
    const nuevoItem = {
        tempId: Date.now(), // ID temporal para manejar el borrado en UI
        id_db: mat.id,
        nombre: mat.nombre,
        cantidad: cant,
        unidad: mat.unidad_medida,
        precioUnitario: mat.costo_compra,
        subtotal: mat.costo_compra * cant
    };

    itemsCotizados.push(nuevoItem);
    renderTablaCotizacion();
    
    // Reset de inputs
    document.getElementById('cantMat').value = 1;
}

// 4. RENDERIZAR TABLA (Lógica de inyección de HTML similar a tu Quiniela)
function renderTablaCotizacion() {
    const tbody = document.getElementById('listaCotizacion');
    if (!tbody) return;

    tbody.innerHTML = "";

    itemsCotizados.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.className = "item-row animate-fade-in"; // Puedes añadir animaciones en CSS
        tr.innerHTML = `
            <td><strong>${item.nombre}</strong></td>
            <td>${item.cantidad}</td>
            <td>${item.unidad}</td>
            <td>$${item.precioUnitario.toFixed(2)}</td>
            <td class="text-accent">$${item.subtotal.toFixed(2)}</td>
            <td>
                <button class="btn-del" onclick="eliminarItem(${index})">
                    <i class="icon-trash"></i> ❌
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    calcularResultados();
}

// 5. ELIMINAR ITEM
function eliminarItem(index) {
    itemsCotizados.splice(index, 1);
    renderTablaCotizacion();
}

// 6. CÁLCULOS MATEMÁTICOS DE PRECIO DE VENTA
function calcularResultados() {
    const costoBase = itemsCotizados.reduce((acc, item) => acc + item.subtotal, 0);
    const margenInput = document.getElementById('margen');
    const margenPorcentaje = (parseFloat(margenInput.value) || 0) / 100;

    // Fórmula Profesional: El margen se calcula sobre el precio de venta final
    // Si quieres ganar el 30%, no es Costo * 1.30, sino Costo / (1 - 0.30)
    const precioVenta = margenPorcentaje < 1 
        ? costoBase / (1 - margenPorcentaje) 
        : costoBase;

    const utilidad = precioVenta - costoBase;

    // Actualizar UI
    document.getElementById('displayTotal').innerText = `$${precioVenta.toFixed(2)}`;
    
    // Opcional: mostrar desglose si tienes los IDs en el HTML
    const totalCostoElem = document.getElementById('totalCosto');
    if(totalCostoElem) totalCostoElem.innerText = `$${costoBase.toFixed(2)}`;
}

// 7. EXPORTAR A PDF (Inspirado en tu uso de jsPDF)
function generarPDF() {
    if (itemsCotizados.length === 0) {
        alert("La cotización está vacía.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("Orbitron", "bold");
    doc.text("COTIZACIÓN VALIA", 10, 10);
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 10, 20);

    // Aquí usaríamos autoTable como en tu proyecto previo
    const rows = itemsCotizados.map(i => [i.nombre, i.cantidad, i.unidad, i.precioUnitario, i.subtotal]);
    
    doc.autoTable({
        head: [['Insumo', 'Cant', 'U.M', 'P. Unit', 'Subtotal']],
        body: rows,
        startY: 30,
        theme: 'grid'
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`TOTAL A PAGAR: ${document.getElementById('displayTotal').innerText}`, 10, finalY);

    doc.save(`Cotizacion_Valia_${Date.now()}.pdf`);
}

// UTILIDADES
function actualizarFecha() {
    const fechaElem = document.getElementById('fecha');
    if (fechaElem) {
        const now = new Date();
        fechaElem.innerText = now.toLocaleDateString('es-MX', { 
            weekday: 'long', day: 'numeric', month: 'long' 
        });
    }
}