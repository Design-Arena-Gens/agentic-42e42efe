"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

type PosterPattern = "none" | "grid" | "dots" | "diagonal" | "waves";
type PosterLayout = "split" | "center" | "hero";
type PosterStyle = {
  id: string;
  name: string;
  description: string;
  palette: {
    gradient: [string, string];
    accent: string;
    accentText: string;
    secondary: string;
    text: string;
    subtext: string;
    panel: string;
    shadow: string;
  };
  pattern: PosterPattern;
  layout: PosterLayout;
  imageAlignment: "left" | "center" | "right";
  ctaStyle: "pill" | "bar";
};

type FormState = {
  brandName: string;
  productName: string;
  tagline: string;
  description: string;
  cta: string;
  price: string;
  accent: string;
};

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350;

const templateKeys = ["neon", "minimal", "organic"] as const;
type StyleTemplateKey = (typeof templateKeys)[number];

const posterStyles: PosterStyle[] = [
  {
    id: "neon",
    name: "Launch Neon",
    description: "High-energy gradient built for tech drops & bold promos.",
    palette: {
      gradient: ["#030712", "#122060"],
      accent: "#38BDF8",
      accentText: "#020617",
      secondary: "#A5B4FC",
      text: "#F8FAFC",
      subtext: "rgba(226,232,240,0.78)",
      panel: "rgba(15,23,42,0.52)",
      shadow: "rgba(2,132,199,0.38)",
    },
    pattern: "diagonal",
    layout: "split",
    imageAlignment: "right",
    ctaStyle: "pill",
  },
  {
    id: "minimal",
    name: "Minimal Glow",
    description: "Soft gradients, centered layout and modern editorial feel.",
    palette: {
      gradient: ["#0F172A", "#1E293B"],
      accent: "#FBBF24",
      accentText: "#0F172A",
      secondary: "#F8FAFC",
      text: "#F1F5F9",
      subtext: "rgba(241,245,249,0.75)",
      panel: "rgba(255,255,255,0.08)",
      shadow: "rgba(255,255,255,0.12)",
    },
    pattern: "waves",
    layout: "center",
    imageAlignment: "center",
    ctaStyle: "pill",
  },
  {
    id: "organic",
    name: "Organic Fresh",
    description: "Earthy gradients and textured grids for wellness brands.",
    palette: {
      gradient: ["#052E16", "#0F172A"],
      accent: "#4ADE80",
      accentText: "#022C22",
      secondary: "#BBF7D0",
      text: "#ECFDF5",
      subtext: "rgba(209,250,229,0.82)",
      panel: "rgba(15,118,110,0.35)",
      shadow: "rgba(16,185,129,0.42)",
    },
    pattern: "grid",
    layout: "hero",
    imageAlignment: "left",
    ctaStyle: "bar",
  },
];

const defaultFormData: FormState = {
  brandName: "Lumen Labs",
  productName: "Aurora Brew Cold Concentrate",
  tagline: "Ignite your mornings with luminous energy.",
  description:
    "Triple-steeped coffee enhanced with adaptogens for a smooth, sustained lift that keeps creatives in flow.",
  cta: "Launch bundle • Ships today",
  price: "$24",
  accent: "New Release",
};

const defaultBullets: string[] = [
  "Single-origin beans with caramel citrus finish",
  "Focus-fueling lion's mane & ginseng",
  "Serve chilled over oat milk or tonic",
];

const accentPool = [
  "Creator Favorite",
  "Drop Two",
  "Launch Day",
  "Limited Edition",
  "Made for Motion",
  "New Release",
  "Small Batch",
  "Studio Essential",
];

function randomChoice<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function replaceTemplate(template: string, product: string, brand: string) {
  return template
    .replaceAll("{product}", product || "your product")
    .replaceAll("{brand}", brand || "your brand");
}

