import type { MetadataRoute } from "next";
import { getRecipes, getCategories } from "@/lib/firebase/firestore";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cookwithprem.com";

  const staticRoutes = [
    "",
    "/recipes",
    "/categories",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  try {
    const [recipes, categories] = await Promise.all([
      getRecipes(),
      getCategories(),
    ]);

    const recipeRoutes = recipes.map((recipe) => ({
      url: `${baseUrl}/recipes/${recipe.slug}`,
      lastModified: recipe.updatedAt ? recipe.updatedAt.toDate() : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    const categoryRoutes = categories.map((category) => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

    return [...staticRoutes, ...recipeRoutes, ...categoryRoutes];
  } catch {
    // Return static routes if firestore fetch fails (e.g. at build time without firebase credentials)
    return staticRoutes;
  }
}
