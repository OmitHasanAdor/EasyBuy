import Image from "next/image";
import { Star, Heart } from "lucide-react";

type Product = {
  name: string;
  category: "Men" | "Women";
  price: number;
  oldPrice?: number;
  rating: number;
  image: string;
};

// NOTE: images below are generic royalty-free placeholder photography (Lorem Picsum,
// sourced from Unsplash, free-to-use license) just to preview the layout with real
// photos instead of icons. Swap the `image` field for your actual product photos
// (e.g. "/products/oxford-shirt.jpg") before shipping.
const bestSellers: Product[] = [
  { name: "Classic Oxford Shirt", category: "Men", price: 1450, oldPrice: 1800, rating: 4.8, image: "https://picsum.photos/seed/easybuy-shirt/600/600" },
  { name: "Chrono Steel Watch", category: "Men", price: 3200, rating: 4.6, image: "https://picsum.photos/seed/easybuy-watch/600/600" },
  { name: "Suede Sneakers", category: "Women", price: 2650, oldPrice: 3100, rating: 4.7, image: "https://picsum.photos/seed/easybuy-sneakers/600/600" },
  { name: "Statement Sunglasses", category: "Women", price: 950, rating: 4.5, image: "https://picsum.photos/seed/easybuy-sunglasses/600/600" },
  { name: "Structured Tote Bag", category: "Women", price: 2200, rating: 4.9, image: "https://picsum.photos/seed/easybuy-totebag/600/600" },
  { name: "Minimal Gold Necklace", category: "Women", price: 1350, oldPrice: 1600, rating: 4.6, image: "https://picsum.photos/seed/easybuy-necklace/600/600" },
  { name: "Linen Casual Shirt", category: "Men", price: 1250, rating: 4.4, image: "https://picsum.photos/seed/easybuy-linen/600/600" },
  { name: "Leather Ankle Boots", category: "Men", price: 3450, rating: 4.8, image: "https://picsum.photos/seed/easybuy-boots/600/600" },
];

export default function BestSellers() {
  return (
    <section className="w-full bg-[#FBF8F1] px-6 py-20 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        {/* Section heading */}
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[4px] text-[#C05620]">
              Shop the Favorites
            </span>
            <h2 className="font-serif text-3xl font-medium text-[#2B2420] sm:text-4xl">
              Best Sellers
            </h2>
          </div>
          <a
            href="#"
            className="text-sm font-semibold text-[#2B2420] underline-offset-4 hover:underline"
          >
            View all products →
          </a>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {bestSellers.map((product) => (
            <div
              key={product.name}
              className="group relative flex flex-col overflow-hidden rounded-lg border border-[#E7DCC4] bg-white transition-shadow hover:shadow-lg"
            >
              {/* Badge */}
              {product.oldPrice && (
                <span className="absolute left-3 top-3 z-10 rounded-full bg-[#C05620] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#F7F2E7]">
                  Best Seller
                </span>
              )}

              {/* Wishlist */}
              <button
                aria-label="Add to wishlist"
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#8E3D14] transition-colors hover:bg-white"
              >
                <Heart className="h-4 w-4" strokeWidth={2} />
              </button>

              {/* Product image */}
              <div className="relative aspect-square overflow-hidden bg-[#F2EADA]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col gap-1.5 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[#8E3D14]">
                  {product.category}
                </span>
                <h3 className="font-serif text-base font-medium leading-snug text-[#2B2420]">
                  {product.name}
                </h3>

                <div className="mt-0.5 flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-[#C05620] text-[#C05620]" />
                  <span className="text-xs text-[#5B5145]">{product.rating}</span>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <span className="font-serif text-lg font-medium text-[#2B2420]">
                    ৳{product.price.toLocaleString()}
                  </span>
                  {product.oldPrice && (
                    <span className="text-sm text-[#A89A80] line-through">
                      ৳{product.oldPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}