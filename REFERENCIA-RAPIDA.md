/**
 * GUÍA RÁPIDA DE REFERENCIA - VALIA PRO
 * Funciones principales y cómo usarlas
 */

// ================================================================
// FUNCIONES DE COTIZACIONES
// ================================================================

/**
 * cargarMaterialesEnCotizacion()
 * Carga todos los materiales en el dropdown de cotización
 * Agrupa por categoría automáticamente
 * 
 * Uso: cargarMaterialesEnCotizacion();
 * Triggers: Al iniciar sesión o cambiar de pestaña
 */

/**
 * actualizarPrecioUnitarioCot()
 * Actualiza el campo de precio unitario cuando selecciona material
 * 
 * Uso: <select onchange="actualizarPrecioUnitarioCot()">
 * Resultado: Actualiza campo "#cotPrecioUnit"
 */

/**
 * calcularTotalCot()
 * Realiza TODOS los cálculos en tiempo real
 * Actualiza desglose automáticamente
 * 
 * Fórmulas internas:
 * - Descuento por volumen
 * - Margen de ganancia
 * - IVA 16%
 * - Precio final
 * 
 * Uso: calcularTotalCot();
 * Triggers: Al cambiar cantidad o margen
 */

/**
 * agregarMaterialACotizacion()
 * Valida y agrega un material a la cotización actual
 * Limpia formulario después
 * 
 * Uso: <button onclick="agregarMaterialACotizacion()">
 * Validaciones: Material seleccionado, cantidad válida
 * Resultado: Agrega a cotizacionActual[] + actualiza tabla
 */

/**
 * removerMaterialDeCotizacion(itemId)
 * Elimina un material específico de la cotización
 * 
 * Parámetros: itemId (number) - ID único del item
 * Uso: removerMaterialDeCotizacion(1234567890);
 * Resultado: Actualiza tabla de resumen
 */

/**
 * guardarCotizacion()
 * Guarda la cotización en BD + genera PDF
 * Registra auditoría
 * Limpia la cotización después de guardar
 * 
 * Validaciones:
 * - cotizacionActual.length > 0
 * - Todos los cálculos correctos
 * 
 * Resultado:
 * - INSERT en tabla cotizaciones
 * - Guarda en localStorage
 * - Genera PDF
 * - Registra auditoría
 */

/**
 * descargarPDFCotizacionActual()
 * Descarga PDF SIN guardar en BD
 * Útil para preview antes de guardar
 * 
 * Uso: <button onclick="descargarPDFCotizacionActual()">
 * Resultado: Descarga Cotizacion_TEMP-timestamp.pdf
 */

/**
 * generarPDFCotizacion(cotizacion)
 * Genera el archivo PDF real
 * Llamado internamente por guardarCotizacion()
 * 
 * Parámetro: cotizacion (object)
 * Estructura:
 * {
 *   id: "COT-1234567",
 *   usuario: "Juan Pérez",
 *   fecha: "2026-03-17T10:30:00",
 *   materiales: [...],
 *   totalCosto: 9500,
 *   totalPrecio: 14326
 * }
 * 
 * Resultado: Descarga archivo PDF
 */

/**
 * limpiarCotizacion()
 * Limpia toda la cotización actual
 * Pide confirmación antes
 * 
 * Uso: <button onclick="limpiarCotizacion()">
 * Resultado: Vacía cotizacionActual[]
 */

/**
 * obtenerDescuentoVolumen(cantidad)
 * Calcula el descuento basado en cantidad
 * 
 * Parámetro: cantidad (number)
 * Retorna: porcentaje (number) - 0, 5, 10, 15
 * 
 * Ejemplo:
 * obtenerDescuentoVolumen(50)    // 0
 * obtenerDescuentoVolumen(100)   // 5
 * obtenerDescuentoVolumen(500)   // 10
 * obtenerDescuentoVolumen(1000)  // 15
 */

/**
 * validarCantidad(cantidad)
 * Valida si cantidad es válida
 * 
 * Parámetro: cantidad (any)
 * Retorna: {valido: boolean, error: string}
 * 
 * Ejemplo:
 * validarCantidad(0)      // {valido: false, error: "..."}
 * validarCantidad(100)    // {valido: true}
 * validarCantidad("abc")  // {valido: false}
 */

// ================================================================
// FUNCIONES DE AUDITORÍA Y LOGGING
// ================================================================

