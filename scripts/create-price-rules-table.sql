-- Create price_rules table for dynamic pricing configuration

CREATE TABLE IF NOT EXISTS price_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cancha_id UUID NOT NULL REFERENCES canchas(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_price_rules_cancha_id ON price_rules(cancha_id);
CREATE INDEX IF NOT EXISTS idx_price_rules_day_time ON price_rules(day_of_week, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_price_rules_active ON price_rules(is_active);

-- Add RLS (Row Level Security)
ALTER TABLE price_rules ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only manage price rules for their own canchas
CREATE POLICY "Users can manage price rules for own canchas" ON price_rules
  USING (
    cancha_id IN (
      SELECT c.id 
      FROM canchas c 
      JOIN complejos comp ON c.id_complejo = comp.id 
      WHERE comp.id_usuario_propietario = auth.uid()
    )
  );

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_price_rules_updated_at 
  BEFORE UPDATE ON price_rules 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE price_rules IS 'Dynamic pricing rules for canchas by day of week and time range';