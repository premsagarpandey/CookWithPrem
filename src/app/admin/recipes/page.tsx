"use client";

// ============================================
// CookWithPrem — Admin Recipes Management
// ============================================

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, Star, Eye } from "lucide-react";
import { getRecipes, deleteRecipe, updateRecipe } from "@/lib/firebase/firestore";
import { formatTime } from "@/lib/utils";
import type { Recipe } from "@/types";

export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const data = await getRecipes();
      setRecipes(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;
    try {
      await deleteRecipe(id);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const toggleFeatured = async (recipe: Recipe) => {
    try {
      await updateRecipe(recipe.id, { isFeatured: !recipe.isFeatured });
      setRecipes((prev) =>
        prev.map((r) =>
          r.id === recipe.id ? { ...r, isFeatured: !r.isFeatured } : r
        )
      );
    } catch (error) {
      console.error("Toggle featured error:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          Manage Recipes
        </h1>
        <Link href="/admin/recipes/new" className="btn-primary text-sm">
          <Plus size={16} />
          Add Recipe
        </Link>
      </div>

      <div className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-muted">Loading...</div>
        ) : recipes.length === 0 ? (
          <div className="p-8 text-center text-text-muted">
            <p className="mb-4">No recipes yet.</p>
            <Link href="/admin/recipes/new" className="btn-primary text-sm">
              Add Your First Recipe
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-light bg-cream/50">
                  <th className="text-left p-4 font-medium text-text-secondary">Recipe</th>
                  <th className="text-left p-4 font-medium text-text-secondary hidden md:table-cell">Category</th>
                  <th className="text-left p-4 font-medium text-text-secondary hidden lg:table-cell">Time</th>
                  <th className="text-center p-4 font-medium text-text-secondary">Featured</th>
                  <th className="text-right p-4 font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map((recipe) => (
                  <tr
                    key={recipe.id}
                    className="border-b border-border-light hover:bg-cream/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {recipe.heroImage && (
                          <Image
                            src={recipe.heroImage}
                            alt=""
                            width={40}
                            height={40}
                            className="rounded-[var(--radius-sm)] object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-text-primary line-clamp-1">
                            {recipe.title}
                          </p>
                          <p className="text-xs text-text-muted">
                            {recipe.difficulty} · {recipe.cuisine}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-text-secondary hidden md:table-cell">
                      {recipe.category}
                    </td>
                    <td className="p-4 text-text-secondary hidden lg:table-cell">
                      {formatTime(recipe.totalTime)}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleFeatured(recipe)}
                        className={`transition-colors ${
                          recipe.isFeatured
                            ? "text-warm-brown"
                            : "text-beige-dark hover:text-warm-brown"
                        }`}
                        aria-label={recipe.isFeatured ? "Unfeature" : "Feature"}
                      >
                        <Star
                          size={18}
                          className={recipe.isFeatured ? "fill-current" : ""}
                        />
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/recipes/${recipe.slug}`}
                          className="p-2 text-text-muted hover:text-text-primary rounded-[var(--radius-sm)] hover:bg-beige transition-colors"
                          aria-label="View recipe"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          href={`/admin/recipes/${recipe.id}/edit`}
                          className="p-2 text-text-muted hover:text-warm-brown rounded-[var(--radius-sm)] hover:bg-beige transition-colors"
                          aria-label="Edit recipe"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(recipe.id)}
                          className="p-2 text-text-muted hover:text-error rounded-[var(--radius-sm)] hover:bg-red-50 transition-colors"
                          aria-label="Delete recipe"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