/**
 * registrarLogAuditoria(tipo, detalles)
 * Registra un evento en logs de auditoría
 * 
 * Parámetros:
 * - tipo (string): Tipo de evento
 *   Opciones: 'COTIZACION_GENERADA', 'PDF_DESCARGADO', ...
 * - detalles (object): Información adicional
 * 
 * Ejemplo:
 * registrarLogAuditoria('COTIZACION_GENERADA', {
 *   id: 'COT-123',
 *   items: 3,
 *   total: 14326
 * });
 * 
 * Resultado: Se inserta en BD (logs_auditoria)
 */

/**
 * cargarHistorialCotizaciones()
 * Carga todas las cotizaciones del localStorage
 * Llena el array cotizacionesHistorial
 * 
 * Uso: cargarHistorialCotizaciones();
 * Resultado: Llena variable cotizacionesHistorial
 */

// ================================================================
// FUNCIONES DE INICIALIZACIÓN
// ================================================================

/**
 * inicializarCotizaciones()
 * Inicializa todo el módulo de cotizaciones
 * Llamada automáticamente al cargar
 * 
 * Acciones:
 * - Carga materiales
 * - Carga historial
 * - Prepara dropdown
 * 
 * Uso: inicializarCotizaciones();
 */

/**
 * switchTab(tabId)
 * Cambia entre pestañas (Inventario, Cotizaciones, Config)
 * 
 * Parámetro: tabId (string)
 * Valores: 'tab-materiales', 'tab-cotizaciones', 'tab-config'
 * 
 * Ejemplo:
 * <button onclick="switchTab('tab-cotizaciones')">...</button>
 */

// ================================================================
// FUNCIONES DE UTILIDADES - VALIDACIONES
// ================================================================

/**
 * Validaciones.esNumeroPp(valor)
 * Valida si es número positivo
 * Retorna: boolean
 * 
 * Ejemplo:
 * Validaciones.esNumeroPp(100)    // true
 * Validaciones.esNumeroPp(-5)     // false
 * Validaciones.esNumeroPp("abc")  // false
 */

/**
 * Validaciones.esEmail(email)
 * Valida si es email válido
 * Retorna: boolean
 */

/**
 * Validaciones.esTexto(texto, min, max)
 * Valida longitud de texto
 * Parámetros: texto, longitud mínima (def 3), máxima (def 255)
 * Retorna: boolean
 */

/**
 * Validaciones.sanitizar(entrada)
 * Sanitiza entrada para XSS
 * Retorna: string limpio
 */

// ================================================================
// FUNCIONES DE UTILIDADES - FORMATOS
// ================================================================

/**
 * Formatos.redondear(valor, decimales)
 * Redondea a N decimales
 * 
 * Ejemplo:
 * Formatos.redondear(3.14159, 2)  // 3.14
 * Formatos.redondear(1234.5678, 0) // 1235
 */

/**
 * Formatos.porcentaje(porcentaje, valor)
 * Calcula porcentaje de un valor
 * 
 * Ejemplo:
 * Formatos.porcentaje(15, 1000)  // 150
 * Formatos.porcentaje(5, 200)    // 10
 */

/**
 * Formatos.descuento(valor, descuento)
 * Aplica descuento a un valor
 * 
 * Ejemplo:
 * Formatos.descuento(1000, 10)  // 900
 */

/**
 * Formatos.margen(costo, margen)
 * Aplica margen a un costo
 * 
 * Ejemplo:
 * Formatos.margen(100, 30)  // 130
 */

/**
 * Formatos.impuesto(valor, tarifa)
 * Aplica impuesto a un valor
 * 
 * Ejemplo:
 * Formatos.impuesto(1000, 16)  // 1160
 */

// ================================================================
// FUNCIONES DE UTILIDADES - ARRAYS
// ================================================================

/**
 * Arrays.ordenar(array, propiedad, direccion)
 * Ordena array de objetos
 * 
 * Parámetros:
 * - array: Array de objetos
 * - propiedad: Campo a ordenar
 * - direccion: 'asc' o 'desc'
 * 
 * Retorna: Array nuevo ordenado
 * 
 * Ejemplo:
 * Arrays.ordenar(materiales, 'nombre', 'asc');
 */

/**
 * Arrays.filtrar(array, predicado)
 * Filtra array con función
 * 
 * Parámetro: predicado (function)
 * Retorna: Array filtrado
 * 
 * Ejemplo:
 * Arrays.filtrar(cotizaciones, c => c.total > 1000);
 */

