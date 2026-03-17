const URL_SB = "https://ietudbyosupknisbfhlj.supabase.co"; 
const KEY_SB = "sb_publishable_wzDzxlSwdpKw4ok4J1qPPA_1eabsV4P";
const _sb = supabase.createClient(URL_SB, KEY_SB);

let dbMateriales = [];
let dbServicios = [];
let itemsCotizados = [];

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('fecha-actual').innerText = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    await Promise.all([cargarMateriales(), cargarServicios()]);
    actualizarInterfaz();
});

async function cargarMateriales() {
    const { data } = await _sb.from('materiales').select('*').order('nombre');
    dbMateriales = data || [];
}

async function cargarServicios() {
    const { data } = await _sb.from('servicios').select('id, nombre, precio_base').order('nombre');
    dbServicios = data || [];
}

function actualizarInterfaz() {
    const tipo = document.getElementById('tipoItem').value;
    const select = document.getElementById('selectItem');
    const labelCant = document.getElementById('labelCant');
    select.innerHTML = "";

    if (tipo === "material") {
        labelCant.innerText = "Cantidad";
        dbMateriales.forEach(m => {
            select.add(new Option(`${m.nombre} ($${m.costo_compra}/${m.unidad_medida})`, m.id));
        });
    } else {
        labelCant.innerText = "Horas/Unid";
        dbServicios.forEach(s => {
            select.add(new Option(`${s.nombre} ($${s.precio_base})`, s.id));
        });
    }
}

function agregarItemALista() {
    const tipo = document.getElementById('tipoItem').value;
    const id = document.getElementById('selectItem').value;
    const cant = parseFloat(document.getElementById('cantidadItem').value);

    if (!id || cant <= 0) return;

    let item, precio;
    if (tipo === "material") {
        item = dbMateriales.find(m => m.id == id);
        precio = item.costo_compra;
    } else {
        item = dbServicios.find(s => s.id == id);
        precio = item.precio_base;
    }

    itemsCotizados.push({
        nombre: (tipo === "material" ? "📦 " : "🛠 ") + item.nombre,
        cantidad: cant,
        precio: precio,
        subtotal: precio * cant
    });

    renderTabla();
}

function renderTabla() {
    const tbody = document.getElementById('listaCotizacion');
    tbody.innerHTML = itemsCotizados.map((item, i) => `
        <tr>
            <td>${item.nombre}</td>
            <td>${item.cantidad}</td>
            <td>$${item.precio.toFixed(2)}</td>
            <td style="color:var(--accent); font-weight:bold;">$${item.subtotal.toFixed(2)}</td>
            <td><button onclick="eliminarItem(${i})" style="background:none; border:none; color:#ff4444; cursor:pointer;">❌</button></td>
        </tr>
    `).join('');
    calcularFinal();
}

function eliminarItem(index) {
    itemsCotizados.splice(index, 1);
    renderTabla();
}

function calcularFinal() {
    const costoTotal = itemsCotizados.reduce((acc, i) => acc + i.subtotal, 0);
    const margen = (parseFloat(document.getElementById('margen').value) || 0) / 100;
    const total = margen < 1 ? costoTotal / (1 - margen) : costoTotal;
    document.getElementById('displayTotal').innerText = `$${total.toFixed(2)}`;
}

async function generarPDF() {
    if (itemsCotizados.length === 0) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("COTIZACIÓN VALIA", 15, 20);
    
    const rows = itemsCotizados.map(i => [i.nombre, i.cantidad, `$${i.precio.toFixed(2)}`, `$${i.subtotal.toFixed(2)}`]);
    
    doc.autoTable({
        startY: 30,
        head: [['Concepto', 'Cant.', 'P. Unit', 'Subtotal']],
        body: rows,
    });
    
    doc.text(`TOTAL: ${document.getElementById('displayTotal').innerText}`, 15, doc.lastAutoTable.finalY + 20);
    doc.save("Cotizacion_Valia.pdf");
}