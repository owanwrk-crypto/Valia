# 📊 ESTRUCTURA DEL PROYECTO - VALIA PRO v1.0.0

## 🏗️ Arquitectura General

```
Valia-cotizador/
│
├── 📄 ARCHIVOS HTML (Interfaz)
│   ├── index.html              # Página de login/acceso
│   └── cotizador.html          # Aplicación principal
│
├── 🎨 ARCHIVOS CSS (Estilos)
│   └── style.css               # Estilos responsivos + temas
│
├── ⚙️ ARCHIVOS JAVASCRIPT (Lógica)
│   ├── app.js                  # Lógica principal (500+ líneas)
│   ├── config-avanzada.js      # Configuración personalizable
│   └── utilidades.js           # Funciones helper y validaciones
│
└── 📚 ARCHIVOS DE DOCUMENTACIÓN
    ├── README.md               # Manual de usuario
    ├── MANUAL-TECNICO.md       # Documentación técnica
    ├── GUIA-TESTING.md         # Casos de prueba (150+)
    ├── REFERENCIA-RAPIDA.md    # Guía de funciones
    ├── IMPLEMENTACION.md       # Resumen de implementación
    └── ESTRUCTURA-PROYECTO.md  # Este archivo
```

## 📋 Descripción de Archivos

### 1. **index.html** - Página de Acceso
```
Propósito: Autenticación de usuarios
Contenido:
  • Formulario de login
  • Validación de credenciales
  • Redirección a cotizador.html
  • Almacenamiento de sesión en localStorage
Conexión: Supabase Auth (futuro)
```

### 2. **cotizador.html** - Aplicación Principal
```
Propósito: Interfaz de cotizaciones e inventario
Secciones:
  • Header con nombre de usuario
  • Navegación de pestañas (3 módulos)
  • Pestaña 1: Inventario (CRUD de materiales)
  • Pestaña 2: Cotizaciones (Crear cotizaciones)
  • Pestaña 3: Configuración
Librerías incluidas:
  • Supabase JS SDK
  • jsPDF (generación de PDF)
  • XLSX (exportación a Excel)
Módulos JS cargados:
  • app.js
  • utilidades.js (defer)
  • config-avanzada.js (defer)
```

### 3. **style.css** - Estilos Globales
```
Características:
  • Glassmorphism design
  • Colores: Índigo (#6366f1) + Cyan (#00f2ff)
  • Responsibo: Mobile (480px), Tablet (768px), Desktop (1024px+)
  • Animaciones suaves (300ms transiciones)
  • Dark mode por defecto
  
Componentes:
  • Pestañas (nav-tabs, tab-btn, tab-content)
  • Formularios (form-field, btn-save)
  • Tablas (inventory-list, table estilos)
  • Tarjetas (stat-card, material-form)
  • Layouts (inventory-layout con grid)
  • Botones (btn-save, btn-export, btn-delete)
```

### 4. **app.js** - LÓGICA PRINCIPAL (~700 líneas)

#### Sección 1: Inicialización y Utilidades
```javascript
// Credenciales Supabase
URL_VALIA, KEY_VALIA

// Estado global
materialesData[], currentFilter, currentSearch, cotizacionActual[]

// Funciones utilidad
formatCurrency()      // Formatea moneda MXN
formatDateTime()      // Formatea fecha/hora
switchTab()          // Cambia entre pestañas
```

#### Sección 2: INVENTARIO
```javascript
cargarMateriales()   // Carga desde Supabase
renderTablaMateriales() // Renderiza tabla
filtrarInventario()  // Filtra por texto/categoría
guardarNuevoMaterial() // Inserta nuevo material
eliminarMaterial()   // Elimina material
exportarExcel()      // Exporta tabla a Excel
exportarPDF()        // Exporta tabla a PDF
```

#### Sección 3: COTIZACIONES ⭐ MÁS IMPORTANTE
```javascript
// Auditoria
registrarLogAuditoria(tipo, detalles)

// Configuración de cotizaciones
configuracionImpuestos {
  tasa_iva: 16,
  descuentoVolumen: [{cantidad, porcentaje}, ...]
}
cotizacionesHistorial[]

// Funciones de carga
cargarMaterialesEnCotizacion()     // Llena dropdown
cargarHistorialCotizaciones()      // Carga desde localStorage

// Validaciones
validarCantidad(cantidad)          // Número positivo
obtenerDescuentoVolumen(cantidad)  // Calcula % descuento

// Cálculos en tiempo real
actualizarPrecioUnitarioCot()      // Actualiza precio unitario
calcularTotalCot()                 // Calcula TODOS los totales

// Gestor de cotización actual
agregarMaterialACotizacion()       // Agrega material validado
removerMaterialDeCotizacion(id)    // Elimina material
actualizarTablaCotizacion()        // Actualiza tabla resumen

// Guardado y exportación
guardarCotizacion()                // Guarda en BD + PDF
descargarPDFCotizacionActual()     // Descarga PDF sin guardar
generarPDFCotizacion(obj)          // Genera documento PDF
limpiarCotizacion()                // Limpia todo

// Inicialización
inicializarCotizaciones()          // Setup del módulo
```