function generateAiCopy(
  form: FormState,
  style: PosterStyle,
  bullets: string[],
): {
  tagline: string;
  description: string;
  cta: string;
  accent: string;
  bullets: string[];
} {
  const product = form.productName.trim() || "Signature Blend";
  const brand = form.brandName.trim() || "Your Brand";

  const taglineTemplates: Record<StyleTemplateKey, string[]> = {
    neon: [
      "Fuel {brand} with {product}",
      "{product}: engineered for momentum",
      "Meet the future of {brand}",
      "Push past ordinary with {product}",
    ],
    minimal: [
      "{product}, distilled for everyday calm",
      "Quiet power in every pour",
      "Elevate routine with {product}",
      "Design-forward flavor for focused days",
    ],
    organic: [
      "Harvested energy in every sip",
      "Plant-powered clarity starts here",
      "{product}: ritual-ready and rooted",
      "Pure botanicals, pure momentum",
    ],
  };

  const descriptionTemplates: Record<StyleTemplateKey, string[]> = {
    neon: [
      "Precision-crafted for teams who move fast — bright notes, clean caffeine, zero crash.",
      "A layered profile of citrus, caramel, and cacao that keeps strategy sessions dialed in.",
      "Built in micro-batches for makers chasing the next big launch.",
    ],
    minimal: [
      "Cold-steeped 18 hours for a velvet texture that plays nice with late-night edits.",
      "Balanced sweetness and natural clarity, designed for studios that stay in motion.",
      "Silky concentrate with adaptive botanicals to keep your pace calm and confident.",
    ],
    organic: [
      "Organic beans infused with adaptogens and nervines for grounded energy.",
      "Whole-plant nutrition meets nuanced flavor — brewed slow, bottled fresh.",
      "Clean, sustainable, and vibrant — your daily ritual reimagined.",
    ],
  };

  const ctaTemplates: Record<StyleTemplateKey, string[]> = {
    neon: [
      "Unlock {product}",
      "Reserve your supply",
      "Upgrade your studio bar",
    ],
    minimal: [
      "Bring {product} home",
      "Add to your ritual",
      "Blend a calmer morning",
    ],
    organic: [
      "Taste the first press",
      "Stock the studio fridge",
      "Sip the slow energy",
    ],
  };

  const bulletFragments: Record<StyleTemplateKey, string[]> = {
    neon: [
      "Crafted for launch nights",
      "Silky nitro texture",
      "Zero jitter microdose",
      "Bright citrus finish",
      "Sustainable aluminum vessel",
    ],
    minimal: [
      "18-hour cold steep",
      "Velvet vanilla finish",
      "Low-acid extraction",
      "Pairs with tonic or oat",
      "Ready in 30 seconds",
    ],
    organic: [
      "Botanical adaptogen stack",
      "USDA organic & fair trade",
      "Naturally sweet cacao finish",
      "Sun-dried single origin",
      "Compostable packaging",
    ],
  };

  const styleKey: StyleTemplateKey = templateKeys.includes(
    style.id as StyleTemplateKey,
  )
    ? (style.id as StyleTemplateKey)
    : "neon";

  const tagline = replaceTemplate(
    randomChoice(taglineTemplates[styleKey]),
    product,
    brand,
  );
  const description = replaceTemplate(
    randomChoice(descriptionTemplates[styleKey]),
    product,
    brand,
  );
  const cta = replaceTemplate(
    randomChoice(ctaTemplates[styleKey]),
    product,
    brand,
  );

  const bulletSet = new Set(
    bullets
      .concat(
        Array.from({ length: 3 }, () => randomChoice(bulletFragments[styleKey])),
      )
      .map((item) => item.trim())
      .filter(Boolean),
  );

  return {
    tagline,
    description,
    cta,
    accent: randomChoice(accentPool),
    bullets: Array.from(bulletSet).slice(0, 4),
  };
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function renderPattern(
  ctx: CanvasRenderingContext2D,
  style: PosterStyle,
  width: number,
  height: number,
) {
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.lineWidth = 2;
  ctx.strokeStyle = style.palette.secondary;
  ctx.fillStyle = style.palette.secondary;

  switch (style.pattern) {
    case "grid": {
      const spacing = 120;
      for (let x = spacing / 2; x < width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = spacing / 2; y < height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      break;
    }
    case "dots": {
      for (let x = 40; x < width; x += 120) {
        for (let y = 60; y < height; y += 120) {
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }
    case "diagonal": {
      const spacing = 140;
      ctx.lineWidth = 3;
      for (let i = -height; i < width; i += spacing) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + height, height);
        ctx.stroke();
      }
      break;
    }
    case "waves": {
      ctx.lineWidth = 2;
      const amplitude = 22;
      const wavelength = 180;
      for (let y = 80; y < height; y += 140) {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 10) {
          const waveY = y + Math.sin((x / wavelength) * Math.PI * 2) * amplitude;
          if (x === 0) {
            ctx.moveTo(x, waveY);
          } else {
            ctx.lineTo(x, waveY);
          }
        }
        ctx.stroke();
      }
      break;
    }
    default:
      break;
  }

  ctx.restore();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
  align: CanvasTextAlign,
) {
  if (!text.trim()) {
    return startY;
  }

  const words = text.trim().split(/\s+/);
  let line = "";
  let y = startY;

  ctx.textAlign = align;

  for (let i = 0; i < words.length; i += 1) {
    const word = words[i];
    const testLine = line ? `${line} ${word}` : word;
    const testWidth = ctx.measureText(testLine).width;

    if (testWidth > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else {
      line = testLine;
    }

    if (i === words.length - 1) {
      ctx.fillText(line, x, y);
    }
  }

  return y + lineHeight;
}

export default function Home() {
  const [selectedStyleId, setSelectedStyleId] = useState<string>(
    posterStyles[0]?.id ?? "neon",
  );
  const [formData, setFormData] = useState<FormState>(defaultFormData);
  const [bulletPoints, setBulletPoints] =
    useState<string[]>(defaultBullets.slice(0, 3));
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [productImageUrl, setProductImageUrl] = useState<string>(
    "/sample-product.svg",
  );
  const [productImage, setProductImage] = useState<HTMLImageElement | null>(
    null,
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedStyle = useMemo(
    () =>
      posterStyles.find((style) => style.id === selectedStyleId) ??
      posterStyles[0],
    [selectedStyleId],
  );

  const loadImageFromUrl = useCallback((url: string) => {
    if (typeof window === "undefined") return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.src = url;
    img.onload = () => {
      setProductImage(img);
      setProductImageUrl(url);
    };
  }, []);

  useEffect(() => {
    loadImageFromUrl("/sample-product.svg");
  }, [loadImageFromUrl]);

  const renderPoster = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const dpr =
      typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.maxWidth = "520px";

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(dpr, dpr);
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const { palette, layout, imageAlignment, ctaStyle } = selectedStyle;

    // Background gradient
    const gradient = context.createLinearGradient(
      0,
      0,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
    );
    gradient.addColorStop(0, palette.gradient[0]);
    gradient.addColorStop(1, palette.gradient[1]);
    context.fillStyle = gradient;
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    renderPattern(context, selectedStyle, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Lower vignette for readability
    const vignette = context.createLinearGradient(
      0,
      CANVAS_HEIGHT * 0.45,
      0,
      CANVAS_HEIGHT,
    );
    vignette.addColorStop(0, "rgba(2,6,23,0)");
    vignette.addColorStop(1, "rgba(2,6,23,0.55)");
    context.fillStyle = vignette;
    context.fillRect(0, CANVAS_HEIGHT * 0.45, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Accent orb behind product
    context.save();
    const orbGradient = context.createRadialGradient(
      CANVAS_WIDTH * 0.5,
      CANVAS_HEIGHT * 0.28,
      80,
      CANVAS_WIDTH * 0.5,
      CANVAS_HEIGHT * 0.28,
      CANVAS_WIDTH * 0.5,
    );
    orbGradient.addColorStop(0, `${palette.accent}33`);
    orbGradient.addColorStop(1, "transparent");
    context.fillStyle = orbGradient;

    let orbCenterX = CANVAS_WIDTH * 0.5;
    if (imageAlignment === "right") orbCenterX = CANVAS_WIDTH * 0.64;
    if (imageAlignment === "left") orbCenterX = CANVAS_WIDTH * 0.36;

    context.beginPath();
    context.ellipse(
      orbCenterX,
      CANVAS_HEIGHT * 0.36,
      CANVAS_WIDTH * 0.32,
      CANVAS_HEIGHT * 0.2,
      0,
      0,
      Math.PI * 2,
    );
    context.fill();
    context.restore();

    // Product image render
    if (productImage) {
      const maxImageWidth =
        layout === "split" ? CANVAS_WIDTH * 0.55 : CANVAS_WIDTH * 0.6;
      const maxImageHeight = CANVAS_HEIGHT * 0.55;
      const scale = Math.min(
        maxImageWidth / productImage.width,
        maxImageHeight / productImage.height,
      );
      const drawWidth = productImage.width * scale;
      const drawHeight = productImage.height * scale;

      let imageX = (CANVAS_WIDTH - drawWidth) / 2;
      if (imageAlignment === "right") {
        imageX = CANVAS_WIDTH * 0.62 - drawWidth / 2;
      } else if (imageAlignment === "left") {
        imageX = CANVAS_WIDTH * 0.36 - drawWidth / 2;
      }
      const imageY = CANVAS_HEIGHT * 0.18;

      context.save();
      context.shadowColor = palette.shadow;
      context.shadowBlur = 80;
      context.shadowOffsetY = 48;
      context.drawImage(productImage, imageX, imageY, drawWidth, drawHeight);
      context.restore();
    } else {
      const placeholderWidth = CANVAS_WIDTH * 0.42;
      const placeholderHeight = CANVAS_HEIGHT * 0.48;
      let placeholderX = (CANVAS_WIDTH - placeholderWidth) / 2;
      if (imageAlignment === "right") {
        placeholderX = CANVAS_WIDTH * 0.62 - placeholderWidth / 2;
      } else if (imageAlignment === "left") {
        placeholderX = CANVAS_WIDTH * 0.34 - placeholderWidth / 2;
      }
      const placeholderY = CANVAS_HEIGHT * 0.2;

      context.save();
      context.globalAlpha = 0.3;
      context.setLineDash([18, 14]);
      context.lineWidth = 4;
      drawRoundedRect(
        context,
        placeholderX,
        placeholderY,
        placeholderWidth,
        placeholderHeight,
        28,
      );
      context.strokeStyle = palette.secondary;
      context.stroke();
      context.restore();
    }

    // Accent pill
    const accentText =
      (formData.accent || randomChoice(accentPool)).toUpperCase();
    context.save();
    context.font = "20px 'Geist', 'Inter', sans-serif";
    const accentWidth = Math.min(
      CANVAS_WIDTH * 0.6,
      context.measureText(accentText).width + 120,
    );
    const accentHeight = 48;
    const accentX =
      layout === "center"
        ? CANVAS_WIDTH / 2 - accentWidth / 2
        : CANVAS_WIDTH * 0.1;
    const accentY = 90;

    drawRoundedRect(
      context,
      accentX,
      accentY,
      accentWidth,
      accentHeight,
      28,
    );
    context.fillStyle = palette.accent;
    context.globalAlpha = 0.92;
    context.fill();
    context.fillStyle = palette.accentText;
    context.textAlign = "left";
    context.globalAlpha = 1;
    context.fillText(accentText, accentX + 32, accentY + 30);
    context.restore();

    const textAlign: CanvasTextAlign =
      layout === "split" || layout === "hero" ? "left" : "center";
    const textX =
      textAlign === "left" ? CANVAS_WIDTH * 0.1 : CANVAS_WIDTH / 2;
    const textWidth =
      textAlign === "left" ? CANVAS_WIDTH * 0.46 : CANVAS_WIDTH * 0.72;

    // Brand label
    context.fillStyle = palette.subtext;
    context.font = "26px 'Geist', 'Inter', sans-serif";
    context.textAlign = textAlign;
    const brandY = CANVAS_HEIGHT * 0.6;
    if (formData.brandName.trim()) {
      context.fillText(formData.brandName.toUpperCase(), textX, brandY);
    }

    // Product name
    context.fillStyle = palette.text;
    context.font = "74px 'Geist', 'Space Grotesk', sans-serif";
    const productY = brandY + 70;
    const nextY = wrapText(
      context,
      formData.productName,
      textX,
      productY,
      textWidth,
      80,
      textAlign,
    );

    // Tagline
    context.fillStyle = palette.secondary;
    context.font = "42px 'Geist', 'Inter', sans-serif";
    const taglineY = wrapText(
      context,
      formData.tagline,
      textX,
      nextY + 6,
      textWidth,
      56,
      textAlign,
    );

    // Description
    context.fillStyle = "rgba(226,232,240,0.7)";
    context.font = "26px 'Geist', 'Inter', sans-serif";
    const bodyY = wrapText(
      context,
      formData.description,
      textX,
      taglineY + 4,
      textWidth,
      40,
      textAlign,
    );

    // Bullet highlights / chips
    const bulletStartY = bodyY + 24;
    const bulletSpacing = layout === "center" ? 66 : 42;
    bulletPoints.forEach((point, index) => {
      if (!point.trim()) return;
      if (layout === "center") {
        context.save();
        const chipText = point.toUpperCase();
        context.font = "22px 'Geist', 'Inter', sans-serif";
        const chipWidth = Math.min(
          textWidth,
          context.measureText(chipText).width + 90,
        );
        const chipX = CANVAS_WIDTH / 2 - chipWidth / 2;
        const chipY = bulletStartY + index * bulletSpacing;
        drawRoundedRect(context, chipX, chipY, chipWidth, 54, 32);
        context.fillStyle = palette.panel;
        context.globalAlpha = 0.92;
        context.fill();
        context.globalAlpha = 1;
        context.fillStyle = palette.text;
        context.textAlign = "center";
        context.fillText(chipText, CANVAS_WIDTH / 2, chipY + 35);
        context.restore();
      } else {
        context.save();
        context.font = "24px 'Geist', 'Inter', sans-serif";
        context.fillStyle = palette.subtext;
        context.textAlign = "left";
        const bulletYPos = bulletStartY + index * bulletSpacing;
        context.fillText(`• ${point}`, textX, bulletYPos);
        context.restore();
      }
    });

    // CTA block
    const ctaText = formData.cta || "Shop now";
    context.font = "30px 'Geist', 'Inter', sans-serif";
    const ctaMetrics = context.measureText(ctaText);
    const paddingX = 44;
    const ctaWidth =
      textAlign === "left"
        ? Math.max(ctaMetrics.width + paddingX * 2, 320)
        : ctaMetrics.width + paddingX * 2;
    const ctaHeight = 74;
    const ctaY = CANVAS_HEIGHT - 160;

    const ctaX =
      textAlign === "left"
        ? CANVAS_WIDTH * 0.1
        : CANVAS_WIDTH / 2 - ctaWidth / 2;

    drawRoundedRect(
      context,
      ctaX,
      ctaY,
      ctaWidth,
      ctaHeight,
      ctaStyle === "pill" ? 40 : 18,
    );
    context.fillStyle = palette.accent;
    context.globalAlpha = 0.96;
    context.fill();
    context.globalAlpha = 1;
    context.fillStyle = palette.accentText;
    context.textAlign = textAlign === "left" ? "left" : "center";
    context.fillText(
      ctaText,
      textAlign === "left" ? ctaX + paddingX : CANVAS_WIDTH / 2,
      ctaY + ctaHeight / 2 + 10,
    );

    // Price badge
    if (formData.price.trim()) {
      const badgeX =
        imageAlignment === "left"
          ? CANVAS_WIDTH - 170
          : CANVAS_WIDTH - 150;
      const badgeY = CANVAS_HEIGHT * 0.26;
      context.save();
      context.beginPath();
      context.arc(badgeX, badgeY, 90, 0, Math.PI * 2);
      context.fillStyle = palette.panel;
      context.globalAlpha = 0.92;
      context.fill();
      context.globalAlpha = 0.5;
      context.strokeStyle = palette.accent;
      context.lineWidth = 5;
      context.stroke();
      context.restore();

      context.save();
      context.fillStyle = palette.text;
      context.font = "42px 'Geist', 'Inter', sans-serif";
      context.textAlign = "center";
      context.fillText(formData.price, badgeX, badgeY + 14);
      context.restore();
    }
  }, [productImage, selectedStyle, formData, bulletPoints]);

  useEffect(() => {
    renderPoster();
  }, [renderPoster]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        loadImageFromUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const resetImageToSample = () => {
    loadImageFromUrl("/sample-product.svg");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const updateFormField = <Key extends keyof FormState>(
    key: Key,
    value: FormState[Key],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateBullet = (index: number, value: string) => {
    setBulletPoints((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const addBullet = () => {
    setBulletPoints((prev) =>
      prev.length >= 5 ? prev : [...prev, ""],
    );
  };

  const removeBullet = (index: number) => {
    setBulletPoints((prev) =>
      prev.length <= 2 ? prev : prev.filter((_, i) => i !== index),
    );
  };

  const handleGenerateCopy = () => {
    setIsGeneratingCopy(true);
    window.setTimeout(() => {
      const ai = generateAiCopy(formData, selectedStyle, bulletPoints);
      setFormData((prev) => ({
        ...prev,
        tagline: ai.tagline,
        description: ai.description,
        cta: ai.cta,
        accent: ai.accent,
      }));
      setBulletPoints(ai.bullets);
      setIsGeneratingCopy(false);
    }, 520);
  };

  const handleDownloadPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${formData.productName || "poster"}.png`;
    link.href = canvas.toDataURL("image/png", 1);
    link.click();
  };

  return (
    <div className="min-h-screen w-full px-4 pb-16 pt-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 lg:flex-row">
        <aside className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-md lg:max-w-md">
          <div className="mb-8 flex flex-col gap-3">
            <span className="text-sm font-medium uppercase tracking-[0.3em] text-sky-300/80">
              PosterCraft AI
            </span>
            <h1 className="text-3xl font-semibold leading-tight text-slate-50">
              Convert raw product shots into launch-ready ad posters.
            </h1>
            <p className="text-sm leading-relaxed text-slate-300/70">
              Upload a product photo, pick a creative direction, and let the
              AI-assisted studio draft copy, highlights, and layout in real
              time.
            </p>
          </div>

          <div className="space-y-8">
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200/80">
                  Product Image
                </h2>
                <button
                  type="button"
                  onClick={resetImageToSample}
                  className="text-xs font-medium text-slate-300/80 underline underline-offset-4 transition hover:text-sky-300"
                >
                  Use sample
                </button>
              </div>
              <label className="group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center transition hover:border-sky-300/50 hover:bg-white/[0.08]">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-2xl text-slate-200">
                  ⬆️
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-100">
                    Drop or click to upload
                  </p>
                  <p className="text-xs text-slate-400">
                    PNG, JPG or transparent assets up to 20MB
                  </p>
                </div>
              </label>

              <div className="mt-6 flex items-center gap-4 rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-white/10 bg-black/60">
                  <Image
                    src={productImageUrl}
                    alt="Product preview"
                    fill
                    sizes="80px"
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-100">
                    Current Asset
                  </p>
                  <p className="text-xs text-slate-400">
                    Swap assets to explore new creative blends instantly.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-200/80">
                Creative Direction
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {posterStyles.map((style) => {
                  const isActive = style.id === selectedStyleId;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setSelectedStyleId(style.id)}
                      className={`flex h-full flex-col gap-3 rounded-2xl border p-4 text-left transition ${
                        isActive
                          ? "border-sky-400/70 bg-white/[0.12] shadow-[0_0_24px_rgba(56,189,248,0.28)]"
                          : "border-white/10 bg-white/[0.05] hover:border-sky-300/40 hover:bg-white/[0.08]"
                      }`}
                    >
                      <div
                        className="h-24 w-full rounded-xl"
                        style={{
                          background: `linear-gradient(135deg, ${style.palette.gradient[0]}, ${style.palette.gradient[1]})`,
                        }}
                      />
                      <div>
                        <p className="text-base font-semibold text-slate-100">
                          {style.name}
                        </p>
                        <p className="text-xs text-slate-300/75">
                          {style.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200/80">
                  Narrative
                </h2>
                <button
                  type="button"
                  onClick={handleGenerateCopy}
                  disabled={isGeneratingCopy}
                  className="rounded-full border border-sky-400/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-sky-200 transition hover:bg-sky-400/10 disabled:cursor-wait disabled:opacity-60"
                >
                  {isGeneratingCopy ? "Crafting…" : "AI Refresh"}
                </button>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Brand Name
                  <input
                    value={formData.brandName}
                    onChange={(event) =>
                      updateFormField("brandName", event.target.value)
                    }
                    placeholder="Brand or collection name"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400/70 focus:bg-white/[0.08]"
                  />
                </label>
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Product Name
                  <input
                    value={formData.productName}
                    onChange={(event) =>
                      updateFormField("productName", event.target.value)
                    }
                    placeholder="Flagship product or hero SKU"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400/70 focus:bg-white/[0.08]"
                  />
                </label>
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Tagline
                  <input
                    value={formData.tagline}
                    onChange={(event) =>
                      updateFormField("tagline", event.target.value)
                    }
                    placeholder="Punchy headline the poster should deliver"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400/70 focus:bg-white/[0.08]"
                  />
                </label>
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Description
                  <textarea
                    value={formData.description}
                    onChange={(event) =>
                      updateFormField("description", event.target.value)
                    }
                    placeholder="Flavor notes, differentiators, or launch messaging."
                    className="mt-2 h-24 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400/70 focus:bg-white/[0.08]"
                  />
                </label>
              </div>
            </section>

            <section className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  CTA
                  <input
                    value={formData.cta}
                    onChange={(event) =>
                      updateFormField("cta", event.target.value)
                    }
                    placeholder="Call to action"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400/70 focus:bg-white/[0.08]"
                  />
                </label>
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Price
                  <input
                    value={formData.price}
                    onChange={(event) =>
                      updateFormField("price", event.target.value)
                    }
                    placeholder="$24"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400/70 focus:bg-white/[0.08]"
                  />
                </label>
              </div>
              <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Accent Label
                <input
                  value={formData.accent}
                  onChange={(event) =>
                    updateFormField("accent", event.target.value)
                  }
                  placeholder="Limited Drop, Studio Essential, etc."
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400/70 focus:bg-white/[0.08]"
                />
              </label>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200/80">
                  Highlights
                </h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addBullet}
                    disabled={bulletPoints.length >= 5}
                    className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 transition hover:border-sky-400/60 hover:text-sky-200 disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {bulletPoints.map((point, index) => (
                  <div
                    key={`bullet-${index}`}
                    className="flex items-center gap-3"
                  >
                    <input
                      value={point}
                      onChange={(event) => updateBullet(index, event.target.value)}
                      placeholder="Flavor, feature, or benefit"
                      className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400/70 focus:bg-white/[0.08]"
                    />
                    {bulletPoints.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeBullet(index)}
                        className="rounded-full border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-slate-300 transition hover:border-rose-400/60 hover:text-rose-200"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </aside>

        <section className="flex w-full flex-1 flex-col gap-6">
          <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-md lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-50">
                Poster Preview
              </h2>
              <p className="text-sm text-slate-300/70">
                Updates stream live as you adjust style, copy, and highlights.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleGenerateCopy}
                disabled={isGeneratingCopy}
                className="rounded-full border border-sky-400/60 px-6 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-sky-200 transition hover:bg-sky-400/10 disabled:cursor-wait disabled:opacity-60"
              >
                {isGeneratingCopy ? "Reimagining…" : "Refresh Copy"}
              </button>
              <button
                type="button"
                onClick={handleDownloadPoster}
                className="rounded-full bg-sky-400/90 px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-950 transition hover:bg-sky-300"
              >
                Download Poster
              </button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[560px]">
            <div className="relative mx-auto aspect-[4/5] w-full overflow-hidden rounded-[36px] border border-white/15 bg-black/40 shadow-[0_80px_160px_-60px_rgba(15,23,42,0.95)]">
              <canvas
                ref={canvasRef}
                className="h-full w-full"
                aria-label="Generated advertisement poster preview"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