/**
 * Arrays.agrupar(array, propiedad)
 * Agrupa array por propiedad
 * 
 * Retorna: Object con grupos
 * 
 * Ejemplo:
 * Arrays.agrupar(materiales, 'categoria');
 * // {Tazas: [...], Textiles: [...], ...}
 */

/**
 * Arrays.unicos(array)
 * Obtiene valores únicos
 * Retorna: Array sin duplicados
 */

/**
 * Arrays.combinar(...arrays)
 * Combina múltiples arrays
 * Retorna: Array único
 */

// ================================================================
// FUNCIONES DE UTILIDADES - STORAGE
// ================================================================

/**
 * Storage.guardar(clave, valor)
 * Guarda en localStorage
 * 
 * Parámetros:
 * - clave: String para identificar
 * - valor: Cualquier valor (se convierte a JSON)
 * 
 * Retorna: boolean (éxito/fracaso)
 * 
 * Ejemplo:
 * Storage.guardar('usuario', {nombre: 'Juan'});
 * Storage.guardar('cotizaciones', [cot1, cot2]);
 */

/**
 * Storage.obtener(clave, defecto)
 * Obtiene del localStorage
 * 
 * Parámetros:
 * - clave: String
 * - defecto: Valor si no existe
 * 
 * Retorna: valor o defecto
 * 
 * Ejemplo:
 * const usuario = Storage.obtener('usuario', {});
 */

/**
 * Storage.eliminar(clave)
 * Elimina del localStorage
 * Retorna: boolean
 */

/**
 * Storage.limpiar()
 * Limpia todo el localStorage
 * ⚠️ PELIGROSO - No usar sin confirmación
 * Retorna: boolean
 */

// ================================================================
// FUNCIONES DE UTILIDADES - LOGS
// ================================================================

/**
 * Logs.registrar(mensaje, tipo)
 * Registra mensaje en consola con color
 * 
 * Parámetros:
 * - mensaje: String
 * - tipo: 'info', 'success', 'warning', 'error'
 * 
 * Ejemplo:
 * Logs.registrar('Cotización guardada', 'success');
 * Logs.registrar('No hay materiales', 'warning');
 */

/**
 * Logs.tabla(datos)
 * Muestra array como tabla en consola
 * Util para debugging
 * 
 * Ejemplo:
 * Logs.tabla(cotizacionesHistorial);
 */

/**
 * Logs.medir(función, nombre)
 * Mide tiempo de ejecución
 * 
 * Ejemplo:
 * Logs.medir(() => {
 *   calcularTotalCot();
 * }, 'Cálculo de cotización');
 */

// ================================================================
// VARIABLES GLOBALES
// ================================================================

/**
 * cotizacionActual
 * Array de items en cotización actual
 * Estructura de cada item:
 * {
 *   id: timestamp único,
 *   materialId: ID del material,
 *   nombre: string,
 *   cantidad: number,
 *   precioUnit: number,
 *   unidad: string,
 *   desglose: object con cálculos
 * }
 */

/**
 * materialesData
 * Array de todos los materiales cargados
 * Guardado en memoria para performance
 */

/**
 * cotizacionesHistorial
 * Array de todas las cotizaciones guardadas
 * Cargado del localStorage
 */

/**
 * configuracionImpuestos
 * Objeto con configuración de impuestos
 * Propiedades:
 * - tasa_iva: 16 (porcentaje)
 * - descuentoVolumen: Array de descuentos
 */

// ================================================================
// CONSTANTES DE CONFIGURACIÓN
// ================================================================

/**
 * Descuentos por volumen (del archivo config-avanzada.js):
 * 100 unidades: 5%
 * 500 unidades: 10%
 * 1000 unidades: 15%
 * 
 * Para cambiar: Editar CONFIG_COTIZACIONES.descuentosVolumen
 */

/**
 * IVA (del archivo config-avanzada.js):
 * Actual: 16% (México)
 * 
 * Para cambiar: Editar CONFIG_COTIZACIONES.impuestos.IVA_DEFECTO
 */

// ================================================================
// DATOS NECESARIOS EN SUPABASE
// ================================================================

