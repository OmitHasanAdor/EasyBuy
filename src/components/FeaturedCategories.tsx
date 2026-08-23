import { Shirt, Home, Sparkles, ShoppingBag } from "lucide-react";

const categories = [
  {
    name: "Men's Fashion",
    description: "Shirts, sneakers & everyday wear",
    icon: Shirt,
    bg: "bg-[#C05620]",
  },
  {
    name: "Women's Fashion",
    description: "Dresses, accessories & more",
    icon: ShoppingBag,
    bg: "bg-[#8E3D14]",
  },
  {
    name: "Home & Lifestyle",
    description: "Decor picks for every room",
    icon: Home,
    bg: "bg-[#5B5145]",
  },
  {
    name: "New Arrivals",
    description: "Fresh drops added weekly",
    icon: Sparkles,
    bg: "bg-[#2B2420]",
  },
];

export default function FeaturedCategories() {
  return (
    <section className="w-full bg-[#F7F2E7] px-6 py-16 sm:px-10 lg:px-16">
      <h2 className="mb-10 font-serif text-3xl font-normal text-[#2B2420] sm:text-4xl">
        Shop by Category
      </h2>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
        {categories.map(({ name, description, icon: Icon, bg }) => (
          <a
            key={name}
            href="#"
            className="group flex flex-col overflow-hidden rounded-2xl border border-[#ddd6c9] bg-white transition-shadow hover:shadow-lg"
          >
            <div
              className={`flex h-28 items-center justify-center sm:h-36 ${bg}`}
            >
              <Icon
                size={36}
                className="text-[#F7F2E7] transition-transform group-hover:scale-110"
              />
            </div>
            <div className="p-4">
              <h3 className="font-serif text-lg text-[#2B2420]">{name}</h3>
              <p className="mt-1 text-sm text-neutral-600">{description}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}