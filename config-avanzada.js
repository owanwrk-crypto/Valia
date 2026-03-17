/**
 * CONFIGURACIÓN AVANZADA - VALIA PRO
 * Archivo para personalizar el comportamiento del sistema de cotizaciones
 * 
 * INSTRUCCIONES:
 * 1. No modifiques este archivo a menos que sepas qué haces
 * 2. Haz backup before antes de cambios importantes
 * 3. Prueba los cambios en environment de desarrollo primero
 * 4. Reinicia el navegador después de cambios
 */

// ============================================
// CONFIGURACIÓN DE IMPUESTOS Y DESCUENTOS
// ============================================

const CONFIG_COTIZACIONES = {
    // Tabla de impuestos por región/tipo
    impuestos: {
        "IVA_MEXICO": 16,      // Impuesto al Valor Agregado en México
        "IVA_USA": 0,          // No hay IVA federal en USA (aplica por estado)
        "IVA_ESPAÑA": 21,      // IVA en España
        "IVA_COLOMBIA": 19,    // IVA en Colombia
        "IVA_DEFECTO": 16      // IVA por defecto usado actualmente
    },

    // Configuración de descuentos por volumen
    descuentosVolumen: {
        nivel1: { cantidad: 50, porcentaje: 2 },
        nivel2: { cantidad: 100, porcentaje: 5 },
        nivel3: { cantidad: 500, porcentaje: 10 },
        nivel4: { cantidad: 1000, porcentaje: 15 },
        nivel5: { cantidad: 5000, porcentaje: 20 },
        // Personalizar según necesidades
    },

    // Descuentos por categoría de producto
    descuentosPorCategoria: {
        "Tazas": 0,           // Sin descuento especial
        "Textiles": 3,        // 3% descuento fijo
        "Viniles": 2,         // 2% descuento fijo
        "Consumibles": 5,     // 5% descuento fijo
        "General": 0
    },

    // Márgenes de ganancia recomendados por categoría
    margenesPorCategoria: {
        "Tazas": 35,          // 35% margen recomendado
        "Textiles": 40,       // 40% margen recomendado
        "Viniles": 45,        // 45% margen recomendado
        "Consumibles": 25,    // 25% margen recomendado (bajo porque se venden en volumen)
        "General": 30         // 30% por defecto
    },

    // Validaciones y límites
    validaciones: {
        cantidadMinima: 1,          // Cantidad mínima requerida
        cantidadMaxima: 1000000,    // Cantidad máxima (límite de sistema)
        margenMinimo: 0,            // Margen mínimo (%: negativo no permitido)
        margenMaximo: 300,          // Margen máximo (%)
        precioUnitarioMinimo: 0.01, // Precio más bajo permitido
    },

    // Configuración de redondeo
    redondeo: {
        preciosFinales: 2,      // 2 decimales para precios finales
        costosIntermedios: 4,   // 4 decimales para cálculos intermedios
    },

    // Mensajes personalizables
    mensajes: {
        exito: "✅ Operación completada con éxito",
        error: "❌ Ha ocurrido un error",
        advertencia: "⚠️ Advertencia",
        descuentoAplicado: "🎁 Descuento por volumen aplicado",
        cotizacionGuardada: "✅ Cotización guardada y PDF generado",
    }
};

// ============================================
// CONFIGURACIÓN DE BASE DE DATOS
// ============================================

const CONFIG_BASE_DATOS = {
    // Información de conectividad
    supabase: {
        url: "https://ietudbyosupknisbfhlj.supabase.co",
        apiKey: "sb_publishable_wzDzxlSwdpKw4ok4J1qPPA_1eabsV4P",
        version: "2",
        timeout: 30000  // 30 segundos
    },

    // Nombres de tablas
    tablas: {
        materiales: "materiales",
        cotizaciones: "cotizaciones",
        usuarios: "usuarios",
        logs: "logs_auditoria"
    },

    // Configuración de cachés
    cache: {
        habilitado: true,
        duracionMateriales: 300000,  // 5 minutos en ms
        duracionCotizaciones: 600000 // 10 minutos en ms
    }
};

// ============================================
// CONFIGURACIÓN DE INTERFAZ/UI
// ============================================

const CONFIG_UI = {
    // Temas disponibles
    temas: {
        modaPrincipal: {
            primary: "#6366f1",      // Índigo
            accent: "#00f2ff",       // Cyan
            bgDark: "#0f172a",       // Dark blue
            glass: "rgba(15, 23, 42, 0.8)",
            border: "rgba(255, 255, 255, 0.1)"
        },
        modoClaro: {
            primary: "#4f46e5",
            accent: "#0ea5e9",
            bgLight: "#f8fafc",
            glass: "rgba(255, 255, 255, 0.8)",
            border: "rgba(0, 0, 0, 0.1)"
        }
    },

    // Animaciones
    animaciones: {
        duracionTransicion: "0.3s",  // CSS transition duration
        habilitarAnimaciones: true,
        velocidadFadein: "0.5s"
    },

    // Responsividad - Breakpoints
    breakpoints: {
        mobile: 480,       // px
        tablet: 768,       // px
        laptop: 1024,      // px
        desktop: 1440      // px
    },

    // Opciones de tabla
    tabla: {
        filasPorPagina: 20,
        mostrarPaginacion: true,
        habilitarOrdenamiento: true,
        habilitarFiltrado: true
    }
};

