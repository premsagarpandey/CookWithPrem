"use client";

// ============================================
// CookWithPrem — Popular Categories Section
// ============================================

import { motion } from "framer-motion";
import { ArrowRight, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const categories = [
  { name: "Breakfast", slug: "breakfast", emoji: "🥞", color: "bg-amber-50" },
  { name: "Lunch", slug: "lunch", emoji: "🍛", color: "bg-orange-50" },
  { name: "Dinner", slug: "dinner", emoji: "🍝", color: "bg-red-50" },
  { name: "Snacks", slug: "snacks", emoji: "🥟", color: "bg-yellow-50" },
  { name: "Desserts", slug: "desserts", emoji: "🍰", color: "bg-pink-50" },
  { name: "Indian", slug: "indian", emoji: "🇮🇳", color: "bg-orange-50" },
  { name: "Italian", slug: "italian", emoji: "🍕", color: "bg-green-50" },
  { name: "Healthy", slug: "healthy-food", emoji: "🥗", color: "bg-emerald-50" },
];

export default function PopularCategories() {
  const { user, setShowLoginModal } = useAuth();

  const handleCategoryClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setShowLoginModal(true);
    }
  };

  return (
    <section className="section-padding bg-cream">
      <div className="container-custom mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-sage/10 text-sage-dark rounded-[var(--radius-full)] text-xs font-medium uppercase tracking-wider mb-4">
            <UtensilsCrossed size={14} />
            Browse
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-3">
            Popular Categories
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto">
            Find your favorite cuisine or explore something new from our curated
            collections.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Link
                href={`/categories/${category.slug}`}
                onClick={handleCategoryClick}
                className={`block ${category.color} rounded-[var(--radius-lg)] p-5 md:p-6 text-center group hover:shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1`}
              >
                <span className="text-4xl md:text-5xl block mb-3 group-hover:scale-110 transition-transform duration-300">
                  {category.emoji}
                </span>
                <h3 className="font-heading text-base md:text-lg font-semibold text-text-primary">
                  {category.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All */}
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {user ? (
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 text-warm-brown font-medium hover:gap-3 transition-all"
            >
              View All Categories
              <ArrowRight size={18} />
            </Link>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="inline-flex items-center gap-2 text-warm-brown font-medium hover:gap-3 transition-all"
            >
              View All Categories
              <ArrowRight size={18} />
            </button>
          )}
        </motion.div>
      </div>
    </section>
  );
}
