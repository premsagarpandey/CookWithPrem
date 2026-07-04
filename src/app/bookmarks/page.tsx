"use client";

// ============================================
// CookWithPrem — Bookmarks Page
// ============================================

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RecipeCard from "@/components/recipe/RecipeCard";
import { useAuth } from "@/contexts/AuthContext";
import { getUserBookmarks, getRecipeById } from "@/lib/firebase/firestore";
import type { Recipe } from "@/types";

export default function BookmarksPage() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) return;
      try {
        const bookmarks = await getUserBookmarks(user.uid);
        const recipePromises = bookmarks.map((b) => getRecipeById(b.recipeId));
        const recipeResults = await Promise.all(recipePromises);
        setRecipes(
          recipeResults.filter((r): r is Recipe => r !== null)
        );
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, [user]);

  return (
    <ProtectedRoute>
      <section className="bg-cream py-12 md:py-16">
        <div className="container-custom mx-auto px-4 md:px-6">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-3">
              Saved Recipes
            </h1>
            <p className="text-text-secondary">
              Your bookmarked recipes, all in one place.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom mx-auto px-4 md:px-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe, i) => (
                <RecipeCard key={recipe.id} recipe={recipe} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-text-muted">
              <Bookmark size={48} className="mx-auto mb-4 text-beige-dark" />
              <p className="text-lg font-medium mb-2">No saved recipes yet</p>
              <p className="text-sm mb-6">
                Start bookmarking recipes you love and find them here.
              </p>
              <Link href="/recipes" className="btn-primary">
                Browse Recipes
              </Link>
            </div>
          )}
        </div>
      </section>
    </ProtectedRoute>
  );
}