// ============================================
// CONFIGURACIÓN DE EXPORTACIÓN/REPORTES
// ============================================

const CONFIG_REPORTES = {
    // Formato de PDF
    pdf: {
        orientacion: "portrait",      // portrait | landscape
        tamanoPapel: "letter",        // letter | a4
        margenesTotales: 14,          // px
        tamanoFuente: 11,
        incluirLogo: true,
        incluirFooter: true,
        compresion: true
    },

    // Formatos de exportación disponibles
    formatosExportacion: {
        PDF: { habilitado: true, icono: "📄" },
        EXCEL: { habilitado: true, icono: "📊" },
        CSV: { habilitado: false, icono: "📋" },
        JSON: { habilitado: false, icono: "⚙️" }
    },

    // Información en reportes
    datos: {
        mostrarImpuestos: true,
        mostrarDescuentos: true,
        mostrarMargen: false,  // No mostrar margen en PDF por privacidad
        mostrarCostos: false,  // No mostrar costos internos en PDF
        incluirCondicionesVenta: false,
        incluirTerminosEntrega: false
    }
};

// ============================================
// CONFIGURACIÓN DE AUDITORÍA Y SEGURIDAD
// ============================================

const CONFIG_AUDITORIA = {
    // Tipos de eventos a registrar
    eventosRegistrados: {
        "COTIZACION_GENERADA": true,
        "COTIZACION_DESCARGADA": true,
        "MATERIAL_AGREGADO": false,
        "MATERIAL_ELIMINADO": false,
        "USUARIO_LOGIN": true,
        "USUARIO_LOGOUT": true,
        "PDF_GENERADO": true,
        "ERROR_SISTEMA": true
    },

    // Retención de logs
    retencion: {
        dias: 90,  // Mantener logs por 90 días
        autoLimpiar: true
    },

    // Niveles de severidad
    nivelRegistro: {
        INFO: 0,
        WARNING: 1,
        ERROR: 2,
        CRITICO: 3
    }
};

// ============================================
// FUNCIONES DE UTILIDAD AVANZADA
// ============================================

/**
 * Aplicar configuración personalizada
 * @param {string} configuracion - Nombre de la configuración a usar
 */
function aplicarConfiguracion(configuracion = "produccion") {
    console.log(`✅ Aplicando configuración: ${configuracion}`);
    
    if (configuracion === "desarrollo") {
        CONFIG_AUDITORIA.eventosRegistrados["MATERIAL_AGREGADO"] = true;
        CONFIG_AUDITORIA.eventosRegistrados["MATERIAL_ELIMINADO"] = true;
        console.log("🔧 Modo desarrollo activado");
    } else if (configuracion === "produccion") {
        console.log("🏭 Modo producción activado");
    }
}

/**
 * Obtener configuración de descuento total para un material
 * @param {string} categoria - Categoría del material
 * @param {number} cantidad - Cantidad ordenada
 * @returns {number} Descuento total en porcentaje
 */
function obtenerDescuentoTotal(categoria, cantidad) {
    let descuentoCategoria = CONFIG_COTIZACIONES.descuentosPorCategoria[categoria] || 0;
    let descuentoVolumen = 0;

    // Encontrar desc de volumen
    for (let nivel of Object.values(CONFIG_COTIZACIONES.descuentosVolumen)) {
        if (cantidad >= nivel.cantidad) {
            descuentoVolumen = nivel.porcentaje;
        }
    }

    // Sumar descuentos (máximo, no se acumulan)
    return Math.max(descuentoCategoria, descuentoVolumen);
}

/**
 * Calcular margen recomendado por categoría
 * @param {string} categoria - Categoría del material
 * @returns {number} Margen recomendado en porcentaje
 */
function obtenerMargenRecomendado(categoria) {
    return CONFIG_COTIZACIONES.margenesPorCategoria[categoria] || 30;
}

/**
 * Validar cantidad según las reglas configuradas
 * @param {number} cantidad - Cantidad a validar
 * @returns {object} { valido: boolean, mensaje: string }
 */
function validarCantidadAvanzada(cantidad) {
    const { cantidadMinima, cantidadMaxima } = CONFIG_COTIZACIONES.validaciones;

    if (cantidad < cantidadMinima) {
        return { 
            valido: false, 
            mensaje: `La cantidad debe ser mayor a ${cantidadMinima}` 
        };
    }

    if (cantidad > cantidadMaxima) {
        return { 
            valido: false, 
            mensaje: `La cantidad no puede exceder ${cantidadMaxima}` 
        };
    }

    return { valido: true, mensaje: "Cantidad válida" };
}

// ============================================
// EXPORTAR CONFIGURACIONES
// ============================================

// Hacer disponibles globalmente
window.CONFIG_COTIZACIONES = CONFIG_COTIZACIONES;
window.CONFIG_BASE_DATOS = CONFIG_BASE_DATOS;
window.CONFIG_UI = CONFIG_UI;
window.CONFIG_REPORTES = CONFIG_REPORTES;
window.CONFIG_AUDITORIA = CONFIG_AUDITORIA;
window.obtenerDescuentoTotal = obtenerDescuentoTotal;
window.obtenerMargenRecomendado = obtenerMargenRecomendado;
window.validarCantidadAvanzada = validarCantidadAvanzada;

console.log("✅ Configuración avanzada cargada exitosamente");
