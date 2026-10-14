
"use client";

import { useEffect, useState } from "react";
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
  const [activeTab, setActiveTab] = useState<"size" | "tryon">("size");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [garmentPhoto, setGarmentPhoto] = useState<File | null>(null);
  const [isTryOnLoading, setIsTryOnLoading] = useState(false);
const [tryOnResult, setTryOnResult] = useState<string | null>(null);
function clearTryOnResult() {
  setTryOnResult(null);
}
useEffect(() => {
  if (!tryOnResult) return;

  return () => {
   
    URL.revokeObjectURL(tryOnResult);
  };
}, [tryOnResult]);

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
  const [tryOnMode, setTryOnMode] = useState<"photo" | "avatar">("photo");
  const [avatarGender, setAvatarGender] = useState<"female" | "male">("male");
  const [customerPhoto, setCustomerPhoto] = useState<File | null>(null);

const [photoPreview, setPhotoPreview] = useState<string | null>(null);
const [productUrl, setProductUrl] = useState("");
const [productImage, setProductImage] = useState("");
const [photoConsent, setPhotoConsent] = useState(false);
const [notification, setNotification] = useState<{
  type: "success" | "error";
  message: string;
} | null>(null);
async function testProductImage() {
  if (isTryOnLoading) return;
  if (!customerPhoto || !productImage || !photoConsent) return;

  setIsTryOnLoading(true);
  setNotification(null);
 clearTryOnResult();

  try {
    let imageResponse: Response;

try {
  imageResponse = await fetch(productImage);
} catch {
  throw new Error(
    "Ürün görseline bağlanılamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyin."
  );
}

    if (!imageResponse.ok) {
      throw new Error(
  "Ürün görseline şu anda erişilemiyor. Lütfen sayfayı yenileyip tekrar deneyin."
);
    }

    const garmentBlob = await imageResponse.blob();

    const formData = new FormData();
    formData.append("person", customerPhoto);
    formData.append("garment", garmentBlob, "urun.jpg");
  formData.append("category", product === "pants" ? "bottoms" : "tops");

    const response = await fetch("http://127.0.0.1:8000/try-on", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
  let message = "Sanal giydirme işlemi tamamlanamadı.";

  if (response.status === 413) {
    message = "Fotoğraf dosyası çok büyük.";
  } else if (response.status === 503) {
    message = "Yapay zekâ sistemi şu anda yoğun. Lütfen tekrar deneyin.";
  } else if (response.status === 400) {
    message = "Fotoğraf veya ürün görseli işlenemedi.";
  }

  throw new Error(message);
}

    const resultBlob = await response.blob();
    if (!resultBlob.type.startsWith("image/") || resultBlob.size === 0) {
  throw new Error(
    "Yapay zekâ geçerli bir sonuç görseli oluşturamadı. Lütfen tekrar deneyin."
  );
}
const resultUrl = URL.createObjectURL(resultBlob);

setTryOnResult(resultUrl);
    setNotification({
  type: "success",
  message: "Sanal giydirmen hazır! Yeni görünümünü inceleyebilir ve sonuç görselini indirebilirsin.",
});
  } catch (error) {
  console.error("Sanal giydirme hatası:", error);

  const message =
    error instanceof Error
      ? error.message
      : "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.";

setNotification({
  type: "error",
  message:
    message === "Failed to fetch"
      ? "Yapay zekâ sistemine şu anda bağlanılamıyor. Lütfen biraz sonra tekrar deneyin."
      : message,
});
  } finally {
    setIsTryOnLoading(false);
  }
}
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const url = params.get("productUrl");
const image = params.get("productImage");

