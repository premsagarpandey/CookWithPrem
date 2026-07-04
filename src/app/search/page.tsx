"use client";

// ============================================
// CookWithPrem — Search Page
// ============================================

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RecipeCard from "@/components/recipe/RecipeCard";
import { getRecipes } from "@/lib/firebase/firestore";
import { CATEGORIES, DIFFICULTY_OPTIONS, CUISINE_OPTIONS, COOK_TIME_OPTIONS } from "@/lib/constants";
import type { Recipe, RecipeFilters } from "@/types";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState<RecipeFilters>({});

  const performSearch = useCallback(
    async (searchQuery: string, searchFilters: RecipeFilters) => {
      setLoading(true);
      setHasSearched(true);
      try {
        const data = await getRecipes({
          ...searchFilters,
          search: searchQuery || undefined,
        });
        setRecipes(data);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Debounced search
  useEffect(() => {
    if (!query && !Object.values(filters).some(Boolean)) return;
    const timer = setTimeout(() => {
      performSearch(query, filters);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, filters, performSearch]);

  const clearAll = () => {
    setQuery("");
    setFilters({});
    setRecipes([]);
    setHasSearched(false);
  };

  return (
    <ProtectedRoute>
      <section className="bg-cream py-12 md:py-16">
        <div className="container-custom mx-auto px-4 md:px-6">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-6">
              Search Recipes
            </h1>

            {/* Search Input */}
            <div className="relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, ingredient, or tag..."
                className="w-full pl-12 pr-12 py-4 rounded-[var(--radius-full)] bg-white border border-border-light text-text-primary shadow-[var(--shadow-soft)] focus:outline-none focus:border-warm-brown focus:shadow-[var(--shadow-card)] transition-all text-base"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom mx-auto px-4 md:px-6">
          {/* Filter Row */}
          <div className="flex flex-wrap gap-3 mb-8">
            <select
              className="input-base w-auto min-w-[140px]"
              value={filters.category || ""}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value || undefined })
              }
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>

            <select
              className="input-base w-auto min-w-[120px]"
              value={filters.difficulty || ""}
              onChange={(e) =>
                setFilters({ ...filters, difficulty: e.target.value || undefined })
              }
            >
              <option value="">All Levels</option>
              {DIFFICULTY_OPTIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              className="input-base w-auto min-w-[120px]"
              value={filters.cuisine || ""}
              onChange={(e) =>
                setFilters({ ...filters, cuisine: e.target.value || undefined })
              }
            >
              <option value="">All Cuisines</option>
              {CUISINE_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              className="input-base w-auto min-w-[140px]"
              value={filters.cookTime || ""}
              onChange={(e) =>
                setFilters({ ...filters, cookTime: e.target.value || undefined })
              }
            >
              <option value="">Any Time</option>
              {COOK_TIME_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            <label className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={filters.isVeg === true}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    isVeg: e.target.checked ? true : undefined,
                  })
                }
                className="rounded border-border"
              />
              Veg Only
            </label>

            {(query || Object.values(filters).some(Boolean)) && (
              <button
                onClick={clearAll}
                className="text-sm text-error flex items-center gap-1 px-3"
              >
                <X size={14} />
                Clear All
              </button>
            )}
          </div>

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          ) : hasSearched ? (
            recipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe, i) => (
                  <RecipeCard key={recipe.id} recipe={recipe} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-text-muted">
                <span className="text-5xl block mb-4">🔍</span>
                <p className="text-lg font-medium mb-2">No recipes found</p>
                <p className="text-sm">Try a different search term or adjust filters.</p>
              </div>
            )
          ) : (
            <div className="text-center py-20 text-text-muted">
              <span className="text-5xl block mb-4">🍳</span>
              <p className="text-lg font-medium mb-2">Start Searching</p>
              <p className="text-sm">Type a recipe name, ingredient, or use the filters above.</p>
            </div>
          )}
        </div>
      </section>
    </ProtectedRoute>
  );
}