/**
 * Tabla: materiales
 * Columnas requeridas:
 * - id (BIGINT, PK)
 * - nombre (VARCHAR)
 * - categoria (VARCHAR)
 * - costo_compra (DECIMAL) ← CRÍTICO
 * - unidad_medida (VARCHAR)
 * - stock_actual (INT)
 * - stock_minimo (INT)
 * 
 * Ejemplo de inserción:
 * INSERT INTO materiales VALUES
 * (1, 'Taza Blanca', 'Tazas', 15.50, 'pza', 100, 5);
 */

/**
 * Tabla: cotizaciones
 * Columnas requeridas:
 * - id (VARCHAR, PK) - COT-timestamp
 * - usuario (VARCHAR)
 * - email (VARCHAR)
 * - fecha (TIMESTAMP)
 * - materiales (JSONB)
 * - total_costo (DECIMAL)
 * - total_precio (DECIMAL)
 * - estado (VARCHAR)
 */

/**
 * Tabla: logs_auditoria (Opcional)
 * Columnas:
 * - id (BIGINT, PK)
 * - tipo (VARCHAR)
 * - usuario (VARCHAR)
 * - detalles (JSONB)
 * - timestamp (TIMESTAMP)
 */

// ================================================================
// EJEMPLOS PRÁCTICOS
// ================================================================

/**
 * EJEMPLO 1: Crear una cotización programáticamente
 * 
 * // Agregar 3 materiales
 * document.getElementById('cotMaterial').value = '1'; // ID del material
 * document.getElementById('cotCantidad').value = '100';
 * agregarMaterialACotizacion();
 * 
 * document.getElementById('cotMaterial').value = '2';
 * document.getElementById('cotCantidad').value = '50';
 * agregarMaterialACotizacion();
 * 
 * // Guardar
 * guardarCotizacion();
 */

/**
 * EJEMPLO 2: Obtener descuento para cantidad
 * 
 * const cantidades = [50, 100, 500, 1000];
 * cantidades.forEach(cant => {
 *   const descuento = obtenerDescuentoVolumen(cant);
 *   console.log(`${cant} unidades: ${descuento}%`);
 * });
 * // Output:
 * // 50 unidades: 0%
 * // 100 unidades: 5%
 * // 500 unidades: 10%
 * // 1000 unidades: 15%
 */

/**
 * EJEMPLO 3: Filtrar cotizaciones por monto
 * 
 * const cotizacionesAltas = Arrays.filtrar(
 *   cotizacionesHistorial,
 *   c => c.totalPrecio > 5000
 * );
 * Logs.tabla(cotizacionesAltas);
 */

/**
 * EJEMPLO 4: Guardar configuración personalizada
 * 
 * Storage.guardar('config_usuario', {
 *   margenDefecto: 35,
 *   ivaDefecto: 16,
 *   nombreEmpresa: 'Mi Empresa'
 * });
 */

// ================================================================
// TROUBLESHOOTING RÁPIDO
// ================================================================

/**
 * ❌ ERROR: "cotizacionActual is not defined"
 * ✅ SOLUCIÓN: Asegúrate que app.js está cargado antes de usar
 * 
 * ❌ ERROR: "No se carga dropdown de materiales"
 * ✅ SOLUCIÓN: Verifica conexión a Supabase, tabla existe
 * 
 * ❌ ERROR: "PDF no se descarga"
 * ✅ SOLUCIÓN: Verifica jsPDF está cargado, cotización tiene datos
 * 
 * ❌ ERROR: "Cálculos incorrectos"
 * ✅ SOLUCIÓN: Verifica precio unitario está cargado, cantidad válida
 * 
 * ❌ ERROR: "Storage no preserva datos"
 * ✅ SOLUCIÓN: Verifica localStorage no está deshabilitado en navegador
 */

// ================================================================
// ATAJOS ÚTILES EN CONSOLA
// ================================================================

/**
 * // Ver estado actual
 * console.table(cotizacionActual);
 * console.table(materialesData);
 * 
 * // Simular descuento
 * obtenerDescuentoVolumen(250);
 * 
 * // Ver configuración
 * console.log(CONFIG_COTIZACIONES);
 * 
 * // Ver historial
 * console.table(cotizacionesHistorial);
 * 
 * // Limpiar datos (⚠️)
 * Storage.limpiar();
 * cotizacionActual = [];
 * 
 * // Exportar historial a CSV (para Excel)
 * JSON.stringify(cotizacionesHistorial, null, 2)
 */

---

**Última actualización**: 17/03/2026  
**Versión**: 1.0.0  
**Nota**: Actualizar según cambios en el sistema