if (image) {
  try {
    const parsedImage = new URL(image);

    if (parsedImage.protocol === "https:") {
      setProductImage(parsedImage.toString());
      setTryOnResult(null);
      setPhotoConsent(false);
    }
  } catch {
    console.warn("Geçersiz ürün görseli adresi.");
  }
}
  if (!url) return;

  try {
    const parsedUrl = new URL(url);

    if (
      parsedUrl.protocol === "https:" &&
      ["www.duneclothings.com", "duneclothings.com"].includes(
        parsedUrl.hostname
      )
    ) {
      setProductUrl(parsedUrl.toString());
    }
  } catch {
    console.warn("Geçersiz ürün adresi.");
  }
}, []);


  return (
    <main className="min-h-screen bg-white px-6 py-12 text-black">
      {notification && (
  <div
    role="alert"
    className={`fixed right-4 top-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-2xl border p-5 shadow-2xl ${
      notification.type === "success"
        ? "border-green-200 bg-white"
        : "border-red-200 bg-white"
    }`}
  >
    <div className="flex items-start gap-3">
      <span className="text-xl">
        {notification.type === "success" ? "✓" : "!"}
      </span>

      <div className="flex-1">
        <p className="text-sm font-bold tracking-wide">
          {notification.type === "success"
            ? "İŞLEM BAŞARILI"
            : "İŞLEM TAMAMLANAMADI"}
        </p>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          {notification.message}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setNotification(null)}
        aria-label="Bildirimi kapat"
        className="text-xl text-gray-400 hover:text-black"
      >
        ×
      </button>
    </div>
  </div>
)}
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
        <div className="mb-8 flex w-full gap-2 rounded-2xl bg-gray-100 p-2">
  <button
    type="button"
    onClick={() => setActiveTab("size")}
    aria-pressed={activeTab === "size"}
    className={`flex-1 rounded-xl px-3 py-4 text-sm font-semibold transition-all sm:text-base ${
      activeTab === "size"
        ? "bg-black text-white shadow-md"
        : "text-gray-600 hover:bg-white"
    }`}
  >
    📏 Bedenini Keşfet
  </button>

  <button
    type="button"
    onClick={() => setActiveTab("tryon")}
    aria-pressed={activeTab === "tryon"}
    className={`flex-1 rounded-xl px-3 py-4 text-sm font-semibold transition-all sm:text-base ${
      activeTab === "tryon"
        ? "bg-black text-white shadow-md"
        : "text-gray-600 hover:bg-white"
    }`}
  >
    ✨ Yapay Zekâ ile Dene
  </button>
</div>
<h1 className="mb-3 text-3xl font-semibold">
  {activeTab === "size" ? "Bedenini Keşfet" : "Yapay Zekâ ile Dene"}
</h1>

<p className="mb-10 text-sm text-gray-500">
  {activeTab === "size"
    ? "Sana en uygun bedeni bulmak için bilgilerini gir."
    : "Fotoğrafını yükle, beğendiğin ürünü üzerinde keşfet."}
</p>
        <div
  className="space-y-6"
 style={{ display: activeTab === "size" ? "block" : "none" }}
>
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
       if (isTryOnLoading) return;
        setProduct("zipHoodie");
        setResult(null);
        setTryOnResult(null);
        setPhotoConsent(false);
      }}
    />

    <VisualOption
      title="Kısa Kollu Tişört"
      description="Regular kalıp"
      image="/products/short-sleeve.png"
      selected={product === "shortSleeve"}
      onClick={() => {
        if (isTryOnLoading) return;
        setProduct("shortSleeve");
        setResult(null);
        setTryOnResult(null);
        setPhotoConsent(false);
      }}
    />

    <VisualOption
      title="Uzun Kollu Tişört"
      description="Oversize kalıp"
      image="/products/long-sleeve.png"
      selected={product === "longSleeve"}
      onClick={() => {
        if (isTryOnLoading) return;
        setProduct("longSleeve");
        setResult(null);
        setTryOnResult(null);
        setPhotoConsent(false);
      }}
    />

    <VisualOption
      title="İş Pantolonu"
      description="İş giyim"
      image="/products/pants.png"
      selected={product === "pants"}
      onClick={() => {
        if (isTryOnLoading) return;
        setProduct("pants");
        setResult(null);
        setTryOnResult(null);
        setPhotoConsent(false);
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
console.log("DUNE SONUÇ KONTROLÜ", recommendation);
  setResult(recommendation);
 
}}
            disabled={!height || !weight}
            className="w-full rounded-lg bg-black p-4 font-medium text-white disabled:opacity-40"
          >
            Bedenimi Bul →
         </button>
</div>
</div>

<div
  className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5"
  data-section="ai-tryon"
  style={{ display: activeTab === "tryon" ? "block" : "none" }}
