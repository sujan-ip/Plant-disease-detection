CREATE TABLE public.plant_ai_gateway_status (
  id text PRIMARY KEY CHECK (id = 'global'),
  blocked boolean NOT NULL DEFAULT false,
  safe_message text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.plant_ai_gateway_status TO service_role;
ALTER TABLE public.plant_ai_gateway_status ENABLE ROW LEVEL SECURITY;