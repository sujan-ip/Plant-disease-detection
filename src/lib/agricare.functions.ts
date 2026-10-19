import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { analyzePlantPhotoServer } from "@/lib/agricare.server";

const analysisInput = z.object({
  imageDataUrl: z.string().max(8_500_000),
  cropHint: z.string().max(80),
  observedNotes: z.string().max(1000),
});

export const analyzePlantPhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => analysisInput.parse(input))
  .handler(async ({ data, context }) => {
    return analyzePlantPhotoServer(data, context.supabase, context.userId);
  });