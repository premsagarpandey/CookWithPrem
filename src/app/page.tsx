"use client";

// ============================================
// CookWithPrem — Home Page
// ============================================

import HeroSection from "@/components/home/HeroSection";
import FeaturedRecipes from "@/components/home/FeaturedRecipes";
import PopularCategories from "@/components/home/PopularCategories";
import CookingTips from "@/components/home/CookingTips";
import Testimonials from "@/components/home/Testimonials";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedRecipes />
      <PopularCategories />
      <CookingTips />
      <Testimonials />
    </>
  );
}
