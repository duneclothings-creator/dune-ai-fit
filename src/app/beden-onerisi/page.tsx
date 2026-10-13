
"use client";
import { useState } from "react";
import { recommendSize } from "../../sizeRecommendation";
type VisualOptionProps = {
  title: string;
  description?: string;
  image?: string;
  selected: boolean;
  onClick: () => void;
};

function VisualOption({
  title,
  description,
  image,
  selected,
  onClick,
}: VisualOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`overflow-hidden rounded-2xl border-2 bg-white text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg-all hover:border-gray-500 ${
        selected
          ? "border-black shadow-md"
          : "border-gray-200"
      }`}
    >
<div className="aspect-square overflow-hidden bg-[#F5F5F3]">
  {image ? (
    <img
      src={image}
      alt={title}
  className="h-full w-full object-contain p-2 sm:p-4"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center">
      <span className="text-xs text-gray-400">
        Ürün görseli
      </span>
    </div>
  )}
</div>
      

      <div className="p-3">
        <p className="text-sm sm:text-base font-semibold tracking-tight text-gray-900">{title}</p>

        {description && (
          <p className="mt-1 text-xs font-normal leading-relaxed text-gray-500">
  {description}
</p>
        )}
      </div>
    </button>
  );
}
export default function BedenOnerisi() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [chestCm, setChestCm] = useState("");
  const [bellyCm, setBellyCm] = useState("");
  const [shoulderType, setShoulderType] =
  useState<"narrow" | "normal" | "broad">("normal");
  const [bellyType, setBellyType] =
  useState<"flat" | "medium" | "large">("flat");
const bodyType: "slim" | "normal" | "athletic" | "broad" =
  bellyType === "large" || shoulderType === "broad"
    ? "broad"
    : shoulderType === "narrow" && bellyType === "flat"
    ? "slim"
    : "normal";

const [fit, setFit] =
  useState<"slim" | "regular" | "oversize">("regular");

