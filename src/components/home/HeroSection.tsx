"use client";

// ============================================
// CookWithPrem — Home Page (Hero Section)
// ============================================

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function HeroSection() {
  const { user, setShowLoginModal } = useAuth();

  const handleExplore = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-cream via-white to-beige overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-warm-brown/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-sage/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-warm-brown/3 rounded-full blur-[120px]" />

      <div className="container-custom mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-warm-brown/10 text-warm-brown rounded-[var(--radius-full)] text-sm font-medium mb-6">
              <Play size={14} className="fill-current" />
              Step-by-Step Cooking Tutorials
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary leading-[1.1] mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            Learn Cooking{" "}
            <span className="text-warm-brown">One Step</span>{" "}
            at a Time
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="text-text-secondary text-lg md:text-xl leading-relaxed max-w-xl mx-auto mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Discover detailed step-by-step recipes, cooking tips, and tutorials
            by Prem Sagar Pandey. From beginners to home chefs — cook with
            confidence.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
          >
            {user ? (
              <Link href="/recipes" className="btn-primary text-base px-8 py-3.5">
                Explore Recipes
                <ArrowRight size={18} />
              </Link>
            ) : (
              <button
                onClick={handleExplore}
                className="btn-primary text-base px-8 py-3.5"
              >
                Explore Recipes
                <ArrowRight size={18} />
              </button>
            )}
            <button
              onClick={() => !user && setShowLoginModal(true)}
              className="btn-secondary text-base px-8 py-3.5"
            >
              {user ? (
                <Link href="/categories">Browse Categories</Link>
              ) : (
                "Sign In"
              )}
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex items-center justify-center gap-8 md:gap-12 mt-14 pt-10 border-t border-border-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {[
              { number: "100+", label: "Recipes" },
              { number: "12", label: "Categories" },
              { number: "1000+", label: "Happy Cooks" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-heading text-2xl md:text-3xl font-bold text-warm-brown">
                  {stat.number}
                </p>
                <p className="text-text-muted text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
