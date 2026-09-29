import HeroSection from "@/components/HeroSection";
import FeaturedCategories from "@/components/FeaturedCategories";
import TrendingProducts from "@/components/TrendingProducts";
import TrialRoomBanner from "@/components/trial-room/TrialRoomBanner";
import WhatIsEasyBuy from "@/components/WhatIsEasyBuy";
import BestSellers from "@/components/BestSellers";
import FlashSale from "@/components/FlashSale";
import WhyChooseUs from "@/components/WhyChooseUs";
import RecentlyViewed from "@/components/RecentlyViewed";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturedCategories />
      <TrendingProducts />
      <TrialRoomBanner />
      <BestSellers />
      <RecentlyViewed />
      <FlashSale />
      <WhatIsEasyBuy />
      <WhyChooseUs />
    </div>
  );
}