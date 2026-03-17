# Valia Pro - Sistema de Cotizaciones Automatizado

## 📋 Descripción General

Valia Pro es un sistema web avanzado de gestión de cotizaciones automatizadas que permite crear, gestionar y descargar cotizaciones de productos/servicios de forma rápida y eficiente.

## ✨ Características Implementadas

### 1. **Gestión de Inventario**
- ✅ Registro de materiales/productos en la base de datos Supabase
- ✅ Cálculo automático de costo unitario basado en lotes
- ✅ Filtrado por categoría y búsqueda por nombre
- ✅ Visualización de inventario con totales y subtotales
- ✅ Exportación a Excel y PDF

### 2. **Sistema de Cotizaciones Avanzado**
- ✅ Selector dinámico de materiales con agrupación por categoría
- ✅ Validación en tiempo real de cantidades (números positivos)
- ✅ Cálculo automático de precios con desglose detallado:
  - Subtotal bruto
  - Descuentos por volumen (automáticos según cantidad)
  - IVA (16% configurable)
  - Margen de ganancia personalizable
  - Precio final con impuestos

### 3. **Descuentos por Volumen**
- ✅ 5% descuento desde 100 unidades
- ✅ 10% descuento desde 500 unidades
- ✅ 15% descuento desde 1000 unidades
- ✅ Información en tiempo real de descuentos aplicables

### 4. **Generación de Reportes**
- ✅ Desglose detallado de cálculos en la interfaz
- ✅ Generación automática de PDF con:
  - Encabezado con ID de cotización y fecha
  - Tabla de materiales con cantidades y precios
  - Desglose de costos, descuentos, IVA
  - Precio final en grande
  - Footer con fecha/hora de generación

### 5. **Manejo de Errores**
- ✅ Validación de cantidades (debe ser número positivo)
- ✅ Control de productos sin precio configurado
- ✅ Mensajes de error claros y descriptivos
- ✅ Prevención de cotizaciones vacías

### 6. **Sistema de Auditoría**
- ✅ Registro de cada cotización generada
- ✅ Log de descargas de PDF
- ✅ Información del usuario y timestamp
- ✅ Historial almacenado en localStorage y BD

### 7. **Interfaz Responsiva**
- ✅ Diseño adaptable a móvil, tablet y desktop
- ✅ Breakpoints en 480px, 768px, 1024px
- ✅ Glassmorphism y diseño moderno
- ✅ Animaciones suaves y transiciones

### 8. **Seguridad y Rendimiento**
- ✅ Integración con Supabase para BD segura
- ✅ Validación de sesión de usuario
- ✅ Cálculos optimizados en cliente
- ✅ Manejo de errores sin bloqueos

## 🎯 Uso del Sistema

### Acceso
1. Ir a `index.html` para loguearse
2. Ingresar credenciales (sistema de autenticación)
3. Se redirige a `cotizador.html`

### Crear una Cotización

#### Paso 1: Navega a la pestaña "Cotizaciones"
- Click en el botón "Cotizaciones" en la navegación superior

#### Paso 2: Selecciona un Material
- Abre el dropdown "Material"
- Los materiales están agrupados por categoría
- Cada opción muestra: nombre, precio unitario y unidad de medida

#### Paso 3: Ingresa la Cantidad
- Escribe la cantidad requerida en "Cantidad Requerida"
- El sistema automáticamente:
  - Valida que sea un número positivo
  - Verifica descuentos por volumen
  - Recalcula el precio final en tiempo real

#### Paso 4: Ajusta el Margen (Opcional)
- El margen predeterminado es 30%
- Modifica si necesitas otro porcentaje
- El precio se actualiza al instante

#### Paso 5: Revisa el Desglose
- En la sección "Desglose del Cálculo" ves:
  - Subtotal (costo base)
  - Descuento aplicado (si aplica)
  - Precio con margen
  - IVA calculado
  - Precio final

#### Paso 6: Agrega a Cotización
- Click en "➕ AGREGAR A COTIZACIÓN"
- El material aparece en la tabla de la derecha

#### Paso 7: Repite el Proceso
- Puedes agregar múltiples materiales
- Veras el total en "Resumen de Cotización"

#### Paso 8: Descarga o Guarda
- **Descargar PDF**: Obtén PDF sin guardar en BD
- **Guardar Cotización**: Guarda en BD + genera PDF
- **Limpiar**: Descarta la cotización actual

### Formulario de Cotización

