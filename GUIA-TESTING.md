# GUÍA DE TESTING - VALIA PRO

## 🎯 Objetivo

Asegurar que todas las funcionalidades del sistema de cotizaciones funcionan correctamente según los requisitos especificados.

## ✅ Checklist de Testing

### Sección 1: Acceso y Autenticación

- [ ] **Login válido**
  - Ingresa credenciales correctas
  - ✓ Redirige a cotizador.html
  - ✓ Muestra nombre de usuario en header

- [ ] **Login inválido**
  - Ingresa credenciales incorrectas
  - ✓ Muestra error
  - ✓ No redirige

- [ ] **Logout**
  - Click en "Cerrar Sesión"
  - ✓ Limpia localStorage
  - ✓ Redirige a index.html

- [ ] **Sesión persistente**
  - Carga cotizador.html directamente sin login
  - ✓ Verifica sesión
  - ✓ Redirige a login si no existe

### Sección 2: Inventario (Pestaña 1)

- [ ] **Cargar materiales**
  - Abre tab "Inventario"
  - ✓ Los materiales se cargan desde Supabase
  - ✓ Se muestran en tabla
  - ✓ Dashboard actualiza: Total SKUs, Categorías, Valor Total

- [ ] **Filtrado por texto**
  - Ingresa nombre en búsqueda
  - ✓ Tabla filtra en tiempo real
  - ✓ Subtotales recalculan
  - ✓ Borrar búsqueda vuelve a mostrar todo

- [ ] **Filtrado por categoría**
  - Selecciona categoría del dropdown
  - ✓ Tabla filtra solo eso categoría
  - ✓ Se guarda preferencia en localStorage
  - ✓ Al refrescar, mantiene el filtro

- [ ] **Agregar nuevo material**
  - Completa formulario con datos válidos
  - Click "GUARDAR MATERIAL"
  - ✓ Se inserta en BD
  - ✓ Tabla se actualiza
  - ✓ Campos se limpian
  - ✓ Muestra mensaje de éxito

- [ ] **Validación de campos**
  - Intenta guardar sin completar campos requeridos
  - ✓ Muestra advertencia
  - ✓ No guarda

- [ ] **Cálculo de costo unitario**
  - Ingresa: Costo Lote: 1000, Cantidad: 20
  - ✓ Costo Unitario = 50.00
  - Ingresa: Costo Lote: 1500, Cantidad: 10
  - ✓ Costo Unitario = 150.00

- [ ] **Eliminar material**
  - Click botón "Eliminar" en tabla
  - ✓ Pide confirmación
  - ✓ Si confirma: Elimina de BD y tabla se actualiza
  - ✓ Si cancela: No hace nada

- [ ] **Exportar a Excel**
  - Click "Excel"
  - ✓ Descarga archivo: Inventario_Valia_FECHA.xlsx
  - ✓ Abre correctamente en Excel
  - ✓ Datos coinciden con tabla

- [ ] **Exportar a PDF**
  - Click "PDF"
  - ✓ Descarga archivo: Inventario_Valia_FECHA.pdf
  - ✓ PDF abre correctamente
  - ✓ Contiene logo, tablas, totales

### Sección 3: Cotizaciones (Pestaña 2) - CRÍTICO

#### 3.1 Carga de Materiales

- [ ] **Materials se cargan en dropdown**
  - Click en pestaña "Cotizaciones"
  - ✓ Dropdown de materiales se llena
  - ✓ Agrupados por categoría (optgroup)
  - ✓ Cada opción muestra: nombre, precio, unidad

- [ ] **Sin materiales registrados**
  - Si no hay materiales en BD
  - ✓ Dropdown muestra "-- Selecciona --"
  - ✓ No causa error

#### 3.2 Selección de Material

- [ ] **Seleccionar material**
  - Abre dropdown y selecciona un material
  - ✓ Precio unitario se actualiza
  - ✓ Campo de cantidad se limpia
  - ✓ Campos de cálculo se resetean

- [ ] **Material sin precio**
  - Si material tiene costo_compra = NULL
  - ✓ Muestra advertencia: "Material sin precio"
  - ✓ No permite calcular

- [ ] **Cambiar de material**
  - Selecciona material A
  - Luego selecciona material B
  - ✓ Se actualiza precio unitario
  - ✓ Cantidad se limpia

#### 3.3 Ingreso de Cantidad

