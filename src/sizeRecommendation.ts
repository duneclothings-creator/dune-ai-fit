
import { sizeCharts } from "./data/sizechart";
export type ProductType = keyof typeof sizeCharts;

export type BodyType =
  | "slim"
  | "normal"
  | "athletic"
  | "broad";

export type FitType =
  | "slim"
  | "regular"
  | "oversize";

export type SizeInput = {
  height: number;
  weight: number;
  bodyType: BodyType;
  shoulderType?: "narrow" | "normal" | "broad";
bellyType?: "flat" | "medium" | "large";
  fit: FitType;
  product: ProductType;
  chestCm?: number;
  bellyCm?: number;
  waistCm?: number;
};

export type SizeResult = {
  size: string | null;
 confidence: "low" | "medium" | "high";
  message: string;
};
export const productFits = {
  zipHoodie: "oversize",
  longSleeve: "oversize",
  shortSleeve: "regular",
  pants: "regular",
} as const;
export function recommendSize(input: SizeInput): SizeResult {
 const {
  height,
  weight,
  product,
  chestCm,
  bellyCm,
  waistCm,
  shoulderType,
  bellyType,
} = input;

  if (
    !Number.isFinite(height) ||
    !Number.isFinite(weight) ||
    height < 100 ||
    height > 230 ||
    weight < 25 ||
    weight > 300
  ) {
    return {
      size: null,
      confidence: "low",
      message: "Geçerli boy ve kilo bilgisi giriniz.",
    };
  }

  const chart = sizeCharts[product];
  // Boy ve kilodan vücut kitle indeksi hesaplama
const heightMeters = height / 100;
const bmi = weight / (heightMeters * heightMeters);
// Boy ve kilodan yaklaşık göğüs çevresi tahmini
// Bu formül başlangıç amaçlıdır, gerçek ölçüm yerine geçmez.

const estimatedChestCm =
  0.5 * Math.max(height, 175) +
  0.25 * weight -
  4;

        const shoulderAdjustmentCm =
  shoulderType === "broad"
    ? 3
    : shoulderType === "narrow"
    ? -1
    : 0;
const bellyAdjustmentCm =
  bellyType === "large"
    ? 6
    : bellyType === "medium"
    ? 3
    : 0;
  // Pantolon için mevcut bel tablosunun ölçüm yöntemi
  // doğrulanmadan çevre ölçüsünden kesin beden hesaplanmaz.
  if (product === "pants") {
    return {
      size: null,
      confidence: "low",
      message:
        "Pantolon için bel ölçüsünün nasıl alındığını doğrulamamız gerekiyor. Şimdilik beden tablosunu inceleyiniz.",
    };
  }

  // Üst giyimde ürün genişliği düz zeminde ölçülmüştür.
  // Göğüs çevresi verilirse ikiye bölerek karşılaştırırız.
  const hasMeasuredChest =
  chestCm !== undefined &&
  Number.isFinite(chestCm) &&
  chestCm > 0;

const bodyAdjustmentCm =
  shoulderAdjustmentCm < 0
    ? shoulderAdjustmentCm + bellyAdjustmentCm
    : Math.max(shoulderAdjustmentCm, bellyAdjustmentCm);

const measuredBellyCm =
  typeof bellyCm === "number" &&
  Number.isFinite(bellyCm) &&
  bellyCm >= 60 &&
  bellyCm <= 200
    ? bellyCm
    : undefined;
const effectiveChestCm =
  hasMeasuredChest ? chestCm : estimatedChestCm;

  if (
  bmi >= 35 &&
  !hasMeasuredChest &&
  measuredBellyCm === undefined
) {
 
  return {
    size: null,
    confidence: "low",
    message:
      "Daha güvenilir bir beden önerisi sunabilmemiz için göğüs veya karın çevrenizi girmenizi rica ediyoruz. Yalnızca boy ve kilo bilgileriniz bu durumda yeterli olmayabilir.",
  };
}

if (effectiveChestCm > 0) {
   const baseChestCm = hasMeasuredChest
  ? chestCm
  : estimatedChestCm;

const halfChest = baseChestCm / 2;
    
const sizes: { size: string; width: number }[] =
  product === "zipHoodie"
    ? sizeCharts.zipHoodie.sizes.map((item) => ({
        size: item.size,
        width: item.width,
      }))
    : product === "longSleeve"
      ? sizeCharts.longSleeve.sizes.map((item) => ({
          size: item.size,
          width: item.chest,
        }))
      : sizeCharts.shortSleeve.sizes.map((item) => ({
          size: item.size,
          width: item.chest,
        }));

// Ürünün kendi kalıbını belirle
const productFit = productFits[product];

// Müşterinin istediği giyim rahatlığına göre ek pay
// Oversize ürün zaten geniş kesimli olduğu için
// ikinci kez fazla genişlik eklemiyoruz.


const extraEase =
  product === "shortSleeve"
    ? input.fit === "slim"
      ? 0
      : input.fit === "regular"
        ? 1
        : 4
    : input.fit === "slim"
      ? 2
      : input.fit === "regular"
        ? 6
        : 10;

// 

const bodyEase = 0;

const targetWidth =
  halfChest + extraEase + bodyEase + bodyAdjustmentCm / 2;

const bellyEase =
  input.fit === "slim"
    ? 4
    : input.fit === "oversize"
      ? 8
      : 6;

const minimumLength =
  height >= 190 ? 77 :
  height >= 180 ? 75 :
  height >= 175 ? 73 :
  0;




const match = sizes.find(
  (item) =>
   item.width + (
  product === "shortSleeve"
    ? sizeCharts.shortSleeve.toleranceCm
    : 0
) >= targetWidth &&
    (product !== "zipHoodie" ||
      (sizeCharts.zipHoodie.sizes.find(
        (s) => s.size === item.size
      )?.length ?? 0) >= minimumLength) &&

    (
      product === "zipHoodie"
        ? (
            measuredBellyCm === undefined ||
            item.width * 2 >= measuredBellyCm + bellyEase
          )
        : true
    )
);


   if (match) {
  return {
    size: match.size,
confidence:
  hasMeasuredChest && measuredBellyCm !== undefined
    ? "high"
    : hasMeasuredChest || measuredBellyCm !== undefined
    ? "medium"
    : "low",
    message:
  hasMeasuredChest && measuredBellyCm !== undefined
    ? "Göğüs ve karın çevresi ölçüleriniz, giyim tercihinizle birlikte ürünün beden tablosuyla karşılaştırıldı. Önerimiz gerçek ölçülerinize dayanmaktadır."
    : hasMeasuredChest
    ? "Göğüs çevresi ölçünüz ve giyim tercihiniz ürünün beden tablosuyla karşılaştırıldı. Daha hassas bir öneri için karın çevrenizi de girebilirsiniz."
    : measuredBellyCm !== undefined
    ? "Karın çevresi ölçünüz ve tahmini göğüs çevreniz ürünün beden tablosuyla karşılaştırıldı. Daha hassas bir öneri için göğüs çevrenizi de girebilirsiniz."
    : "Bu beden, boyunuz, kilonuz ve vücut yapınızdan hesaplanan yaklaşık ölçülere göre önerildi. Daha doğru bir sonuç için göğüs ve karın çevrenizi girebilirsiniz.",
  };
}

    return {
      size: null,
      confidence: "low",
      message:
  "Ölçülerinize ve tercih ettiğiniz giyim rahatlığına göre mevcut beden tablomuzda uygun bir seçenek belirlenemedi. Daha doğru sonuç için göğüs çevrenizi ölçebilir veya bizimle iletişime geçebilirsiniz.",
    };
  }

 return {
  size: null,
  confidence: "low",
  message:
    "Göğüs çevreniz ve tercih ettiğiniz giyim rahatlığına göre mevcut beden tablomuzda uygun bir seçenek belirlenemedi. Daha dar bir kalıp tercihi deneyebilir veya beden ölçüleri için bizimle iletişime geçebilirsiniz.",
};
}
