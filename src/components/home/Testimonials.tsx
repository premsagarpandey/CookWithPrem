"use client";

// ============================================
// CookWithPrem — Testimonials Section
// ============================================

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
  {
    name: "Ananya Sharma",
    role: "Home Cook",
    content:
      "CookWithPrem has completely transformed how I cook. The step-by-step instructions are so easy to follow. I went from burning toast to making restaurant-quality biryani!",
    rating: 5,
  },
  {
    name: "Rahul Verma",
    role: "College Student",
    content:
      "As a college student living alone, this website has been a lifesaver. The recipes are simple, affordable, and absolutely delicious. Thank you, Prem!",
    rating: 5,
  },
  {
    name: "Priya Patel",
    role: "Working Professional",
    content:
      "I love how each recipe has detailed steps with timings. It takes the guesswork out of cooking. The Indian recipes are authentic and remind me of home.",
    rating: 5,
  },
  {
    name: "Arjun Mehta",
    role: "Food Enthusiast",
    content:
      "The variety of recipes and the quality of instructions are outstanding. From quick snacks to elaborate dinners, CookWithPrem has it all.",
    rating: 4,
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const current = testimonials[currentIndex];

  return (
    <section className="section-padding bg-cream">
      <div className="container-custom mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-sage/10 text-sage-dark rounded-[var(--radius-full)] text-xs font-medium uppercase tracking-wider mb-4">
            <Quote size={14} />
            Testimonials
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-3">
            What Our Cooks Say
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto">
            Join thousands of happy home cooks who have transformed their cooking
            journey with CookWithPrem.
          </p>
        </motion.div>

        {/* Testimonial Card */}
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-white rounded-[var(--radius-xl)] p-8 md:p-12 shadow-[var(--shadow-card)]">
            {/* Quote Icon */}
            <div className="absolute -top-4 left-8">
              <div className="w-10 h-10 bg-warm-brown rounded-full flex items-center justify-center shadow-lg">
                <Quote size={18} className="text-white fill-current" />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                {/* Stars */}
                <div className="flex items-center justify-center gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      className={`${
                        star <= current.rating
                          ? "text-warm-brown-light fill-current"
                          : "text-beige-dark"
                      }`}
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-text-secondary text-lg leading-relaxed mb-8 italic">
                  &ldquo;{current.content}&rdquo;
                </p>

                {/* Author */}
                <div>
                  <div className="w-12 h-12 bg-warm-brown/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-warm-brown font-semibold text-lg">
                      {current.name[0]}
                    </span>
                  </div>
                  <p className="font-heading text-lg font-semibold text-text-primary">
                    {current.name}
                  </p>
                  <p className="text-text-muted text-sm">{current.role}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prev}
                className="p-2 rounded-full border border-border hover:bg-beige transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={18} className="text-text-secondary" />
              </button>

              {/* Dots */}
              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentIndex
                        ? "bg-warm-brown w-6"
                        : "bg-beige-dark hover:bg-text-muted"
                    }`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="p-2 rounded-full border border-border hover:bg-beige transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight size={18} className="text-text-secondary" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
