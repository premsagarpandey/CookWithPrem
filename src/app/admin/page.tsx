"use client";

// ============================================
// CookWithPrem — Admin Dashboard
// ============================================

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  UtensilsCrossed,
  Users,
  MessageCircle,
  Mail,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import {
  getRecipes,
  getAllUsers,
  getAllComments,
  getContactMessages,
  getNewsletterSubscribers,
} from "@/lib/firebase/firestore";

interface Stats {
  recipes: number;
  users: number;
  comments: number;
  messages: number;
  subscribers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    recipes: 0,
    users: 0,
    comments: 0,
    messages: 0,
    subscribers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [recipes, users, comments, messages, subscribers] =
          await Promise.all([
            getRecipes(),
            getAllUsers(),
            getAllComments(),
            getContactMessages(),
            getNewsletterSubscribers(),
          ]);
        setStats({
          recipes: recipes.length,
          users: users.length,
          comments: comments.length,
          messages: messages.length,
          subscribers: subscribers.length,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Total Recipes",
      value: stats.recipes,
      icon: UtensilsCrossed,
      color: "bg-warm-brown/10 text-warm-brown",
      href: "/admin/recipes",
    },
    {
      label: "Registered Users",
      value: stats.users,
      icon: Users,
      color: "bg-sage/10 text-sage-dark",
      href: "/admin/users",
    },
    {
      label: "Comments",
      value: stats.comments,
      icon: MessageCircle,
      color: "bg-amber-50 text-amber-700",
      href: "/admin/comments",
    },
    {
      label: "Contact Messages",
      value: stats.messages,
      icon: Mail,
      color: "bg-blue-50 text-blue-700",
      href: "/admin/messages",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-text-primary">
            Dashboard
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Welcome to the admin panel.
          </p>
        </div>
        <Link
          href="/admin/recipes/new"
          className="btn-primary text-sm"
        >
          <Plus size={16} />
          Add Recipe
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={stat.href}
                className="block bg-white rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center ${stat.color}`}
                  >
                    <Icon size={20} />
                  </div>
                  <ArrowUpRight
                    size={16}
                    className="text-text-muted group-hover:text-text-primary transition-colors"
                  />
                </div>
                <p className="text-2xl font-bold text-text-primary">
                  {loading ? "—" : stat.value}
                </p>
                <p className="text-sm text-text-muted mt-1">{stat.label}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-soft)]">
        <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link
            href="/admin/recipes/new"
            className="p-4 bg-cream rounded-[var(--radius-md)] hover:bg-beige transition-colors text-sm font-medium text-text-primary"
          >
            ➕ Add New Recipe
          </Link>
          <Link
            href="/admin/categories"
            className="p-4 bg-cream rounded-[var(--radius-md)] hover:bg-beige transition-colors text-sm font-medium text-text-primary"
          >
            📂 Manage Categories
          </Link>
          <Link
            href="/admin/messages"
            className="p-4 bg-cream rounded-[var(--radius-md)] hover:bg-beige transition-colors text-sm font-medium text-text-primary"
          >
            📬 View Messages
          </Link>
        </div>
      </div>
    </div>
  );
}
