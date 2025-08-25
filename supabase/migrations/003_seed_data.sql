-- Seed data for testing and development
-- This script creates sample data for the Canchetia application

-- Insert sample servicios
INSERT INTO servicios (id, nombre, icono) VALUES
    (uuid_generate_v4(), 'Parrilla', 'grill'),
    (uuid_generate_v4(), 'Estacionamiento', 'parking'),
    (uuid_generate_v4(), 'Vestuarios', 'changing-room'),
    (uuid_generate_v4(), 'Iluminación', 'light-bulb'),
    (uuid_generate_v4(), 'Buffet', 'restaurant'),
    (uuid_generate_v4(), 'WiFi', 'wifi'),
    (uuid_generate_v4(), 'Duchas', 'shower'),
    (uuid_generate_v4(), 'Aire Acondicionado', 'air-conditioning'),
    (uuid_generate_v4(), 'Seguridad', 'shield');

-- Note: The following are sample records that would be created 
-- when users register and create complexes through the application.
-- In production, these would be created through the app interface.

-- Sample usuarios (these IDs would come from Supabase Auth)
-- This is for reference only - in production, users are created via Auth
/*
INSERT INTO usuarios (id, nombre, apellido, email, rol) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Juan', 'Pérez', 'juan@example.com', 'admin_complejo'),
    ('00000000-0000-0000-0000-000000000002', 'María', 'González', 'maria@example.com', 'admin_complejo'),
    ('00000000-0000-0000-0000-000000000003', 'Carlos', 'López', 'carlos@example.com', 'jugador'),
    ('00000000-0000-0000-0000-000000000004', 'Ana', 'Martínez', 'ana@example.com', 'jugador'),
    ('00000000-0000-0000-0000-000000000005', 'Luis', 'Rodríguez', 'luis@example.com', 'jugador');
*/

-- Sample complejos (commented for production)
/*
INSERT INTO complejos (id, id_usuario_propietario, nombre, direccion, ciudad, latitud, longitud, descripcion, telefono_contacto) VALUES
    (
        uuid_generate_v4(),
        '00000000-0000-0000-0000-000000000001',
        'La Cancha del Barrio',
        'Av. Corrientes 1234',
        'Buenos Aires',
        -34.603722,
        -58.381592,
        'Complejo deportivo familiar con excelentes instalaciones y ambiente amigable.',
        '+54 11 1234-5678'
    ),
    (
        uuid_generate_v4(),
        '00000000-0000-0000-0000-000000000002',
        'Fútbol Total',
        'Calle San Martín 567',
        'Rosario',
        -32.944444,
        -60.650000,
        'El mejor lugar para jugar al fútbol con amigos. Canchas de primer nivel.',
        '+54 341 987-6543'
    );
*/

-- Functions for creating sample data when needed
CREATE OR REPLACE FUNCTION create_sample_complex(
    owner_id UUID,
    complex_name TEXT,
    address TEXT,
    city TEXT,
    lat DECIMAL DEFAULT -34.603722,
    lng DECIMAL DEFAULT -58.381592
) RETURNS UUID AS $$
DECLARE
    complex_id UUID;
    cancha_5_id UUID;
    cancha_7_id UUID;
    cancha_11_id UUID;
    servicio_parrilla UUID;
    servicio_estacionamiento UUID;
    servicio_vestuarios UUID;
