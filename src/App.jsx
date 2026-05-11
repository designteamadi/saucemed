import React, { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Wand2,
  Plus,
  X,
  Check,
  Image as ImageIcon,
  UserCircle,
  Layout,
  Send,
  Download,
  CheckCircle2,
  Lightbulb,
  TrendingUp,
  AlertCircle,
  Link as LinkIcon,
  BarChart2,
  Play,
  ChevronLeft,
  ChevronRight,
  Type,
  Target,
  CalendarDays,
  Cpu,
} from "lucide-react";
import { generateText, generateImage } from "./api.js";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
// Text engine — Gemini only in this build.
const ENGINES = [
  { id: "gemini", label: "Gemini", model: "3 Flash" },
];
const TONES = [
  "Editorial",
  "Playful",
  "Bold",
  "Elegant",
  "Casual",
  "Inspirational",
  "Witty",
  "Authoritative",
  "Friendly",
  "Edgy",
];
const PLATFORMS = [
  "Instagram",
  "TikTok",
  "LinkedIn",
  "Twitter/X",
  "Facebook",
  "YouTube",
  "Pinterest",
];
const ASPECTS = [
  { label: "1:1", desc: "Square" },
  { label: "4:3", desc: "Landscape" },
  { label: "16:9", desc: "Cinematic" },
  { label: "3:4", desc: "Portrait" },
  { label: "9:16", desc: "Reel" },
];

