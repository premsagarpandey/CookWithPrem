"use client";

// ============================================
// CookWithPrem — Admin Categories Management
// ============================================

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { getCategories, deleteCategory, addCategory } from "@/lib/firebase/firestore";
import type { Category } from "@/types";
import { slugify } from "@/lib/utils";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCat, setNewCat] = useState({ name: "", description: "", imageUrl: "" });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.name) return;
    try {
      const slug = slugify(newCat.name);
      const categoryData = {
        name: newCat.name,
        description: newCat.description,
        imageUrl: newCat.imageUrl,
        slug,
        order: categories.length,
        recipeCount: 0,
      };
      const id = await addCategory(categoryData);
      setCategories([...categories, { id, ...categoryData }]);
      setIsAdding(false);
      setNewCat({ name: "", description: "", imageUrl: "" });
    } catch (error) {
      console.error("Add category error:", error);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          Manage Categories
        </h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="btn-primary text-sm"
        >
          {isAdding ? "Cancel" : <><Plus size={16} /> Add Category</>}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] mb-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Add New Category</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                className="input-base"
                value={newCat.name}
                onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="input-base"
                rows={2}
                value={newCat.description}
                onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input
                type="text"
                className="input-base"
                value={newCat.imageUrl}
                onChange={(e) => setNewCat({ ...newCat, imageUrl: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-primary">Save Category</button>
          </form>
        </div>
      )}


      <div className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-muted">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-text-muted">No categories found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-light bg-cream/50">
                  <th className="text-left p-4 font-medium text-text-secondary">Category</th>
                  <th className="text-left p-4 font-medium text-text-secondary">Slug</th>
                  <th className="text-right p-4 font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="border-b border-border-light hover:bg-cream/30"
                  >
                    <td className="p-4">
                      <div className="font-medium text-text-primary">{cat.name}</div>
                      <div className="text-xs text-text-muted truncate max-w-xs">{cat.description}</div>
                    </td>
                    <td className="p-4 text-text-secondary">{cat.slug}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-2 text-text-muted hover:text-error rounded-[var(--radius-sm)] hover:bg-red-50 transition-colors"
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