```
┌─────────────────────────────────────────────┐
│  AGREGAR MATERIAL                           │
├─────────────────────────────────────────────┤
│                                             │
│  📦 Material *                              │
│  [dropdown con materiales]                  │
│                                             │
│  💲 Precio Unitario                         │
│  [lectura: $125.50]                         │
│                                             │
│  📊 Cantidad Requerida *                    │
│  [100]                                      │
│  ↳ 🎁 Descuento por volumen: 5% aplicado   │
│                                             │
│  📈 Margen de Ganancia (%)                  │
│  [30]                                       │
│                                             │
│  ┌─ DESGLOSE DEL CÁLCULO ─────────────┐   │
│  │ Subtotal (Costo):      $12,550.00   │   │
│  │ Descuento por Volumen: -$627.50     │   │
│  │ Subtotal c/ Descuento: $11,922.50   │   │
│  │ Precio c/ Margen:      $15,500.25   │   │
│  │ IVA (16%):             $2,480.04    │   │
│  │ 💰 PRECIO FINAL:       $17,980.29   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [➕ AGREGAR A COTIZACIÓN]                  │
│  [🗑️ LIMPIAR FORMULARIO]                   │
│                                             │
└─────────────────────────────────────────────┘
```

## 📊 Estructura de Datos

### Tabla: materiales
```
{
  id: number,
  nombre: string,
  categoria: string,
  costo_compra: number,
  unidad_medida: string,
  stock_actual: number,
  stock_minimo: number
}
```

### Tabla: cotizaciones
```
{
  id: string (COT-timestamp),
  usuario: string,
  email: string,
  fecha: ISO 8601,
  materiales: JSON[],
  total_costo: number,
  total_precio: number,
  estado: 'generada'|'descargada'|'cancelada'
}
```

### Tabla: logs_auditoria (Opcional)
```
{
  tipo: string ('COTIZACION_GENERADA'|'PDF_DESCARGADO'|...),
  usuario: string,
  detalles: JSON,
  timestamp: ISO 8601
}
```

## 🔧 Configuración

### Archivo: app.js
Variables configurables:

```javascript
// Línea ~36
configuracionImpuestos = {
    tasa_iva: 16,  // Cambiar a 0, 8%, 21%, etc.
    descuentoVolumen: [
        { cantidad: 100, porcentaje: 5 },
        { cantidad: 500, porcentaje: 10 },
        { cantidad: 1000, porcentaje: 15 }
    ]
};
```

### Conexión a Supabase
```javascript
// Línea 1-2
const URL_VALIA = "https://ietudbyosupknisbfhlj.supabase.co"; 
const KEY_VALIA = "sb_publishable_wzDzxlSwdpKw4ok4J1qPPA_1eabsV4P";
```

## 🎨 Interfaz de Usuario

### Colores y Temas
- Primary: `#6366f1` (Índigo)
- Accent: `#00f2ff` (Cyan)
- Background: `#0f172a` (Azul oscuro)
- Border: `rgba(255, 255, 255, 0.1)`

### Tipografía
- Font: Inter, Space Grotesk
- Responsivo con escalado automático

## 📱 Compatibilidad

- ✅ Chrome/Edge (último)
- ✅ Firefox (último)
- ✅ Safari (último)
- ✅ Mobile (iOS/Android)
- ✅ Tablets

## 🔐 Seguridad

- ✅ Validación de sesión en cada página
- ✅ Almacenamiento seguro con Supabase
- ✅ Validación de entrada en cliente y servidor
- ✅ Protección contra XSS
- ✅ Encriptación de datos sensibles en tránsito (HTTPS)

## 📈 Rendimiento

- ✅ Cálculos en cliente (sin latencia)
- ✅ Carga lazy de materiales
- ✅ Caché en localStorage
- ✅ Compresión de PDF
- ✅ Optimización de imágenes y estilos

## 🚀 Mejoras Futuras

- [ ] Integración con sistemas de pago
- [ ] Email automático de cotizaciones
- [ ] Reportes analíticos de cotizaciones
- [ ] Versión con múltiples monedas
- [ ] API REST para terceros
- [ ] Dashboard con gráficos
- [ ] Cálculo de márgenes inteligentes por categoría
- [ ] Historial editable de cotizaciones
- [ ] Comparación de cotizaciones

## 📞 Soporte

Para reportar errores o sugerencias, contacta al equipo de desarrollo.

---

**Versión**: 1.0.0  
**Última actualización**: ${new Date().toLocaleDateString('es-MX')}  
**Estado**: ✅ Producción