// Image-generation models — Gemini Nano Banana family only.
const IMAGE_ENGINES = [
  {
    id: "gemini",
    label: "Gemini",
    models: [
      {
        id: "gemini-3.1-flash-image-preview",
        label: "Nano Banana 2",
        note: "Gemini 3.1 Flash · fast, cheap",
      },
      {
        id: "gemini-3-pro-image-preview",
        label: "Nano Banana Pro",
        note: "Gemini 3 Pro · top quality, 4K",
      },
      {
        id: "gemini-2.5-flash-image",
        label: "Nano Banana",
        note: "Gemini 2.5 Flash · classic",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Reusable atoms
// ─────────────────────────────────────────────────────────────────────────────
const Label = ({ children, required }) => (
  <label className="label flex items-center gap-2">
    <span>{children}</span>
    {required && <span className="text-sauce">●</span>}
  </label>
);

const SectionTitle = ({ kicker, title, sub }) => (
  <div className="mb-10">
    {kicker && (
      <div className="mono text-[10px] tracking-[0.32em] uppercase text-sauce mb-3">
        {kicker}
      </div>
    )}
    <h1 className="serif text-5xl md:text-6xl leading-[0.95] text-ink font-light tracking-tight">
      {title}
    </h1>
    {sub && (
      <p className="mt-4 text-ink/60 max-w-2xl text-base leading-relaxed">
        {sub}
      </p>
    )}
  </div>
);

// In the Gemini-only build, this is just a status badge instead of a switcher.
const EngineSwitcher = () => (
  <div className="inline-flex items-center gap-2 bg-cream border border-ink/10 rounded-full px-4 py-2 shadow-card">
    <span className="w-1.5 h-1.5 rounded-full bg-sauce"></span>
    <span className="text-xs font-medium text-ink">Gemini</span>
    <span className="opacity-50 text-[10px] mono">3 Flash</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Top navigation: editorial step tracker
// ─────────────────────────────────────────────────────────────────────────────
const TopNav = ({ step }) => {
  const steps = [
    { num: 1, label: "Briefing" },
    { num: 2, label: "Aesthetic" },
    { num: 3, label: "Pillars" },
    { num: 4, label: "Calendar" },
    { num: 5, label: "Production" },
  ];
  const cur =
    typeof step === "number"
      ? step
      : step === "loading_calendar"
      ? 4
      : step === "executing"
      ? 5
      : 5;

  return (
    <header className="border-b border-ink/10 bg-cream/80 backdrop-blur-md sticky top-0 z-30">
      {/* Top ticker */}
      <div className="overflow-hidden border-b border-ink/10 bg-ink text-bone">
        <div className="ticker py-2 mono text-[10px] tracking-[0.4em] uppercase">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <span key={i} className="mx-8">
                Saucemed · Vol. 01 · A content studio with character · Editorial
                AI for brands ·
              </span>
            ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <span className="serif text-3xl text-ink italic font-light">
            saucemed
          </span>
          <span className="mono text-[10px] tracking-[0.3em] uppercase text-ink/40 hidden md:inline">
            content studio
          </span>
        </div>

        {/* Step pills */}
        <nav className="hidden md:flex items-center gap-2">
          {steps.map((s, i) => {
            const past = cur > s.num;
            const here = cur === s.num;
            return (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mono ${
                      past
                        ? "bg-ink text-bone"
                        : here
                        ? "bg-sauce text-bone ring-4 ring-sauce/20"
                        : "bg-bone text-ink/40 border border-ink/10"
                    }`}
                  >
                    {past ? <Check className="w-3 h-3" strokeWidth={3} /> : s.num}
                  </span>
                  <span
                    className={`text-xs ${
                      here
                        ? "text-sauce font-medium"
                        : past
                        ? "text-ink"
                        : "text-ink/40"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`w-6 h-px ${
                      past ? "bg-ink" : "bg-ink/15"
                    }`}
                  ></div>
                )}
              </React.Fragment>
            );
          })}
        </nav>

        <div className="mono text-[10px] tracking-[0.3em] uppercase text-ink/40">
          {String(cur).padStart(2, "0")} / 05
        </div>
      </div>
    </header>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(1);
  const [engine, setEngine] = useState("gemini");
  const [loadingText, setLoadingText] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  // -------- Briefing state --------
  const [brief, setBrief] = useState({
    brandName: "La Roche-Posay",
    productDescription:
      "Cicaplast Baume B5+ — a multi-purpose soothing balm that nourishes, repairs, and protects irritated skin.",
    brandPersona: "Professional with a quietly witty edge",
    targetAudience: "Women, 25–40, skincare-curious",
    brandValues:
      "Repair, soothe, protect — dermatological trust with everyday warmth.",
    competitors: "Bepanthen, Avène Cicalfate",
    tones: ["Editorial", "Witty", "Elegant"],
    platforms: ["Instagram"],
    accountUrl: "",
    insightsAnalysis: null,
  });

  // -------- Assets state --------
  const [assets, setAssets] = useState({
    styleOptions: [],
    selectedStyleId: null,
    designStyle: "",
    photographyStyle: "",
    typographyStyle: "",
    styleReferenceBase64: "",
    styleReferenceMimeType: "",
    productPhotoBase64: "",
    productPhotoMimeType: "",
    characterPhotoBase64: "",
    characterPhotoMimeType: "",
    aspectRatio: "1:1",
    imageEngine: "gemini",
    imageModel: "gemini-3.1-flash-image-preview",
  });

  const [pillarsData, setPillarsData] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [results, setResults] = useState([]);
  const [executionProgress, setExecutionProgress] = useState(0);

  // -------- AI flags --------
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isAnalyzingInsights, setIsAnalyzingInsights] = useState(false);
  const [isSuggestingStyles, setIsSuggestingStyles] = useState(false);
  const [isSuggestingPillars, setIsSuggestingPillars] = useState(false);
  const [rewritingId, setRewritingId] = useState(null);
  const [regeneratingImageId, setRegeneratingImageId] = useState(null);
  const [rewriteInstructions, setRewriteInstructions] = useState({});
  const [imageInstructions, setImageInstructions] = useState({});
  const [isExporting, setIsExporting] = useState(false);

  // ───────── File upload handler ─────────
  const handleFileUpload = (e, prefix) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      const mimeType = result.split(";")[0].split(":")[1];
      const base64 = result.split(",")[1];
      setAssets((p) => ({
        ...p,
        [`${prefix}Base64`]: base64,
        [`${prefix}MimeType`]: mimeType,
      }));
    };
    reader.readAsDataURL(file);
  };

  // ───────── AI: Enhance brief ─────────
  const enhanceBrief = async () => {
    if (!brief.brandName) return showToast("Add a brand name first.");
    setIsEnhancing(true);
    try {
      const prompt = `You are an expert brand strategist. The product is "${brief.brandName}".
What is known: "${brief.productDescription}".
Expand this into a polished marketing brief — give a thorough productDescription, the ideal targetAudience, the brandPersona, and the brandValues.`;
      const { json } = await generateText({
        engine,
        prompt,
        schema: {
          productDescription: "string",
          targetAudience: "string",
          brandPersona: "string",
          brandValues: "string",
        },
      });
      setBrief((p) => ({ ...p, ...json }));
    } catch (e) {
      showToast(e.message);
    }
    setIsEnhancing(false);
  };

  // ───────── AI: Analyze insights ─────────
  const analyzeInsights = async () => {
    if (!brief.accountUrl) return showToast("Add an account link first.");
    setIsAnalyzingInsights(true);
    try {
      const prompt = `You are an expert social media analyst. For the Instagram account at "${brief.accountUrl}":
1. What content typically drives the highest engagement (formats, themes, angles)?
2. What content tends to underperform?
3. Three actionable rules to apply going forward.
Use general knowledge of the brand or its category. Be concrete.`;
      const { json } = await generateText({
        engine,
        prompt,
        schema: {
          topContent: "string",
          lowContent: "string",
          keyLearnings: ["string"],
        },
      });
      setBrief((p) => ({ ...p, insightsAnalysis: json }));
    } catch (e) {
      showToast(e.message);
    }
    setIsAnalyzingInsights(false);
  };

  // ───────── AI: Suggest visual styles ─────────
  const suggestStyles = async () => {
    setIsSuggestingStyles(true);
    try {
      const prompt = `Act as an Art Director for "${brief.brandName}".
Brief: ${brief.productDescription}
Audience: ${brief.targetAudience}
Tone: ${brief.tones.join(", ")}
Suggest exactly 5 distinct visual style directions. Each must have a short evocative name, a design direction, a photography direction, and a typography direction.`;
      const { json } = await generateText({
        engine,
        prompt,
        schema: {
          styles: [
            {
              name: "string",
              design: "string",
              photography: "string",
              typography: "string",
            },
          ],
        },
      });
      const optionsWithIds = (json.styles || []).map((s, i) => ({
        ...s,
        id: `style-${i}`,
      }));
      setAssets((p) => ({ ...p, styleOptions: optionsWithIds }));
    } catch (e) {
      showToast(e.message);
    }
    setIsSuggestingStyles(false);
  };

  const applyStyle = (s) =>
    setAssets((p) => ({
      ...p,
      selectedStyleId: s.id,
      designStyle: s.design,
      photographyStyle: s.photography,
      typographyStyle: s.typography,
    }));

  // ───────── AI: Suggest pillars ─────────
  const suggestPillars = async () => {
    setIsSuggestingPillars(true);
    try {
      const prompt = `Act as a content strategist for "${brief.brandName}".
Brief: ${brief.productDescription}
Audience: ${brief.targetAudience}
Values: ${brief.brandValues}
Tone: ${brief.tones.join(", ")}
${
  brief.insightsAnalysis
    ? `\nINSIGHTS:\n- Top: ${brief.insightsAnalysis.topContent}\n- Low: ${
        brief.insightsAnalysis.lowContent
      }\n- Learnings: ${brief.insightsAnalysis.keyLearnings.join(" | ")}\n`
    : ""
}
Create EXACTLY 3 distinct, strategic content pillars. Each: name, description, rationale (why it works), hashtags (string), cta.`;
      const { json } = await generateText({
        engine,
        prompt,
        schema: {
          pillars: [
            {
              name: "string",
              description: "string",
              rationale: "string",
              hashtags: "string",
              cta: "string",
            },
          ],
        },
      });
      const newPillars = (json.pillars || []).map((p, i) => ({
        ...p,
        id: Date.now() + i,
        postsCount: 4,
        source: engine,
      }));
      setPillarsData((p) => [...p, ...newPillars]);
    } catch (e) {
      showToast(e.message);
    }
    setIsSuggestingPillars(false);
  };

  const handleAddManualPillar = () =>
    setPillarsData((p) => [
      ...p,
      {
        id: Date.now(),
        name: "",
        description: "",
        postsCount: 4,
        hashtags: "",
        cta: "Shop Now",
        rationale: "Manually created pillar.",
        source: "manual",
      },
    ]);

  const removePillar = (id) =>
    setPillarsData((p) => p.filter((x) => x.id !== id));
  const updatePillar = (id, field, value) =>
    setPillarsData((p) =>
      p.map((x) => (x.id === id ? { ...x, [field]: value } : x))
    );

  // ───────── AI: Calendar ─────────
  const generateCalendar = async () => {
    if (pillarsData.length === 0)
      return showToast("Define at least one pillar first.");
    setLoadingText("Architecting your editorial calendar…");
    setStep("loading_calendar");
    try {
      const totalPosts = pillarsData.reduce(
        (s, p) => s + parseInt(p.postsCount || 0),
        0
      );
      const prompt = `Create a content calendar for "${brief.brandName}".
Description: ${brief.productDescription}
Tone: ${brief.tones.join(", ")}
${
  brief.insightsAnalysis
    ? `\nLean into: ${brief.insightsAnalysis.topContent}\nLearnings: ${brief.insightsAnalysis.keyLearnings.join(
        " | "
      )}\n`
    : ""
}
Pillars (with required post counts):
${pillarsData
  .map((p) => `- ${p.name} (${p.postsCount} posts). Context: ${p.description}`)
  .join("\n")}

Rules:
1. Generate EXACTLY the requested count per pillar.
2. Total = ${totalPosts}.
3. Distribute across April 2026 (2026-04-01 to 2026-04-30). Stagger smartly.
4. Each post needs: pillar (exact name), topic, visual_concept (rich photographer brief), date (YYYY-MM-DD), time (HH:MM), format (carousel|reel|static|story).`;
      const { json } = await generateText({
        engine,
        prompt,
        schema: {
          calendar: [
            {
              pillar: "string",
              topic: "string",
              visual_concept: "string",
              date: "string",
              time: "string",
              format: "string",
            },
          ],
        },
        maxTokens: 4096,
      });
      const sorted = (json.calendar || []).sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      setCalendar(sorted.map((it, i) => ({ ...it, id: i, status: "pending" })));
      setStep(4);
    } catch (e) {
      showToast(e.message);
      setStep(3);
    }
    setLoadingText("");
  };

  // ───────── AI: Caption rewrite ─────────
  const rewriteCaption = async (idx) => {
    const instruction = rewriteInstructions[idx];
    if (!instruction) return;
    setRewritingId(idx);
    try {
      const target = results[idx];
      const prompt = `Rewrite this caption with this instruction: "${instruction}".
Original: "${target.generatedCaption}"
Keep it engaging, on-brand, and platform-appropriate.`;
      const { json } = await generateText({
        engine,
        prompt,
        schema: { newCaption: "string" },
      });
      const next = [...results];
      next[idx].generatedCaption = json.newCaption;
      setResults(next);
      setRewriteInstructions((p) => ({ ...p, [idx]: "" }));
    } catch (e) {
      showToast(e.message);
    }
    setRewritingId(null);
  };

  // ───────── AI: Image regenerate ─────────
  const regenerateImage = async (idx) => {
    const instruction = imageInstructions[idx];
    if (!instruction) return;
    setRegeneratingImageId(idx);
    try {
      const target = results[idx];
      const orientation =
        assets.aspectRatio === "16:9" || assets.aspectRatio === "4:3"
          ? "horizontal landscape"
          : assets.aspectRatio === "1:1"
          ? "square"
          : "vertical portrait";

      const refs = buildReferenceImages();
      const imagePrompt = `${target.visual_concept}.
ADDITIONAL INSTRUCTION: "${instruction}".
Product: ${brief.brandName}.
Design: ${assets.designStyle || "brand-appropriate"}.
Photography: ${assets.photographyStyle || "professional, cinematic"}.
${orientation} ${assets.aspectRatio} composition. Hi-res, masterpiece quality, magazine-grade.`;

      const { dataUrl } = await generateImage({
        engine: assets.imageEngine,
        model: assets.imageModel,
        prompt: imagePrompt,
        aspect: assets.aspectRatio,
        referenceImages: refs,
      });

      const next = [...results];
      next[idx].generatedImage = dataUrl;
      setResults(next);
      setImageInstructions((p) => ({ ...p, [idx]: "" }));
    } catch (e) {
      showToast(e.message);
    }
    setRegeneratingImageId(null);
  };

  // ───────── Reference image collector ─────────
  const buildReferenceImages = () => {
    const refs = [];
    if (assets.styleReferenceBase64)
      refs.push({
        mimeType: assets.styleReferenceMimeType,
        base64: assets.styleReferenceBase64,
      });
    if (assets.productPhotoBase64)
      refs.push({
        mimeType: assets.productPhotoMimeType,
        base64: assets.productPhotoBase64,
      });
    if (assets.characterPhotoBase64)
      refs.push({
        mimeType: assets.characterPhotoMimeType,
        base64: assets.characterPhotoBase64,
      });
    return refs;
  };

  // ───────── Execute production pipeline ─────────
  const executeContentPlan = async () => {
    setStep("executing");
    setExecutionProgress(0);
    const finalResults = [];
    const orientation =
      assets.aspectRatio === "16:9" || assets.aspectRatio === "4:3"
        ? "horizontal landscape"
        : assets.aspectRatio === "1:1"
        ? "square"
        : "vertical portrait";

    const refs = buildReferenceImages();

    for (let i = 0; i < calendar.length; i++) {
      const item = calendar[i];
      setLoadingText(`Producing ${i + 1} / ${calendar.length}\n${item.topic}`);

      try {
        // 1. Caption + CTA
        const captionPrompt = `Write a tightly-crafted caption + CTA for this post:
Brand: ${brief.brandName}
Tone: ${brief.tones.join(", ")}
Platform: ${brief.platforms[0] || "Instagram"}
Topic: ${item.topic}
Visual context: ${item.visual_concept}
Make it sing. Use emojis sparingly but with purpose.`;
        const { json: capJson } = await generateText({
          engine,
          prompt: captionPrompt,
          schema: { caption: "string", cta: "string" },
        });

        // 2. Image
        const imagePrompt = `${item.visual_concept}.
Product: ${brief.brandName}.
Design: ${assets.designStyle || "brand-appropriate"}.
Photography: ${assets.photographyStyle || "professional, editorial"}.
Typography style (if implied): ${assets.typographyStyle || "clean editorial serif"}.
${orientation} ${assets.aspectRatio} composition. Magazine-grade, hi-res, atmospheric.`;
        let imageUrl;
        try {
          const { dataUrl } = await generateImage({
            engine: assets.imageEngine,
            model: assets.imageModel,
            prompt: imagePrompt,
            aspect: assets.aspectRatio,
            referenceImages: refs,
          });
          imageUrl = dataUrl;
        } catch {
          imageUrl = `https://placehold.co/600x600/ebe4d3/161311?text=${encodeURIComponent(
            "Image failed"
          )}`;
        }

        finalResults.push({
          ...item,
          generatedCaption: capJson.caption,
          generatedCTA: capJson.cta,
          generatedImage: imageUrl,
        });
        setResults([...finalResults]);
        setExecutionProgress(Math.round(((i + 1) / calendar.length) * 100));
      } catch (e) {
        finalResults.push({
          ...item,
          generatedCaption: "Error generating content.",
          generatedCTA: "—",
          generatedImage: `https://placehold.co/600x600/ebe4d3/d83a1f?text=${encodeURIComponent(
            "Error"
          )}`,
        });
        setResults([...finalResults]);
      }
    }
    setStep(5);
    setLoadingText("");
  };

  // ───────── Downloads ─────────
  const downloadSingleImage = (item, i) => {
    if (!item.generatedImage) return;
    const a = document.createElement("a");
    a.href = item.generatedImage;
    a.download = `post_${i + 1}_${item.pillar
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      let txt = `SAUCEMED · CONTENT PACKAGE\n${brief.brandName}\n\n`;
      let csv =
        "Post,Date,Time,Format,Pillar,Topic,Caption,CTA,Visual Concept\n";
      const escape = (s) => `"${(s || "").replace(/"/g, '""')}"`;

      results.forEach((item, i) => {
        const safeName = item.pillar
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase();
        if (item.generatedImage?.startsWith("data:image")) {
          zip.file(
            `images/post_${i + 1}_${safeName}.png`,
            item.generatedImage.split(",")[1],
            { base64: true }
          );
        }
        txt += `── POST ${i + 1} ──\n`;
        txt += `${item.date} ${item.time} · ${item.format}\nPillar: ${item.pillar}\nTopic: ${item.topic}\n\n`;
        txt += `Caption:\n${item.generatedCaption}\n\nCTA:\n${item.generatedCTA}\n\nVisual:\n${item.visual_concept}\n\n\n`;
        csv += `${i + 1},${item.date},${item.time},${item.format},${escape(
          item.pillar
        )},${escape(item.topic)},${escape(item.generatedCaption)},${escape(
          item.generatedCTA
        )},${escape(item.visual_concept)}\n`;
      });

      zip.file("content_plan.txt", txt);
      zip.file("calendar.csv", csv);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${brief.brandName.replace(
        /[^a-z0-9]/gi,
        "_"
      )}_saucemed.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      showToast(e.message);
    }
    setIsExporting(false);
  };

  // ───────── Pillar color palette ─────────
  const pillarColor = (name) => {
    const idx = pillarsData.findIndex((p) => p.name === name);
    const palette = [
      { dot: "bg-sauce", accent: "border-sauce text-sauce bg-sauce/5" },
      { dot: "bg-olive", accent: "border-olive text-olive bg-olive/5" },
      { dot: "bg-ink", accent: "border-ink text-ink bg-ink/5" },
      { dot: "bg-sauce-glow", accent: "border-sauce-glow text-sauce-glow bg-sauce-glow/5" },
      { dot: "bg-amber-700", accent: "border-amber-700 text-amber-700 bg-amber-50" },
    ];
    return palette[Math.max(0, idx) % palette.length] || palette[0];
  };

  // ───────── Calendar grid (April 2026) ─────────
  const calendarCells = useMemo(() => {
    const year = 2026, month = 3;
    const first = new Date(year, month, 1);
    const startDow = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < startDow; i++) {
      cells.push({ type: "blank", key: `blank-${i}` });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-04-${String(d).padStart(2, "0")}`;
      const events = calendar.filter((ev) => ev.date === dateStr);
      cells.push({ type: "day", key: `d-${d}`, day: d, events });
    }
    while (cells.length < 42) cells.push({ type: "blank", key: `e-${cells.length}` });
    return cells;
  }, [calendar]);

  return (
    <div className="min-h-screen bg-cream text-ink">
      <TopNav step={step} />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-up">
          <div
            className={`px-5 py-3 rounded-lg shadow-deep border ${
              toast.type === "error"
                ? "bg-ink text-bone border-sauce"
                : "bg-bone text-ink border-ink/20"
            } flex items-center gap-3 max-w-sm`}
          >
            <AlertCircle
              className={`w-4 h-4 flex-shrink-0 ${
                toast.type === "error" ? "text-sauce" : "text-ink"
              }`}
            />
            <span className="text-sm">{toast.msg}</span>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-12 pb-24">
        {/* ═══════════════════ STEP 1: BRIEFING ═══════════════════ */}
        {step === 1 && (
          <div className="animate-fade-up">
            <div className="grid grid-cols-12 gap-8 mb-12">
              <div className="col-span-12 md:col-span-8">
                <SectionTitle
                  kicker="Chapter One · The Brief"
                  title={
                    <>
                      Tell us <em className="serif italic">who</em> you are,
                      <br /> and we'll find your{" "}
                      <em className="serif italic text-sauce">voice.</em>
                    </>
                  }
                  sub="Saucemed reads your brand like an editor reads a manuscript — with care, with curiosity, with a sharp pencil."
                />
              </div>
              <div className="col-span-12 md:col-span-4 flex md:justify-end md:items-end">
                <div className="flex flex-col gap-3 items-end">
                  <span className="mono text-[10px] tracking-[0.3em] uppercase text-ink/40 flex items-center gap-2">
                    <Cpu className="w-3 h-3" /> Engine
                  </span>
                  <EngineSwitcher value={engine} onChange={setEngine} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="card p-8 grain">
                <Label required>Brand or Product</Label>
                <input
                  className="field text-2xl serif"
                  value={brief.brandName}
                  onChange={(e) =>
                    setBrief({ ...brief, brandName: e.target.value })
                  }
                />
                <div className="mt-8">
                  <Label required>Description</Label>
                  <textarea
                    rows={5}
                    className="field-box resize-y"
                    value={brief.productDescription}
                    onChange={(e) =>
                      setBrief({ ...brief, productDescription: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="card p-8 grain">
                <Label required>Persona</Label>
                <textarea
                  rows={2}
                  className="field-box resize-y"
                  value={brief.brandPersona}
                  onChange={(e) =>
                    setBrief({ ...brief, brandPersona: e.target.value })
                  }
                />
                <div className="mt-6">
                  <Label>Audience</Label>
                  <input
                    className="field-box"
                    value={brief.targetAudience}
                    onChange={(e) =>
                      setBrief({ ...brief, targetAudience: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <Label>Values</Label>
                    <input
                      className="field-box"
                      value={brief.brandValues}
                      onChange={(e) =>
                        setBrief({ ...brief, brandValues: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Competitors</Label>
                    <input
                      className="field-box"
                      placeholder="Key rivals…"
                      value={brief.competitors}
                      onChange={(e) =>
                        setBrief({ ...brief, competitors: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-8 mb-6">
              <Label required>Tone of Voice</Label>
              <div className="flex flex-wrap gap-2 mt-3">
                {TONES.map((t) => {
                  const on = brief.tones.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() =>
                        setBrief((p) => ({
                          ...p,
                          tones: on
                            ? p.tones.filter((x) => x !== t)
                            : [...p.tones, t],
                        }))
                      }
                      className={`chip ${on ? "chip-on" : "chip-off"}`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8">
                <Label required>Platforms</Label>
                <div className="flex flex-wrap gap-2 mt-3">
                  {PLATFORMS.map((p) => {
                    const on = brief.platforms.includes(p);
                    return (
                      <button
                        key={p}
                        onClick={() =>
                          setBrief((prev) => ({
                            ...prev,
                            platforms: on
                              ? prev.platforms.filter((x) => x !== p)
                              : [...prev.platforms, p],
                          }))
                        }
                        className={`chip ${
                          on
                            ? "bg-sauce text-bone border-sauce"
                            : "chip-off"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Insights block */}
            <div className="card p-8 mb-12">
              <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-sauce" />
                    <h3 className="serif text-2xl">
                      Account intelligence{" "}
                      <span className="mono text-[9px] tracking-[0.3em] uppercase text-ink/40 ml-2">
                        optional
                      </span>
                    </h3>
                  </div>
                  <p className="text-sm text-ink/60">
                    Drop your Instagram link — let the engine read what already
                    works.
                  </p>
                </div>
                <button
                  onClick={analyzeInsights}
                  disabled={isAnalyzingInsights || !brief.accountUrl}
                  className="btn-outline"
                >
                  {isAnalyzingInsights ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <BarChart2 className="w-4 h-4" />
                  )}
                  Analyze
                </button>
              </div>

              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" />
                <input
                  type="url"
                  placeholder="https://instagram.com/yourbrand"
                  value={brief.accountUrl}
                  onChange={(e) =>
                    setBrief({ ...brief, accountUrl: e.target.value })
                  }
                  className="field-box pl-11"
                />
              </div>

              {brief.insightsAnalysis && (
                <div className="mt-6 space-y-4 animate-fade-up">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border border-ink/10 rounded-xl p-5 bg-bone/40">
                      <div className="flex items-center gap-2 text-olive mb-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="mono text-[10px] uppercase tracking-[0.2em]">
                          Top Performers
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">
                        {brief.insightsAnalysis.topContent}
                      </p>
                    </div>
                    <div className="border border-ink/10 rounded-xl p-5 bg-bone/40">
                      <div className="flex items-center gap-2 text-sauce mb-2">
                        <AlertCircle className="w-4 h-4" />
                        <span className="mono text-[10px] uppercase tracking-[0.2em]">
                          Underperformers
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">
                        {brief.insightsAnalysis.lowContent}
                      </p>
                    </div>
                  </div>
                  <div className="border border-ink/10 rounded-xl p-5 bg-cream">
                    <div className="flex items-center gap-2 text-ink mb-3">
                      <Lightbulb className="w-4 h-4 text-sauce" />
                      <span className="mono text-[10px] uppercase tracking-[0.2em]">
                        Editorial rules to apply
                      </span>
                    </div>
                    <ol className="space-y-2.5 list-none">
                      {brief.insightsAnalysis.keyLearnings.map((l, i) => (
                        <li
                          key={i}
                          className="text-sm flex items-start gap-3 leading-relaxed"
                        >
                          <span className="serif italic text-sauce text-lg leading-none mt-0.5">
                            {String(i + 1).padStart(2, "0")}.
                          </span>
                          <span>{l}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <button
                onClick={enhanceBrief}
                disabled={isEnhancing}
                className="btn-outline"
              >
                {isEnhancing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4 text-sauce" />
                )}
                Auto-enhance brief
              </button>

              <button onClick={() => setStep(2)} className="btn-ink">
                Continue to aesthetic
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════ STEP 2: ASSETS / AESTHETIC ═══════════════════ */}
        {step === 2 && (
          <div className="animate-fade-up">
            <SectionTitle
              kicker="Chapter Two · The Aesthetic"
              title={
                <>
                  Set the <em className="serif italic text-sauce">mood.</em>
                </>
              }
              sub="Direct the visuals like a photo editor. Reference images condition output on whichever image engine you pick."
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Art direction column */}
              <div className="card p-8">
                <div className="flex items-center justify-between mb-6">
                  <span className="serif text-xl">Art direction</span>
                  <button
                    onClick={suggestStyles}
                    disabled={isSuggestingStyles}
                    className="text-xs flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink/5 hover:bg-ink/10 transition-colors"
                  >
                    {isSuggestingStyles ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Wand2 className="w-3 h-3 text-sauce" />
                    )}
                    Suggest styles
                  </button>
                </div>

                {assets.styleOptions.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 mb-6 animate-fade-up">
                    {assets.styleOptions.map((s) => {
                      const sel = assets.selectedStyleId === s.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => applyStyle(s)}
                          className={`text-left p-4 rounded-xl border-2 transition-all ${
                            sel
                              ? "border-sauce bg-sauce/5"
                              : "border-ink/10 hover:border-ink/30 bg-bone/30"
                          }`}
                        >
                          <h4 className="serif text-base mb-1">{s.name}</h4>
                          <p className="text-[11px] text-ink/60 leading-snug line-clamp-3">
                            {s.design}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <Label>Design</Label>
                    <input
                      className="field-box text-sm"
                      placeholder="Minimalist, bold accents…"
                      value={assets.designStyle}
                      onChange={(e) =>
                        setAssets({ ...assets, designStyle: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Photography</Label>
                    <input
                      className="field-box text-sm"
                      placeholder="Soft daylight, macro detail…"
                      value={assets.photographyStyle}
                      onChange={(e) =>
                        setAssets({
                          ...assets,
                          photographyStyle: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Typography</Label>
                    <input
                      className="field-box text-sm"
                      placeholder="Editorial serif, modern sans…"
                      value={assets.typographyStyle}
                      onChange={(e) =>
                        setAssets({
                          ...assets,
                          typographyStyle: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Format + Uploaders column */}
              <div className="space-y-6">
                {/* Image Engine selector */}
                <div className="card p-8">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <Label required>Image engine</Label>
                    <span className="mono text-[9px] tracking-[0.25em] uppercase text-ink/40">
                      Powers every image generated
                    </span>
                  </div>
                  <div className="flex gap-2 mb-5 p-3 rounded-xl bg-bone/40 border border-ink/10">
                    <span className="w-2 h-2 rounded-full bg-sauce mt-1.5 flex-shrink-0"></span>
                    <div>
                      <div className="text-sm font-semibold text-ink">
                        Gemini · Nano Banana
                      </div>
                      <div className="mono text-[9px] uppercase tracking-widest text-ink/40 mt-0.5">
                        Powered by Google's image-generation family
                      </div>
                    </div>
                  </div>
                  <Label>Model</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {IMAGE_ENGINES.find((e) => e.id === assets.imageEngine)
                      ?.models.map((m) => {
                        const sel = assets.imageModel === m.id;
                        return (
                          <button
                            key={m.id}
                            onClick={() =>
                              setAssets({ ...assets, imageModel: m.id })
                            }
                            className={`text-left p-3 rounded-lg border transition-all ${
                              sel
                                ? "border-sauce bg-sauce/5"
                                : "border-ink/10 hover:border-ink/30 bg-bone/20"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  sel ? "bg-sauce" : "bg-ink/20"
                                }`}
                              ></span>
                              <span className="text-sm font-medium">
                                {m.label}
                              </span>
                            </div>
                            <div className="mono text-[9px] uppercase tracking-widest text-ink/40 mt-1 ml-3.5">
                              {m.note}
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>

                <div className="card p-8">
                  <Label required>Format</Label>
                  <div className="flex gap-3 overflow-x-auto pb-2 mt-3">
                    {ASPECTS.map((r) => {
                      const sel = assets.aspectRatio === r.label;
                      return (
                        <button
                          key={r.label}
                          onClick={() =>
                            setAssets({ ...assets, aspectRatio: r.label })
                          }
                          className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-24 rounded-xl border-2 transition-all ${
                            sel
                              ? "border-sauce bg-sauce/5 text-sauce"
                              : "border-ink/15 hover:border-ink/40 text-ink/60"
                          }`}
                        >
                          <div
                            className={`border-2 rounded mb-2 ${
                              sel ? "border-sauce" : "border-ink/40"
                            }`}
                            style={{
                              width: "22px",
                              aspectRatio: r.label.replace(":", "/"),
                            }}
                          ></div>
                          <span className="text-xs font-bold">{r.label}</span>
                          <span className="mono text-[8px] uppercase tracking-widest opacity-70">
                            {r.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <UploadTile
                    label="Style"
                    icon={Layout}
                    base64={assets.styleReferenceBase64}
                    mime={assets.styleReferenceMimeType}
                    onChange={(e) => handleFileUpload(e, "styleReference")}
                  />
                  <UploadTile
                    label="Product"
                    icon={ImageIcon}
                    base64={assets.productPhotoBase64}
                    mime={assets.productPhotoMimeType}
                    onChange={(e) => handleFileUpload(e, "productPhoto")}
                  />
                  <UploadTile
                    label="Model"
                    icon={UserCircle}
                    base64={assets.characterPhotoBase64}
                    mime={assets.characterPhotoMimeType}
                    onChange={(e) => handleFileUpload(e, "characterPhoto")}
                  />
                </div>

                <div className="border border-ink/10 rounded-xl p-4 bg-bone/40 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-sauce flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-ink/70 leading-relaxed">
                    Images render via{" "}
                    <span className="serif italic">
                      {IMAGE_ENGINES.find((e) => e.id === assets.imageEngine)
                        ?.models.find((m) => m.id === assets.imageModel)
                        ?.label || assets.imageModel}
                    </span>
                    . Reference photos condition the output — upload a product
                    shot for accurate placement.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button onClick={() => setStep(1)} className="btn-ghost">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={() => setStep(3)} className="btn-primary">
                Define pillars <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════ STEP 3: PILLARS ═══════════════════ */}
        {step === 3 && (
          <div className="animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <SectionTitle
                kicker="Chapter Three · Pillars"
                title={
                  <>
                    Three <em className="serif italic text-sauce">columns</em>
                    <br /> hold the whole house up.
                  </>
                }
                sub="Each pillar is a strategic angle — a recurring story the audience comes back for."
              />

              <div className="flex flex-col items-end gap-3">
                <EngineSwitcher value={engine} onChange={setEngine} />
                <div className="flex gap-3">
                  <button
                    onClick={suggestPillars}
                    disabled={isSuggestingPillars}
                    className="btn-ink"
                  >
                    {isSuggestingPillars ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-sauce-glow" />
                    )}
                    Suggest pillars
                  </button>
                  <button
                    onClick={handleAddManualPillar}
                    className="btn-outline"
                  >
                    <Plus className="w-4 h-4" /> Manual
                  </button>
                </div>
              </div>
            </div>

            {pillarsData.length === 0 ? (
              <div className="card p-16 text-center grain">
                <Target className="w-12 h-12 text-ink/20 mx-auto mb-4" />
                <h3 className="serif text-2xl mb-2">No pillars yet</h3>
                <p className="text-sm text-ink/50 max-w-md mx-auto mb-6">
                  Let the engine read your brief and propose three strategic
                  angles — or sketch them yourself.
                </p>
              </div>
            ) : (
              <div className="space-y-5 mb-10">
                {pillarsData.map((p, i) => {
                  const c = pillarColor(p.name);
                  return (
                    <div
                      key={p.id}
                      className="card p-8 relative group hover:shadow-deep transition-shadow"
                    >
                      <button
                        onClick={() => removePillar(p.id)}
                        className="absolute top-5 right-5 text-ink/20 hover:text-sauce transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-3 mb-6">
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center mono text-[11px] font-bold ${c.dot} text-bone`}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {p.source !== "manual" && (
                          <span className="mono text-[9px] tracking-[0.25em] uppercase text-ink/50 px-2 py-1 border border-ink/15 rounded-full flex items-center gap-1.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            {p.source}
                          </span>
                        )}
                      </div>

                      <div className="grid md:grid-cols-12 gap-4 mb-4">
                        <div className="md:col-span-4">
                          <Label>Name</Label>
                          <input
                            className="field-box text-base serif"
                            value={p.name}
                            onChange={(e) =>
                              updatePillar(p.id, "name", e.target.value)
                            }
                          />
                        </div>
                        <div className="md:col-span-6">
                          <Label>Description</Label>
                          <input
                            className="field-box text-sm"
                            value={p.description}
                            onChange={(e) =>
                              updatePillar(p.id, "description", e.target.value)
                            }
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>Posts</Label>
                          <input
                            type="number"
                            min={1}
                            max={15}
                            className="field-box text-center"
                            value={p.postsCount}
                            onChange={(e) =>
                              updatePillar(
                                p.id,
                                "postsCount",
                                parseInt(e.target.value) || 1
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Hashtags</Label>
                          <input
                            className="field-box text-sm mono text-xs"
                            value={p.hashtags}
                            onChange={(e) =>
                              updatePillar(p.id, "hashtags", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label>CTA</Label>
                          <select
                            className="field-box text-sm"
                            value={p.cta}
                            onChange={(e) =>
                              updatePillar(p.id, "cta", e.target.value)
                            }
                          >
                            <option>Shop Now</option>
                            <option>Learn More</option>
                            <option>Link in Bio</option>
                            <option>Comment Below</option>
                            <option>Save this Post</option>
                          </select>
                        </div>
                      </div>

                      {p.rationale && (
                        <div className="mt-6 pt-6 border-t border-ink/10 flex items-start gap-3">
                          <Lightbulb className="w-4 h-4 text-sauce flex-shrink-0 mt-0.5" />
                          <p className="text-xs italic text-ink/60 leading-relaxed serif">
                            {p.rationale}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {pillarsData.length > 0 && (
              <div className="border-y border-ink py-3 px-1 mb-10 flex items-center justify-between">
                <span className="mono text-[10px] uppercase tracking-[0.3em] text-ink/60">
                  Total scheduled
                </span>
                <span className="serif text-3xl">
                  {pillarsData.reduce(
                    (s, p) => s + parseInt(p.postsCount || 0),
                    0
                  )}
                  <span className="text-ink/30 text-base ml-2">posts</span>
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <button onClick={() => setStep(2)} className="btn-ghost">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={generateCalendar}
                disabled={pillarsData.length === 0}
                className="btn-primary"
              >
                Build calendar <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════ LOADING CALENDAR ═══════════════════ */}
        {step === "loading_calendar" && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center animate-fade-up">
            <div className="serif text-6xl italic text-sauce mb-2">
              architecting
            </div>
            <div className="mono text-[10px] tracking-[0.3em] uppercase text-ink/50 mb-8">
              the calendar is forming
            </div>
            <Loader2 className="w-8 h-8 text-ink animate-spin mb-4" />
            <p className="text-ink/60 text-sm whitespace-pre-line text-center max-w-md">
              {loadingText}
            </p>
          </div>
        )}

        {/* ═══════════════════ STEP 4: CALENDAR ═══════════════════ */}
        {step === 4 && (
          <div className="animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <SectionTitle
                kicker="Chapter Four · The Calendar"
                title={
                  <>
                    Thirty days,
                    <br />
                    one <em className="serif italic text-sauce">rhythm.</em>
                  </>
                }
                sub="Posts staged across April. Edit, regenerate, or run the production line."
              />
              <button onClick={generateCalendar} className="btn-outline">
                <CalendarDays className="w-4 h-4" /> Re-architect
              </button>
            </div>

            <div className="card overflow-hidden mb-10">
              <div className="flex items-center justify-between p-6 pb-4">
                <button className="p-2 hover:bg-ink/5 rounded-full">
                  <ChevronLeft className="w-4 h-4 text-ink/50" />
                </button>
                <div className="text-center">
                  <div className="serif text-3xl">April</div>
                  <div className="mono text-[10px] tracking-[0.3em] uppercase text-ink/40">
                    Volume · Twenty Six
                  </div>
                </div>
                <button className="p-2 hover:bg-ink/5 rounded-full">
                  <ChevronRight className="w-4 h-4 text-ink/50" />
                </button>
              </div>
              <div className="dotted-divider"></div>

              <div className="grid grid-cols-7 bg-bone/40 border-y border-ink/10">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div
                    key={d}
                    className="mono text-[10px] uppercase tracking-[0.3em] text-ink/50 py-3 text-center border-r border-ink/10 last:border-0"
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 border-l border-ink/10">
                {calendarCells.map((cell) =>
                  cell.type === "blank" ? (
                    <div
                      key={cell.key}
                      className="bg-bone/20 border-r border-b border-ink/10 min-h-[110px]"
                    />
                  ) : (
                    <div
                      key={cell.key}
                      className="bg-cream border-r border-b border-ink/10 min-h-[110px] p-2 flex flex-col gap-1"
                    >
                      <span className="serif text-sm text-ink/70 mb-1">
                        {String(cell.day).padStart(2, "0")}
                      </span>
                      {cell.events.map((ev, i) => {
                        const c = pillarColor(ev.pillar);
                        return (
                          <div
                            key={i}
                            title={ev.topic}
                            className={`text-[10px] leading-tight px-2 py-1 rounded border-l-2 truncate ${c.accent}`}
                          >
                            {ev.topic}
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* List view */}
            <div className="card p-8 mb-10">
              <div className="flex items-center justify-between mb-6">
                <span className="mono text-[10px] uppercase tracking-[0.3em] text-ink/50">
                  Issue plan · {calendar.length} posts
                </span>
                <span className="mono text-[10px] uppercase tracking-[0.3em] text-ink/40">
                  via {engine}
                </span>
              </div>
              <div className="divide-y divide-ink/10">
                {calendar.map((it, i) => {
                  const c = pillarColor(it.pillar);
                  return (
                    <div
                      key={i}
                      className="py-3 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-ink/[0.02] -mx-2 px-2 rounded transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full ${c.dot}`}
                        ></span>
                        <span className="text-sm font-medium truncate">
                          {it.topic}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-xs text-ink/50 mono">
                        <span className="px-2 py-0.5 bg-bone rounded text-[10px] uppercase tracking-wider">
                          {it.format}
                        </span>
                        <span className="hidden sm:inline">{it.date}</span>
                        <span>{it.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button onClick={() => setStep(3)} className="btn-ghost">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={executeContentPlan} className="btn-primary">
                Run production <Play className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════ EXECUTING ═══════════════════ */}
        {step === "executing" && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center animate-fade-up">
            <div className="relative w-32 h-32 mb-8">
              <svg
                className="w-full h-full -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(22,19,17,0.1)"
                  strokeWidth="2"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#d83a1f"
                  strokeWidth="2"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * executionProgress) / 100}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="serif text-4xl text-ink">
                  {executionProgress}
                </span>
                <span className="mono text-[10px] text-ink/50 tracking-[0.3em]">
                  PERCENT
                </span>
              </div>
            </div>
            <div className="serif text-3xl italic text-ink mb-3">
              the press is running
            </div>
            <p className="text-ink/60 text-sm whitespace-pre-line text-center max-w-md leading-relaxed">
              {loadingText}
            </p>

            {/* Preview strip */}
            <div className="mt-12 w-full max-w-3xl overflow-hidden">
              <div className="flex gap-3 overflow-x-auto p-2">
                {results.map((r, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 h-32 rounded-md bg-bone overflow-hidden border border-ink/10 relative"
                    style={{
                      aspectRatio: assets.aspectRatio.replace(":", "/"),
                    }}
                  >
                    {r.generatedImage && (
                      <img
                        src={r.generatedImage}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-ink/30 flex items-center justify-center">
                      <CheckCircle2 className="text-bone w-6 h-6" />
                    </div>
                  </div>
                ))}
                {Array.from({ length: calendar.length - results.length }).map(
                  (_, i) => (
                    <div
                      key={`s-${i}`}
                      className="flex-shrink-0 h-32 rounded-md shimmer border border-ink/10"
                      style={{
                        aspectRatio: assets.aspectRatio.replace(":", "/"),
                      }}
                    ></div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════ STEP 5: RESULTS ═══════════════════ */}
        {step === 5 && (
          <div className="animate-fade-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
              <div>
                <div className="mono text-[10px] tracking-[0.32em] uppercase text-sauce mb-3">
                  Issue ready · April 2026
                </div>
                <h1 className="serif text-5xl md:text-6xl leading-[0.95] font-light tracking-tight">
                  The <em className="italic">press</em> has run.
                </h1>
                <p className="text-ink/60 mt-3 max-w-xl">
                  Your full content set is below. Edit captions inline, regenerate
                  any image, or take the whole package home.
                </p>
              </div>
              <button
                onClick={handleExportAll}
                disabled={isExporting}
                className="btn-ink"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isExporting ? "Packing…" : "Download package"}
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((item, idx) => (
                <ResultCard
                  key={idx}
                  item={item}
                  idx={idx}
                  aspect={assets.aspectRatio}
                  pillarColor={pillarColor(item.pillar)}
                  onDownload={() => downloadSingleImage(item, idx)}
                  rewriteInstructions={rewriteInstructions}
                  setRewriteInstructions={setRewriteInstructions}
                  onRewrite={() => rewriteCaption(idx)}
                  rewritingId={rewritingId}
                  imageInstructions={imageInstructions}
                  setImageInstructions={setImageInstructions}
                  onRegenerateImage={() => regenerateImage(idx)}
                  regeneratingImageId={regeneratingImageId}
                />
              ))}
            </div>

            <div className="mt-16 pt-8 border-t border-ink/10 text-center">
              <button
                onClick={() => {
                  setStep(1);
                  setResults([]);
                  setCalendar([]);
                  setPillarsData([]);
                }}
                className="text-sauce font-medium hover:text-sauce-deep inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Start a new issue
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-ink/10 py-8 mt-16 bg-cream">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between flex-wrap gap-3">
          <span className="serif text-xl italic text-ink">saucemed</span>
          <div className="mono text-[10px] tracking-[0.3em] uppercase text-ink/40 flex items-center gap-4">
            <span>Vol. 01</span>
            <span>·</span>
            <span>Built with Inter Tight & Fraunces</span>
            <span>·</span>
            <span>Image engine: Gemini Nano Banana</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────
function UploadTile({ label, icon: Icon, base64, mime, onChange }) {
  return (
    <div className="card p-3">
      <Label>{label}</Label>
      <div className="relative border border-dashed border-ink/30 rounded-lg bg-bone/40 p-3 flex flex-col items-center justify-center min-h-[120px] overflow-hidden hover:border-sauce hover:bg-sauce/5 transition-all group">
        <input
          type="file"
          accept="image/*"
          onChange={onChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        {base64 ? (
          <img
            src={`data:${mime};base64,${base64}`}
            alt={label}
            className="h-20 object-contain"
          />
        ) : (
          <>
            <Icon className="w-5 h-5 text-ink/40 mb-2 group-hover:text-sauce transition-colors" />
            <span className="text-[10px] text-ink/50">Upload</span>
          </>
        )}
      </div>
    </div>
  );
}

function ResultCard({
  item,
  idx,
  aspect,
  pillarColor,
  onDownload,
  rewriteInstructions,
  setRewriteInstructions,
  onRewrite,
  rewritingId,
  imageInstructions,
  setImageInstructions,
  onRegenerateImage,
  regeneratingImageId,
}) {
  return (
    <article className="card overflow-hidden flex flex-col group hover:shadow-deep transition-shadow">
      {/* Image */}
      <div
        className="w-full bg-bone relative overflow-hidden"
        style={{ aspectRatio: aspect.replace(":", "/") }}
      >
        {regeneratingImageId === idx ? (
          <div className="absolute inset-0 bg-bone flex flex-col items-center justify-center z-20">
            <Loader2 className="w-6 h-6 text-sauce animate-spin mb-2" />
            <span className="text-[10px] mono uppercase tracking-widest text-ink/50">
              Regenerating
            </span>
          </div>
        ) : (
          <img
            src={item.generatedImage}
            alt={item.topic}
            className="w-full h-full object-cover"
          />
        )}

        {/* Overlay download */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-4 pointer-events-none">
          <button
            onClick={onDownload}
            className="bg-bone text-ink px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 hover:bg-cream pointer-events-auto shadow-deep"
          >
            <Download className="w-3 h-3" /> Save
          </button>
        </div>

        {/* Pillar badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-bone/95 backdrop-blur rounded-full text-[10px] mono uppercase tracking-[0.2em] text-ink shadow-sm">
            {item.pillar}
          </span>
        </div>

        {/* Image rewrite bar */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-ink/85 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
          <div className="relative">
            <input
              type="text"
              placeholder="Tweak the image…"
              value={imageInstructions[idx] || ""}
              onChange={(e) =>
                setImageInstructions((p) => ({
                  ...p,
                  [idx]: e.target.value,
                }))
              }
              onKeyDown={(e) => e.key === "Enter" && onRegenerateImage()}
              disabled={regeneratingImageId === idx}
              className="w-full text-xs px-3 py-2.5 bg-bone/95 backdrop-blur rounded-full border-none focus:ring-2 focus:ring-sauce outline-none pr-10 text-ink placeholder:text-ink/40"
            />
            <button
              onClick={onRegenerateImage}
              disabled={
                !imageInstructions[idx] || regeneratingImageId === idx
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-sauce hover:text-sauce-deep disabled:opacity-30"
            >
              <Wand2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className="mono text-[9px] tracking-[0.3em] uppercase text-ink/40">
            {item.date} · {item.time}
          </span>
          <span className="mono text-[9px] tracking-[0.2em] uppercase text-ink/40">
            {item.format}
          </span>
        </div>
        <h3 className="serif text-lg leading-snug mb-4 text-ink">
          {item.topic}
        </h3>

        {/* Caption */}
        <div className="bg-bone/40 border border-ink/10 p-4 rounded-lg flex-1 mb-3 relative">
          <Type className="absolute top-3 right-3 w-3.5 h-3.5 text-ink/20" />
          {rewritingId === idx ? (
            <div className="flex items-center justify-center min-h-[80px]">
              <Loader2 className="w-5 h-5 text-sauce animate-spin" />
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap leading-relaxed pr-5 text-ink/85">
              {item.generatedCaption}
            </p>
          )}

          <div className="mt-4 pt-3 border-t border-ink/10">
            <div className="relative">
              <input
                placeholder="Make it shorter, sharper, weirder…"
                value={rewriteInstructions[idx] || ""}
                onChange={(e) =>
                  setRewriteInstructions((p) => ({
                    ...p,
                    [idx]: e.target.value,
                  }))
                }
                onKeyDown={(e) => e.key === "Enter" && onRewrite()}
                disabled={rewritingId === idx}
                className="w-full text-xs px-3 py-2 bg-cream border border-ink/15 rounded-md focus:ring-2 focus:ring-sauce/30 focus:border-sauce outline-none pr-9"
              />
              <button
                onClick={onRewrite}
                disabled={!rewriteInstructions[idx] || rewritingId === idx}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sauce hover:text-sauce-deep disabled:opacity-30"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-start gap-3 bg-sauce/5 border border-sauce/20 p-3 rounded-lg">
          <Target className="w-4 h-4 text-sauce flex-shrink-0 mt-0.5" />
          <div>
            <span className="mono text-[9px] uppercase tracking-[0.3em] text-sauce-deep mb-0.5 block">
              Call to action
            </span>
            <p className="text-sm font-medium text-ink">{item.generatedCTA}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
