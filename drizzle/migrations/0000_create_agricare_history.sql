CREATE TABLE public.plant_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  crop text,
  disease text,
  health_status text NOT NULL CHECK (health_status IN ('healthy', 'concern', 'uncertain')),
  result jsonb NOT NULL,
  image_path text
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plant_analyses TO authenticated;
GRANT ALL ON public.plant_analyses TO service_role;
ALTER TABLE public.plant_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own plant analyses" ON public.plant_analyses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own plant analyses" ON public.plant_analyses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own plant analyses" ON public.plant_analyses FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own plant analyses" ON public.plant_analyses FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can upload plant analysis images to their folder" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'plant-analysis-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can read plant analysis images in their folder" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'plant-analysis-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete plant analysis images in their folder" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'plant-analysis-images' AND (storage.foldername(name))[1] = auth.uid()::text);