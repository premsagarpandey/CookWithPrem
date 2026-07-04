"use client";

// ============================================
// CookWithPrem — Recipes Page
// ============================================

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Filter, X } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RecipeCard from "@/components/recipe/RecipeCard";
import { getRecipes } from "@/lib/firebase/firestore";
import { CATEGORIES, DIFFICULTY_OPTIONS, CUISINE_OPTIONS, COOK_TIME_OPTIONS } from "@/lib/constants";
import type { Recipe, RecipeFilters } from "@/types";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<RecipeFilters>({});

  const fetchRecipes = async (currentFilters: RecipeFilters) => {
    setLoading(true);
    try {
      const data = await getRecipes(currentFilters);
      setRecipes(data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = () => {
    fetchRecipes(filters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const cleared: RecipeFilters = {};
    setFilters(cleared);
    fetchRecipes(cleared);
  };

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== ""
  );

  return (
    <ProtectedRoute>
      {/* Hero */}
      <section className="bg-cream py-12 md:py-16">
        <div className="container-custom mx-auto px-4 md:px-6">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-3">
              All Recipes
            </h1>
            <p className="text-text-secondary max-w-lg mx-auto">
              Explore our complete collection of step-by-step recipes.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom mx-auto px-4 md:px-6">
          {/* Filter Bar */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-text-muted text-sm">
              {loading ? "Loading..." : `${recipes.length} recipes found`}
            </p>
            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-error flex items-center gap-1 hover:underline"
                >
                  <X size={14} />
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-[var(--radius-full)] text-sm font-medium text-text-secondary hover:bg-beige transition-colors"
              >
                <Filter size={16} />
                Filters
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              className="mb-8 p-6 bg-cream rounded-[var(--radius-lg)] border border-border-light"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Category
                  </label>
                  <select
                    className="input-base"
                    value={filters.category || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, category: e.target.value || undefined })
                    }
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Difficulty
                  </label>
                  <select
                    className="input-base"
                    value={filters.difficulty || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, difficulty: e.target.value || undefined })
                    }
                  >
                    <option value="">All Levels</option>
                    {DIFFICULTY_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Cuisine
                  </label>
                  <select
                    className="input-base"
                    value={filters.cuisine || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, cuisine: e.target.value || undefined })
                    }
                  >
                    <option value="">All Cuisines</option>
                    {CUISINE_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Cooking Time
                  </label>
                  <select
                    className="input-base"
                    value={filters.cookTime || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, cookTime: e.target.value || undefined })
                    }
                  >
                    <option value="">Any Time</option>
                    {COOK_TIME_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.isVeg === true}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        isVeg: e.target.checked ? true : undefined,
                      })
                    }
                    className="rounded border-border text-warm-brown focus:ring-warm-brown"
                  />
                  Vegetarian Only
                </label>
                <button
                  onClick={applyFilters}
                  className="btn-primary text-sm py-2 px-5 ml-auto"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          )}

          {/* Recipe Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[...Array(9)].map((_, i) => (
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
            <div className="text-center py-20 text-text-muted">
              <span className="text-5xl block mb-4">🍽️</span>
              <p className="text-lg font-medium mb-2">No recipes found</p>
              <p className="text-sm">
                {hasActiveFilters
                  ? "Try adjusting your filters."
                  : "Check back soon for new recipes!"}
              </p>
            </div>
          )}
        </div>
      </section>
    </ProtectedRoute>
  );
}
