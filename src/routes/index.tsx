import { useServerFn } from "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Camera, CheckCircle2, CircleAlert, FileImage, LoaderCircle, ScanSearch, ShieldCheck, Sprout, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import fieldImage from "@/assets/agricare-field.jpg";
import { AppShell } from "@/components/agricare-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAgriAuth } from "@/lib/agricare-auth";
import { analyzePlantPhoto } from "@/lib/agricare.functions";
import { validateLeafImage } from "@/lib/agricare-rules";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AgriCare AI — Plant health, made clearer" },
      { name: "description", content: "Upload a leaf photo for a careful, AI-assisted plant health review, or explore evidence-led soil guidance." },
      { property: "og:title", content: "AgriCare AI — Plant health, made clearer" },
      { property: "og:description", content: "A thoughtful first look at plant health, with practical next steps and clear limits." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

type Photo = { file: File; preview: string };

function HomePage() {
  const { user, loading: authLoading } = useAgriAuth();
  const runAnalysis = useServerFn(analyzePlantPhoto);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [cropHint, setCropHint] = useState("");
  const [notes, setNotes] = useState("");
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Awaited<ReturnType<typeof runAnalysis>> | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (photo) URL.revokeObjectURL(photo.preview);
  }, [photo]);

  function selectFile(file?: File) {
    if (!file) return;
    const validation = validateLeafImage(file.type, file.size);
    if (!validation.ok) {
      setErrorMessage(validation.message);
      setAnalysis(null);
      return;
    }
    setErrorMessage("");
    setAnalysis(null);
    setPhoto({ file, preview: URL.createObjectURL(file) });
  }

  async function handleAnalyze() {
    if (!photo) return;
    if (!user) {
      toast.error("Sign in to analyze and save your plant check.");
      return;
    }
    setAnalyzing(true);
    setErrorMessage("");
    try {
      const imageDataUrl = await readFileAsDataUrl(photo.file);
      const result = await runAnalysis({ data: { imageDataUrl, cropHint, observedNotes: notes } });
      setAnalysis(result);
      if (result.ok) toast.success("Plant check saved to your history.");
      else setErrorMessage(result.message);
    } catch (error) {
      const message = error instanceof Error ? error.message : "The plant check could not be completed. Please try again.";
      setErrorMessage(message);
    } finally {
      setAnalyzing(false);
    }
  }

  const result = analysis?.ok ? analysis.result : null;

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-7 sm:px-6 lg:px-8">
        <section className="grid items-center gap-8 pb-10 md:grid-cols-[1.05fr_0.95fr] md:gap-10 md:pb-12">
          <div className="relative z-10 py-3">
            <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase text-primary">
              <Sprout className="size-4" aria-hidden="true" /> A calmer way to care for plants
            </p>
            <h1 className="max-w-xl text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              Plant health, <span className="text-primary">made clearer.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
              Start with what you can see. Get a careful first look at a leaf, then decide on a practical next step.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-md">
                <a href="#leaf-check">Check a leaf <ArrowRight className="size-4" /></a>
              </Button>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="size-4 text-primary" /> Private by account
              </span>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /> No made-up confidence scores</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /> No automatic fertilizer doses</span>
            </div>
          </div>
          <div className="relative min-h-64 overflow-hidden rounded-md md:min-h-[330px]">
            <img src={fieldImage} alt="Tomato leaves growing in a sunlit greenhouse" width={1536} height={1024} className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 bg-foreground/10" aria-hidden="true" />
            <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-md border border-border/60 bg-background/90 px-4 py-3 shadow-sm backdrop-blur-sm">
              <span className="flex size-10 items-center justify-center rounded-full bg-accent text-primary"><ScanSearch className="size-5" /></span>
              <span><span className="block text-sm font-semibold text-foreground">A first look, not a final diagnosis</span><span className="mt-0.5 block text-xs text-muted-foreground">Built to be useful about uncertainty</span></span>
            </div>
          </div>
        </section>

        <section id="leaf-check" className="scroll-mt-24 border-t border-border pt-9">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-primary">Plant check</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">What is your leaf telling you?</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">A clear, close-up photo gives the best first look. Your photo is analyzed securely and is not saved with your history.</p>
            </div>
            <span className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground">JPG · PNG · up to 6 MB</span>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
            <Card className="overflow-hidden rounded-md border-border shadow-none">
              {!photo ? (
                <div
                  onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(event) => { event.preventDefault(); setDragging(false); selectFile(event.dataTransfer.files.item(0) ?? undefined); }}
                  className={`flex min-h-72 flex-col items-center justify-center px-5 py-8 text-center transition-colors ${dragging ? "bg-accent" : "bg-card"}`}
                >
                  <input ref={fileInput} type="file" accept="image/jpeg,image/png" className="sr-only" aria-label="Choose a leaf photo" onChange={(event) => selectFile(event.target.files?.item(0) ?? undefined)} />
                  <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-accent text-primary"><UploadCloud className="size-7" /></span>
                  <p className="text-base font-semibold text-foreground">Drop a leaf photo here</p>
                  <p className="mt-1 text-sm text-muted-foreground">or choose a photo from your device</p>
                  <Button type="button" variant="outline" className="mt-5 rounded-md" onClick={() => fileInput.current?.click()}><Camera className="size-4" /> Choose photo</Button>
                </div>
              ) : (
                <div className="grid min-h-72 md:grid-cols-[1fr_0.75fr]">
                  <div className="relative min-h-64 bg-muted">
                    <img src={photo.preview} alt="Selected plant leaf preview" className="absolute inset-0 size-full object-contain" />
                  </div>
                  <div className="flex flex-col justify-between p-5">
                    <div>
                      <span className="flex size-10 items-center justify-center rounded-full bg-accent text-primary"><FileImage className="size-5" /></span>
                      <p className="mt-4 break-words text-sm font-semibold text-foreground">{photo.file.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{(photo.file.size / (1024 * 1024)).toFixed(1)} MB</p>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Button type="button" variant="outline" className="rounded-md" onClick={() => fileInput.current?.click()}>Change photo</Button>
                      <input ref={fileInput} type="file" accept="image/jpeg,image/png" className="sr-only" aria-label="Choose a different leaf photo" onChange={(event) => selectFile(event.target.files?.item(0) ?? undefined)} />
                      <Button type="button" variant="ghost" className="rounded-md" onClick={() => { setPhoto(null); setAnalysis(null); }}>Remove</Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            <Card className="rounded-md border-border p-5 shadow-none sm:p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><ScanSearch className="size-4 text-primary" /> A little context helps</div>
              <label className="mt-5 block text-sm font-medium text-foreground" htmlFor="crop-hint">Crop, if you know it</label>
              <input id="crop-hint" value={cropHint} onChange={(event) => setCropHint(event.target.value)} placeholder="e.g. tomato, potato, rice" maxLength={80} className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              <label className="mt-4 block text-sm font-medium text-foreground" htmlFor="observed-notes">What have you noticed?</label>
              <textarea id="observed-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="When did it start? Which leaves are affected? (optional)" maxLength={1000} rows={3} className="mt-2 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              {!user && !authLoading && <p className="mt-3 text-xs leading-5 text-muted-foreground">Sign in first to run a plant check and keep its written result in your private history.</p>}
              <Button type="button" className="mt-5 w-full rounded-md" onClick={() => void handleAnalyze()} disabled={!photo || analyzing || authLoading || !user}>
                {analyzing ? <><LoaderCircle className="size-4 animate-spin" /> Looking closely…</> : <>Analyze leaf <ArrowRight className="size-4" /></>}
              </Button>
              <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">An AI-assisted first look. Similar symptoms can have different causes.</p>
            </Card>
          </div>

          {errorMessage && <Alert variant="destructive" className="mt-5"><CircleAlert className="size-4" /><AlertTitle>We could not complete that check</AlertTitle><AlertDescription>{errorMessage}</AlertDescription></Alert>}

          {result && photo && (
            <section className="mt-6 border-t border-border pt-6" aria-live="polite">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div><p className="text-xs font-semibold uppercase text-primary">Your plant check</p><h2 className="mt-2 text-2xl font-semibold text-foreground">{result.healthStatus === "healthy" ? "No clear concern visible" : result.healthStatus === "uncertain" ? "This photo is not conclusive" : result.possibleIssue ?? "A possible concern to look into"}</h2><p className="mt-2 text-sm text-muted-foreground">{result.cropIdentified ? `Possible crop: ${result.cropIdentified}` : "Crop not confidently identified"} · Preliminary visual guidance</p></div>
                <Button type="button" variant="outline" className="rounded-md" onClick={() => { setAnalysis(null); setErrorMessage(""); }}>Analyze another leaf</Button>
              </div>
              <div className="mt-5 grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
                <div className="relative min-h-56 overflow-hidden rounded-md border border-border bg-muted"><img src={photo.preview} alt="Leaf reviewed by AgriCare AI" className="absolute inset-0 size-full object-contain" /></div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <ResultList title="Visible symptoms" items={result.visibleSymptoms} empty="No distinct symptom could be described." />
                  <ResultList title="Possible causes" items={result.possibleCauses} empty="More context is needed to narrow down causes." />
                  <ResultList title="Practical next steps" items={result.nextSteps} empty="Take another clear photo and compare changes over time." />
                  <div className="border-l-2 border-primary pl-4"><h3 className="text-sm font-semibold text-foreground">Nutrients are a separate question</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{result.nutrientNote}</p><a className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary" href="/fertilizer">Review soil information <ArrowRight className="size-4" /></a></div>
                </div>
              </div>
              <p className="mt-5 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">Image-based predictions are preliminary, not a definitive diagnosis. Disease, pests, nutrient imbalance, and growing conditions can look similar. Ask a local agricultural expert when symptoms worsen or the evidence is unclear.</p>
            </section>
          )}
        </section>

        <section className="mt-12 grid gap-3 border-t border-border pt-8 sm:grid-cols-3">
          <Principle icon={<ScanSearch className="size-4" />} title="Look before treating" text="Start from visible evidence, not assumptions." />
          <Principle icon={<Sprout className="size-4" />} title="Feed with a reason" text="Use soil results and crop context before changing nutrients." />
          <Principle icon={<ShieldCheck className="size-4" />} title="Know the limits" text="A photo can guide a closer look, not replace local expertise." />
        </section>
      </main>
    </AppShell>
  );
}

function ResultList({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return <div className="border-l-2 border-border pl-4"><h3 className="text-sm font-semibold text-foreground">{title}</h3>{items.length ? <ul className="mt-2 space-y-2 text-sm leading-6 text-muted-foreground">{items.map((item, index) => <li key={`${item}-${index}`}>• {item}</li>)}</ul> : <p className="mt-2 text-sm leading-6 text-muted-foreground">{empty}</p>}</div>;
}

function Principle({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="flex gap-3 py-2"><span className="mt-0.5 text-primary">{icon}</span><div><h3 className="text-sm font-semibold text-foreground">{title}</h3><p className="mt-1 text-sm leading-5 text-muted-foreground">{text}</p></div></div>;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read that photo. Please choose it again."));
    reader.onerror = () => reject(new Error("Could not read that photo. Please choose it again."));
    reader.readAsDataURL(file);
  });
}