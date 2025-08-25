-- Canchetia - Initial Database Schema
-- Based on technical-definition.md entities

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('jugador', 'admin_complejo');
CREATE TYPE field_type AS ENUM ('5', '7', '8', '11');
CREATE TYPE surface_type AS ENUM ('sintético', 'natural', 'cemento');
CREATE TYPE reservation_status AS ENUM ('pendiente_pago', 'confirmada', 'cancelada', 'completada');
CREATE TYPE payment_method AS ENUM ('Mercado Pago', 'efectivo');
CREATE TYPE payment_status AS ENUM ('aprobado', 'rechazado', 'pendiente');

-- 1. Usuario table
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefono TEXT,
    rol user_role NOT NULL DEFAULT 'jugador',
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Complejo table
CREATE TABLE complejos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_usuario_propietario UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    direccion TEXT NOT NULL,
    ciudad TEXT NOT NULL,
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    descripcion TEXT,
    telefono_contacto TEXT NOT NULL,
    horario_apertura TIME NOT NULL DEFAULT '08:00',
    horario_cierre TIME NOT NULL DEFAULT '23:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Cancha table
CREATE TABLE canchas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_complejo UUID NOT NULL REFERENCES complejos(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    tipo_futbol field_type NOT NULL,
    tipo_superficie surface_type NOT NULL DEFAULT 'sintético',
    es_techada BOOLEAN DEFAULT FALSE,
    precio_hora DECIMAL(10, 2) NOT NULL,
    fotos TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Reserva table
CREATE TABLE reservas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_usuario UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    id_cancha UUID NOT NULL REFERENCES canchas(id) ON DELETE CASCADE,
    fecha_hora_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_hora_fin TIMESTAMP WITH TIME ZONE NOT NULL,
    estado reservation_status DEFAULT 'pendiente_pago',
    precio_total DECIMAL(10, 2) NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_time_range CHECK (fecha_hora_fin > fecha_hora_inicio),
    CONSTRAINT no_overlap UNIQUE (id_cancha, fecha_hora_inicio, fecha_hora_fin)
);

-- 5. Pago table
CREATE TABLE pagos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_reserva UUID NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
    monto DECIMAL(10, 2) NOT NULL,
    metodo_pago payment_method NOT NULL,
    estado_pago payment_status DEFAULT 'pendiente',
    id_transaccion_externa TEXT,
    fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Reseña table
CREATE TABLE resenas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_usuario UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    id_complejo UUID NOT NULL REFERENCES complejos(id) ON DELETE CASCADE,
    calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    comentario TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- One review per user per complex
    UNIQUE(id_usuario, id_complejo)
);

-- 7. Servicio table
CREATE TABLE servicios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT UNIQUE NOT NULL,
    icono TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Complejo_Servicio junction table
CREATE TABLE complejo_servicio (
    id_complejo UUID NOT NULL REFERENCES complejos(id) ON DELETE CASCADE,
    id_servicio UUID NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
    PRIMARY KEY (id_complejo, id_servicio)
);

-- Create indexes for better performance
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_complejos_ciudad ON complejos(ciudad);
CREATE INDEX idx_complejos_propietario ON complejos(id_usuario_propietario);
CREATE INDEX idx_canchas_complejo ON canchas(id_complejo);
CREATE INDEX idx_canchas_tipo_futbol ON canchas(tipo_futbol);
CREATE INDEX idx_reservas_usuario ON reservas(id_usuario);
CREATE INDEX idx_reservas_cancha ON reservas(id_cancha);
CREATE INDEX idx_reservas_fecha ON reservas(fecha_hora_inicio, fecha_hora_fin);
CREATE INDEX idx_reservas_estado ON reservas(estado);
CREATE INDEX idx_pagos_reserva ON pagos(id_reserva);
CREATE INDEX idx_pagos_estado ON pagos(estado_pago);
CREATE INDEX idx_resenas_complejo ON resenas(id_complejo);
CREATE INDEX idx_resenas_usuario ON resenas(id_usuario);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complejos_updated_at BEFORE UPDATE ON complejos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canchas_updated_at BEFORE UPDATE ON canchas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservas_updated_at BEFORE UPDATE ON reservas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagos_updated_at BEFORE UPDATE ON pagos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resenas_updated_at BEFORE UPDATE ON resenas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_servicios_updated_at BEFORE UPDATE ON servicios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();