#### Sección 4: Exports de Funciones
```javascript
// Todas las funciones públicas se exportan a window
window.switchTab = switchTab;
window.cargarMateriales = cargarMateriales;
window.guardarNuevoMaterial = guardarNuevoMaterial;
// ... etc (20+ funciones)
```

### 5. **config-avanzada.js** - CONFIGURACIÓN (~300 líneas)

```javascript
CONFIG_COTIZACIONES {
  impuestos:          // IVA por país
  descuentosVolumen:  // Tabla de descuentos
  descuentosPorCategoria:  // Descuentos por producto
  margenesPorCategoria:    // Márgenes recomendados
  validaciones:       // Límites de cantidad/margen
  redondeo:          // Precisión decimal
  mensajes:          // Textos personalizables
}

CONFIG_BASE_DATOS {
  supabase:   // Credenciales
  tablas:     // Nombres de tablas
  cache:      // Configuración de caché
}

CONFIG_UI {
  temas:              // Colores disponibles
  animaciones:        // Duraciones
  breakpoints:        // Puntos de quiebre responsivos
  tabla:              // Opciones de tabla
}

CONFIG_REPORTES {
  pdf:                // Configuración PDF
  formatosExportacion:// Formatos disponibles
  datos:              // QUÉ mostrar en reporte
}

CONFIG_AUDITORIA {
  eventosRegistrados: // Qué eventos registrar
  retencion:         // Días de retención
  nivelRegistro:     // Niveles de severidad
}

// Utilidades de configuración
obtenerDescuentoTotal(categoria, cantidad)      // Descuento total
obtenerMargenRecomendado(categoria)             // Margen recomendado
validarCantidadAvanzada(cantidad)               // Validación avanzada
```

### 6. **utilidades.js** - FUNCIONES HELPER (~600 líneas)

#### Validaciones
```javascript
esNumeroPpsitivo(valor)          // Número positivo
esEmailValido(email)             // Email válido
esTextoValido(texto, min, max)   // Longitud de texto
sinCaracteresEspeciales(texto)   // Sin caracteres peligrosos
sanitizarEntrada(entrada)        // Limpia XSS
estaDentroDelRango(valor, min, max) // Rango válido
```

#### Formatos y Conversiones
```javascript
formatearTiempo(segundos)        // HH:MM:SS
formatearBytes(bytes)            // KB, MB, GB
redondear(valor, decimales)      // n decimales
calcularPorcentaje(%, valor)     // Calcula %
aplicarDescuento(valor, %)       // Valor con desc
aplicarMargen(costo, %)          // Valor con margen
aplicarImpuesto(valor, %)        // Valor con impuesto
```

#### Arrays y Objetos
```javascript
ordenarPor(array, propiedad, dir)    // Ordena
filtrar(array, predicado)            // Filtra
agruparPor(array, propiedad)         // Agrupa
obtenerUnicos(array)                 // Sin duplicados
encontrarDuplicado(array)            // Busca duplicado
combinarArrays(...arrays)            // Combina
```

#### Strings
```javascript
capitalizarPrimera(texto)        // Capitalize case
aUpperCase(texto)                // MAYÚSCULAS
aLowerCase(texto)                // minúsculas
removerEspacios(texto)           // Sin espacios
truncarTexto(texto, long, sufijo) // Corta texto
reemplazarMultiple(texto, obj)   // Múltiples reemplazos
```

#### Fechas
```javascript
fechaActual(formato)             // Hoy en formato
diferenciaDias(f1, f2)           // Días entre fechas
esFechaValida(fecha)             // Validar fecha
formatearFecha(fecha, estilo)    // Formatea fecha
```

#### Almacenamiento
```javascript
guardarEnStorage(clave, valor)   // localStorage.setItem
obtenerDelStorage(clave, defecto) // localStorage.getItem
eliminarDelStorage(clave)        // localStorage.removeItem
limpiarStorage()                 // localStorage.clear
```

#### Logging
```javascript
registrarLog(mensaje, tipo)      // Log en consola coloreado
tabulaConsola(datos)             // console.table
medirTiempo(func, nombre)        // Mide performance
```

#### Exports
```javascript
window.Validaciones      // Objeto con validaciones
window.Formatos          // Objeto con formatos
window.Arrays            // Objeto con utilidades array
window.Strings           // Objeto con utilidades string
window.Fechas            // Objeto con utilidades fecha
window.Storage           // Objeto con almacenamiento
window.Logs              // Objeto con logging
```

## 📚 DOCUMENTACIÓN

