import { createFileRoute } from "@tanstack/react-router";
import { FlaskConical, Info, Sprout, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppShell } from "@/components/agricare-shell";
import { soilAdviceState } from "@/lib/agricare-rules";

export const Route = createFileRoute("/fertilizer")({
  head: () => ({
    meta: [
      { title: "Soil & nutrients — AgriCare AI" },
      { name: "description", content: "Evidence-led soil guidance: why a soil test and local interpretation come before any fertilizer change." },
      { property: "og:title", content: "Soil & nutrients — AgriCare AI" },
      { property: "og:description", content: "Evidence-led soil guidance: why a soil test and local interpretation come before any fertilizer change." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FertilizerPage,
});

const field = "mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

function FertilizerPage() {
  const [crop, setCrop] = useState("");
  const [soilPh, setSoilPh] = useState("");
  const [nitrogen, setNitrogen] = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [potassium, setPotassium] = useState("");

  const state = soilAdviceState({ crop, soilPh, nitrogen, phosphorus, potassium });

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-7 sm:px-6 lg:px-8">
        <div className="border-b border-border pb-6">
          <p className="text-xs font-semibold uppercase text-primary">Soil &amp; nutrients</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Feed with a reason, not a guess</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            A leaf photo cannot measure your soil. Before changing any fertilizer, get a soil test and have it interpreted for your crop and your region.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Card className="rounded-md border-border p-6 shadow-none">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground"><FlaskConical className="size-5 text-primary" /> What do your soil results say?</h2>
            <label className="mt-5 block text-sm font-medium text-foreground" htmlFor="fert-crop">Crop</label>
            <input id="fert-crop" value={crop} onChange={(event) => setCrop(event.target.value)} placeholder="e.g. tomato, rice" maxLength={60} className={field} />
            <label className="mt-4 block text-sm font-medium text-foreground" htmlFor="fert-ph">Soil pH (from your soil test)</label>
            <input id="fert-ph" value={soilPh} onChange={(event) => setSoilPh(event.target.value)} placeholder="e.g. 6.5" maxLength={10} className={field} />
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-foreground" htmlFor="fert-n">Nitrogen (N)</label>
                <input id="fert-n" value={nitrogen} onChange={(event) => setNitrogen(event.target.value)} placeholder="test value" maxLength={20} className={field} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground" htmlFor="fert-p">Phosphorus (P)</label>
                <input id="fert-p" value={phosphorus} onChange={(event) => setPhosphorus(event.target.value)} placeholder="test value" maxLength={20} className={field} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground" htmlFor="fert-k">Potassium (K)</label>
                <input id="fert-k" value={potassium} onChange={(event) => setPotassium(event.target.value)} placeholder="test value" maxLength={20} className={field} />
              </div>
            </div>
          </Card>

          <Card className="rounded-md border-border p-6 shadow-none">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground"><Sprout className="size-5 text-primary" /> What this means</h2>
            {state === "need_crop" && (
              <p className="mt-4 text-sm leading-6 text-muted-foreground">Tell us which crop you are growing. Nutrient needs differ between crops, so no guidance is possible without that context.</p>
            )}
            {state === "need_soil_test" && (
              <p className="mt-4 text-sm leading-6 text-muted-foreground">No soil measurements yet — and a photo or a symptom description is not enough to diagnose a nutrient problem. Get a proper soil test from a local lab or agriculture extension service first.</p>
            )}
            {state === "needs_local_interpretation" && (
              <p className="mt-4 text-sm leading-6 text-muted-foreground">You have measurements. Take them, along with your crop and growing stage, to a local agriculture extension officer or agronomist for interpretation. Thresholds differ by soil type, climate and crop variety, so AgriCare does not calculate doses.</p>
            )}

            <div className="mt-6 border-l-2 border-primary pl-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground"><TriangleAlert className="size-4 text-primary" /> Why no doses here</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Over-fertilizing can damage plants and soil. Correct application rates depend on soil test values, crop stage, water quality and local practice — none of which an app can know. AgriCare will never invent a dose.
              </p>
            </div>
            <div className="mt-5 flex items-start gap-2 rounded-md bg-accent px-4 py-3">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-xs leading-5 text-muted-foreground">If a plant looks unhealthy, remember a disease is not solved by fertilizer. Start with a <a href="/" className="font-semibold text-primary hover:underline">leaf check</a>, then treat nutrition as a separate question.</p>
            </div>
          </Card>
        </div>
      </main>
    </AppShell>
  );
}