- [ ] **Cantidad válida**
  - Ingresa: 100
  - ✓ Cantidad se acepta
  - ✓ Cálculos se actualizan

- [ ] **Cantidad = 0**
  - Ingresa: 0
  - ✓ Se muestra error o no calcula
  - ✓ Precio final = $0.00

- [ ] **Cantidad negativa**
  - Intenta ingresar: -50
  - ✓ Se muestra error: "Cantidad debe ser positiva"
  - ✓ No realiza cálculos

- [ ] **Cantidad no numérica**
  - Ingresa: "abc" o "50.5.5"
  - ✓ Se muestra error
  - ✓ Precio final = $0.00

- [ ] **Cantidad muy grande**
  - Ingresa: 9999999
  - ✓ Se acepta (suponiendo es válido)
  - ✓ Calcula correctamente

- [ ] **Cantidad decimal**
  - Ingresa: 50.5
  - ✓ Se acepta
  - ✓ Calcula: 50.5 × precio

#### 3.4 Cálculos en Tiempo Real

- [ ] **Desglose actualiza mientras escribes**
  - Material: $100, escribiendo cantidad: 10, 20, 100
  - ✓ Cada cambio actualiza automáticamente
  - ✓ No necesita tab o click

- [ ] **Cálculo de subtotal**
  - Material $50, Cantidad 100
  - ✓ Subtotal = $5,000.00

- [ ] **Descuento por volumen - 5%**
  - Material $100, Cantidad 100
  - ✓ Desc. por volumen = 5%
  - ✓ Subtotal: $10,000
  - ✓ Descuento: -$500
  - ✓ Subtotal c/ Desc: $9,500

- [ ] **Descuento por volumen - 10%**
  - Material $100, Cantidad 500
  - ✓ Desc. por volumen = 10%
  - ✓ Descuento: -$5,000
  - ✓ Subtotal c/ Desc: $45,000

- [ ] **Descuento por volumen - 15%**
  - Material $100, Cantidad 1000
  - ✓ Desc. por volumen = 15%
  - ✓ Descuento: -$15,000
  - ✓ Subtotal c/ Desc: $85,000

- [ ] **Sin descuento**
  - Material $100, Cantidad 50
  - ✓ No aplica descuento (< 100)
  - ✓ Descuento: $0
  - ✓ Información: "Próximo descuento en +50 unidades"

- [ ] **Cálculo de margen**
  - Precio c/ Desc: $9,500, Margen: 30%
  - ✓ Margen: $2,850
  - ✓ Precio c/ Margen: $12,350

- [ ] **Margen personalizado**
  - Cambio margen de 30% a 50%
  - ✓ Precio c/ Margen se actualiza
  - ✓ Cálculo correcto

- [ ] **Cálculo de IVA (16%)**
  - Precio c/ Margen: $12,350
  - ✓ IVA (16%): $1,976
  - ✓ Precio Final: $14,326

- [ ] **Precio final correcto**
  - Presupuesto: Costo $100, Cantidad 100, Margen 30
  - Subtotal: $10,000
  - Descuento 5%: -$500
  - Subtotal c/ Desc: $9,500
  - Margen 30%: +$2,850
  - IVA 16%: +$1,976
  - **FINAL: $14,326.00** ✓

#### 3.5 Agregar a Cotización

- [ ] **Agregar material válido**
  - Completa: Material, Cantidad (100), Margen (30)
  - Click "➕ AGREGAR A COTIZACIÓN"
  - ✓ Material aparece en tabla de resumen
  - ✓ Tabla se actualiza con subtotal
  - ✓ Formulario se limpia
  - ✓ Resumen en parte inferior muestra total

- [ ] **Sin material seleccionado**
  - Click "➕ AGREGAR A COTIZACIÓN" sin material
  - ✓ Muestra advertencia: "⚠️ Selecciona un material"
  - ✓ No agrega a tablaactual

- [ ] **Sin cantidad válida**
  - Selecciona material pero no ingresa cantidad
  - Click "➕ AGREGAR A COTIZACIÓN"
  - ✓ Muestra error de validación
  - ✓ No agrega

- [ ] **Agregar multiples materiales**
  - Material A: Cantidad 50
  - Click agregar
  - Material B: Cantidad 100
  - Click agregar
  - Material C: Cantidad 200
  - Click agregar
  - ✓ Tabla de resumen muestra 3 materiales
  - ✓ Total = suma de todos
  - ✓ Cada uno tiene su cálculo independiente

