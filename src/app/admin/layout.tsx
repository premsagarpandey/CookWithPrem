"use client";

// ============================================
// CookWithPrem — Admin Layout
// ============================================

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChefHat,
  LayoutDashboard,
  UtensilsCrossed,
  Grid3X3,
  Users,
  MessageCircle,
  Mail,
  Newspaper,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";
import AdminGuard from "@/components/auth/AdminGuard";

const adminNavItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Recipes", href: "/admin/recipes", icon: UtensilsCrossed },
  { label: "Categories", href: "/admin/categories", icon: Grid3X3 },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Comments", href: "/admin/comments", icon: MessageCircle },
  { label: "Messages", href: "/admin/messages", icon: Mail },
  { label: "Newsletter", href: "/admin/newsletter", icon: Newspaper },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="flex min-h-[calc(100vh-5rem)]">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex flex-col w-64 bg-cream border-r border-border-light">
          <div className="p-6 border-b border-border-light">
            <div className="flex items-center gap-2">
              <ChefHat size={24} className="text-warm-brown" />
              <span className="font-heading text-lg font-bold text-text-primary">
                Admin Panel
              </span>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-warm-brown text-white"
                      : "text-text-secondary hover:bg-beige hover:text-text-primary"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-border-light">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Website
            </Link>
          </div>
        </aside>

        {/* Mobile Sidebar Toggle */}
        <div className="lg:hidden fixed bottom-4 right-4 z-30">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-12 h-12 bg-warm-brown text-white rounded-full shadow-lg flex items-center justify-center"
            aria-label="Toggle admin menu"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-20">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-cream shadow-xl">
              <div className="p-6 border-b border-border-light flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ChefHat size={24} className="text-warm-brown" />
                  <span className="font-heading text-lg font-bold">Admin</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-warm-brown text-white"
                          : "text-text-secondary hover:bg-beige"
                      }`}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 bg-beige/30 overflow-auto">
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
    </AdminGuard>
  );
}
