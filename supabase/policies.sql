
-- Políticas RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Visitantes podem ver produtos ativos
CREATE POLICY "Visualizar produtos ativos" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Visualizar variantes" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Visualizar configs" ON store_settings FOR SELECT USING (true);

-- Administradores (Autenticados) podem fazer tudo (simplificado)
CREATE POLICY "Admin All Products" ON products USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Variants" ON product_variants USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Settings" ON store_settings USING (auth.role() = 'authenticated');