- [ ] **Orden en tabla**
  - Agrega en orden: C, A, B
  - ✓ Aparecen en orden de adición
  - ✓ No se reordenan

#### 3.6 Tabla de Resumen

- [ ] **Tabla se actualiza**
  - Al agregar materiales
  - ✓ Se actualiza automáticamente
  - ✓ Muestra: Material, Cantidad, Unitario, Subtotal

- [ ] **Botón eliminar en tabla**
  - Click X en una fila
  - ✓ Material se elimina
  - ✓ Total se recalcula
  - ✓ Tabla se actualiza

- [ ] **Tabla vacía**
  - Si no hay materiales
  - ✓ Muestra: "Agrega materiales para ver el desglose"

- [ ] **Total en tabla**
  - Suma correcta de todos los materiales
  - ✓ Muestra en fila "TOTAL COTIZACIÓN"
  - ✓ Color destacado (azul claro)

#### 3.7 Resumen de Cotización (Columna derecha)

- [ ] **Costo Total**
  - Suma de todos los costos (c/ descuento)
  - ✓ Se muestra correctamente
  - ✓ Actualiza al agregar/eliminar

- [ ] **Precio Total**
  - Suma de todos los precios (c/ margen e IVA)
  - ✓ Se muestra correctamente
  - ✓ Actualiza al agregar/eliminar
  - ✓ Número grande y destacado

#### 3.8 Botones de Acción

- [ ] **Botón GUARDAR COTIZACIÓN**
  - Click con materiales en tabla
  -✓ Inserta en BD (table cotizaciones)
  - ✓ Guarda en localStorage (backup)
  - ✓ Registra auditoría
  - ✓ Genera PDF automáticamente
  - ✓ Muestra mensaje: "✅ Cotización guardada y PDF generado"
  - ✓ Limpia formulario y tabla

- [ ] **Guardado sin elementos**
  - Click en "GUARDAR COTIZACIÓN" sin materiales
  - ✓ Muestra: "⚠️ Agrega al menos un material"
  - ✓ No guarda

- [ ] **Botón DESCARGAR PDF**
  - Click "📄 DESCARGAR PDF"
  - ✓ Genera PDF sin guardar en BD
  - ✓ Descarga archivo: Cotizacion_TEMP-timestamp.pdf
  - ✓ PDF contiene todos los detalles
  - ✓ Registra auditoría (PDF_DESCARGADO)

- [ ] **Descargar PDF sin elementos**
  - Click sin materiales
  - ✓ Muestra: "⚠️ Agrega al menos un material"

- [ ] **Botón LIMPIAR FORMULARIO**
  - Click "🗑️ LIMPIAR FORMULARIO"
  - ✓ Pide confirmación
  - ✓ Si confirma: Limpia tabla y formula
  - ✓ Si cancela: Mantiene datos

### Sección 4: PDF Generation

- [ ] **Contenido del PDF**
  - Descarga PDF de cotización
  - ✓ Título: "COTIZACIÓN"
  - ✓ ID de cotización
  - ✓ Fecha y hora
  - ✓ Usuario

- [ ] **Tabla en PDF**
  - ✓ Encabezados: Material, Cantidad, Unidad, Precio, Subtotal
  - ✓ Filas con datos correctos
  - ✓ Formatos de moneda: $1,234.56

- [ ] **Desglose en PDF**
  - ✓ Subtotal Bruto
  - ✓ Descuento por volumen (si aplica)
  - ✓ IVA 16%
  - ✓ TOTAL en grande

- [ ] **Footer en PDF**
  - ✓ Mensaje: "Generado por Valia Pro"
  - ✓ Fecha y hora de generación

- [ ] **Múltiples PDF**
  - Genera 2 PDFs diferentes
  - ✓ Ambos descargan correctamente
  - ✓ Nombres diferentes
  - ✓ Contenidos diferentes

### Sección 5: Responsividad

- [ ] **Desktop (1920px)**
  - Abre en navegador normal
  - ✓ Layout en dos columnas
  - ✓ Todo visible
  - ✓ Sin scroll horizontal

- [ ] **Laptop (1024px)**
  - Redimensiona ventana a 1024px
  - ✓ Layout se adapta
  - ✓ Sigue siendo usable

