"use client";

// ============================================
// CookWithPrem — Profile Page
// ============================================

import { motion } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  Bookmark,
  ChefHat,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { logOut } from "@/lib/firebase/auth";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const { user, userProfile, isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <ProtectedRoute>
      <section className="bg-cream py-12 md:py-16">
        <div className="container-custom mx-auto px-4 md:px-6">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-3">
              My Profile
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto">
            {/* Profile Card */}
            <motion.div
              className="bg-cream rounded-[var(--radius-xl)] p-8 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {userProfile?.photoURL ? (
                    <Image
                      src={userProfile.photoURL}
                      alt={userProfile.displayName || "User Profile"}
                      width={96}
                      height={96}
                      className="rounded-full object-cover shadow-[var(--shadow-card)]"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-warm-brown flex items-center justify-center text-white text-3xl font-bold shadow-[var(--shadow-card)]">
                      {userProfile?.displayName?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="text-center sm:text-left flex-1">
                  <h2 className="font-heading text-2xl font-bold text-text-primary mb-1">
                    {userProfile?.displayName || "User"}
                  </h2>
                  {isAdmin && (
                    <span className="inline-block px-2 py-0.5 bg-warm-brown/10 text-warm-brown text-xs font-medium rounded-[var(--radius-full)] mb-2">
                      Admin
                    </span>
                  )}
                  <div className="space-y-1.5 text-sm text-text-secondary">
                    <p className="flex items-center gap-2 justify-center sm:justify-start">
                      <Mail size={14} />
                      {user?.email}
                    </p>
                    {userProfile?.createdAt && (
                      <p className="flex items-center gap-2 justify-center sm:justify-start">
                        <Calendar size={14} />
                        Member since {formatDate(userProfile.createdAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link
                href="/bookmarks"
                className="flex items-center gap-4 p-4 bg-cream rounded-[var(--radius-lg)] hover:bg-beige transition-colors group"
              >
                <div className="w-10 h-10 bg-warm-brown/10 rounded-[var(--radius-md)] flex items-center justify-center">
                  <Bookmark size={18} className="text-warm-brown" />
                </div>
                <div>
                  <p className="font-medium text-text-primary group-hover:text-warm-brown transition-colors">
                    Saved Recipes
                  </p>
                  <p className="text-sm text-text-muted">
                    {userProfile?.bookmarks?.length || 0} recipes bookmarked
                  </p>
                </div>
              </Link>

              <Link
                href="/recipes"
                className="flex items-center gap-4 p-4 bg-cream rounded-[var(--radius-lg)] hover:bg-beige transition-colors group"
              >
                <div className="w-10 h-10 bg-sage/10 rounded-[var(--radius-md)] flex items-center justify-center">
                  <ChefHat size={18} className="text-sage" />
                </div>
                <div>
                  <p className="font-medium text-text-primary group-hover:text-sage transition-colors">
                    Browse Recipes
                  </p>
                  <p className="text-sm text-text-muted">
                    Explore all available recipes
                  </p>
                </div>
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-4 p-4 bg-cream rounded-[var(--radius-lg)] hover:bg-beige transition-colors group"
                >
                  <div className="w-10 h-10 bg-warm-brown/10 rounded-[var(--radius-md)] flex items-center justify-center">
                    <User size={18} className="text-warm-brown" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary group-hover:text-warm-brown transition-colors">
                      Admin Dashboard
                    </p>
                    <p className="text-sm text-text-muted">
                      Manage recipes, users, and more
                    </p>
                  </div>
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-4 p-4 bg-red-50 rounded-[var(--radius-lg)] hover:bg-red-100 transition-colors group w-full"
              >
                <div className="w-10 h-10 bg-error/10 rounded-[var(--radius-md)] flex items-center justify-center">
                  <LogOut size={18} className="text-error" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-error">Sign Out</p>
                  <p className="text-sm text-error/60">
                    Log out of your account
                  </p>
                </div>
              </button>
            </motion.div>
          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
}
