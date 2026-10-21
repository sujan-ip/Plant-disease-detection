import { createOpenAI } from "@ai-sdk/openai";
import { Output, streamText } from "ai";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { createLovableAiGatewayRunIdFetch } from "./run-id.server";

const plantResultSchema = z.object({
  cropIdentified: z.string().nullable(),
  healthStatus: z.enum(["healthy", "concern", "uncertain"]),
  possibleIssue: z.string().nullable(),
  visibleSymptoms: z.array(z.string()),
  possibleCauses: z.array(z.string()),
  nextSteps: z.array(z.string()),
  nutrientNote: z.string(),
});

type PlantResult = z.infer<typeof plantResultSchema>;
type AnalysisInput = { imageDataUrl: string; cropHint: string; observedNotes: string };

const systemInstructions = `You are AgriCare AI, a cautious plant-health assistant. Review a user-provided photo and context, but never present an image-only guess as a definitive diagnosis. Describe only visible symptoms and plausible causes, distinguish observation from inference, and use the uncertain status when the leaf/crop is unclear or evidence is weak. Do not invent a calibrated confidence score, soil measurements, local facts, crop-specific treatment rates, pesticide/fungicide use, or fertilizer doses. A disease is not solved by fertilizer. For nutrient advice, explain that a soil test and crop/local interpretation are needed; do not diagnose a deficiency from a photograph alone. Give practical, non-chemical next steps such as checking nearby plants, reviewing watering/environment, taking a clearer follow-up photo, or consulting local agricultural expertise. Keep lists concise and actionable. Return only the requested structured result.`;

export async function analyzePlantPhotoServer(input: AnalysisInput, userClient: SupabaseClient<Database>, userId: string) {
  const validImage = /^data:image\/(?:jpeg|png);base64,[A-Za-z0-9+/]+={0,2}$/.test(input.imageDataUrl);
  if (!validImage || input.imageDataUrl.length > 8_500_000) {
    return { ok: false as const, message: "That photo could not be read. Choose a JPG or PNG under 6 MB." };
  }
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return { ok: false as const, message: "Secure plant analysis is not configured yet. Please contact the app owner." };

  try {
    // Run-ID propagation: the gateway mints an ID on the first response and the
    // run-id fetch wrapper resends it across follow-up steps of the same run.
    const runIdFetch = createLovableAiGatewayRunIdFetch();
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: runIdFetch.fetch,
    });
    const response = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      instructions: systemInstructions,
      messages: [{
        role: "user",
        content: [
          { type: "text", text: `Review this plant photo. User crop hint: ${input.cropHint.trim() || "not provided"}. User observations: ${input.observedNotes.trim() || "not provided"}. If the photo does not show a clear leaf or enough detail, use healthStatus uncertain and say what information is missing.` },
          { type: "image", image: new URL(input.imageDataUrl) },
        ],
      }],
      output: Output.object({ schema: plantResultSchema }),
      maxRetries: 0,
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    const result: PlantResult = await response.output;
    const status = result.healthStatus;
    const { data: saved, error: saveError } = await userClient
      .from("plant_analyses")
      .insert({
        user_id: userId,
        crop: result.cropIdentified,
        disease: result.possibleIssue,
        health_status: status,
        result,
        image_path: null,
      })
      .select("id, created_at")
      .single();
    if (saveError || !saved) {
      console.error("Could not save plant analysis", saveError?.message);
      return { ok: false as const, message: "The plant check finished, but we could not save its written result. Please try again." };
    }
    await updateGatewayStatus(false, null);
    return { ok: true as const, result, id: saved.id, createdAt: saved.created_at };
  } catch (error) {
    const { status, message } = gatewayFailure(error);
    if (status === 402 || status === 403) await updateGatewayStatus(true, message);
    return { ok: false as const, message };
  }
}


function gatewayFailure(error: unknown) {
  const record = error && typeof error === "object" ? error as Record<string, unknown> : {};
  const status = typeof record.statusCode === "number" ? record.statusCode : typeof record.status === "number" ? record.status : undefined;
  const body = typeof record["responseBody"] === "string" ? safeBodyMessage(record["responseBody"] as string) : "";
  const original = typeof record["message"] === "string" ? record["message"] as string : "";
  if (status === 401) return { status, message: "Secure AI access is not configured correctly. Please contact the app owner." };
  if (status === 402 || status === 403) {
    const safe = body || original.replace(/^.*?(?:\d{3}:\s*)/, "").slice(0, 240);
    return { status, message: safe || "Plant analysis is temporarily unavailable because of an account or access restriction." };
  }
  if (status === 404) return { status, message: "The configured plant-analysis service is unavailable. Please contact the app owner." };
  if (status === 429) return { status, message: "Plant analysis is busy right now. Please wait a little before starting another check." };
  if (status && status >= 500) return { status, message: "The plant-analysis service had a temporary problem. Please try again later." };
  console.error("Plant image analysis failed", original || error);
  return { status, message: "We could not read this image clearly. Try a well-lit, close-up JPG or PNG photo." };
}

function safeBodyMessage(raw: string) {
  try {
    const parsed = JSON.parse(raw) as { message?: unknown; error?: { message?: unknown } };
    if (typeof parsed.message === "string") return parsed.message.slice(0, 240);
    if (typeof parsed.error?.message === "string") return parsed.error.message.slice(0, 240);
  } catch {
    return "";
  }
  return "";
}

async function updateGatewayStatus(blocked: boolean, safeMessage: string | null) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("plant_ai_gateway_status").upsert({ id: "global", blocked, safe_message: blocked ? safeMessage : null, updated_at: new Date().toISOString() });
    if (error) console.error("Could not persist plant analysis availability", error.message);
  } catch (error) {
    console.error("Could not persist plant analysis availability", error);
  }
}