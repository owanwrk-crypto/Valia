# Sistema de Ventas Diarias - Guía de Uso

## 🎯 Descripción General

El nuevo sistema de **Ventas Diarias** permite:
- Guardar ventas completadas con fecha exacta y ID de usuario
- Mostrar un historial de las últimas 5 ventas del día en tiempo real
- Registrar todos los detalles de la venta (items, descuentos, IVA)
- Persistencia en Supabase con metadata de usuario

## 📊 Características Nuevas

### 1. **Botón "GUARDAR VENTA COMPLETA"**

Ubicación: Tab de Cotizaciones → Botón verde con gradiente

**Función**: 
- Guarda la cotización actual como una venta completada
- Registra automáticamente:
  - Fecha y hora exacta (`date_created` en ISO 8601)
  - ID del usuario (`user_id` = email del usuario)
  - Todos los items de la cotización
  - Totales de costo, precio, descuentos e IVA

**Flujo de Guardado**:
```
Usuario hace clic → guardarVentaDelDia() → Supabase
↓
Agrega venta a ventasDelDia[] (array en memoria)
↓
Guarda en localStorage como respaldo
↓
Actualiza historial visual
↓
Registra auditoría
↓
Limpia formulario
```

### 2. **Historial de Últimas 5 Ventas**

Ubicación: Tab de Cotizaciones → Sección azul al pie

**Información mostrada**:
- **Hora**: Hora exacta de la venta (HH:MM:SS)
- **Producto/Servicio**: Nombre del item vendido
- **Cantidad**: Unidades vendidas
- **P. Unit.**: Precio unitario
- **Total**: Precio final (con margen e IVA)
- **Usuario**: Nombre de quien registró la venta

**Actualización**:
- Se actualiza automáticamente cuando se guarda una venta
- Se carga al iniciar desde Supabase
- Se sincroniza con localStorage como respaldo

### 3. **Funciones JavaScript Principales**

#### `guardarVentaDelDia(detalles = {})`

Guarda una venta del día en:
1. **Supabase** (tabla `ventas_hoy`)
2. **Array ventasDelDia[]** (memoria)
3. **localStorage** (respaldo)

```javascript
// Ejemplo de uso
await guardarVentaDelDia({
    cliente: "Nombre opcional",
    nota: "Nota o referencia"
});
```

**Datos guardados**:
```javascript
{
    id: "VENTA-1704067200000",
    user_id: "usuario@email.com",
    usuario: "Juan Pérez",
    email: "usuario@email.com",
    date_created: "2024-01-01T14:30:45.123Z",
    items: [
        {
            nombre: "Taza Blanca",
            cantidad: 100,
            precioUnit: 15.00,
            margen: 30,
            precioFinal: 1653.00,
            ...
        }
    ],
    totalCosto: 1500.00,
    totalPrecio: 1653.00,
    descuentoTotal: 75.00,
    ivaTotal: 228.00,
    estado: "completada"
}
```

#### `cargarUltimasVentasDelDia()`

Carga las últimas 5 ventas del día desde Supabase:
- Filtro: `date_created >= hoy a las 00:00:00`
- Ordenadas por fecha descendente (más recientes primero)
- Se llama automáticamente al inicializar la página

```javascript
// Ejemplo de uso manual
await cargarUltimasVentasDelDia();
```

#### `actualizarHistorialVentas()`

Renderiza el historial en HTML:
- Crea tabla HTML con los datos de `ventasDelDia[]`
- Aplica estilos CSS
- Formatea fechas, horas y moneda

```javascript
// Se llama automáticamente después de guardar o cargar
actualizarHistorialVentas();
```

## 📱 Interfaz de Usuario

### Sección de Botones de Guardado

```
┌─────────────────────────────────────────────┐
│ 💾 GUARDAR VENTA COMPLETA   │   📄 DESCARGAR PDF │
└─────────────────────────────────────────────┘
```

- **Verde con gradiente**: Guardar venta (principal)
- **Rojo/Naranja**: Descargar PDF (secundario)

### Tabla de Historial

```
┌──────────────────────────────────────────────────────────┐
│ 📊 Últimas Ventas del Día                        (0)      │
├────────────────────────────────────────────────────────────┤
│ Hora      │ Producto  │ Cant │ P. Unit. │ Total  │ Usuario│
├────────────────────────────────────────────────────────────┤
│ 14:30:45  │ Taza Blca │ 100  │ $15.00   │$1653.0│ Juan   │
│ 13:45:22  │ Vinilo    │  50  │ $25.00   │ $1290│ María  │
│ ...       │ ...       │ ...  │  ...     │  ...   │ ...    │
└────────────────────────────────────────────────────────────┘
```

## 🔄 Workflow Completo

**Paso 1**: Selecciona material/servicio
```
↓ Dropdown con materiales + servicios (📦 vs 🎨)  
```

**Paso 2**: Ingresa cantidad y margen
```
↓ El sistema calcula automáticamente
```