>
  <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-6 text-center">
  <span className="text-4xl">✨</span>

  <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-gray-900">
    Yapay Zekâ ile Sanal Giydirme Çok Yakında!
  </h2>

<p className="mt-5 text-lg sm:text-xl leading-8 text-gray-600">
    Dune AI Fit ile beğendiğin ürünleri kendi fotoğrafın
    üzerinde deneyimleyebileceksin. Bu yenilikçi özellik
    için hazırlıklarımız devam ediyor.
  </p>

  <p className="mt-4 font-semibold text-gray-900">
    Çok yakında seninle!
  </p>
</div>
<div className="hidden"></div>
  <h3 className="text-lg font-semibold text-gray-900">
    ✨ AI Sanal Giydirme
  </h3>
  <div className="mt-5 grid grid-cols-2 gap-3 ">
  <button
    type="button"
    onClick={() => {
  if (isTryOnLoading) return;
  setTryOnMode("photo");
}}
disabled={isTryOnLoading}
    className={`rounded-xl border-2 p-4 text-center disabled:cursor-not-allowed disabled:opacity-50 ${
      tryOnMode === "photo"
      
        ? "border-black bg-white shadow-md"
        : "border-gray-200 bg-gray-100"
    }`}
  >
    <span className="block text-3xl">📸</span>
    <span className="mt-3 block text-sm font-semibold">
      Kendi Üzerimde Dene
    </span>
    <span className="mt-2 block text-xs text-gray-500">
      Fotoğrafını yükleyerek ürünü üzerinde gör.
    </span>
  </button>

  <button
    type="button"
    onClick={() => {
  if (isTryOnLoading) return;
  setTryOnMode("avatar");
}}
disabled={isTryOnLoading}
    className={`rounded-xl border-2 p-4 text-center disabled:cursor-not-allowed disabled:opacity-50 ${
      tryOnMode === "avatar"
        ? "border-black bg-white shadow-md"
        : "border-gray-200 bg-gray-100"
    }`}
  >
    <span className="block text-3xl">🧍</span>
    <span className="mt-3 block text-sm font-semibold">
      Sanal Mankende Dene
    </span>
    <span className="mt-2 block text-xs text-gray-500">
      Fotoğraf yüklemeden dijital manken kullan.
    </span>
  </button>
