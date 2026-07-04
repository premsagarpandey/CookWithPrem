"use client";

// ============================================
// CookWithPrem — Protected Route Wrapper
// ============================================

import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, setShowLoginModal } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      setShowLoginModal(true);
    }
  }, [user, loading, setShowLoginModal]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-warm-brown/20 border-t-warm-brown rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-cream">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-warm-brown/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="font-heading text-2xl font-bold text-text-primary mb-3">
            Sign In Required
          </h2>
          <p className="text-text-secondary mb-6">
            Please sign in to unlock all recipes and start cooking with
            CookWithPrem.
          </p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="btn-primary"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