**Paso 3**: Agrega a cotización
```
↓ Aparece en tabla de resumen
```

**Paso 4**: Repite con más items (opcional)
```
↓ Puedes agregar múltiples productos
```

**Paso 5**: GUARDAR VENTA COMPLETA
```
↓ Se guarda en Supabase con:
   - date_created (ISO 8601)
   - user_id (email del usuario)
↓ Aparece en historial abajo
↓ Se genera PDF automáticamente
↓ Se limpia el formulario
```

## 💾 Persistencia de Datos

### En Supabase
- **Tabla**: `ventas_hoy`
- **Permanencia**: Datos guardados permanentemente
- **Acceso**: Solo por el usuario que registró la venta (RLS)
- **Campos clave**: 
  - `date_created`: Timestamp exacto
  - `user_id`: Email del usuario
  - `items`: JSON con detalles
  - `total_precio`: Total de la venta

### En el Navegador (localStorage)
- **Clave**: `ventas_hoy`
- **Permanencia**: Mientras no se limpie el caché
- **Propósito**: Respaldo/sincronización offline
- **Límite**: Últimas 10 ventas en memoria

### Sincronización
```
Guardar Venta
    ↓
    ├→ Supabase (principal) 
    │   └→ Si falla: se continúa de todos modos
    │
    ├→ ventasDelDia[] (memoria)
    │   └→ Mantiene últimas 10
    │
    └→ localStorage (respaldo)
        └→ Restaura si Supabase no está disponible
```

## 📊 Ejemplos de Uso

### Ejemplo 1: Venta Simple

1. Selecciona "Taza Blanca"
2. Ingresa cantidad: 100
3. Ingresa margen: 30%
4. Haz clic en "AGREGAR A COTIZACIÓN"
5. Haz clic en "💾 GUARDAR VENTA COMPLETA"

**Resultado**: La venta aparece en el historial con:
- Hora: 14:30:45
- Total: $1,653.00
- Usuario: Tu nombre

### Ejemplo 2: Venta Múltiple

1. Agreg "Taza Blanca" (100 piezas)
2. Agreg "Vinilo Premium" (50 piezas)
3. Agreg Servicio "Diseño Gráfico" (1 unidad)
4. Haz clic en "💾 GUARDAR VENTA COMPLETA"

**Resultado**: Se guarda como una venta con 3 items

### Ejemplo 3: Ver Historial de Hoy

Al cargar la página:
- Se carga automáticamente `cargarUltimasVentasDelDia()`
- Muestra todas las ventas de hoy ordenadas por hora
- Máximo 5 últimas ventas visible

## ⚙️ Configuración Requerida

### En Supabase

1. Crear tabla `ventas_hoy`:
   ```sql
   -- Ver SUPABASE-SETUP.md para script completo
   ```

2. Crear tabla `servicios`:
   ```sql
   -- Ver SUPABASE-SETUP.md para script completo
   ```

3. Habilitar RLS en ambas tablas

### En la Aplicación

Ninguna configuración adicional necesaria. Todo está automatizado:
- Detecta usuario desde localStorage
- Usa credenciales de Supabase del app.js
- Carga servicios automáticamente
- Sincroniza historial al iniciar

## 🐛 Troubleshooting

### El historial no se carga

**Solución**:
```javascript
// Abre la consola (F12) y ejecuta:
await cargarUltimasVentasDelDia();
console.log(ventasDelDia);
```

Si sale error PGRST116, significa que la tabla `ventas_hoy` no existe. Ver SUPABASE-SETUP.md.

### Las ventas no se guardan

**Verifique**:
1. Está autenticado (debe ver su nombre en la esquina superior)
2. Tiene al menos 1 item en la cotización
3. La tabla `ventas_hoy` existe en Supabase
4. Revise la consola (F12) para errores específicos

### Las horas no son correctas

Los timestamp se guardan en UTC (Zona horaria universal). JavaScript los convierte automáticamente a tu zona local para mostrar. Si ves diferencia horaria, es normal.

## 📈 Métricas Disponibles

Con los datos guardados, puedes obtener:
- Total de ventas por usuario por día
- Productos/servicios más vendidos
- Margen promedio de ganancia
- Descuentos totales aplicados
- Ingresos diarios

Ver ejemplos de consultas en SUPABASE-SETUP.md

## 🔐 Privacidad y Seguridad

- ✅ **RLS Habilitado**: Solo ves tus propias ventas
- ✅ **Encriptado**: Datos en tránsito (HTTPS)
- ✅ **Autenticado**: Solo usuarios registrados
- ✅ **Sin respaldos locales**: localStorage se usa solo como respaldo
- ✅ **Auditoría**: Se registra quién hizo cada venta

## 📞 Soporte

Para problemas o preguntas:
1. Revisa la consola del navegador (F12)
2. Verificar conexión a Supabase
3. Confirmar que las tablas existen
4. Revisar políticas de RLS

---

**Versión**: 1.0  
**Última actualización**: Enero 2024  
**Estado**: Producción
