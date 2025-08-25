-- Enable RLS on all tables
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE complejos ENABLE ROW LEVEL SECURITY;
ALTER TABLE canchas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE resenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE complejo_servicio ENABLE ROW LEVEL SECURITY;

-- RLS Policies for usuarios table
CREATE POLICY "Users can view their own profile" ON usuarios
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON usuarios
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can create a user profile" ON usuarios
    FOR INSERT WITH CHECK (true);

-- RLS Policies for complejos table
CREATE POLICY "Anyone can view complejos" ON complejos
    FOR SELECT USING (true);

CREATE POLICY "Complex owners can manage their complexes" ON complejos
    FOR ALL USING (auth.uid() = id_usuario_propietario);

CREATE POLICY "Admin_complejo users can create complexes" ON complejos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND rol = 'admin_complejo'
        )
    );

-- RLS Policies for canchas table  
CREATE POLICY "Anyone can view canchas" ON canchas
    FOR SELECT USING (true);

CREATE POLICY "Complex owners can manage their canchas" ON canchas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM complejos 
            WHERE id = canchas.id_complejo 
            AND id_usuario_propietario = auth.uid()
        )
    );

CREATE POLICY "Complex owners can create canchas" ON canchas
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM complejos 
            WHERE id = canchas.id_complejo 
            AND id_usuario_propietario = auth.uid()
        )
    );

-- RLS Policies for reservas table
CREATE POLICY "Users can view their own reservas" ON reservas
    FOR SELECT USING (
        auth.uid() = id_usuario OR
        EXISTS (
            SELECT 1 FROM complejos c
            JOIN canchas ca ON ca.id_complejo = c.id
            WHERE ca.id = reservas.id_cancha 
            AND c.id_usuario_propietario = auth.uid()
        )
    );

CREATE POLICY "Users can create reservas" ON reservas
    FOR INSERT WITH CHECK (auth.uid() = id_usuario);

CREATE POLICY "Users can update their own reservas" ON reservas
    FOR UPDATE USING (auth.uid() = id_usuario);

CREATE POLICY "Complex owners can update reservas for their canchas" ON reservas
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM complejos c
            JOIN canchas ca ON ca.id_complejo = c.id
            WHERE ca.id = reservas.id_cancha 
            AND c.id_usuario_propietario = auth.uid()
        )
    );

-- RLS Policies for pagos table
CREATE POLICY "Users can view their own pagos" ON pagos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM reservas r
            WHERE r.id = pagos.id_reserva 
            AND r.id_usuario = auth.uid()
        )
    );

CREATE POLICY "Complex owners can view pagos for their reservas" ON pagos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM reservas r
            JOIN canchas ca ON ca.id = r.id_cancha
            JOIN complejos c ON c.id = ca.id_complejo
            WHERE r.id = pagos.id_reserva 
            AND c.id_usuario_propietario = auth.uid()
        )
    );

CREATE POLICY "System can manage pagos" ON pagos
    FOR ALL USING (true);

-- RLS Policies for resenas table
CREATE POLICY "Anyone can view resenas" ON resenas
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own resenas" ON resenas
    FOR INSERT WITH CHECK (auth.uid() = id_usuario);

CREATE POLICY "Users can update their own resenas" ON resenas
    FOR UPDATE USING (auth.uid() = id_usuario);

CREATE POLICY "Users can delete their own resenas" ON resenas
    FOR DELETE USING (auth.uid() = id_usuario);

-- RLS Policies for servicios table
CREATE POLICY "Anyone can view servicios" ON servicios
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage servicios" ON servicios
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND rol = 'admin_complejo'
        )
    );

-- RLS Policies for complejo_servicio table
CREATE POLICY "Anyone can view complejo_servicio" ON complejo_servicio
    FOR SELECT USING (true);

CREATE POLICY "Complex owners can manage their complejo_servicio" ON complejo_servicio
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM complejos 
            WHERE id = complejo_servicio.id_complejo 
            AND id_usuario_propietario = auth.uid()
        )
    );

-- Functions for custom validations
CREATE OR REPLACE FUNCTION check_reservation_conflicts(
    p_id_cancha UUID,
    p_fecha_hora_inicio TIMESTAMP WITH TIME ZONE,
    p_fecha_hora_fin TIMESTAMP WITH TIME ZONE,
    p_reservation_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM reservas 
        WHERE id_cancha = p_id_cancha
        AND estado != 'cancelada'
        AND (p_reservation_id IS NULL OR id != p_reservation_id)
        AND (
            (fecha_hora_inicio <= p_fecha_hora_inicio AND fecha_hora_fin > p_fecha_hora_inicio) OR
            (fecha_hora_inicio < p_fecha_hora_fin AND fecha_hora_fin >= p_fecha_hora_fin) OR
            (fecha_hora_inicio >= p_fecha_hora_inicio AND fecha_hora_fin <= p_fecha_hora_fin)
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to check reservation conflicts
CREATE OR REPLACE FUNCTION validate_reservation_conflict()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT check_reservation_conflicts(NEW.id_cancha, NEW.fecha_hora_inicio, NEW.fecha_hora_fin, NEW.id) THEN
        RAISE EXCEPTION 'Reservation conflicts with existing booking';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_reservation_conflicts_trigger
    BEFORE INSERT OR UPDATE ON reservas
    FOR EACH ROW
    EXECUTE FUNCTION validate_reservation_conflict();