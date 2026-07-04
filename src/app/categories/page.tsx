"use client";

// ============================================
// CookWithPrem — Categories Page
// ============================================

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getCategories } from "@/lib/firebase/firestore";
import { CATEGORIES } from "@/lib/constants";
import type { Category } from "@/types";

const categoryEmojis: Record<string, string> = {
  breakfast: "🥞",
  lunch: "🍛",
  dinner: "🍝",
  snacks: "🥟",
  desserts: "🍰",
  indian: "🇮🇳",
  chinese: "🥢",
  italian: "🍕",
  "south-indian": "🥘",
  "street-food": "🌮",
  "healthy-food": "🥗",
  vegetarian: "🥦",
};

export default function CategoriesPage() {
  const [firestoreCategories, setFirestoreCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setFirestoreCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Use Firestore categories if available, otherwise fall back to constants
  const displayCategories =
    firestoreCategories.length > 0
      ? firestoreCategories.map((c) => ({
          name: c.name,
          slug: c.slug,
          description: c.description,
          imageUrl: c.imageUrl,
          recipeCount: c.recipeCount,
        }))
      : CATEGORIES.map((c) => ({
          name: c.name,
          slug: c.slug,
          description: `Explore delicious ${c.name.toLowerCase()} recipes`,
          imageUrl: "",
          recipeCount: 0,
        }));

  return (
    <ProtectedRoute>
      <section className="bg-cream py-12 md:py-16">
        <div className="container-custom mx-auto px-4 md:px-6">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-3">
              Recipe Categories
            </h1>
            <p className="text-text-secondary max-w-lg mx-auto">
              Browse recipes organized by category. Find exactly what
              you&apos;re looking for.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom mx-auto px-4 md:px-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="skeleton h-48 rounded-[var(--radius-lg)]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayCategories.map((category, index) => (
                <motion.div
                  key={category.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Link
                    href={`/categories/${category.slug}`}
                    className="group block relative overflow-hidden rounded-[var(--radius-lg)] bg-cream h-48 hover:shadow-[var(--shadow-card)] transition-all duration-300"
                  >
                    {category.imageUrl ? (
                      <>
                        <Image
                          src={category.imageUrl}
                          alt={category.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <h3 className="font-heading text-xl font-bold text-white mb-1">
                            {category.name}
                          </h3>
                          <p className="text-white/80 text-sm">
                            {category.recipeCount} recipes
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full p-6 group-hover:-translate-y-1 transition-transform">
                        <span className="text-5xl mb-3">
                          {categoryEmojis[category.slug] || "🍽️"}
                        </span>
                        <h3 className="font-heading text-xl font-bold text-text-primary mb-1">
                          {category.name}
                        </h3>
                        <p className="text-text-muted text-sm">
                          {category.description}
                        </p>
                      </div>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </ProtectedRoute>
  );
}
