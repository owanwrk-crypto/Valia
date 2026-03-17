/**
 * UTILIDADES Y VALIDACIONES
 * Funciones helper para el sistema de cotizaciones de Valia Pro
 */

// ============================================
// VALIDACIONES
// ============================================

/**
 * Validar si una entrada es un número positivo válido
 * @param {any} valor - Valor a validar
 * @returns {boolean}
 */
function esNumeroPpsitivo(valor) {
    const num = parseFloat(valor);
    return !isNaN(num) && isFinite(num) && num > 0;
}

/**
 * Validar especificaciones de email
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
function esEmailValido(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Validar longitud de texto
 * @param {string} texto - Texto a validar
 * @param {number} minimo - Longitud mínima
 * @param {number} maximo - Longitud máxima
 * @returns {boolean}
 */
function esTextoValido(texto, minimo = 3, maximo = 255) {
    const len = String(texto).trim().length;
    return len >= minimo && len <= maximo;
}

/**
 * Validar que no tenga caracteres especiales peligrosos
 * @param {string} texto - Texto a validar
 * @returns {boolean}
 */
function sinCaracteresEspeciales(texto) {
    // Permitir solo letras, números, espacios y algunos caracteres
    const regex = /^[a-zA-Z0-9\s\-_ñáéíóúÑÁÉÍÓÚ.,'()]+$/;
    return regex.test(texto);
}

/**
 * Sanitizar entrada para prevenir XSS
 * @param {string} entrada - Texto a limpiar
 * @returns {string} Texto sanitizado
 */
function sanitizarEntrada(entrada) {
    const div = document.createElement('div');
    div.textContent = entrada;
    return div.innerHTML;
}

/**
 * Validar rango de números
 * @param {number} valor - Valor a validar
 * @param {number} minimo - Valor mínimo (incluido)
 * @param {number} maximo - Valor máximo (incluido)
 * @returns {boolean}
 */
function estaDentroDelRango(valor, minimo, maximo) {
    const num = parseFloat(valor);
    return !isNaN(num) && num >= minimo && num <= maximo;
}

// ============================================
// FORMATOS Y CONVERSIONES
// ============================================

/**
 * Convertir segundos a formato HH:MM:SS
 * @param {number} segundos - Segundos totales
 * @returns {string}
 */
function formatearTiempo(segundos) {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const secs = segundos % 60;
    
    return [horas, minutos, secs]
        .map(v => String(v).padStart(2, '0'))
        .join(':');
}

/**
 * Convertir bytes a formato legible (KB, MB, GB)
 * @param {number} bytes - Número de bytes
 * @returns {string}
 */
function formatearBytes(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Redondear a número específico de decimales
 * @param {number} valor - Valor a redondear
 * @param {number} decimales - Número de decimales
 * @returns {number}
 */
function redondear(valor, decimales = 2) {
    const factor = Math.pow(10, decimales);
    return Math.round(valor * factor) / factor;
}

/**
 * Calcular porcentaje de un valor
 * @param {number} porcentaje - Porcentaje
 * @param {number} valor - Valor base
 * @returns {number}
 */
function calcularPorcentaje(porcentaje, valor) {
    return redondear(valor * (porcentaje / 100));
}

/**
 * Obtener valor después de aplicar descuento
 * @param {number} valor - Valor original
 * @param {number} descuento - Descuento en porcentaje
 * @returns {number}
 */
function aplicarDescuento(valor, descuento) {
    return redondear(valor - calcularPorcentaje(descuento, valor));
}

/**
 * Obtener valor después de aplicar margen
 * @param {number} costo - Costo base
 * @param {number} margen - Margen en porcentaje
 * @returns {number}
 */
function aplicarMargen(costo, margen) {
    return redondear(costo * (1 + margen / 100));
}

/**
 * Obtener valor con impuesto incluido
 * @param {number} valor - Valor sin impuesto
 * @param {number} tarifaImpuesto - Tarifa de impuesto en porcentaje
 * @returns {number}
 */
function aplicarImpuesto(valor, tarifaImpuesto) {
    return redondear(valor + calcularPorcentaje(tarifaImpuesto, valor));
}

// ============================================
// MANIPULACIÓN DE ARRAYS/OBJETOS
// ============================================

/**
 * Ordenar array de objetos por propiedad
 * @param {Array} array - Array a ordenar
 * @param {string} propiedad - Nombre de la propiedad
 * @param {string} direccion - 'asc' | 'desc'
 * @returns {Array}
 */
function ordenarPor(array, propiedad, direccion = 'asc') {
    return [...array].sort((a, b) => {
        const valueA = a[propiedad];
        const valueB = b[propiedad];
        
        if (valueA < valueB) return direccion === 'asc' ? -1 : 1;
        if (valueA > valueB) return direccion === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * Filtrar array de objetos por condición
 * @param {Array} array - Array a filtrar
 * @param {Function} predicado - Función que retorna boolean
 * @returns {Array}
 */
function filtrar(array, predicado) {
    return array.filter(predicado);
}

/**
 * Agrupar array de objetos por propiedad
 * @param {Array} array - Array a agrupar
 * @param {string} propiedad - Propiedad para agrupar
 * @returns {Object}
 */
function agruparPor(array, propiedad) {
    return array.reduce((grupo, item) => {
        const key = item[propiedad];
        if (!grupo[key]) {
            grupo[key] = [];
        }
        grupo[key].push(item);
        return grupo;
    }, {});
}

/**
 * Obtener valores únicos de array
 * @param {Array} array - Array original
 * @returns {Array}
 */
function obtenerUnicos(array) {
    return [...new Set(array)];
}

/**
 * Encontrar elemento duplicado en array
 * @param {Array} array - Array a verificar
 * @returns {any} Elemento duplicado o null
 */
function encontrarDuplicado(array) {
    return array.find((item, index) => array.indexOf(item) !== index) || null;
}

/**
 * Combinar múltiples arrays
 * @param {...Array} arrays - Arrays a combinar
 * @returns {Array}
 */
function combinarArrays(...arrays) {
    return arrays.flat();
}

// ============================================
// MANIPULACIÓN DE STRINGS
// ============================================

/**
 * Capitalizar primera letra de string
 * @param {string} texto - Texto a capitalizar
 * @returns {string}
 */
function capitalizarPrimera(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

/**
 * Convertir a mayúsculas
 * @param {string} texto - Texto a convertir
 * @returns {string}
 */
function aUpperCase(texto) {
    return String(texto).toUpperCase();
}

/**
 * Convertir a minúsculas
 * @param {string} texto - Texto a convertir
 * @returns {string}
 */
function aLowerCase(texto) {
    return String(texto).toLowerCase();
}

/**
 * Remover espacios en blanco
 * @param {string} texto - Texto a limpiar
 * @returns {string}
 */
function removerEspacios(texto) {
    return String(texto).replace(/\s/g, '');
}

/**
 * Truncar texto a cierta longitud
 * @param {string} texto - Texto a truncar
 * @param {number} longitud - Longitud máxima
 * @param {string} suffijo - Texto al final (ej: "...")
 * @returns {string}
 */
function truncarTexto(texto, longitud = 50, suffijo = '...') {
    return texto.length > longitud 
        ? texto.substring(0, longitud) + suffijo 
        : texto;
}

/**
 * Reemplazar múltiples valores en string
 * @param {string} texto - Texto original
 * @param {Object} reemplazos - {original: 'reemplazo', ...}
 * @returns {string}
 */
function reemplazarMultiple(texto, reemplazos) {
    let resultado = texto;
    Object.entries(reemplazos).forEach(([original, nuevo]) => {
        resultado = resultado.replaceAll(original, nuevo);
    });
    return resultado;
}

// ============================================
// OPERACIONES DE FECHA/HORA
// ============================================

/**
 * Obtener fecha actual en formato deseado
 * @param {string} formato - 'corto' | 'largo' | 'iso'
 * @returns {string}
 */
function fechaActual(formato = 'largo') {
    const hoy = new Date();
    
    if (formato === 'corto') {
        return hoy.toLocaleDateString('es-MX');
    } else if (formato === 'largo') {
        return hoy.toLocaleDateString('es-MX', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    return hoy.toISOString();
}

/**
 * Calcular diferencia de días entre dos fechas
 * @param {Date|string} fecha1 - Primera fecha
 * @param {Date|string} fecha2 - Segunda fecha
 * @returns {number} Diferencia en días
 */
function diferenciaDias(fecha1, fecha2) {
    const f1 = new Date(fecha1);
    const f2 = new Date(fecha2);
    const diffTime = Math.abs(f2 - f1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Verificar si fecha es válida
 * @param {any} fecha - Fecha a validar
 * @returns {boolean}
 */
function esFechaValida(fecha) {
    return fecha instanceof Date ? !isNaN(fecha) : !isNaN(Date.parse(fecha));
}

/**
 * Formatear fecha a estilo específico
 * @param {Date|string} fecha - Fecha a formatear
 * @param {string} estilo - 'corto' | 'medio' | 'largo'
 * @returns {string}
 */
function formatearFecha(fecha, estilo = 'medio') {
    const estilos = {
        corto: { dateStyle: 'short' },
        medio: { dateStyle: 'medium' },
        largo: { dateStyle: 'long' },
        completo: { dateStyle: 'full', timeStyle: 'medium' }
    };
    
    return new Intl.DateTimeFormat('es-MX', estilos[estilo] || estilos.medio)
        .format(new Date(fecha));
}

// ============================================
// ALMACENAMIENTO
// ============================================

/**
 * Guardar dato en localStorage
 * @param {string} clave - Clave para guardar
 * @param {any} valor - Valor a guardar (se convierte a JSON)
 * @returns {boolean}
 */
function guardarEnStorage(clave, valor) {
    try {
        localStorage.setItem(clave, JSON.stringify(valor));
        return true;
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
        return false;
    }
}

/**
 * Obtener dato de localStorage
 * @param {string} clave - Clave a obtener
 * @param {any} defecto - Valor por defecto si no existe
 * @returns {any}
 */
function obtenerDelStorage(clave, defecto = null) {
    try {
        const valor = localStorage.getItem(clave);
        return valor ? JSON.parse(valor) : defecto;
    } catch (error) {
        console.error('Error al obtener de localStorage:', error);
        return defecto;
    }
}

/**
 * Eliminar dato de localStorage
 * @param {string} clave - Clave a eliminar
 * @returns {boolean}
 */
function eliminarDelStorage(clave) {
    try {
        localStorage.removeItem(clave);
        return true;
    } catch (error) {
        console.error('Error al eliminar de localStorage:', error);
        return false;
    }
}

/**
 * Limpiar todo el localStorage
 * @returns {boolean}
 */
function limpiarStorage() {
    try {
        localStorage.clear();
        return true;
    } catch (error) {
        console.error('Error al limpiar localStorage:', error);
        return false;
    }
}

// ============================================
// LOGGING Y DEBUG
// ============================================

/**
 * Registrar mensaje en consola con color
 * @param {string} mensaje - Mensaje a registrar
 * @param {string} tipo - 'info' | 'success' | 'warning' | 'error'
 */
function registrarLog(mensaje, tipo = 'info') {
    const estilos = {
        info: 'color: #0ea5e9; font-weight: bold;',
        success: 'color: #22c55e; font-weight: bold;',
        warning: 'color: #f59e0b; font-weight: bold;',
        error: 'color: #ef4444; font-weight: bold;'
    };
    
    console.log(`%c[${tipo.toUpperCase()}] ${mensaje}`, estilos[tipo] || estilos.info);
}

/**
 * Mostrar tabla en consola
 * @param {Array} datos - Array de datos
 */
function tabulaConsola(datos) {
    console.table(datos);
}

/**
 * Medir tiempo de ejecución de función
 * @param {Function} funcion - Función a medir
 * @param {string} nombre - Nombre de la función (para log)
 * @returns {any} Resultado de la función
 */
function medirTiempo(funcion, nombre = 'Función') {
    const inicio = performance.now();
    const resultado = funcion();
    const fin = performance.now();
    const tiempo = redondear(fin - inicio, 2);
    
    registrarLog(`${nombre} ejecutada en ${tiempo}ms`, 'info');
    return resultado;
}

// ============================================
// EXPORTAR UTILIDADES
// ============================================

window.Validaciones = {
    esNumeroPp: esNumeroPpsitivo,
    esEmail: esEmailValido,
    esTexto: esTextoValido,
    sinEspeciales: sinCaracteresEspeciales,
    sanitizar: sanitizarEntrada,
    rango: estaDentroDelRango
};

window.Formatos = {
    tiempo: formatearTiempo,
    bytes: formatearBytes,
    redondear: redondear,
    porcentaje: calcularPorcentaje,
    descuento: aplicarDescuento,
    margen: aplicarMargen,
    impuesto: aplicarImpuesto
};

window.Arrays = {
    ordenar: ordenarPor,
    filtrar: filtrar,
    agrupar: agruparPor,
    unicos: obtenerUnicos,
    duplicado: encontrarDuplicado,
    combinar: combinarArrays
};

window.Strings = {
    capitalizar: capitalizarPrimera,
    upper: aUpperCase,
    lower: aLowerCase,
    limpiar: removerEspacios,
    truncar: truncarTexto,
    reemplazar: reemplazarMultiple
};

window.Fechas = {
    hoy: fechaActual,
    diferencia: diferenciaDias,
    valida: esFechaValida,
    formato: formatearFecha
};

window.Storage = {
    guardar: guardarEnStorage,
    obtener: obtenerDelStorage,
    eliminar: eliminarDelStorage,
    limpiar: limpiarStorage
};

window.Logs = {
    registrar: registrarLog,
    tabla: tabulaConsola,
    medir: medirTiempo
};

console.log('✅ Utilidades y validaciones cargadas exitosamente');
