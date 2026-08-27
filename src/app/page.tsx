import HeroSection from "@/components/HeroSection";
import FeaturedCategories from "@/components/FeaturedCategories";
import TrendingProducts from "@/components/TrendingProducts";
import WhatIsEasyBuy from "@/components/WhatIsEasyBuy";
import BestSellers from "@/components/BestSellers";
import WhyChooseUs from "@/components/WhyChooseUs";

export default function Home() {
  return (
    <div className="">
      <HeroSection></HeroSection>
      <FeaturedCategories></FeaturedCategories>
      <TrendingProducts></TrendingProducts>
      <WhatIsEasyBuy></WhatIsEasyBuy>
      <BestSellers></BestSellers>
      <WhyChooseUs></WhyChooseUs>
    </div>
  );
}