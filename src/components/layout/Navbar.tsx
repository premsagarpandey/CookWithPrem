"use client";

// ============================================
// CookWithPrem — Navbar Component
// ============================================

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  User,
  Menu,
  X,
  LogOut,
  Bookmark,
  ChefHat,
  Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { logOut } from "@/lib/firebase/auth";
import { NAV_ITEMS, APP_NAME } from "@/lib/constants";

export default function Navbar() {
  const pathname = usePathname();
  const { user, userProfile, isAdmin, setShowLoginModal } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [pathname]);

  const handleNavClick = (href: string, requiresAuth?: boolean) => {
    if (requiresAuth && !user) {
      setShowLoginModal(true);
      return;
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logOut();
      setIsProfileMenuOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-[var(--shadow-soft)]"
            : "bg-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 200 }}
      >
        <nav className="container-custom mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 group"
              aria-label="CookWithPrem Home"
            >
              <ChefHat
                size={28}
                className="text-warm-brown group-hover:rotate-12 transition-transform duration-300"
              />
              <span className="font-heading text-xl md:text-2xl font-bold text-text-primary">
                {APP_NAME}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                if (item.requiresAuth && !user) {
                  return (
                    <button
                      key={item.href}
                      onClick={() => setShowLoginModal(true)}
                      className={`relative px-4 py-2 text-sm font-medium rounded-[var(--radius-full)] transition-colors ${
                        isActive
                          ? "text-warm-brown"
                          : "text-text-secondary hover:text-text-primary hover:bg-beige"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-4 py-2 text-sm font-medium rounded-[var(--radius-full)] transition-colors ${
                      isActive
                        ? "text-warm-brown"
                        : "text-text-secondary hover:text-text-primary hover:bg-beige"
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-warm-brown rounded-full"
                        layoutId="navIndicator"
                        transition={{ type: "spring", damping: 20 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Right Section */}
            <div className="hidden md:flex items-center gap-2">
              {/* Search */}
              {user ? (
                <Link
                  href="/search"
                  className="p-2 rounded-full hover:bg-beige transition-colors text-text-secondary hover:text-text-primary"
                  aria-label="Search recipes"
                >
                  <Search size={20} />
                </Link>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="p-2 rounded-full hover:bg-beige transition-colors text-text-secondary hover:text-text-primary"
                  aria-label="Search recipes"
                >
                  <Search size={20} />
                </button>
              )}

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-full hover:bg-beige transition-colors"
                    aria-label="User menu"
                    aria-expanded={isProfileMenuOpen}
                  >
                    {userProfile?.photoURL ? (
                      <Image
                        src={userProfile.photoURL}
                        alt={userProfile.displayName || "User Profile"}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-warm-brown flex items-center justify-center text-white text-sm font-semibold">
                        {userProfile?.displayName?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                  </button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-elevated)] overflow-hidden py-2"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="px-4 py-3 border-b border-border-light">
                          <p className="text-sm font-semibold text-text-primary truncate">
                            {userProfile?.displayName || "User"}
                          </p>
                          <p className="text-xs text-text-muted truncate">
                            {user.email}
                          </p>
                        </div>

                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-beige hover:text-text-primary transition-colors"
                        >
                          <User size={16} />
                          My Profile
                        </Link>

                        <Link
                          href="/bookmarks"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-beige hover:text-text-primary transition-colors"
                        >
                          <Bookmark size={16} />
                          Saved Recipes
                        </Link>

                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-beige hover:text-text-primary transition-colors"
                          >
                            <Shield size={16} />
                            Admin Dashboard
                          </Link>
                        )}

                        <div className="border-t border-border-light mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-red-50 transition-colors w-full"
                          >
                            <LogOut size={16} />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="btn-primary text-sm py-2.5 px-5"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-[var(--radius-sm)] hover:bg-beige transition-colors"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-30 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/20"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              className="absolute top-16 left-0 right-0 bg-white shadow-[var(--shadow-elevated)] border-t border-border-light"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="py-4 px-6 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));

                  if (item.requiresAuth && !user) {
                    return (
                      <button
                        key={item.href}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setShowLoginModal(true);
                        }}
                        className={`block w-full text-left px-4 py-3 rounded-[var(--radius-md)] text-base font-medium transition-colors ${
                          isActive
                            ? "bg-cream text-warm-brown"
                            : "text-text-secondary hover:bg-beige"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => handleNavClick(item.href, item.requiresAuth)}
                      className={`block px-4 py-3 rounded-[var(--radius-md)] text-base font-medium transition-colors ${
                        isActive
                          ? "bg-cream text-warm-brown"
                          : "text-text-secondary hover:bg-beige"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}

                {user ? (
                  <>
                    <Link
                      href="/search"
                      className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] text-base font-medium text-text-secondary hover:bg-beige"
                    >
                      <Search size={18} />
                      Search Recipes
                    </Link>
                    <Link
                      href="/bookmarks"
                      className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] text-base font-medium text-text-secondary hover:bg-beige"
                    >
                      <Bookmark size={18} />
                      Saved Recipes
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] text-base font-medium text-text-secondary hover:bg-beige"
                    >
                      <User size={18} />
                      My Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] text-base font-medium text-text-secondary hover:bg-beige"
                      >
                        <Shield size={18} />
                        Admin Dashboard
                      </Link>
                    )}
                    <div className="border-t border-border-light mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] text-base font-medium text-error hover:bg-red-50 w-full"
                      >
                        <LogOut size={18} />
                        Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="border-t border-border-light mt-2 pt-4">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setShowLoginModal(true);
                      }}
                      className="btn-primary w-full"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click-away listener for profile dropdown */}
      {isProfileMenuOpen && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setIsProfileMenuOpen(false)}
        />
      )}
    </>
  );
}