### README.md (~500 líneas)
- Descripción general
- Características implementadas
- Guía de uso paso a paso
- Estructura de datos
- Configuración
- Interfaz y colores
- Compatibilidad
- Seguridad
- Rendimiento
- Mejoras futuras

### MANUAL-TECNICO.md (~600 líneas)
- Arquitectura sistema
- Diagrama de flujo
- Flujo de datos de cotización
- Validaciones por nivel
- Esquema de BD
- Seguridad detallada
- Optimizaciones
- Testing básico
- Troubleshooting
- Referencias

### GUIA-TESTING.md (~800 líneas)
- 150+ casos de prueba
- Checklist organizado por sección
- Validaciones detalladas
- Cálculos de ejemplo
- Criterios de aceptación
- Plantilla de reporte
- Resumen de testing

### REFERENCIA-RAPIDA.md (~500 líneas)
- Todas las funciones disponibles
- Parámetros y ejemplos
- Variables globales
- Constantes de configuración
- Datos necesarios en BD
- Ejemplos prácticos
- Troubleshooting rápido
- Atajos de consola

### IMPLEMENTACION.md (~300 líneas)
- Resumen ejecutivo
- Todos los requisitos marcados
- Archivos creados/modificados
- Características destacadas
- Cómo usar el sistema
- Seguridad implementada
- Métricas
- Checklist de implementación

## 🔄 FLUJO DE DATOS

### Entrada de Usuario
```
Usuario → HTML (input/select)
        ↓
   onchange/oninput handlers
        ↓
   Funciones de JavaScript
```

### Flujo de Cotización
```
1. Selecciona material → cargarMaterialesEnCotizacion()
2. Ingresa cantidad    → validarCantidad()
3. Calcula precio      → calcularTotalCot()
4. Agrega a tabla      → agregarMaterialACotizacion()
5. Requiere guardar    → guardarCotizacion()
6. Genera PDF          → generarPDFCotizacion()
7. Registra auditoría  → registrarLogAuditoria()
8. Descarga archivo    → Archivo PDF local
```

## 📊 ESTADÍSTICAS

```
Líneas de código
├── app.js:               ~700 líneas
├── utilidades.js:        ~600 líneas
├── config-avanzada.js:   ~300 líneas
├── style.css:            ~200 líneas
├── cotizador.html:       ~450 líneas
├── index.html:           ~300 líneas
└── Documentación:        ~2,500 líneas
                          ───────────
                    TOTAL: ~5,000 líneas

Funciones principales: 60+
Funciones de utilidad: 50+
Casos de prueba: 150+
Archivos documentación: 5
```

## 🔐 SEGURIDAD POR CAPA

```
┌─ Frontend ─────────────────┐
│ ✓ Validación de entrada    │
│ ✓ Sanitización de datos    │
│ ✓ Prevención XSS           │
└────────────────────────────┘
            ↓
┌─ Base de Datos ────────────┐
│ ✓ Constraints en tablas    │
│ ✓ Validaciones servidor    │
│ ✓ HTTPS/TLS                │
└────────────────────────────┘
            ↓
┌─ Autenticación ────────────┐
│ ✓ Sesión localStorage      │
│ ✓ Logout limpia datos      │
│ ✓ Validación en cada página│
└────────────────────────────┘
```

## 🚀 INICIO RÁPIDO

### Para Usuario Final
1. Abre `index.html` en navegador
2. Inicia sesión
3. Ve a pestaña "Cotizaciones"
4. Selecciona material → cantidad → guardar

### Para Desarrollador
1. Abre `cotizador.html`
2. Abre DevTools (F12)
3. Ejecuta: `cargarMaterialesEnCotizacion()`
4. Abre consola para logs

### Para Personalizar
1. Edita `config-avanzada.js`
2. Cambia tasas, descuentos, márgenes
3. Recarga página
4. Verifica cambios

## 📦 DEPENDENCIAS EXTERNAS

```
Supabase JS SDK         @ latest
  └─ Para conexión BD

jsPDF                   v2.5.1
  └─ Para generación PDF

jsPDF AutoTable         v3.5.25
  └─ Para tablas en PDF

XLSX                    v0.18.5
  └─ Para exportación Excel

Google Fonts
  └─ Inter, Space Grotesk
```

## 🎯 OBEJTIVOS CUMPLIDOS

✅ Sistema completo de cotizaciones
✅ Validaciones robustas
✅ Cálculos con descuentos e IVA
✅ Generación de PDF
✅ Auditoría y logging
✅ Interfaz responsiva
✅ Integración BD
✅ Documentación exhaustiva
✅ 150+ casos de prueba
✅ Listo para producción

---

**Proyecto**: Valia Pro - Sistema de Cotizaciones  
**Versión**: 1.0.0  
**Estado**: ✅ COMPLETADO  
**Calidad**: Producción  
**Fecha**: 17 de Marzo, 2026
