import HeroSection from "@/components/HeroSection";
import FeaturedCategories from "@/components/FeaturedCategories";
import TrendingProducts from "@/components/TrendingProducts";
import WhatIsEasyBuy from "@/components/WhatIsEasyBuy";

export default function Home() {
  return (
    <div className="">
      <HeroSection></HeroSection>
      <FeaturedCategories></FeaturedCategories>
      <TrendingProducts></TrendingProducts>
      <WhatIsEasyBuy></WhatIsEasyBuy>
    </div>
  );
}