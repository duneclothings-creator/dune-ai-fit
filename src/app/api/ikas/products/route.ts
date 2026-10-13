
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const clientId = process.env.IKAS_CLIENT_ID;
  const clientSecret = process.env.IKAS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { success: false, message: "ikas API bilgileri eksik." },
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
        { success: false, step: "token" },
        { status: 502 }
      );
    }

    const token = await tokenResponse.json();

    if (!token.access_token) {
      return NextResponse.json(
        { success: false, message: "Token alınamadı." },
        { status: 502 }
      );
    }
const page = 1;

const schemaResponse = await fetch(
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
          __type(name: "SimpleProductMetadata") {
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      `,
    }),
    cache: "no-store",
  }
);

const schemaResult = await schemaResponse.json();
console.log(
  "IKAS PRODUCT FIELDS:",
  JSON.stringify(schemaResult.data?.__type?.fields, null, 2)
);

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
              listProduct(pagination: { page: ${page}, limit: 100 }) {
                count
                data {
                  id
                  name
                  metaData {
                   slug
                    }
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
    const secondResponse = await fetch(
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
          listProduct(pagination: { page: 2, limit: 100 }) {
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

if (!secondResponse.ok) {
  return NextResponse.json(
    { success: false, message: "İkinci ürün sayfası alınamadı." },
    { status: 502 }
  );
}

const secondResult = await secondResponse.json();

if (secondResult.errors?.length) {
  return NextResponse.json(
    { success: false, errors: secondResult.errors },
    { status: 502 }
  );
}

    if (!response.ok || result.errors?.length) {
      return NextResponse.json(
        {
          success: false,
          step: "graphql",
          errors: result.errors ?? [],
        },
        { status: 502 }
      );
    }

  return NextResponse.json({
  success: true,
  total: result.data?.listProduct?.count ?? 0,
  loaded: [
  ...(result.data?.listProduct?.data ?? []),
  ...(secondResult.data?.listProduct?.data ?? []),
].length,
  products: [
    ...(result.data?.listProduct?.data ?? []),
    ...(secondResult.data?.listProduct?.data ?? []),
  ],
});
  } catch {
    return NextResponse.json(
      { success: false, message: "ikas bağlantı hatası." },
      { status: 500 }
    );
  }
}
