# Configuración de Tabla Productos - Valia Cotizador

## 📋 Tabla `productos` - Productos con Costos Detallados

Copia y ejecuta este SQL en el editor SQL de Supabase:

```sql
-- Crear tabla productos con costos detallados
CREATE TABLE IF NOT EXISTS productos (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) DEFAULT 'General',
    descripcion TEXT,
    
    -- Costos detallados
    costo_materia_prima DECIMAL(12, 2) DEFAULT 0 CHECK (costo_materia_prima >= 0),
    costo_mano_obra DECIMAL(12, 2) DEFAULT 0 CHECK (costo_mano_obra >= 0),
    gastos_indirectos DECIMAL(12, 2) DEFAULT 0 CHECK (gastos_indirectos >= 0),
    gastos_administrativos DECIMAL(12, 2) DEFAULT 0 CHECK (gastos_administrativos >= 0),
    otros_costos DECIMAL(12, 2) DEFAULT 0 CHECK (otros_costos >= 0),
    
    -- Costos calculados
    costo_total DECIMAL(12, 2) GENERATED ALWAYS AS (
        costo_materia_prima + costo_mano_obra + gastos_indirectos + gastos_administrativos + otros_costos
    ) STORED,
    
    -- Precio de venta
    precio_venta DECIMAL(12, 2) DEFAULT 0 CHECK (precio_venta >= 0),
    
    -- Información adicional
    unidad_medida VARCHAR(50) DEFAULT 'pza',
    activo BOOLEAN DEFAULT true
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS productos_categoria_idx ON productos(categoria);
CREATE INDEX IF NOT EXISTS productos_activo_idx ON productos(activo);
CREATE INDEX IF NOT EXISTS productos_costo_total_idx ON productos(costo_total);
CREATE INDEX IF NOT EXISTS productos_precio_venta_idx ON productos(precio_venta);

-- Políticas de seguridad (RLS)
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Productos lectura pública" ON productos
    FOR SELECT USING (true);

CREATE POLICY "Productos insertar autenticado" ON productos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Productos actualizar autenticado" ON productos
    FOR UPDATE USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Productos eliminar autenticado" ON productos
    FOR DELETE USING (auth.role() = 'authenticated');

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_productos_updated_at 
    BEFORE UPDATE ON productos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

## 📊 Estructura de la Tabla

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | BIGINT | ID único generado automáticamente |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de última actualización |
| `nombre` | VARCHAR(255) | Nombre del producto |
| `categoria` | VARCHAR(100) | Categoría (Tazas, Textiles, etc.) |
| `descripcion` | TEXT | Descripción detallada |
| `costo_materia_prima` | DECIMAL | Costo de materiales |
| `costo_mano_obra` | DECIMAL | Costo de mano de obra |
| `gastos_indirectos` | DECIMAL | Electricidad, alquiler, etc. |
| `gastos_administrativos` | DECIMAL | Contabilidad, marketing |
| `otros_costos` | DECIMAL | Transporte, embalaje, etc. |
| `costo_total` | DECIMAL | **Calculado automáticamente** |
| `precio_venta` | DECIMAL | Precio sugerido al público |
| `unidad_medida` | VARCHAR | Unidad (pza, metro, etc.) |
| `activo` | BOOLEAN | Si el producto está activo |

## 💰 Cálculo del Costo Total

El `costo_total` se calcula automáticamente como:

```
costo_total = costo_materia_prima + costo_mano_obra + gastos_indirectos + gastos_administrativos + otros_costos
```

Esto se hace a nivel de base de datos usando `GENERATED ALWAYS AS STORED`.

## 📈 Margen de Ganancia

El margen se calcula en la interfaz como:

```
margen = ((precio_venta - costo_total) / costo_total) * 100
```

## 🏷️ Datos de Ejemplo

Inserta algunos productos de ejemplo:

```sql
INSERT INTO productos (
    nombre, categoria, descripcion,
    costo_materia_prima, costo_mano_obra, gastos_indirectos, 
    gastos_administrativos, otros_costos, precio_venta, unidad_medida
) VALUES
-- Tazas personalizadas
('Taza Blanca 11oz', 'Tazas', 'Taza cerámica blanca con impresión personalizada',
 15.00, 8.00, 2.50, 1.50, 1.00, 35.00, 'pza'),

('Taza Negra 15oz', 'Tazas', 'Taza cerámica negra de mayor capacidad',
 18.00, 9.00, 2.50, 1.50, 1.20, 42.00, 'pza'),

-- Textiles
('Playera Algodón Blanca', 'Textiles', 'Playera 100% algodón blanca talla M',
 25.00, 12.00, 3.00, 2.00, 1.50, 65.00, 'pza'),

