"use client";

// ============================================
// CookWithPrem — Add New Recipe (Admin)
// ============================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import { addRecipe } from "@/lib/firebase/firestore";
import { uploadImage, getRecipeImagePath } from "@/lib/firebase/storage";
import { recipeSchema, type RecipeFormData } from "@/lib/validators";
import { slugify } from "@/lib/utils";
import { CATEGORIES, CUISINE_OPTIONS, DIFFICULTY_OPTIONS } from "@/lib/constants";
import type { Ingredient, RecipeStep, FAQ } from "@/types";

const generateTempId = () => Date.now().toString();

export default function NewRecipePage() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", quantity: "", unit: "" },
  ]);
  const [steps, setSteps] = useState<RecipeStep[]>([
    { stepNumber: 1, title: "", description: "", imageUrl: "" },
  ]);
  const faqs: FAQ[] = [];
  const [tools, setTools] = useState<string[]>([""]);
  const tags: string[] = [];
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      isVeg: false,
      isFeatured: false,
      prepTime: 0,
      cookTime: 0,
      totalTime: 0,
      calories: 0,
      servings: 2,
    },
  });



  const onSubmit = async (data: RecipeFormData) => {
    setSubmitting(true);
    setError("");
    try {
      let heroImage = data.heroImage;

      // Upload hero image if a file was selected
      if (heroFile) {
        const tempId = generateTempId();
        const path = getRecipeImagePath(tempId, heroFile.name);
        heroImage = await uploadImage(heroFile, path);
      }

      const recipeData = {
        ...data,
        heroImage,
        slug: data.slug || slugify(data.title),
        totalTime: (data.prepTime || 0) + (data.cookTime || 0),
        ingredients: ingredients.filter((i) => i.name.trim()),
        steps: steps.filter((s) => s.description.trim()).map((s, i) => ({
          ...s,
          stepNumber: i + 1,
        })),
        tools: tools.filter((t) => t.trim()),
        tags: tags.filter((t) => t.trim()),
        faqs: faqs.filter((f) => f.question.trim()),
        nutrition: {
          calories: data.calories || 0,
          protein: "0g",
          carbs: "0g",
          fat: "0g",
          fiber: "0g",
          sugar: "0g",
        },
      };

      await addRecipe(recipeData);
      router.push("/admin/recipes");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add recipe";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/recipes"
          className="p-2 hover:bg-beige rounded-[var(--radius-sm)] transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          Add New Recipe
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-error rounded-[var(--radius-md)] text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
            Basic Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Recipe Title *
              </label>
              <input
                type="text"
                className="input-base"
                placeholder="e.g., Classic Butter Chicken"
                {...register("title")}
                onChange={(e) => {
                  register("title").onChange(e);
                  setValue("slug", slugify(e.target.value));
                }}
              />
              {errors.title && (
                <p className="text-error text-xs mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Slug
              </label>
              <input
                type="text"
                className="input-base"
                {...register("slug")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Description *
              </label>
              <textarea
                rows={3}
                className="input-base resize-none"
                placeholder="A brief description of the recipe..."
                {...register("description")}
              />
              {errors.description && (
                <p className="text-error text-xs mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Hero Image */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Hero Image
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  className="input-base flex-1"
                  placeholder="Image URL or upload below"
                  {...register("heroImage")}
                />
                <label className="btn-secondary text-sm cursor-pointer">
                  <Upload size={16} />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setHeroFile(file);
                        setValue("heroImage", file.name);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Category *
                </label>
                <select className="input-base" {...register("category")}>
                  <option value="">Select</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Cuisine *
                </label>
                <select className="input-base" {...register("cuisine")}>
                  <option value="">Select</option>
                  {CUISINE_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Difficulty *
                </label>
                <select className="input-base" {...register("difficulty")}>
                  {DIFFICULTY_OPTIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Prep Time (min)
                </label>
                <input type="number" className="input-base" {...register("prepTime")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Cook Time (min)
                </label>
                <input type="number" className="input-base" {...register("cookTime")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Servings
                </label>
                <input type="number" className="input-base" {...register("servings")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Calories
                </label>
                <input type="number" className="input-base" {...register("calories")} />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" {...register("isVeg")} className="rounded border-border" />
                Vegetarian
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" {...register("isFeatured")} className="rounded border-border" />
                Featured Recipe
              </label>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
            Ingredients
          </h2>
          <div className="space-y-3">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2 items-start">
                <input
                  type="text"
                  className="input-base w-24"
                  placeholder="Qty"
                  value={ing.quantity}
                  onChange={(e) => {
                    const updated = [...ingredients];
                    updated[i].quantity = e.target.value;
                    setIngredients(updated);
                  }}
                />
                <input
                  type="text"
                  className="input-base w-20"
                  placeholder="Unit"
                  value={ing.unit}
                  onChange={(e) => {
                    const updated = [...ingredients];
                    updated[i].unit = e.target.value;
                    setIngredients(updated);
                  }}
                />
                <input
                  type="text"
                  className="input-base flex-1"
                  placeholder="Ingredient name"
                  value={ing.name}
                  onChange={(e) => {
                    const updated = [...ingredients];
                    updated[i].name = e.target.value;
                    setIngredients(updated);
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    setIngredients(ingredients.filter((_, j) => j !== i))
                  }
                  className="p-2 text-text-muted hover:text-error"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setIngredients([...ingredients, { name: "", quantity: "", unit: "" }])
              }
              className="text-sm text-warm-brown font-medium flex items-center gap-1 hover:underline"
            >
              <Plus size={14} />
              Add Ingredient
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
            Steps
          </h2>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div
                key={i}
                className="p-4 bg-cream rounded-[var(--radius-md)] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-text-primary">
                    Step {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSteps(steps.filter((_, j) => j !== i))}
                    className="text-text-muted hover:text-error"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Step title"
                  value={step.title}
                  onChange={(e) => {
                    const updated = [...steps];
                    updated[i].title = e.target.value;
                    setSteps(updated);
                  }}
                />
                <textarea
                  rows={2}
                  className="input-base resize-none"
                  placeholder="Step description..."
                  value={step.description}
                  onChange={(e) => {
                    const updated = [...steps];
                    updated[i].description = e.target.value;
                    setSteps(updated);
                  }}
                />
                <input
                  type="text"
                  className="input-base"
                  placeholder="Step image URL (optional)"
                  value={step.imageUrl || ""}
                  onChange={(e) => {
                    const updated = [...steps];
                    updated[i].imageUrl = e.target.value;
                    setSteps(updated);
                  }}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setSteps([
                  ...steps,
                  {
                    stepNumber: steps.length + 1,
                    title: "",
                    description: "",
                    imageUrl: "",
                  },
                ])
              }
              className="text-sm text-warm-brown font-medium flex items-center gap-1 hover:underline"
            >
              <Plus size={14} />
              Add Step
            </button>
          </div>
        </div>

        {/* Kitchen Tools */}
        <div className="bg-white rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
            Kitchen Tools
          </h2>
          <div className="space-y-2">
            {tools.map((tool, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  className="input-base flex-1"
                  placeholder="e.g., Frying Pan"
                  value={tool}
                  onChange={(e) => {
                    const updated = [...tools];
                    updated[i] = e.target.value;
                    setTools(updated);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setTools(tools.filter((_, j) => j !== i))}
                  className="p-2 text-text-muted hover:text-error"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setTools([...tools, ""])}
              className="text-sm text-warm-brown font-medium flex items-center gap-1 hover:underline"
            >
              <Plus size={14} />
              Add Tool
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary disabled:opacity-50"
          >
            {submitting ? "Publishing..." : "Publish Recipe"}
          </button>
          <Link
            href="/admin/recipes"
            className="text-sm text-text-muted hover:text-text-primary"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
