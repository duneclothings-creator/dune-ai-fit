
"use client";

import { useEffect, useMemo, useState } from "react";

type Variant = {
  id: string;
  sku: string;
  variantValues: {
    variantTypeName: string;
    variantValueName: string;
  }[];
  images: {
    imageId: string;
    fileName: string;
    isMain: boolean;
  }[];
};

type Product = {
  id: string;
  name: string;
  variants: Variant[];
  metaData?: {
  slug?: string;
};
};

export default function Home() {
  const [customerPhoto, setCustomerPhoto] = useState<string | null>(null);
  const [customerFile, setCustomerFile] = useState<File | null>(null);
  const [tryOnLoading, setTryOnLoading] = useState(false);
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [tryOnError, setTryOnError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tümü");
  useEffect(() => {
    fetch("/api/ikas/products")
      .then(async (response) => {
        if (!response.ok) throw new Error("API yanıt vermedi.");
        const data = await response.json();
        if (!data.success) throw new Error("Ürünler alınamadı.");
        setProducts(data.products ?? []);
      })
      .catch(() => setError("Ürünler yüklenemedi."))
      .finally(() => setLoading(false));
  }, []);

  const options = (type: string) =>
    Array.from(
      new Set(
        selectedProduct?.variants.flatMap((variant) =>
          variant.variantValues
            .filter((value) => value.variantTypeName === type)
            .map((value) => value.variantValueName)
        ) ?? []
      )
    );

  const colors = options("Renk");

  const sizes = useMemo(
    () =>
      Array.from(
        new Set(
          selectedProduct?.variants
            .filter(
              (variant) =>
                !color ||
                variant.variantValues.some(
                  (value) =>
                    value.variantTypeName === "Renk" &&
                    value.variantValueName === color
                )
            )
            .flatMap((variant) =>
              variant.variantValues
                .filter((value) => value.variantTypeName === "Beden")
                .map((value) => value.variantValueName)
            ) ?? []
        )
      ),
    [selectedProduct, color]
  );

  const selectedVariant = selectedProduct?.variants.find(
    (variant) =>
      variant.variantValues.some(
        (value) =>
          value.variantTypeName === "Renk" &&
          value.variantValueName === color
      ) &&
      variant.variantValues.some(
        (value) =>
          value.variantTypeName === "Beden" &&
          value.variantValueName === size
      )
  );

async function handleTryOn() {
  if (!customerFile || !selectedVariant) {
    setTryOnError("Önce ürün, renk, beden ve fotoğraf seçmelisin.");
    return;
  }

  const imageId = selectedVariant.images?.[0]?.imageId;

  if (!imageId) {
    setTryOnError("Seçilen ürünün görseli bulunamadı.");
    return;
  }

  setTryOnLoading(true);
  setTryOnError("");
  setTryOnResult(null);

  try {
    const garmentUrl =
      `https://cdn.myikas.com/images/98c378c8-5a77-46a7-94c1-b6feb27b032d/${imageId}/image_1080.webp`;

    const garmentResponse = await fetch(garmentUrl);

    if (!garmentResponse.ok) {
      throw new Error("Ürün görseli indirilemedi.");
    }

    const garmentBlob = await garmentResponse.blob();

    const formData = new FormData();
    formData.append("person", customerFile);
    formData.append(
      "garment",
      new File([garmentBlob], "garment.webp", {
        type: "image/webp",
      })
    );
    formData.append("category", "tops");

    const response = await fetch("/api/tryon", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Sanal giydirme işlemi başarısız oldu.");
    }

    const resultBlob = await response.blob();
    setTryOnResult(URL.createObjectURL(resultBlob));
  } catch (error) {
    setTryOnError(
      error instanceof Error ? error.message : "Bir hata oluştu."
    );
  } finally {
    setTryOnLoading(false);
  }
}

  return (
    <main className="min-h-screen bg-neutral-50 px-5 py-10 text-neutral-900">
      <div className="mx-auto max-w-6xl">
        
<header className="mb-12 border-b border-neutral-200 pb-10">
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div>
      <p className="text-sm font-semibold tracking-[0.25em]">
        DUNE CO. ATELIER
      </p>
      <p className="mt-2 text-xs tracking-[0.2em] text-neutral-500">
        VIRTUAL FITTING STUDIO
      </p>
    </div>
    <span className="rounded-full border border-neutral-300 px-4 py-2 text-xs tracking-widest">
      POWERED BY AI
    </span>
  </div>

  <div className="py-14">
    <p className="mb-5 text-xs tracking-[0.3em] text-neutral-500">
      THE FUTURE OF PERSONAL STYLE
    </p>

    <h1 className="text-5xl font-medium tracking-tight sm:text-6xl">
      Tarzını keşfet.
      <span className="mt-2 block font-light italic text-stone-500">
        Üzerinde gör.
      </span>
    </h1>

    <p className="mt-7 max-w-xl text-base leading-8 text-neutral-600">
      Dune Co. Atelier koleksiyonundan bir ürün seç.
      Rengini ve bedenini belirle, fotoğrafını yükle.
      Yapay zekâ ile yeni görünümünü keşfet.
    </p>

    <div className="mt-9 flex flex-wrap gap-3">
      {["01 / Ürününü seç", "02 / Fotoğrafını yükle", "03 / Sanal dene"].map(
        (step) => (
          <span
            key={step}
            className="rounded-full bg-white px-4 py-2 text-xs text-neutral-700 shadow-sm"
          >
            {step}
          </span>
        )
      )}
    </div>
  </div>
</header>


        <h2 className="mb-5 text-xl font-semibold">1. Ürün seçimi</h2>
<div className="mb-5 flex flex-wrap gap-2">
  {["Tümü", "T-shirt", "Hoodie", "Sweatshirt", "Pantolon", "Çanta"].map(
    (item) => (
      <button
        key={item}
        type="button"
        onClick={() => setCategory(item)}
        className={`rounded-full border px-4 py-2 text-sm transition ${
          category === item
            ? "border-black bg-black text-white"
            : "border-neutral-200 bg-white text-neutral-700 hover:border-black"
        }`}
      >
        {item}
      </button>
    )
  )}
</div>
<div className="mb-6">
  <input
    type="search"
    value={search}
    onChange={(event) => setSearch(event.target.value)}
    placeholder="Ürün ara... Örn: Paramedik, ATT, Hoodie"
    className="w-full rounded-xl border border-neutral-200 bg-white px-5 py-4 text-sm outline-none transition focus:border-neutral-900"
  />
</div>

        {loading && <p>Ürünler yükleniyor...</p>}
        {error && <p className="text-red-600">{error}</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
{products
  .filter((product) => {
    const name = product.name.toLocaleLowerCase("tr-TR");

    const matchesSearch = name.includes(
      search.toLocaleLowerCase("tr-TR").trim()
    );

    const matchesCategory =
      category === "Tümü" ||
      (category === "T-shirt" &&
        (name.includes("t-shirt") || name.includes("tişört"))) ||
      (category === "Hoodie" && name.includes("hoodie")) ||
      (category === "Sweatshirt" && name.includes("sweatshirt")) ||
      (category === "Pantolon" && name.includes("pantolon")) ||
      (category === "Çanta" && name.includes("çanta"));

    return matchesSearch && matchesCategory;
  })
  .map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => {
                setSelectedProduct(product);
                setColor("");
                setSize("");
                requestAnimationFrame(() => {
  document.getElementById("variant-selection")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
});
              }}
              
className={`group overflow-hidden rounded-xl border bg-white p-3 text-left transition-all duration-300 ${
  selectedProduct?.id === product.id
    ? "border-neutral-900 shadow-md"
    : "border-neutral-200 hover:border-neutral-400 hover:-translate-y-1 hover:shadow-lg"
}`}
            >

<div className="aspect-[3/4] overflow-hidden rounded-lg bg-[#f3f2f0]">
  {product.variants[0]?.images?.[0]?.imageId ? (
    <img
      src={`https://cdn.myikas.com/images/98c378c8-5a77-46a7-94c1-b6feb27b032d/${product.variants[0].images[0].imageId}/image_1080.webp`}
      alt={product.name}
     className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
      loading="lazy"
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  ) : (
    <div className="flex h-full items-center justify-center text-sm text-neutral-400">
      Görsel bulunamadı
    </div>
  )}
</div>
              <h3 className="mt-4 font-medium">{product.name}</h3>
              <p className="mt-1 text-sm text-neutral-500">
                {product.variants.length} varyant
              </p>
            </button>
          ))}
        </div>

        {selectedProduct && (
          <section 
           id="variant-selection"
          className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6">
            {selectedVariant?.images?.[0]?.imageId && (
  <div className="mb-6 flex justify-center rounded-xl bg-neutral-100 p-4">
    <img
      key={selectedVariant.images[0].imageId}
      src={`https://cdn.myikas.com/images/98c378c8-5a77-46a7-94c1-b6feb27b032d/${selectedVariant.images[0].imageId}/image_1080.webp`}
      alt={`${selectedProduct.name} - ${color} - ${size}`}
      className="h-80 w-full object-contain"
    />
  </div>
)}
            <h2 className="text-xl font-semibold">
              2. Renk ve beden seçimi
            </h2>
            <p className="mt-2 text-neutral-500">{selectedProduct.name}</p>

            <label className="mt-6 block text-sm font-medium">Renk</label>
            <select
              value={color}
              onChange={(event) => {
                setColor(event.target.value);
                setSize("");
              }}
              className="mt-2 w-full rounded-lg border border-neutral-300 p-3"
            >
              <option value="">Renk seçiniz</option>
              {colors.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <label className="mt-5 block text-sm font-medium">Beden</label>
            <select
              value={size}
              onChange={(event) => setSize(event.target.value)}
              disabled={!color}
              className="mt-2 w-full rounded-lg border border-neutral-300 p-3 disabled:bg-neutral-100"
            >
              <option value="">Beden seçiniz</option>
              {sizes.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            {selectedVariant && (
              <div className="mt-6 rounded-xl bg-neutral-100 p-4">
                <p className="font-semibold">Seçimin hazır!</p>
                <p className="mt-2 text-sm">
                  {selectedProduct.name} — {color} / {size}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  SKU: {selectedVariant.sku}
                </p>
              </div>
            )}
            {selectedVariant && (
  <button
    type="button"
    onClick={() => {
      document.getElementById("photo-upload")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }}
    className="mt-4 w-full rounded-xl bg-black px-6 py-4 font-medium text-white transition hover:bg-neutral-800"
  >
    Devam Et — Fotoğrafını Yükle →
  </button>
)}
          </section>
        )}
        <section 
        id="photo-upload"
        className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6">
  <h2 className="text-xl font-semibold">3. Fotoğrafını yükle</h2>
  <p className="mt-2 text-sm text-neutral-500">
    Seçtiğin ürünü üzerinde görmek için fotoğrafını yükle.
  </p>


<label 

onDragOver={(event) => {
  event.preventDefault();
}}
onDrop={(event) => {
  event.preventDefault();

  const file = event.dataTransfer.files?.[0];
  if (!file) return;

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    setTryOnError("Lütfen JPG, PNG veya WEBP fotoğraf yükleyin.");
    return;
  }

  if (customerPhoto) URL.revokeObjectURL(customerPhoto);

  setCustomerPhoto(URL.createObjectURL(file));
  setCustomerFile(file);
  setTryOnResult(null);
  setTryOnError("");
}}

className="mt-6 flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-6 py-10 text-center transition-all duration-300 hover:border-black hover:bg-neutral-100">
  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-neutral-200 bg-white">
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
    </svg>
  </div>

  <span className="text-base font-medium text-neutral-900">
    Fotoğrafını buraya yükle
  </span>

  <span className="mt-2 text-sm text-neutral-500">
    Fotoğraf seçmek için tıkla
  </span>

  <span className="mt-4 text-xs text-neutral-400">
    JPG, PNG veya WEBP
  </span>

  <input
    type="file"
    accept="image/jpeg,image/png,image/webp"
    className="sr-only"
    onChange={(event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (customerPhoto) URL.revokeObjectURL(customerPhoto);

      setCustomerPhoto(URL.createObjectURL(file));
      setCustomerFile(file);
      setTryOnResult(null);
      setTryOnError("");
    }}
  />
</label>


  {customerPhoto && (
    <div className="mt-6">
      <p className="mb-3 text-sm font-medium">Yüklediğin fotoğraf</p>
      
<button
  type="button"
  onClick={() => {
    setCustomerPhoto(null);
    setCustomerFile(null);
    setTryOnResult(null);
    setTryOnError("");
  }}
  className="mb-4 rounded-lg border border-neutral-300 bg-white px-5 py-2 text-sm font-medium transition hover:bg-neutral-100"
>
  Fotoğrafı Değiştir ↗
</button>

      <img
        src={customerPhoto}
        alt="Müşteri fotoğrafı"
        className="max-h-96 w-full rounded-xl bg-neutral-100 object-contain"
      />
    </div>
  )}
  
<button
  type="button"
  onClick={handleTryOn}
  disabled={!customerFile || !selectedVariant || tryOnLoading}
  className="mt-6 w-full rounded-xl bg-black px-6 py-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
>
  
{tryOnLoading ? (
  <span className="flex items-center justify-center gap-3">
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
    Yapay zekâ görünümünü hazırlıyor...
  </span>
) : (
  "Sanal Dene"
)}

</button>

{tryOnError && (
  <p className="mt-4 text-sm text-red-600">{tryOnError}</p>
)}


{tryOnResult && (
  <div className="mt-10 border-t border-neutral-200 pt-8">
    <div className="mb-6">
      <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
        DUNE CO. ATELIER / AI FIT
      </p>

      <h3 className="mt-3 text-2xl font-medium tracking-tight">
        Yeni görünümün hazır.
      </h3>

      <p className="mt-2 text-sm text-neutral-500">
        Fotoğrafını ve yapay zekâ ile oluşturulan görünümünü karşılaştır.
      </p>
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest">
            Önce
          </span>
          <span className="text-xs text-neutral-400">
            Orijinal
          </span>
        </div>

        <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
          {customerPhoto && (
            <img
              src={customerPhoto}
              alt="Müşterinin orijinal fotoğrafı"
              className="h-full w-full object-contain"
            />
          )}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest">
            Sonra
          </span>
          <span className="text-xs text-neutral-400">
            AI FIT
          </span>
        </div>

        <div className=" relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
          <img
            src={tryOnResult}
            alt="Yapay zekâ sanal giydirme sonucu"
            className="h-full w-full object-contain"
          />
          
<a
  href={tryOnResult}
  target="_blank"
  rel="noopener noreferrer"
  className="absolute bottom-4 right-4 rounded-full bg-white/95 px-4 py-2 text-xs font-medium text-black shadow-lg transition hover:bg-white"
>
  Görseli Büyüt ↗
</a>



        </div>
      </div>
    </div>

    <a
      href={tryOnResult}
      download="dune-ai-fit-sonuc.png"
      className="mt-6 flex w-full items-center justify-center rounded-xl bg-black px-6 py-4 text-sm font-medium text-white transition hover:bg-neutral-800"
    >
      Görünümümü İndir ↓
    </a>
    {selectedProduct?.metaData?.slug && (
  <a
    href={`https://www.duneclothings.com/${selectedProduct.metaData.slug}`}
    target="_blank"
    rel="noopener noreferrer"
    className="mt-3 flex w-full items-center justify-center rounded-xl border border-neutral-900 bg-white px-6 py-4 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100"
  >
    Ürünü Mağazada Gör ↗
  </a>
)}
{selectedProduct && selectedVariant && (
  <div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
    <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
      DENEDİĞİN ÜRÜN
    </p>

    <h4 className="text-base font-semibold text-neutral-900">
      {selectedProduct.name}
    </h4>

    <div className="mt-3 flex flex-wrap gap-2">
      <span className="rounded-full border bg-white px-4 py-2 text-xs">
        Renk: {color}
      </span>

      <span className="rounded-full border bg-white px-4 py-2 text-xs">
        Beden: {size}
      </span>
    </div>

    <p className="mt-3 text-xs text-neutral-500">
      SKU: {selectedVariant.sku}
    </p>
  </div>
)}
    <p className="mt-4 text-center text-xs text-neutral-400">
      AI ile oluşturulmuştur. Gerçek ürün görünümü farklılık gösterebilir.
    </p>
  </div>
)}


</section>
      </div>
    </main>
  );
}
