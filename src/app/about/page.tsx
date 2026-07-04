"use client";

// ============================================
// CookWithPrem — About Page
// ============================================

import { motion } from "framer-motion";
import { Heart, BookOpen, Users, Award } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Passion for Cooking",
    description:
      "Every recipe is crafted with love and tested multiple times to ensure perfection.",
  },
  {
    icon: BookOpen,
    title: "Step-by-Step Learning",
    description:
      "Detailed instructions that make even the most complex recipes approachable for beginners.",
  },
  {
    icon: Users,
    title: "Community First",
    description:
      "Building a community of home cooks who support and inspire each other on their culinary journey.",
  },
  {
    icon: Award,
    title: "Quality Content",
    description:
      "Every recipe includes nutrition info, cooking tips, and beautiful visuals to guide you.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-cream py-16 md:py-24">
        <div className="container-custom mx-auto px-4 md:px-6">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-text-primary mb-6">
              About <span className="text-warm-brown">CookWithPrem</span>
            </h1>
            <p className="text-text-secondary text-lg leading-relaxed">
              A passion project by Prem Sagar Pandey, dedicated to making
              cooking accessible, enjoyable, and rewarding for everyone.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="section-padding bg-white">
        <div className="container-custom mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-6">
                The Story Behind CookWithPrem
              </h2>
              <div className="space-y-4 text-text-secondary leading-relaxed">
                <p>
                  Hi, I&apos;m <strong className="text-text-primary">Prem Sagar Pandey</strong>,
                  and CookWithPrem is my way of sharing the joy of cooking with the world.
                  I believe that everyone can cook delicious meals — all they need is the right
                  guidance and a bit of confidence.
                </p>
                <p>
                  Growing up, I was fascinated by the aromas and flavors coming from our kitchen.
                  That fascination turned into a passion, and over the years, I&apos;ve learned
                  that the best recipes are those that are shared. That&apos;s why I created
                  CookWithPrem — to provide detailed, step-by-step cooking tutorials that make
                  even the most complex dishes feel achievable.
                </p>
                <p>
                  Whether you&apos;re a complete beginner learning to boil water or an experienced
                  home cook looking for new inspiration, CookWithPrem has something for you.
                  Every recipe on this platform is personally tested and written with clear
                  instructions, helpful tips, and love.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="section-padding bg-warm-brown text-white">
        <div className="container-custom mx-auto px-4 md:px-6">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">
              Our Mission
            </h2>
            <p className="text-white/85 text-lg leading-relaxed">
              To help beginners learn cooking through easy-to-follow,
              step-by-step tutorials. We believe that cooking is not just about
              food — it&apos;s about creating memories, sharing love, and
              nourishing the people you care about.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-beige">
        <div className="container-custom mx-auto px-4 md:px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-3">
              What We Stand For
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  className="bg-white p-6 rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="w-10 h-10 bg-warm-brown/10 rounded-[var(--radius-md)] flex items-center justify-center mb-4">
                    <Icon size={20} className="text-warm-brown" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-text-primary mb-2">
                    {value.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
