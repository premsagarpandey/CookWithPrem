"use client";

// ============================================
// CookWithPrem — Cooking Tips Section
// ============================================

import { motion } from "framer-motion";
import {
  Lightbulb,
  Timer,
  Thermometer,
  Flame,
  Leaf,
  ChefHat,
} from "lucide-react";

const tips = [
  {
    icon: Timer,
    title: "Prep Before You Cook",
    description:
      "Read the entire recipe and prepare all ingredients before you start. This is called mise en place.",
  },
  {
    icon: Thermometer,
    title: "Get the Temperature Right",
    description:
      "Always preheat your pan or oven. The right temperature makes a huge difference in taste and texture.",
  },
  {
    icon: Flame,
    title: "Master Your Heat",
    description:
      "Learn when to use high, medium, and low heat. Most beginners cook on too high a flame.",
  },
  {
    icon: Leaf,
    title: "Season as You Go",
    description:
      "Add salt and spices at different stages. Layered seasoning creates much deeper flavors.",
  },
  {
    icon: ChefHat,
    title: "Taste Before Serving",
    description:
      "Always taste your food before serving and adjust seasoning. Your palate is your best tool.",
  },
  {
    icon: Lightbulb,
    title: "Keep It Simple",
    description:
      "Start with simple recipes and master them. Complex dishes are built on basic techniques.",
  },
];

export default function CookingTips() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-warm-brown/10 text-warm-brown rounded-[var(--radius-full)] text-xs font-medium uppercase tracking-wider mb-4">
            <Lightbulb size={14} />
            Tips
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-3">
            Cooking Tips for Beginners
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto">
            Essential tips that every home cook should know. Master these basics
            and transform your cooking.
          </p>
        </motion.div>

        {/* Tips Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tips.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <motion.div
                key={tip.title}
                className="group p-6 md:p-8 rounded-[var(--radius-lg)] bg-cream hover:bg-warm-brown transition-all duration-300 cursor-default"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <div className="w-12 h-12 rounded-[var(--radius-md)] bg-warm-brown/10 group-hover:bg-white/20 flex items-center justify-center mb-4 transition-colors">
                  <Icon
                    size={22}
                    className="text-warm-brown group-hover:text-white transition-colors"
                  />
                </div>
                <h3 className="font-heading text-lg font-semibold text-text-primary group-hover:text-white mb-2 transition-colors">
                  {tip.title}
                </h3>
                <p className="text-text-secondary group-hover:text-white/80 text-sm leading-relaxed transition-colors">
                  {tip.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