const [product, setProduct] =
  useState<"zipHoodie" | "pants" | "longSleeve" | "shortSleeve">("zipHoodie");
  const [result, setResult] = useState<ReturnType<typeof recommendSize> | null>(null);
  return (
    <main className="min-h-screen bg-white px-6 py-12 text-black">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex justify-center">
  <img
    src="/dune-logo.png"
    alt="Dune Co. Atelier"
    className="h-auto max-h-32 w-auto max-w-[280px] object-contain"
  />
</div>
        <p className="mb-3 text-xs tracking-[0.3em] text-gray-500">
          DUNE CO. ATELIER / AI FIT
        </p>
        <h1 className="mb-3 text-3xl font-semibold">
          Bedenini Keşfet
        </h1>
        <p className="mb-10 text-sm text-gray-500">
          Sana en uygun bedeni bulmak için bilgilerini gir.
        </p>
        <div className="space-y-6">
          <div>
            <div>
  <p className="mb-3 text-sm font-medium">
    Omuz Yapın Nasıl?
    </p>
   
  

  <div className="grid grid-cols-3 gap-3">
    {[
      { value: "narrow", label: "Dar Omuz" },
      { value: "normal", label: "Normal Omuz" },
      { value: "broad", label: "Geniş Omuz" },
    ].map((item) => (
      <button
        key={item.value}
        type="button"
        onClick={() => {
  setShoulderType(item.value as typeof shoulderType);
  setResult(null);
}}
        aria-pressed={shoulderType === item.value}
        className={`rounded-xl border-2 p-4 text-center text-sm transition ${
          shoulderType === item.value
            ? "border-black bg-gray-50 font-semibold"
            : "border-gray-200 bg-white"
        }`}
      >
       <div className="flex flex-col items-center gap-3">
  <svg
    viewBox="0 0 100 120"
    className="h-24 w-full max-w-24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle
      cx="50"
      cy="20"
      r="13"
      fill="#E5E7EB"
      stroke="#374151"
      strokeWidth="2"
    />

    <path
      d={
        item.value === "narrow"
          ? "M37 39 L29 45 L25 105 L75 105 L71 45 L63 39 Z"
          : item.value === "broad"
          ? "M37 39 L12 45 L23 105 L77 105 L88 45 L63 39 Z"
          : "M37 39 L21 45 L25 105 L75 105 L79 45 L63 39 Z"
      }
      fill="#F3F4F6"
      stroke="#374151"
      strokeWidth="2"
      strokeLinejoin="round"
    />

    <path
      d="M37 39 Q50 49 63 39"
      stroke="#9CA3AF"
      strokeWidth="1.5"
    />
  </svg>

  <span>{item.label}</span>
</div>
      </button>
    ))}
  </div>
</div>
 <div className="mt-6">
  <p className="mb-3 text-sm font-medium">
    Karın Yapın Nasıl?
  </p>

  <div className="grid grid-cols-3 gap-3">
    {[
      { value: "flat", label: "Düz Karın" },
      { value: "medium", label: "Hafif Göbek" },
      { value: "large", label: "Belirgin Göbek" },
    ].map((item) => (
      <button
        key={item.value}
        type="button"
        onClick={() => {
  setBellyType(item.value as typeof bellyType);
  setResult(null);
}}
        aria-pressed={bellyType === item.value}
        className={`rounded-xl border-2 p-3 text-center text-sm transition ${
          bellyType === item.value
            ? "border-black bg-gray-50 font-semibold"
            : "border-gray-200 bg-white"
        }`}
      >
        <div className="flex flex-col items-center gap-2">
  <svg
    viewBox="0 0 100 120"
    className="h-24 w-full"
    fill="none"
    aria-hidden="true"
  >
    <circle
      cx="50"
      cy="18"
      r="12"
      fill="#E5E7EB"
      stroke="#374151"
      strokeWidth="2"
    />

    <path
      d={
        item.value === "flat"
          ? "M35 36 L65 36 L65 105 L35 105 Z"
          : item.value === "medium"
          ? "M35 36 L65 36 Q78 70 68 105 L32 105 Q22 70 35 36 Z"
          : "M35 36 L65 36 Q92 70 73 105 L27 105 Q8 70 35 36 Z"
      }
      fill="#F3F4F6"
      stroke="#374151"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>

  <span>{item.label}</span>
</div>
      </button>
    ))}
  </div>
</div>
          
          
<div>
  <p className="mb-3 text-sm font-medium">
    Ürünü Görselden Seç
  </p>

  <div className="grid grid-cols-2 gap-4">
    <VisualOption
      title="Fermuarlı Sweatshirt"
      description="Oversize kalıp"
      image="/products/zip-hoodie.png"
      selected={product === "zipHoodie"}
      onClick={() => {
        setProduct("zipHoodie");
        setResult(null);
      }}
    />

    <VisualOption
      title="Kısa Kollu Tişört"
      description="Regular kalıp"
      image="/products/short-sleeve.png"
      selected={product === "shortSleeve"}
      onClick={() => {
        setProduct("shortSleeve");
        setResult(null);
      }}
    />

    <VisualOption
      title="Uzun Kollu Tişört"
      description="Oversize kalıp"
      image="/products/long-sleeve.png"
      selected={product === "longSleeve"}
      onClick={() => {
        setProduct("longSleeve");
        setResult(null);
      }}
    />

    <VisualOption
      title="İş Pantolonu"
      description="İş giyim"
      image="/products/pants.png"
      selected={product === "pants"}
      onClick={() => {
        setProduct("pants");
        setResult(null);
      }}
    />
  </div>
</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Boy (cm)
              </label>
              <input
                type="number"
                min="100"
                max="230"
                value={height}
                onChange={(e) => {
  setHeight(e.target.value);
  setResult(null);
}}
                placeholder="Örn. 178"
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Kilo (kg)
              </label>
              <input
                type="number"
                min="25"
                max="300"
                value={weight}
                onChange={(e) => {
  setWeight(e.target.value);
  setResult(null);
}}
                placeholder="Örn. 78"
                className="w-full rounded-lg border p-3"
              />
            </div>
          </div>

          
<div>
  <label className="mb-2 block text-sm font-medium">
    Göğüs Çevresi (cm) — İsteğe Bağlı
  </label>

  <input
    type="number"
    min="60"
    max="180"
    value={chestCm}
    onChange={(e) => {
  setChestCm(e.target.value);
  setResult(null);
}}
    placeholder="Örn. 108"
    className="w-full rounded-lg border p-3"
  />

  <p className="mt-2 text-xs text-gray-500">
    Göğüs çevrenizi mezurayla en geniş noktasından ölçün.
    Bu bilgi daha doğru beden önerisi yapmamıza yardımcı olur.
  </p>
</div>

<div>
  <label className="mb-2 block text-sm font-medium">
    Karın Çevresi (cm) — İsteğe Bağlı
  </label>

  <input
    type="number"
    min="60"
    max="200"
    value={bellyCm}
    onChange={(e) => {
  setBellyCm(e.target.value);
  setResult(null);
}}
    placeholder="Örn. 115"
    className="w-full rounded-lg border p-3"
  />

  <p className="mt-2 text-xs text-gray-500">
    Karın çevrenizi göbek hizasından ölçün.
    Bu bilgi daha doğru beden önerisi yapmamıza yardımcı olur.
  </p>
</div>
    <div>
  <p className="mb-3 text-sm font-medium">
    Nasıl Giymeyi Tercih Edersin?
  </p>

  <div className="grid grid-cols-3 gap-3">
    {[
      { value: "slim", label: "Dar Kesim" },
      { value: "regular", label: "Normal Kesim" },
      { value: "oversize", label: "Bol Kesim" },
    ].map((item) => (
      <button
        key={item.value}
        type="button"
        onClick={() => {
          setFit(item.value as typeof fit);
          setResult(null);
        }}
        aria-pressed={fit === item.value}
        className={`rounded-xl border-2 p-3 text-center text-sm transition ${
          fit === item.value
            ? "border-black bg-gray-50 font-semibold"
            : "border-gray-200 bg-white"
        }`}
      >
        <div className="flex flex-col items-center gap-2">
  <svg
    viewBox="0 0 100 110"
    className="h-24 w-full"
    fill="none"
    aria-hidden="true"
  >
    <path
      d={
        item.value === "slim"
          ? "M35 18 L25 25 L18 43 L30 49 L35 40 L35 95 L65 95 L65 40 L70 49 L82 43 L75 25 L65 18 Q50 30 35 18 Z"
          : item.value === "regular"
          ? "M35 18 L20 25 L12 47 L27 53 L33 40 L32 95 L68 95 L67 40 L73 53 L88 47 L80 25 L65 18 Q50 30 35 18 Z"
          : "M35 18 L15 25 L5 52 L23 59 L30 42 L26 95 L74 95 L70 42 L77 59 L95 52 L85 25 L65 18 Q50 30 35 18 Z"
      }
      fill="#F3F4F6"
      stroke="#374151"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M35 18 Q50 30 65 18"
      stroke="#9CA3AF"
      strokeWidth="2"
    />
  </svg>

  <span>{item.label}</span>
</div>
      </button>
    ))}
  </div>
</div>

          <button
            type="button"
            onClick={() => {
const recommendation = recommendSize({
  product,
  height: Number(height),
  weight: Number(weight),
  bodyType,
  fit,
  shoulderType,
  bellyType, 
  chestCm: chestCm ? Number(chestCm) : undefined,
  bellyCm: bellyCm ? Number(bellyCm) : undefined,
});

  setResult(recommendation);
  window.parent.postMessage(
  { type: "DUNE_AI_FIT_SIZE", size: recommendation.size },
  "https://www.duneclothings.com"
);
}}
            disabled={!height || !weight}
            className="w-full rounded-lg bg-black p-4 font-medium text-white disabled:opacity-40"
          >
            Bedenimi Bul →
          </button>
          {result && (
  <div className="mt-5 rounded-2xl border border-gray-200 bg-[#F8F8F6] p-6 shadow-sm">
    <p className="text-center text-sm text-gray-500">
      Sana önerdiğimiz beden 
    </p>

    <p className="mt-2 text-center text-6xl font-bold">
      {result.size}
    </p>

    <p className="mt-3 text-center text-sm leading-relaxed text-gray-600">
  {result.message}
</p>

    <p className="mt-4 text-center text-xs font-medium text-gray-500">
  Tahmini Güvenilirlik:{" "}
  {result.confidence === "low"
    ? "Düşük"
    : result.confidence === "medium"
    ? "Orta"
    : result.confidence === "high"
    ? "Yüksek"
    : "Belirlenemedi"}
</p>
  </div>
)}
          </div>
        </div>
      </div>
    </main>
  );
}
