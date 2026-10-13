
import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function GET() {
  const clientId = process.env.IKAS_CLIENT_ID;
  const clientSecret = process.env.IKAS_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { success: false, message: "API bilgileri eksik." },
      { status: 500 }
    );
  }
  try {
    const tokenResponse = await fetch(
      "https://api.myikas.com/api/admin/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret,
        }),
        cache: "no-store",
      }
    );
    if (!tokenResponse.ok) {
      return NextResponse.json(
        { success: false, step: "oauth", status: tokenResponse.status },
        { status: 502 }
      );
    }
    const token = await tokenResponse.json();
    if (!token.access_token) {
      throw new Error("Token alınamadı.");
    }
    const response = await fetch(
      "https://api.myikas.com/api/v2/admin/graphql",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.access_token}`,
        },
        body: JSON.stringify({
query: `
  query {
    listProduct(pagination: { page: 1, limit: 5 }) {
      data {
        id
        name
        variants {
          id
          sku
          variantValues {
            variantTypeName
            variantValueName
          }
          images {
            imageId
            fileName
            isMain
          }
        }
      }
    }
  }
`,
        }),
        cache: "no-store",
      }
    );

    const result = await response.json();
const products = result.data?.listProduct?.data ?? [];
const product = products.find(
  (item: { name: string }) =>
    item.name === "112 Acil Sağlık T-shirt"
);
const blackSmallVariants = product?.variants?.filter(
  (variant: {
    variantValues: {
      variantTypeName: string;
      variantValueName: string;
    }[];
  }) => {
    const values = variant.variantValues ?? [];
    const black = values.some(
      (value) =>
        value.variantTypeName === "Renk" &&
        value.variantValueName === "Siyah"
    );

   const small = values.some(
      (value) =>
        value.variantTypeName === "Beden" &&
        value.variantValueName === "S"
    );

    return black && small;
  }
);

return NextResponse.json({
  success: response.ok && !result.errors?.length,
  product: product?.name ?? null,
  blackSmallVariants: blackSmallVariants ?? [],
  errors: result.errors ?? [],
});






  } catch {
    return NextResponse.json(
      { success: false, message: "Bağlantı hatası." },
      { status: 500 }
    );
  }
}