('Playera Poliéster Negra', 'Textiles', 'Playera poliester resistente al lavado',
 22.00, 10.00, 2.50, 1.80, 1.20, 55.00, 'pza'),

-- Viniles
('Vinil Transfer 20x30cm', 'Viniles', 'Vinil transfer para prendas textiles',
 8.00, 5.00, 1.50, 1.00, 0.80, 22.00, 'pza'),

('Vinil Reflectante 50x70cm', 'Viniles', 'Vinil reflectante para seguridad',
 12.00, 7.00, 2.00, 1.20, 1.00, 32.00, 'pza'),

-- Servicios
('Diseño Logo Vectorial', 'Servicios', 'Diseño de logo en formato vectorial editable',
 0.00, 50.00, 5.00, 10.00, 2.00, 120.00, 'servicio'),

('Planchado Térmico', 'Servicios', 'Servicio de planchado de viniles en prendas',
 0.00, 15.00, 3.00, 2.00, 1.00, 35.00, 'pza');
```

## 🔍 Consultas Útiles

### Productos con mejor margen
```sql
SELECT 
    nombre,
    costo_total,
    precio_venta,
    ROUND(((precio_venta - costo_total) / costo_total) * 100, 1) as margen_porcentaje
FROM productos
WHERE activo = true
ORDER BY margen_porcentaje DESC
LIMIT 10;
```

### Costo promedio por categoría
```sql
SELECT 
    categoria,
    COUNT(*) as cantidad_productos,
    ROUND(AVG(costo_total), 2) as costo_promedio,
    ROUND(AVG(precio_venta), 2) as precio_promedio
FROM productos
WHERE activo = true
GROUP BY categoria
ORDER BY costo_promedio DESC;
```

### Productos con bajo margen (< 30%)
```sql
SELECT 
    nombre,
    categoria,
    costo_total,
    precio_venta,
    ROUND(((precio_venta - costo_total) / costo_total) * 100, 1) as margen
FROM productos
WHERE activo = true 
  AND precio_venta > 0 
  AND (((precio_venta - costo_total) / costo_total) * 100) < 30
ORDER BY margen ASC;
```

## ✅ Verificación Post-Setup

Después de ejecutar los scripts, verifica:

1. **Tabla creada correctamente**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'productos';
   ```

2. **Columnas correctas**:
   ```sql
   SELECT column_name, data_type, is_nullable 
   FROM information_schema.columns 
   WHERE table_name = 'productos' 
   ORDER BY ordinal_position;
   ```

3. **RLS habilitado**:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables 
   WHERE tablename = 'productos';
   ```

4. **Datos de ejemplo insertados**:
   ```sql
   SELECT COUNT(*) as total_productos FROM productos;
   ```

5. **Cálculo automático funciona**:
   ```sql
   SELECT nombre, costo_total, 
          (costo_materia_prima + costo_mano_obra + gastos_indirectos + gastos_administrativos + otros_costos) as calculo_manual
   FROM productos 
   LIMIT 5;
   ```

## 🚀 Próximos Pasos

1. **Crear la tabla** ejecutando el SQL arriba
2. **Insertar datos de ejemplo** (opcional)
3. **Probar la interfaz** - debería cargar los productos automáticamente
4. **Configurar precios de venta** según tu estrategia de márgenes
5. **Integrar con cotizaciones** - usar estos costos en lugar de los básicos

## 💡 Estrategia de Márgenes

### Márgenes Recomendados por Categoría:
- **Tazas**: 40-60% (alto volumen, bajo costo unitario)
- **Textiles**: 50-70% (mediano volumen, costo medio)
- **Viniles**: 60-80% (bajo volumen, costo variable)
- **Servicios**: 30-50% (valor percibido alto)

### Cálculo de Precio de Venta:
```
precio_venta = costo_total * (1 + margen_deseado/100)
```

Por ejemplo, para una taza con costo total de $27.50 y margen deseado de 50%:
```
precio_venta = 27.50 * (1 + 0.50) = 27.50 * 1.50 = $41.25
```

## 🔐 Consideraciones de Seguridad

- ✅ **RLS Habilitado**: Solo usuarios autenticados pueden modificar
- ✅ **Validaciones**: Costos no pueden ser negativos
- ✅ **Auditoría**: Todos los cambios se registran con timestamps
- ✅ **Cálculos automáticos**: El costo total no se puede manipular manualmente

---

**¿Todo listo?** La tabla `productos` está preparada para almacenar todos los costos detallados de tus productos. ¡La interfaz ya está conectada y lista para usar! 🎉