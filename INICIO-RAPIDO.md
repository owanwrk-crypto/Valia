# ⚡ Inicio Rápido - Ventas Diarias

**⏱️ Tiempo estimado**: 15 minutos

---

## 🎯 En 5 Minutos: Setup Mínimo

### Paso 1: Abrir Supabase
1. Ir a [supabase.com](https://supabase.com)
2. Iniciar sesión con tu cuenta
3. Seleccionar tu proyecto "valia-cotizador"

### Paso 2: Crear Tabla `servicios`
1. En Supabase, ir a **SQL Editor**
2. Crear una nueva query
3. Copiar y pegar esto:

```sql
CREATE TABLE IF NOT EXISTS servicios (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    nombre VARCHAR NOT NULL,
    categoria VARCHAR DEFAULT 'General',
    precio NUMERIC NOT NULL,
    unidad VARCHAR DEFAULT 'pza',
    descripcion TEXT,
    activo BOOLEAN DEFAULT true
);

INSERT INTO servicios (nombre, categoria, precio, unidad, descripcion) VALUES
('Diseño Gráfico', 'Diseño', 500.00, 'servicio', 'Diseño de logo y branding'),
('Planchado', 'Acabado', 50.00, 'pza', 'Planchado de vinilos');
```

4. Hacer clic en **▶️ Run** (o Ctrl+Enter)
5. ✅ Tabla creada con 2 servicios de ejemplo

### Paso 3: Crear Tabla `ventas_hoy`
1. Crear otra nueva query en SQL Editor
2. Copiar y pegar esto:

```sql
CREATE TABLE IF NOT EXISTS ventas_hoy (
    id VARCHAR PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id VARCHAR,
    usuario VARCHAR,
    email VARCHAR,
    date_created TIMESTAMP WITH TIME ZONE,
    items JSONB,
    total_costo NUMERIC,
    total_precio NUMERIC,
    descuento_total NUMERIC DEFAULT 0,
    iva_total NUMERIC DEFAULT 0,
    estado VARCHAR DEFAULT 'completada'
);

CREATE INDEX IF NOT EXISTS ventas_hoy_user_id_idx ON ventas_hoy(user_id);
CREATE INDEX IF NOT EXISTS ventas_hoy_date_created_idx ON ventas_hoy(date_created);
```

3. Ejecutar (Ctrl+Enter)
4. ✅ Tabla creada

### Paso 4: Recargar la Aplicación
1. Ir a tu aplicación (donde está el cotizador)
2. Recargar la página (F5)
3. ✅ Listo

---

## 🧪 Probar en 5 Minutos

### Test 1: Dropdown Dual
1. En tab de Cotizaciones, haz clic en dropdown "Material"
2. Verás:
   - 📦 Taza Blanca (material)
   - 🎨 Diseño Gráfico (servicio)
   - 🎨 Planchado (servicio)
3. **✅ Funciona** si ves mezcla de 📦 y 🎨

### Test 2: Guardar una Venta
1. Selecciona un material/servicio
2. Ingresa cantidad: **100**
3. Haz clic "➕ AGREGAR A COTIZACIÓN"
4. Haz clic en botón verde "💾 GUARDAR VENTA COMPLETA"
5. Verás:
   - ✅ Alert verde
   - 📄 PDF se descargó
   - 📊 Venta aparece en historial abajo
6. **✅ Funciona** si ves historial con tu venta

### Test 3: Verificar en Supabase
1. En Supabase, ir a **Table Editor**
2. Seleccionar tabla **ventas_hoy**
3. Buscar una fila con tu venta
4. Verificar campos:
   - `user_id` = tu email ✓
   - `date_created` = timestamp de ahora ✓
   - `items` = JSON con productos ✓
5. **✅ Funciona** si te ves los datos

---

## 🎯 Instalación Completa (15 Minutos)

### Sección 1: Base de Datos (5 min)

**Paso 1.1: Tabla `servicios`**
```
Supabase → SQL Editor → Ejecutar script de servicios
Ver: SUPABASE-SETUP.md línea 7-35
```

**Paso 1.2: Tabla `ventas_hoy`**
```
Supabase → SQL Editor → Ejecutar script de ventas_hoy
Ver: SUPABASE-SETUP.md línea 38-90
```

**Paso 1.3: Verificar RLS**
```
Supabase → Table Editor → servicios
Ver: "Row Level Security" debe estar ENCENDIDO
Supabase → Table Editor → ventas_hoy
Ver: "Row Level Security" debe estar ENCENDIDO
```

### Sección 2: Código Local (2 min)

Ya está hecho ✅

- app.js tiene todas las funciones
- cotizador.html tiene los botones
- style.css tiene los estilos

No necesitas modificar nada.

### Sección 3: Probar (1 min)

1. Recargar la aplicación (F5)
2. Abrir Developer Tools (F12)
3. Ir a Console
4. Ejecutar:
```javascript
console.log(serviciosData); // Debe mostrar array de servicios
console.log(ventasDelDia);  // Debe mostrar array de ventas
```

### Sección 4: Primera Venta (3 min)

1. Tab de Cotizaciones
2. Seleccionar un servicio del dropdown
3. Cantidad: 100
4. AGREGAR A COTIZACIÓN
5. GUARDAR VENTA COMPLETA
6. Ver historial abajo
7. ✅ Listo

### Sección 5: Personalizar Servicios (4 min)

En Supabase, agregar tus servicios:

1. Table Editor → servicios
2. Botón "Insert Row" (verde +)
3. Llenar campos:
   - nombre: "Nombre de tu servicio"
   - categoria: "Diseño" o "Acabado" o lo que sea
   - precio: "500.00"
   - unidad: "servicio" o "pza"
   - descripcion: "Breve descripción"
4. Guardar
5. Recargar la aplicación

---

## 📱 Acceso desde Diferentes Lugares

### Local (Desarrollo)
Abre `cotizador.html` en el navegador
```
Archivo → Abrir archivo → cotizador.html
```

### Servidor Web
Si está deployado:
```
https://tu-dominio.com/cotizador.html
```

### Considerar
- Debe haber internet para usar Supabase
- Si no hay internet, funciona con localStorage (respaldo)

---

## 🔧 Solucionar Problemas

### "Error: Servicios no carga"
```
1. Abrir F12 → Console
2. Ver si hay error de conexión a Supabase
3. Verificar que tabla 'servicios' existe
4. Recargar página
```

### "Error: Ventas no se guardan"
```
1. Verificar que estés logueado (nombre arriba a la derecha)
2. Verificar que tabla 'ventas_hoy' existe
3. Abrir F12 → Console → Ver errores específicos
4. Copiar y pegar error en chat
```

### "No veo la tabla de historial"
```
1. Recargar página (F5)
2. Garantizar que hay al menos 1 venta guardada
3. Si ves "Sin ventas el día de hoy" = está bien, agreg más
```

### "Dropdown de materiales está vacío"
```
1. Verificar en BD que hay materiales
2. Ejecutar en console: console.log(materialesData)
3. Si sale vacío, fue error al cargar
4. Recargar página
```

---

## 📊 Datos de Ejemplo

### Servicios para Insertar

Aquí hay algunos para descargar en tu tabla:

```sql
INSERT INTO servicios (nombre, categoria, precio, unidad, descripcion) VALUES
('Diseño de Logo', 'Diseño', 1000.00, 'servicio', 'Logo personalizado con variaciones'),
('Diseño de Etiquetas', 'Diseño', 500.00, 'servicio', 'Diseño de etiquetas para productos'),
('Planchado Manual', 'Acabado', 50.00, 'pza', 'Planchado de vinilos transferibles'),
('Corte por Láser', 'Procesamiento', 100.00, 'servicio', 'Corte personalizado con máquina láser'),
('Sublimación Full Color', 'Acabado', 75.00, 'pza', 'Impresión sublimación en textiles'),
('Bordado Personalizado', 'Acabado', 150.00, 'pza', 'Bordado computarizado personalizado'),
('Asesoría de Diseño', 'Consultoría', 300.00, 'hora', 'Asesoría profesional en diseño gráfico');
```

Copiar y ejecutar en SQL Editor de Supabase.

---

## ✅ Checklist Final

- [ ] Tabla `servicios` creada en Supabase
- [ ] Tabla `ventas_hoy` creada en Supabase
- [ ] RLS habilitado en ambas tablas
- [ ] Al menos 2 servicios insertados
- [ ] Aplicación recargada (F5)
- [ ] Dropdown muestra 📦 y 🎨 mezcla
- [ ] Primera venta guardada e visible en historial
- [ ] Venta visible en Supabase table editor

---

## 🚀 Siguientes Pasos

Una vez todo funciona:

1. **Personalizar Servicios**
   - Ir a GUIA-VENTAS-DIARIAS.md para ver ejemplos

2. **Entrenar Usuarios**
   - Compartir GUIA-VENTAS-DIARIAS.md con el equipo

3. **Monitorear Ventas**
   - Ir a Supabase Table Editor para ver historial
   - Ver consultas útiles en SUPABASE-SETUP.md

4. **Reportar Problemas**
   - Abrir console (F12)
   - Compartir errores específicos

---

## 📞 Contacto & Soporte

Si tienes dudas:

1. Revisar **GUIA-VENTAS-DIARIAS.md** 
2. Buscar en console (F12) errores específicos
3. Revisar **SUPABASE-SETUP.md** para SQL

---

**¡Listo!** Tu sistema de ventas diarias está funcionando 🎉

Próximo: Personaliza servicios agreguando tus categorías reales.