- [ ] **Tablet (768px)**
  - Redimensiona a 768px
  - ✓ Cambia a layout responsivo
  - ✓ Elementos se apilan
  - ✓ Botones son tocables (> 48px)

- [ ] **Mobile (480px)**
  - Redimensiona a 480px
  - ✓ Layout fullwidth
  - ✓ Fuentes legibles
  - ✓ Inputs grandes
  - ✓ Sin elementos escondidos

- [ ] **Orientación landscape**
  - Móvil en orientación landscape
  - ✓ Ajusta correctamente
  - ✓ Scroll si es necesario

### Sección 6: Interfaz y UX

- [ ] **Estilos consistentes**
  - ✓ Colores consistentes (Índigo/Cyan)
  - ✓ Espaciado uniformes
  - ✓ Tipografía clara

- [ ] **Animaciones suaves**
  - Click en tablas
  - ✓ Las transiciones son suaves (300ms)
  - ✓ No hay saltos abruptos

- [ ] **Mensajes de error**
  - Ingresa datos inválidos
  - ✓ Mensajes son claros
  - ✓ Indican el problema específico
  - ✓ Iconos apropiados (⚠️ ❌ ✅)

- [ ] **Validación visual**
  - Click en campo
  - ✓ Focus ring azul/cyan
  - ✓ Indicador visual claro

- [ ] **Hover effects**
  - Pasa mouse sobre botones
  - ✓ Cambio de color
  - ✓ Sombra o elevación

### Sección 7: Rendimiento

- [ ] **Carga inicial**
  - Abre cotizador.html
  - ✓ Carga en < 2 segundos
  - ✓ Materiales se cargan < 1 segundo

- [ ] **Sin lag en cálculos**
  - Ingresa cantidad y cambia margen rápidamente
  - ✓ Los cálculos se actualizar instantáneamente
  - ✓ Sin retrasos

- [ ] **Generación de PDF**
  - Click "Descargar PDF"
  - ✓ PDF se genera en < 2 segundos
  - ✓ No congela la interfaz

### Sección 8: Auditoría y Logs

- [ ] **Auditoría de cotización**
  - Abre consola del navegador (F12)
  - Generar cotización
  - ✓ Se registra: "[AUDITORÍA] COTIZACION_GENERADA ..."

- [ ] **Auditoría de PDF**
  - Descarga PDF
  - ✓ Se registra: "[AUDITORÍA] PDF_DESCARGADO ..."

- [ ] **Auditoría en BD**
  - Revisar tabla logs_auditoria en Supabase
  - ✓ Las acciones están registradas
  - ✓ Con timestamp y detalles

### Sección 9: Casos Especiales

- [ ] **Cantidad muy grande (1,000,000)**
  - Material $1, Cantidad 1,000,000
  - ✓ Calcula correctamente
  - ✓ Descuento 15% aplica
  - ✓ Resultado: $1,190,000 (approx)

- [ ] **Precio muy pequeño ($0.01)**
  - Material $0.01, Cantidad 1000
  - ✓ Calcula: $10.00
  - ✓ IVA: $1.60
  - ✓ Final: $11.60

- [ ] **Margen 0%**
  - Margen = 0%
  - ✓ Precio Final = Subtotal + IVA
  - ✓ Sin ganancia

- [ ] **Margen muy alto (300%)**
  - Margen = 300%
  - ✓ Calcula correctamente (si límite permite)
  - ✓ Precio final = 4 × Costo (aprox)

- [ ] **Sin descuento aplicable**
  - Cantidad 99
  - ✓ No aplica descuento
  - ✓ Muestra: "Próximo descuento en +1 unidad"

---

## 📋 Plantilla de Reporte

```
TEST: [Nombre]
FECHA: DD/MM/YYYY
RESULTADO: ✅ PASÓ / ❌ FALLÓ
OBSERVACIONES: [Detalles]
SCREENSHOT: [Si aplica]
```

## 🎯 Criterios de Aceptación

- ✅ Todas las validaciones funcionan
- ✅ Cálculos son matemáticamente correctos
- ✅ PDFs se generan y descargan
- ✅ Interfaz es responsiva
- ✅ No hay errores en consola
- ✅ Performance es aceptable
- ✅ Auditoría registra eventos
- ✅ Mensages son claros

## 📊 Resumen

Total de casos: **150+**  
Críticos: 25  
Importantes: 75  
Normales: 50+

---

**Última actualización**: 17/03/2026  
**Versión**: 1.0.0
