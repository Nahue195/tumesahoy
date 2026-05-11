-- Columnas de redes sociales en businesses
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS facebook_url text,
  ADD COLUMN IF NOT EXISTS tiktok_url text;

-- Tabla de reseñas
CREATE TABLE IF NOT EXISTS public.business_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  reviewer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Índice para búsquedas por negocio
CREATE INDEX IF NOT EXISTS idx_business_reviews_business_id ON public.business_reviews(business_id);

-- RLS
ALTER TABLE public.business_reviews ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer reseñas
CREATE POLICY "Reseñas públicas" ON public.business_reviews
  FOR SELECT USING (true);

-- Cualquiera puede insertar (anónimos pueden opinar)
CREATE POLICY "Insertar reseña" ON public.business_reviews
  FOR INSERT WITH CHECK (true);

-- El dueño del negocio puede eliminar reseñas de su negocio
CREATE POLICY "Dueño elimina reseñas" ON public.business_reviews
  FOR DELETE USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );
