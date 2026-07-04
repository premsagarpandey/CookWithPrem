"use client";

// ============================================
// CookWithPrem — Category Detail Page
// ============================================

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RecipeCard from "@/components/recipe/RecipeCard";
import { getRecipesByCategory } from "@/lib/firebase/firestore";
import type { Recipe } from "@/types";

export default function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await getRecipesByCategory(slug);
        setRecipes(data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, [slug]);

  return (
    <ProtectedRoute>
      {/* Dynamic SEO Tags */}
      <title>{`${categoryName} Recipes — CookWithPrem`}</title>
      <meta name="description" content={`Explore our complete collection of step-by-step ${categoryName} recipes by Prem Sagar Pandey.`} />
      <meta property="og:title" content={`${categoryName} Recipes — CookWithPrem`} />
      <meta property="og:description" content={`Explore our complete collection of step-by-step ${categoryName} recipes by Prem Sagar Pandey.`} />
      <meta name="twitter:title" content={`${categoryName} Recipes — CookWithPrem`} />
      <meta name="twitter:description" content={`Explore our complete collection of step-by-step ${categoryName} recipes by Prem Sagar Pandey.`} />
      <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL || "https://cookwithprem.com"}/categories/${slug}`} />

      {/* Breadcrumb */}
      <div className="bg-cream py-3">
        <div className="container-custom mx-auto px-4 md:px-6">
          <nav className="flex items-center gap-2 text-sm text-text-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-warm-brown transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link href="/categories" className="hover:text-warm-brown transition-colors">Categories</Link>
            <ChevronRight size={14} />
            <span className="text-text-primary font-medium">{categoryName}</span>
          </nav>
        </div>
      </div>

      <section className="bg-cream py-8 md:py-12">
        <div className="container-custom mx-auto px-4 md:px-6 text-center">
          <motion.h1
            className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {categoryName} Recipes
          </motion.h1>
          <p className="text-text-secondary">
            {loading ? "Loading..." : `${recipes.length} recipes`}
          </p>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom mx-auto px-4 md:px-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card">
                  <div className="aspect-[4/3] skeleton" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 skeleton w-3/4" />
                    <div className="h-4 skeleton w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : recipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {recipes.map((recipe, index) => (
                <RecipeCard key={recipe.id} recipe={recipe} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-text-muted">
              <span className="text-5xl block mb-4">🍽️</span>
              <p className="text-lg font-medium mb-2">No recipes yet</p>
              <p className="text-sm">
                Recipes for this category are coming soon!
              </p>
              <Link href="/recipes" className="btn-primary mt-6 inline-flex">
                Browse All Recipes
              </Link>
            </div>
          )}
        </div>
      </section>
    </ProtectedRoute>
  );
}
