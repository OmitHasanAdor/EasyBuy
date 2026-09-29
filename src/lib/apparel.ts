/**
 * Helper utility to determine if a product is an apparel/clothing item
 * eligible for Virtual Try-On (AI Trial Room).
 */
export function isApparelProduct(product: { name: string; category?: string }): boolean {
  const text = `${product.name} ${product.category || ""}`.toLowerCase();
  const keywords = [
    "fashion",
    "shirt",
    "t-shirt",
    "tee",
    "top",
    "blouse",
    "jacket",
    "coat",
    "hoodie",
    "sweater",
    "pant",
    "pants",
    "trouser",
    "jean",
    "jeans",
    "denim",
    "skirt",
    "short",
    "shorts",
    "bottom",
    "cargo",
    "dress",
    "saree",
    "sari",
    "gown",
    "kurti",
    "kurta",
    "salwar",
    "panjabi",
    "suit",
    "blazer",
    "clothing",
    "apparel",
    "wear",
    "outfit",
  ];
  return keywords.some((kw) => text.includes(kw));
}