BEGIN
    -- Create complex
    INSERT INTO complejos (
        id_usuario_propietario,
        nombre,
        direccion,
        ciudad,
        latitud,
        longitud,
        descripcion,
        telefono_contacto
    ) VALUES (
        owner_id,
        complex_name,
        address,
        city,
        lat,
        lng,
        'Complejo deportivo con excelentes instalaciones para el fútbol.',
        '+54 11 1234-5678'
    ) RETURNING id INTO complex_id;

    -- Create sample canchas
    INSERT INTO canchas (id_complejo, nombre, tipo_futbol, tipo_superficie, es_techada, precio_hora) VALUES
        (complex_id, 'Cancha 1 - Fútbol 5', '5', 'sintético', true, 8000.00),
        (complex_id, 'Cancha 2 - Fútbol 7', '7', 'sintético', false, 12000.00),
        (complex_id, 'Cancha 3 - Fútbol 11', '11', 'natural', false, 20000.00);

    -- Add services to complex
    SELECT id INTO servicio_parrilla FROM servicios WHERE nombre = 'Parrilla' LIMIT 1;
    SELECT id INTO servicio_estacionamiento FROM servicios WHERE nombre = 'Estacionamiento' LIMIT 1;
    SELECT id INTO servicio_vestuarios FROM servicios WHERE nombre = 'Vestuarios' LIMIT 1;

    IF servicio_parrilla IS NOT NULL THEN
        INSERT INTO complejo_servicio (id_complejo, id_servicio) VALUES (complex_id, servicio_parrilla);
    END IF;
    
    IF servicio_estacionamiento IS NOT NULL THEN
        INSERT INTO complejo_servicio (id_complejo, id_servicio) VALUES (complex_id, servicio_estacionamiento);
    END IF;
    
    IF servicio_vestuarios IS NOT NULL THEN
        INSERT INTO complejo_servicio (id_complejo, id_servicio) VALUES (complex_id, servicio_vestuarios);
    END IF;

    RETURN complex_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create sample reservations
CREATE OR REPLACE FUNCTION create_sample_reservation(
    user_id UUID,
    cancha_id UUID,
    start_time TIMESTAMP WITH TIME ZONE,
    duration_hours INTEGER DEFAULT 2
) RETURNS UUID AS $$
DECLARE
    reservation_id UUID;
    end_time TIMESTAMP WITH TIME ZONE;
    price DECIMAL;
BEGIN
    end_time := start_time + (duration_hours || ' hours')::INTERVAL;
    
    -- Get cancha price
    SELECT precio_hora INTO price FROM canchas WHERE id = cancha_id;
    
    -- Create reservation
    INSERT INTO reservas (
        id_usuario,
        id_cancha,
        fecha_hora_inicio,
        fecha_hora_fin,
        estado,
        precio_total
    ) VALUES (
        user_id,
        cancha_id,
        start_time,
        end_time,
        'confirmada',
        price * duration_hours
    ) RETURNING id INTO reservation_id;

    -- Create corresponding payment
    INSERT INTO pagos (
        id_reserva,
        monto,
        metodo_pago,
        estado_pago
    ) VALUES (
        reservation_id,
        price * duration_hours,
        'Mercado Pago',
        'aprobado'
    );

    RETURN reservation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get random cancha from a complex
CREATE OR REPLACE FUNCTION get_random_cancha_from_complex(complex_id UUID)
RETURNS UUID AS $$
DECLARE
    cancha_id UUID;
BEGIN
    SELECT id INTO cancha_id 
    FROM canchas 
    WHERE id_complejo = complex_id 
    ORDER BY RANDOM() 
    LIMIT 1;
    
    RETURN cancha_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for dashboard stats
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    c.id as complejo_id,
    c.nombre as complejo_nombre,
    c.id_usuario_propietario,
    
    -- Today's reservations count
    (SELECT COUNT(*) 
     FROM reservas r 
     JOIN canchas ca ON ca.id = r.id_cancha 
     WHERE ca.id_complejo = c.id 
     AND DATE(r.fecha_hora_inicio) = CURRENT_DATE) as reservas_hoy,
    
    -- This week's revenue
    (SELECT COALESCE(SUM(p.monto), 0) 
     FROM pagos p 
     JOIN reservas r ON r.id = p.id_reserva 
     JOIN canchas ca ON ca.id = r.id_cancha 
     WHERE ca.id_complejo = c.id 
     AND p.estado_pago = 'aprobado'
     AND r.fecha_hora_inicio >= DATE_TRUNC('week', CURRENT_DATE)) as ingresos_semana,
    
    -- Current month occupancy percentage
    (SELECT ROUND(
        (COUNT(*) * 100.0) / 
        NULLIF(
            (SELECT COUNT(*) FROM canchas WHERE id_complejo = c.id) * 
            EXTRACT(DAY FROM DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day') * 12, 
            0
        ), 2
     ) 
     FROM reservas r 
     JOIN canchas ca ON ca.id = r.id_cancha 
     WHERE ca.id_complejo = c.id 
     AND DATE_TRUNC('month', r.fecha_hora_inicio) = DATE_TRUNC('month', CURRENT_DATE)
     AND r.estado != 'cancelada') as ocupacion_porcentaje

FROM complejos c;