</div>

  <p className="mt-2 text-sm leading-6 text-gray-600">
    Fotoğrafını yükle, seçtiğin ürünü kendi üzerinde
    nasıl görünebileceğini keşfet.
  </p>
{tryOnMode === "photo" && (
  <>
  <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white p-6 text-center hover:border-black">
    <span className="text-3xl">📷</span>
    <span className="mt-2 text-sm font-semibold">
      Fotoğraf Yükle
    </span>
    <span className="mt-1 text-xs text-gray-500">
      JPG veya PNG • En fazla 5 MB
    </span>

    <input
      type="file"
      disabled={isTryOnLoading}
      accept="image/jpeg,image/png"
      className="hidden"
      onChange={(event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (
          !["image/jpeg", "image/png"].includes(file.type) ||
          file.size > 5 * 1024 * 1024
        ) {
          alert("Lütfen en fazla 5 MB boyutunda JPG veya PNG yükleyin.");
          event.target.value = "";
          return;
        }

        setCustomerPhoto(file);
        setPhotoConsent(false);
        clearTryOnResult();
        setNotification(null);
        

        const reader = new FileReader();
        reader.onload = () => {
          setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }}
    />
  </label>

  {photoPreview && (
    <div className="mt-5">
      <p className="mb-3 text-sm font-semibold">
        Fotoğraf Önizlemesi
      </p>

      <img
        src={photoPreview}
        alt="Yüklenen müşteri fotoğrafı"
        className="mx-auto max-h-80 rounded-xl object-contain"
      />

      <button
        type="button"
        disabled={isTryOnLoading}
        onClick={() => {
          setCustomerPhoto(null);
          clearTryOnResult();
          setNotification(null);
          setPhotoConsent(false);
          setPhotoPreview(null);
          
          setPhotoConsent(false);
        }}
        className="mt-4 w-full rounded-lg border border-gray-300 p-3 text-sm font-medium hover:bg-gray-100"
      >
        Fotoğrafı Kaldır
      </button>
    </div>
  )}
  {productImage && (
  <div className="mt-5 rounded-xl border border-gray-200 bg-white p-4">
    <p className="mb-3 text-sm font-semibold text-gray-900">
      Mağazada İncelediğin Ürün
    </p>

    <img
      src={productImage}
      alt="Dune Clothings ürün görseli"
      className="mx-auto max-h-72 w-full rounded-lg object-contain"
    />

    <p className="mt-3 text-center text-xs text-gray-500">
      Bu ürün mağazadan otomatik olarak alındı.
    </p>
  </div>
)}

<label className="mt-5 flex items-start gap-3 text-sm text-gray-700">
  <input
    type="checkbox"
    checked={photoConsent}
    disabled={isTryOnLoading}
    onChange={(e) => setPhotoConsent(e.target.checked)}
    className="mt-1 h-4 w-4"
  />
  <span>
    Fotoğrafımın sanal giydirme sonucu oluşturulması amacıyla
    yapay zekâ sistemi tarafından işlenmesini kabul ediyorum.
  </span>
</label>
<button
  type="button"
disabled={!customerPhoto || !productImage || !photoConsent || isTryOnLoading}
  onClick={testProductImage}
  className="mt-5 w-full rounded-xl bg-black px-5 py-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
>
{isTryOnLoading
  ? "⏳ Yapay Zekâ Görselini Oluşturuyor..."
  : "✨ Sanal Giydirmeyi Başlat"}
  {isTryOnLoading && (
  <div
    role="status"
    className="mt-4 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-5 text-center sm:px-6 sm:py-6"
  >
<div
  aria-hidden="true"
  className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-[3px] border-gray-200 border-t-black sm:h-10 sm:w-10"
/>
<p className="text-sm font-semibold leading-6 text-gray-900 sm:text-base">
      Yapay zekâ kıyafetini hazırlıyor
    </p>

   <p className="mx-auto mt-2 max-w-xs text-xs leading-6 text-gray-600 sm:text-sm">
      Fotoğrafın ve ürün detayları işleniyor.
      Lütfen işlem tamamlanana kadar bekle.
    </p>
    <p className="mt-3 text-xs font-medium text-gray-400">
  Görsel oluşturma işlemi birkaç dakika sürebilir.
  Lütfen bu pencereyi kapatma.
</p>
<div
  role="progressbar"
  aria-label="Sanal giydirme işlemi devam ediyor"
  className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-200"
>
 <div className="h-full w-1/3 animate-[loading-slide_1.8s_ease-in-out_infinite] rounded-full bg-black" />
</div>
  </div>
)}
</button>
{tryOnResult && (
  <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
    <h4 className="mb-3 text-center text-base font-semibold text-gray-900">
      ✨ Sanal Giydirme Sonucun
    </h4>

    <img
      src={tryOnResult}
      alt="Yapay zekâ ile oluşturulan sanal giydirme sonucu"
      className="mx-auto w-full max-w-md rounded-xl object-contain"
    />
<a
  href={tryOnResult}
  download="Dune-AI-Fit-Sanal-Giydirme.png"
  className="mt-4 block w-full rounded-xl bg-black px-5 py-3 text-center text-sm font-semibold text-white hover:bg-gray-800"
>
  ⬇️ Sonuç Görselini İndir
</a>
    <p className="mt-3 text-center text-xs text-gray-500">
      Bu görsel yapay zekâ ile oluşturulmuştur.
      Ürünün gerçek beden uyumunu garanti etmez.
    </p>
  </div>
)}
<p className="mt-4 text-xs leading-5 text-gray-500">
  Sanal Giydirmeyi Başlat butonuna bastığınızda fotoğrafınız,
  sanal giydirme sonucunu oluşturmak amacıyla yapay zekâ
  sistemimize gönderilerek işlenir.
  Bu işlem için fotoğrafınızın kullanılmasını kabul etmiş olursunuz.
</p>
    </>
)}
{tryOnMode === "avatar" && (
  <div className="mt-5 rounded-xl border border-gray-200 bg-white p-5">
    <h4 className="text-base font-semibold text-gray-900">
      Sanal Mankenini Oluştur
    </h4>
<div className="mt-5 grid grid-cols-2 gap-3">
  <button
    type="button"
    onClick={() => setAvatarGender("female")}
    aria-pressed={avatarGender === "female"}
    className={`rounded-xl border-2 p-4 text-center transition ${
      avatarGender === "female"
        ? "border-black bg-gray-50 shadow-sm"
        : "border-gray-200 bg-white"
    }`}
  >
    <span className="block text-3xl">👩</span>
    <span className="mt-2 block text-sm font-semibold">
      Kadın Manken
    </span>
  </button>

  <button
    type="button"
    onClick={() => setAvatarGender("male")}
    aria-pressed={avatarGender === "male"}
    className={`rounded-xl border-2 p-4 text-center transition ${
      avatarGender === "male"
        ? "border-black bg-gray-50 shadow-sm"
        : "border-gray-200 bg-white"
    }`}
  >
    <span className="block text-3xl">👨</span>
    <span className="mt-2 block text-sm font-semibold">
      Erkek Manken
    </span>
  </button>
</div>
    <p className="mt-2 text-sm leading-6 text-gray-600">
      Girdiğin boy, kilo ve vücut yapısı bilgilerini
      kullanarak sana özel bir dijital manken hazırlayacağız.
    </p>

    <div className="mt-5 rounded-xl bg-gray-100 p-6 text-center">
      <span className="text-5xl" aria-hidden="true">🧍</span>

      <p className="mt-3 text-sm font-semibold text-gray-900">
        Kişiselleştirilmiş Sanal Manken
      </p>
<div className="mt-5 grid grid-cols-2 gap-3 text-left">
  <div className="rounded-lg bg-white p-3">
    <p className="text-xs text-gray-500">Boy</p>
    <p className="mt-1 font-semibold text-gray-900">
      {height ? `${height} cm` : "Belirtilmedi"}
    </p>
  </div>

  <div className="rounded-lg bg-white p-3">
    <p className="text-xs text-gray-500">Kilo</p>
    <p className="mt-1 font-semibold text-gray-900">
      {weight ? `${weight} kg` : "Belirtilmedi"}
    </p>
  </div>

  <div className="rounded-lg bg-white p-3">
    <p className="text-xs text-gray-500">Omuz Yapısı</p>
    <p className="mt-1 font-semibold text-gray-900">
      {shoulderType === "narrow"
        ? "Dar"
        : shoulderType === "broad"
        ? "Geniş"
        : "Normal"}
    </p>
  </div>

  <div className="rounded-lg bg-white p-3">
    <p className="text-xs text-gray-500">Karın Yapısı</p>
    <p className="mt-1 font-semibold text-gray-900">
      {bellyType === "flat"
        ? "Düz"
        : bellyType === "medium"
        ? "Hafif Göbek"
        : "Belirgin Göbek"}
    </p>
  </div>
</div>
      <p className="mt-2 text-xs leading-5 text-gray-500">
        Vücut ölçülerine göre yaklaşık bir görünüm
        oluşturulacaktır. Gerçek beden uyumunu garanti etmez.
      </p>
    </div>

    <button
      type="button"
      onClick={() => {
  const avatarData = {
    gender: avatarGender,
    height: Number(height),
    weight: Number(weight),
    shoulderType,
    bellyType,
    chestCm: chestCm ? Number(chestCm) : null,
    bellyCm: bellyCm ? Number(bellyCm) : null,
  };

  console.log("Dune AI Fit - Avatar Bilgileri:", avatarData);

  alert(
    "Sanal manken bilgileriniz hazır. Yapay zekâ ile görsel oluşturma bağlantısı henüz geliştirme aşamasındadır."
  );
}}
      disabled={!height || !weight}
className="mt-5 w-full rounded-xl bg-black px-5 py-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"    >
      ✨ Sanal Mankenimi Oluştur
    </button>

    <p className="mt-3 text-center text-xs text-gray-500">
      Sanal manken oluşturma özelliği hazırlanıyor.
    </p>
  </div>
  
)}<div className="hidden"></div>
</div>
{/* AI SANAL GIYDIRME BOLUMU BITISI */}

{activeTab === "size" && result && result.size === null && (
  <div
    role="alert"
    className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-900"
  >
    <p className="font-semibold">
      ⚠️ Uygun beden belirlenemedi
    </p>
    <p className="mt-2 text-sm">{result.message}</p>
  </div>
)}

          {activeTab === "size" && result && result.size !== null && (

            


            
  <div className="mt-5 rounded-2xl border border-gray-200 bg-[#F8F8F6] p-6 shadow-sm">
    {result.size !== null && (
  <>
    <p className="text-center text-sm text-gray-500">
      Sana önerdiğimiz beden 
    </p>

    <p className="mt-2 text-center text-6xl font-bold">
      {result.size}
    </p>

<div className="mt-5 rounded-xl border-2 border-amber-400 bg-amber-50 p-5 shadow-sm">
 {result.size === null && (
  <div
    role="alert"
    className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
  >
    <p className="font-semibold">
      ⚠️ Uygun beden belirlenemedi
    </p>
    <p className="mt-2">{result.message}</p>
  </div>
)}
  <div className="mb-3 flex items-center gap-3">
    <span className="text-2xl" aria-hidden="true">⚠️</span>
    <h3 className="text-sm font-bold uppercase tracking-wide text-amber-900">
      Önemli Bilgilendirme
    </h3>
  </div>

  <p className="text-sm leading-7 text-gray-800">
    <strong>Dune AI Fit, yapay zekâ destekli bir beden öneri sistemidir.</strong>
    {" "}Sunulan beden, verdiğiniz bilgiler doğrultusunda oluşturulmuş
    tahmini bir öneridir ve kesin uyum garantisi taşımaz.
  </p>

  <div className="mt-4 border-t border-amber-300 pt-3">
    <p className="text-sm font-medium leading-7 text-gray-900">
      Nihai beden seçimi size aittir. Onay butonuna bastığınızda
      önerilen bedeni kendi değerlendirmenizle kabul etmiş
      ve ürününüz için seçmiş olursunuz.
    </p>
  </div>
</div>
<button
  type="button"
  onClick={() => {
    window.parent.postMessage(
      {
        type: "DUNE_AI_FIT_CONFIRM",
        size: result.size,
      },
      "https://duneclothings.com"
    );
  }}
  className="mt-5 w-full rounded-lg bg-black px-5 py-4 font-semibold text-white hover:bg-gray-800"
>
 <span className="flex flex-col items-center gap-1">
  <span>✓ {result.size} Bedenini Onaylıyorum</span>
  <span className="text-xs font-normal text-gray-300">
    Seçimimi onayla ve ürüne uygula
  </span>
</span>
</button>
    
<div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 text-center">
  <p className="text-lg font-bold text-gray-900">
    Tahmini Güvenilirlik
  </p>

  <p
    className={`mt-3 text-4xl font-bold ${
      result.confidence === "high"
        ? "text-green-600"
        : result.confidence === "medium"
        ? "text-amber-600"
        : "text-red-600"
    }`}
  >
    {result.confidence === "high"
      ? "%90"
      : result.confidence === "medium"
      ? "%70"
      : "%45"}
  </p>

  <p
    className={`mt-2 text-sm font-semibold ${
      result.confidence === "high"
        ? "text-green-700"
        : result.confidence === "medium"
        ? "text-amber-700"
        : "text-red-700"
    }`}
  >
    {result.confidence === "high"
      ? "Yüksek Güven Seviyesi"
      : result.confidence === "medium"
      ? "Orta Güven Seviyesi"
      : "Düşük Güven Seviyesi"}
  </p>

  <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-gray-200">
    <div
      className={`h-full rounded-full transition-all duration-500 ${
        result.confidence === "high"
          ? "bg-green-600"
          : result.confidence === "medium"
          ? "bg-amber-500"
          : "bg-red-600"
      }`}
      style={{
        width:
          result.confidence === "high"
            ? "90%"
            : result.confidence === "medium"
            ? "70%"
            : "45%",
      }}
    />
  </div>

  <p className="mt-3 text-xs leading-5 text-gray-500">
    Bu yüzde istatistiksel doğruluk oranı değildir.
    Girilen ölçülerin kapsamına göre belirlenen tahmini güven seviyesidir.
  </p>
</div>

  </>
)}
  </div>
)}
      </div>
    </main>
  );
}
