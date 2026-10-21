import { createFileRoute } from "@tanstack/react-router";
import { Camera, Eye, Leaf, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/agricare-shell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & limitations — AgriCare AI" },
      { name: "description", content: "How AgriCare AI works, what it can and cannot do, and how your photos and data are handled." },
      { property: "og:title", content: "About & limitations — AgriCare AI" },
      { property: "og:description", content: "How AgriCare AI works, what it can and cannot do, and how your photos and data are handled." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <AppShell>
      <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-7 sm:px-6 lg:px-8">
        <div className="border-b border-border pb-6">
          <p className="text-xs font-semibold uppercase text-primary">About &amp; limitations</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">A careful first look, not a final diagnosis</h1>
        </div>

        <div className="mt-8 space-y-8">
          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground"><Camera className="size-5 text-primary" /> How a leaf check works</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">You upload a close-up photo of a leaf and add any context you have. An AI assistant reviews the image and describes visible symptoms, plausible causes and practical next steps. The result is clearly labeled as preliminary.</p>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground"><Eye className="size-5 text-primary" /> What it cannot do</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              <li>• It does not give a definitive diagnosis. Different problems — disease, pests, nutrient imbalance, watering — can look alike.</li>
              <li>• It does not invent confidence scores. If the evidence is weak, it says so and asks for a clearer photo.</li>
              <li>• It does not prescribe pesticides, fungicides or fertilizer doses. Those require local expertise and a soil test.</li>
              <li>• It does not diagnose nutrient deficiency from a photo. Soil measurements and crop context are needed.</li>
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground"><Leaf className="size-5 text-primary" /> Soil &amp; fertilizer</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Nutrition is treated separately. Before changing fertilizer, get a soil test and have the results interpreted for your crop and region by local agricultural expertise.</p>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground"><ShieldCheck className="size-5 text-primary" /> Privacy</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">You need an account to run a check. Your written results are saved privately and visible only to you. Photos are analyzed in the moment and are not stored with your history. Only you can see your history.</p>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
