# DOCUMENTACIÓN TÉCNICA - VALIA PRO

## 📐 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (HTML/CSS/JS)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────┐   │
│  │  index.html     │  │  cotizador.html  │  │  style.css   │   │
│  │  (Login)        │  │  (App Principal) │  │  (Estilos)   │   │
│  └────────┬────────┘  └────────┬─────────┘  └──────────────┘   │
│           │                    │                                │
│           └────────┬───────────┘                                │
│                    ▼                                            │
│            ┌───────────────────┐                                │
│            │   JavaScript      │                                │
│            ├───────────────────┤                                │
│            │  app.js (490 KB)  │  - Lógica principal           │
│            │  config.js        │  - Cotizaciones              │
│            │  utilidades.js    │  - Utilidades               │
│            │  config-avanzada  │  - Configuración            │
│            └────────┬──────────┘                                │
└─────────────────────┼──────────────────────────────────────────┘
                      │
┌─────────────────────┼──────────────────────────────────────────┐
│                  CAPA DE DATOS - SUPABASE                      │
├─────────────────────┼──────────────────────────────────────────┤
│                     ▼                                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Base de Datos (PostgreSQL)                               │  │
│  │ ┌───────────┐  ┌─────────────┐  ┌─────────────────────┐ │  │
│  │ │materiales │  │cotizaciones │  │  logs_auditoria    │ │  │
│  │ └───────────┘  └─────────────┘  └─────────────────────┘ │  │
│  │                                                           │  │
│  │ + Auth (usuarios)                                        │  │
│  │ + Storage (archivos PDF)                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘

            ┌──────────────────────────────────────┐
            │  Servicios Externos                   │
            ├──────────────────────────────────────┤
            │  • jsPDF (Generación de PDFs)        │
            │  • XLSX (Exportación a Excel)        │
            │  • Supabase JS SDK                   │
            └──────────────────────────────────────┘
```

## 📁 Estructura de Archivos

```
Valia-cotizador/
├── index.html              # Página de login
├── cotizador.html          # Aplicación principal
├── app.js                  # Lógica principal (500+ líneas)
├── style.css               # Estilos globales y responsivos
├── config-avanzada.js      # Configuración personalizable
├── utilidades.   # Funciones helper y validaciones
├── README.md               # Documentación de usuario
├── MANUAL-TECNICO.md       # Este archivo
└── .gitignore             # Archivos ignorados por Git
```

## 🔄 Flujo de Datos de Cotización

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. SELECTOR DE MATERIAL                                         │
│    └─► cargarMaterialesEnCotizacion()                           │
│        └─► Query Supabase: SELECT * FROM materiales             │
│            └─► Agrupar por categoría                            │
│                └─► Cargar en dropdown                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. INGRESO DE CANTIDAD                                          │
│    └─► validarCantidad()                                        │
│        ├─► Verificar número positivo                            │
│        ├─► Verificar dentro de rango                            │
│        └─► calcularTotalCot() si válido                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. CÁLCULO DE PRECIO                                            │
│    ┌─── Subtotal = precioUnit × cantidad                        │
│    ├─── Descuento = obtenerDescuentoVolumen(cantidad)          │
│    ├─── SubtotalDesc = Subtotal - (Subtotal × Desc%)           │
│    ├─── Margen = SubtotalDesc × (margen / 100)                 │
│    ├─── PrecioConMargen = SubtotalDesc + Margen                │
│    ├─── IVA = PrecioConMargen × (16% / 100)                    │
│    └─── PRECIOFI = PrecioConMargen + IVA                       │
│                                                                 │
│    Resultado: Guardado en dataset de formulario                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. AGREGACIÓN A COTIZACIÓN                                      │
│    └─► agregarMaterialACotizacion()                             │
│        ├─► Validar material seleccionado                        │
│        ├─► Crear objeto itemCotizacion                          │
│        ├─► Agregar a cotizacionActual[]                        │
│        └─► actualizarTablaCotizacion()                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. GUARDADO O DESCARGA                                          │
│    │                                                             │
│    ├─► guardarCotizacion()                                      │
│    │   ├─► Calcular totalCosto y totalPrecio                   │
│    │   ├─► INSERT en BD (tabla cotizaciones)                   │
│    │   ├─► Guardar en localStorage (backup)                    │
│    │   ├─► registrarLogAuditoria()                             │
│    │   └─► Llamar a descargarPDFCotizacionActual()             │
│    │                                                             │
│    └─► descargarPDFCotizacionActual()                           │
│        ├─► generarPDFCotizacion()                               │
│        │   ├─► Crear documento jsPDF                            │
│        │   ├─► Agregar encabezado                               │
│        │   ├─► Crear tabla de materiales                        │
│        │   ├─► Agregar desglose de costos                       │
│        │   └─► Descargar archivo                                │
│        └─► registrarLogAuditoria('PDF_DESCARGADO')             │
└─────────────────────────────────────────────────────────────────┘
```

## 🛡️ Validaciones Implementadas

