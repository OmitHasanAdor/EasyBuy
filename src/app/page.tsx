import HeroSection from "@/components/HeroSection";
import FeaturedCategories from "@/components/FeaturedCategories";
import TrendingProducts from "@/components/TrendingProducts";
import WhatIsEasyBuy from "@/components/WhatIsEasyBuy";
import BestSellers from "@/components/BestSellers";
import FlashSale from "@/components/FlashSale";
import WhyChooseUs from "@/components/WhyChooseUs";

export default function Home() {
  return (
    <div className="">
      <HeroSection></HeroSection>
      <FeaturedCategories></FeaturedCategories>
      <TrendingProducts></TrendingProducts>
      <BestSellers></BestSellers>
      <FlashSale></FlashSale>
      <WhatIsEasyBuy></WhatIsEasyBuy>
      <WhyChooseUs></WhyChooseUs>
    </div>
  );
}