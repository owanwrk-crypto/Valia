# Configuración de Supabase - Valia Cotizador

Este documento contiene los scripts SQL necesarios para configurar las tablas en Supabase.

## 📋 Tablas Requeridas

### 1. Tabla `servicios` (Nueva)

Copia y ejecuta este SQL en el editor SQL de Supabase:

```sql
CREATE TABLE servicios (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    nombre VARCHAR NOT NULL,
    categoria VARCHAR,
    precio NUMERIC NOT NULL,
    unidad VARCHAR DEFAULT 'pza',
    descripcion TEXT,
    activo BOOLEAN DEFAULT true
);

-- Índices
CREATE INDEX servicios_categoria_idx ON servicios(categoria);
CREATE INDEX servicios_activo_idx ON servicios(activo);

-- Políticas de seguridad (RLS)
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Servicios lectura pública" ON servicios
    FOR SELECT USING (true);

CREATE POLICY "Servicios insertar autenticado" ON servicios
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Servicios actualizar autenticado" ON servicios
    FOR UPDATE USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
```

### 2. Tabla `ventas_hoy` (Nueva)

Para guardar las ventas del día con información de usuario y fecha:

```sql
CREATE TABLE ventas_hoy (
    id VARCHAR PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
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

-- Índices para búsquedas rápidas
CREATE INDEX ventas_hoy_user_id_idx ON ventas_hoy(user_id);
CREATE INDEX ventas_hoy_date_created_idx ON ventas_hoy(date_created);
CREATE INDEX ventas_hoy_usuario_idx ON ventas_hoy(usuario);

-- Políticas de seguridad (RLS)
ALTER TABLE ventas_hoy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ventas lectura por usuario" ON ventas_hoy
    FOR SELECT USING (
        auth.jwt() ->> 'email' = email OR
        auth.jwt() ->> 'sub' = user_id
    );

CREATE POLICY "Ventas insertar autenticado" ON ventas_hoy
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Ventas actualizar por usuario" ON ventas_hoy
    FOR UPDATE USING (
        auth.jwt() ->> 'email' = email OR
        auth.jwt() ->> 'sub' = user_id
    )
    WITH CHECK (auth.role() = 'authenticated');
```

### 3. Modificar tabla `cotizaciones` existente (Opcional pero recomendado)

Para agregar campos de fecha y usuario:

```sql
-- Agregar columnas si no existen
ALTER TABLE cotizaciones
ADD COLUMN IF NOT EXISTS date_created TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
ADD COLUMN IF NOT EXISTS user_id VARCHAR;

-- Crear índices
CREATE INDEX IF NOT EXISTS cotizaciones_user_id_idx ON cotizaciones(user_id);
CREATE INDEX IF NOT EXISTS cotizaciones_date_created_idx ON cotizaciones(date_created);
```

### 4. Datos de Ejemplo para `servicios`

Inserta algunos servicios de ejemplo:

```sql
INSERT INTO servicios (nombre, categoria, precio, unidad, descripcion) VALUES
('Diseño Gráfico', 'Diseño', 500.00, 'servicio', 'Diseño de logo y branding'),
('Planchado de Vinilos', 'Acabado', 50.00, 'pza', 'Planchado de vinilos en prendas'),
('Diseño de Empaques', 'Diseño', 800.00, 'servicio', 'Diseño de empaque personalizado'),
('Sublimación', 'Acabado', 75.00, 'pza', 'Proceso de sublimación en productos'),
('Corte Láser', 'Procesamiento', 100.00, 'servicio', 'Corte láser personalizado');
```

## 🔍 Consultas Útiles

### Obtener últimas 5 ventas del día actual:

```sql
SELECT * FROM ventas_hoy
WHERE DATE(date_created) = CURRENT_DATE
ORDER BY date_created DESC
LIMIT 5;
```

### Obtener total de ventas por usuario hoy:

```sql
SELECT 
    usuario,
    email,
    COUNT(*) as cantidad_ventas,
    SUM(total_precio) as total_ingresos
FROM ventas_hoy
WHERE DATE(date_created) = CURRENT_DATE
GROUP BY usuario, email
ORDER BY total_ingresos DESC;
```

### Obtener ventas en un rango de fechas:

```sql
SELECT * FROM ventas_hoy
WHERE date_created >= '2024-01-01'::TIMESTAMP WITH TIME ZONE
  AND date_created <= '2024-01-31'::TIMESTAMP WITH TIME ZONE
ORDER BY date_created DESC;
```

## 🔐 Consideraciones de Seguridad

1. **Row Level Security (RLS)**: Está habilitado en todas las tablas
2. **Autenticación**: Solo usuarios autenticados pueden insertar/actualizar
3. **Lectura**: Cada usuario solo ve sus propias ventas
4. **Email como identificador**: Se usa para validar permisos

## 📊 Estructura de Datos - Items en `ventas_hoy`

El campo `items` guarda un array JSON con la siguiente estructura:

```json
[
  {
    "nombre": "Taza Blanca",
    "cantidad": 100,
    "precioUnit": 15.00,
    "margen": 30,
    "subtotal": 1500.00,
    "descuento": 75.00,
    "subtotalConDescuento": 1425.00,
    "iva": 228.00,
    "precioFinal": 1653.00
  }
]
```

## ✅ Verificación Post-Setup

Después de ejecutar los scripts, verifica:

1. Las tablas se crearon correctamente:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('servicios', 'ventas_hoy', 'cotizaciones');
   ```

2. Los índices se crearon:
   ```sql
   SELECT indexname FROM pg_indexes 
   WHERE tablename IN ('servicios', 'ventas_hoy', 'cotizaciones');
   ```

3. RLS está habilitado:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables 
   WHERE tablename IN ('servicios', 'ventas_hoy', 'cotizaciones');
   ```

## 🚀 Próximos Pasos

1. Ejecuta todos los scripts en el editor SQL de Supabase
2. Verifica que las tablas se crearon correctamente
3. Inserta datos de ejemplo en la tabla `servicios`
4. El sistema ya está listo para guardar ventas con date_created y user_id

---

Si encuentras errores de permisos, verifica que tu usuario en Supabase tiene permisos de administrador en la base de datos.
