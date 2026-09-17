import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { API_URL } from "@/config/api";
import ProductDetailClient, { type ProductDetail } from "./ProductDetailClient";

type Props = {
  params: Promise<{ id: string }>;
};

// Loaded once per request for both generateMetadata and the page. The
// rendered page is cached for a minute (ISR), so crawlers get full HTML
// without every visit hitting the API.
const getProduct = cache(async (id: string): Promise<ProductDetail | null> => {
  // ids are positive integers; anything else can't exist (EB-19)
  if (!/^\d{1,10}$/.test(id)) return null;

  const res = await fetch(`${API_URL}/api/products/${id}`, {
    next: { revalidate: 60 },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load product ${id}: ${res.status}`);
  }
  return res.json();
});

function summarize(text: string, max = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) {
    notFound();
  }

  const description = summarize(product.description);
  const image = product.images?.[0];
  const url = `/products/${product.id}`;

  return {
    title: product.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: "EasyBuy",
      url,
      title: product.name,
      description,
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: product.name,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);

  // Unknown or malformed ids render the 404 page instead of a server error
  if (!product) {
    notFound();
  }

  return <ProductDetailClient initialProduct={product} />;
}
