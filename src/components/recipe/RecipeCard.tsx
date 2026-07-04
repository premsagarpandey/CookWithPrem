"use client";

// ============================================
// CookWithPrem — Recipe Card Component
// ============================================

import { motion } from "framer-motion";
import { Clock, Users, Flame, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { formatTime } from "@/lib/utils";
import type { Recipe } from "@/types";

interface RecipeCardProps {
  recipe: Recipe;
  index?: number;
}

export default function RecipeCard({ recipe, index = 0 }: RecipeCardProps) {
  const { user, setShowLoginModal } = useAuth();

  const handleClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setShowLoginModal(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        href={`/recipes/${recipe.slug}`}
        onClick={handleClick}
        className="card group block h-full"
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {recipe.heroImage ? (
            <Image
              src={recipe.heroImage}
              alt={recipe.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-beige flex items-center justify-center">
              <Flame size={32} className="text-text-muted" />
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-warm-brown rounded-[var(--radius-full)] shadow-sm">
              {recipe.category}
            </span>
          </div>

          {/* Lock Overlay for Guests */}
          {!user && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/95 backdrop-blur-sm p-3 rounded-full shadow-lg">
                <Lock size={20} className="text-warm-brown" />
              </div>
            </div>
          )}

          {/* Veg Badge */}
          {recipe.isVeg && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-sage rounded-sm border-2 border-white shadow-sm">
                <span className="w-2 h-2 rounded-full bg-white" />
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 md:p-5">
          <h3 className="font-heading text-lg md:text-xl font-semibold text-text-primary mb-2 line-clamp-2 group-hover:text-warm-brown transition-colors">
            {recipe.title}
          </h3>

          <p className="text-text-secondary text-sm leading-relaxed mb-4 line-clamp-2">
            {recipe.description}
          </p>

          {/* Meta Row */}
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {formatTime(recipe.totalTime)}
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={14} />
              {recipe.servings} servings
            </span>
            <span className="flex items-center gap-1.5">
              <Flame size={14} />
              {recipe.difficulty}
            </span>
          </div>

          {/* Rating */}
          {recipe.averageRating > 0 && (
            <div className="flex items-center gap-1.5 mt-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-sm ${
                      star <= Math.round(recipe.averageRating)
                        ? "text-warm-brown-light"
                        : "text-beige-dark"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-xs text-text-muted">
                ({recipe.totalRatings})
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