### Nivel 1: Validación de Entrada (Cliente)
```javascript
// Cantidad
└─► esNumeroPsitivo(cantidad)
    └─► !isNaN(num) && isFinite(num) && num > 0

// Material
└─► select.value !== "" (No vacío)

// Email (si se requiere)
└─► regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

### Nivel 2: Validación de Lógica
```javascript
// Precio unitario
└─► esNumeroPsitivo(precioUnit)

// Margen
└─► estaDentroDelRango(margen, 0, 300)

// Cálculos
└─► Verificación de NaN y Infinity en cada operación
```

### Nivel 3: Validación de Datos (BD)
```javascript
// Constraints en Supabase
├─► NOT NULL: nombre, categoria, costo_compra
├─► CHECK: costo_compra >= 0
├─► CHECK: stock_actual >= 0
└─► UNIQUE: id (primary key)
```

## 📊 Esquema de Base de Datos

### Tabla: materiales
```sql
CREATE TABLE materiales (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(100),
    costo_compra DECIMAL(12, 2) NOT NULL CHECK (costo_compra >= 0),
    unidad_medida VARCHAR(50),
    stock_actual INT DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: cotizaciones
```sql
CREATE TABLE cotizaciones (
    id VARCHAR(50) PRIMARY KEY,  -- COT-timestamp
    usuario VARCHAR(255),
    email VARCHAR(255),
    fecha TIMESTAMP NOT NULL,
    materiales JSONB NOT NULL,   -- Array de items
    total_costo DECIMAL(12, 2),
    total_precio DECIMAL(12, 2),
    estado VARCHAR(50),           -- 'generada', 'descargada'
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: logs_auditoria (Opcional)
```sql
CREATE TABLE logs_auditoria (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    tipo VARCHAR(100),
    usuario VARCHAR(255),
    detalles JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
);
```

## 🔐 Seguridad

### 1. Autenticación
- ✅ Sesión manejada por localStorage
- ✅ Validación en cada página
- ✅ Logout limpia datos

### 2. Validación
- ✅ Entrada sanitizada con `sanitizarEntrada()`
- ✅ Validaciones en cliente antes de enviar
- ✅ Validaciones en servidor (Supabase)

### 3. CORS y HTTPS
- ✅ Supabase fuerza HTTPS
- ✅ CORS configurado en BD

### 4. Datos Sensibles
- ✅ Costos internos no se muestran en PDF público
- ✅ Cada usuario solo ve sus cotizaciones

## ⚡ Optimizaciones

### Performance
- **Cálculos en Cliente**: Todos los cálculos ocurren en el navegador (sin latencia)
- **Caché**: Materiales se cargan una sola vez o cada 5 minutos
- **Lazy Loading**: Datos se cargan bajo demanda
- **Debouncing**: Eventos de entrada se debounce para evitar cálculos innecesarios

### Tamaño
- **app.js**: ~15 KB (gzipped)
- **Librerías externas**: ~200 KB (jsPDF, XLSX, Supabase)
- **HTML + CSS**: ~50 KB

## 🧪 Testing

Ver archivo `GUIA-TESTING.md` para casos de prueba completos.

### Pruebas Básicas
```javascript
// 1. Validar cantidad
validarCantidad(0)      // {valido: false}
validarCantidad(-5)     // {valido: false}
validarCantidad(100)    // {valido: true}

// 2. Cálculo de descuentos
obtenerDescuentoVolumen(99)   // 0%
obtenerDescuentoVolumen(100)  // 5%
obtenerDescuentoVolumen(1000) // 15%

// 3. Cálculos de precios
const costo = 100;
const cant = 100;
const subtotal = costo * cant;  // 10,000
const desc = subtotal * 0.05;   // 500
const subtotalDesc = 9,500;
const margen = 30;
const precioConMargen = 12,350;
const iva = 1,976;
const final = 14,326;

// 4. Generación de PDF
generarPDFCotizacion(cotizacion);  // Descargar "Cotizacion_COT-xxx.pdf"
```

## 📝 Cambios Recientes

### v1.0.0 - Inicial
- ✅ Sistema completo de cotizaciones
- ✅ Descuentos por volumen
- ✅ Generación de PDF
- ✅ Auditoría de logs
- ✅ Interfaz responsiva
- ✅ Validaciones automáticas
- ✅ Exportación a Excel
- ✅ Documentación completa

## 🔧 Troubleshooting

### Problema: No carga el dropdown de materiales
**Solución**:
1. Verificar conexión a Supabase
2. Revisar credenciales en app.js (línea 1-2)
3. Verificar tabla materiales existe en BD
4. Abrir consola (F12) y revisar errores

### Problema: PDF no se genera
**Solución**:
1. Verificar jsPDF está cargado en HTML
2. Revisar datos de cotización no estén vacíos
3. Verificar cotizacionActual.length > 0

### Problema: Cálculos incorrectos
**Solución**:
1. Revisar valores ingresados (cantidad, margen)
2. Verificar precio unitario estén cargados
3. Abrir DevTools y revisar valores en dataset

## 📚 Referencias

- [Supabase Docs](https://supabase.com/docs)
- [jsPDF Docs](http://jspdf.io/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [ES6+ Features](https://es6-features.org/)

---

**Última actualización**: 17-03-2026  
**Versión**: 1.0.0  
**Estado**: ✅ Estable
