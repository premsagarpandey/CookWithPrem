"use client";

// ============================================
// CookWithPrem — Featured Recipes Section
// ============================================

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import RecipeCard from "@/components/recipe/RecipeCard";
import { getFeaturedRecipes } from "@/lib/firebase/firestore";
import type { Recipe } from "@/types";

export default function FeaturedRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await getFeaturedRecipes(6);
        setRecipes(data);
      } catch (error) {
        console.error("Error fetching featured recipes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  return (
    <section className="section-padding bg-white">
      <div className="container-custom mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-warm-brown/10 text-warm-brown rounded-[var(--radius-full)] text-xs font-medium uppercase tracking-wider mb-4">
            <Sparkles size={14} />
            Featured
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-3">
            Chef&apos;s Picks
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto">
            Hand-picked recipes that we think you&apos;ll absolutely love. From
            comfort food to gourmet creations.
          </p>
        </motion.div>

        {/* Recipe Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card">
                <div className="aspect-[4/3] skeleton" />
                <div className="p-5 space-y-3">
                  <div className="h-5 skeleton w-3/4" />
                  <div className="h-4 skeleton w-full" />
                  <div className="h-4 skeleton w-1/2" />
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
          <div className="text-center py-16 text-text-muted">
            <p className="text-lg">Featured recipes coming soon!</p>
            <p className="text-sm mt-2">
              Check back later for our hand-picked selections.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
