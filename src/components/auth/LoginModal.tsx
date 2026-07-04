"use client";

// ============================================
// CookWithPrem — Login Modal
// ============================================

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  sendPasswordReset,
} from "@/lib/firebase/auth";
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  type LoginFormData,
  type SignupFormData,
  type ForgotPasswordFormData,
} from "@/lib/validators";
import { LOGIN_PROMPT_MESSAGE } from "@/lib/constants";

type ModalView = "login" | "signup" | "forgot";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    {...props}
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export default function LoginModal() {
  const { showLoginModal, setShowLoginModal } = useAuth();
  const [view, setView] = useState<ModalView>("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const forgotForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const resetState = () => {
    setError("");
    setSuccess("");
    setShowPassword(false);
    loginForm.reset();
    signupForm.reset();
    forgotForm.reset();
  };

  const handleClose = () => {
    setShowLoginModal(false);
    setView("login");
    resetState();
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    try {
      await signInWithGoogle();
      handleClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google sign-in failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setError("");
    try {
      await signInWithEmail(data.email, data.password);
      handleClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      if (message.includes("invalid-credential")) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    setIsLoading(true);
    setError("");
    try {
      await signUpWithEmail(data.email, data.password, data.displayName);
      setSuccess("Account created! Please check your email for verification.");
      setTimeout(() => {
        setView("login");
        resetState();
      }, 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Signup failed";
      if (message.includes("email-already-in-use")) {
        setError("An account with this email already exists.");
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError("");
    try {
      await sendPasswordReset(data.email);
      setSuccess("Password reset email sent! Check your inbox.");
      setTimeout(() => {
        setView("login");
        resetState();
      }, 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send reset email";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const switchView = (newView: ModalView) => {
    resetState();
    setView(newView);
  };

  return (
    <AnimatePresence>
      {showLoginModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-modal)] overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-beige transition-colors"
              aria-label="Close login modal"
            >
              <X size={20} className="text-text-muted" />
            </button>

            {/* Header */}
            <div className="bg-cream px-8 pt-10 pb-6 text-center">
              <motion.h2
                className="font-heading text-2xl md:text-3xl text-text-primary mb-2"
                key={view}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {view === "login" && "Welcome Back"}
                {view === "signup" && "Join CookWithPrem"}
                {view === "forgot" && "Reset Password"}
              </motion.h2>
              <p className="text-text-secondary text-sm leading-relaxed max-w-xs mx-auto">
                {view === "login" && LOGIN_PROMPT_MESSAGE}
                {view === "signup" &&
                  "Create your account and unlock all recipes."}
                {view === "forgot" &&
                  "Enter your email and we'll send you a reset link."}
              </p>
            </div>

            {/* Body */}
            <div className="px-8 py-6">
              {/* Error / Success Messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 rounded-[var(--radius-md)] bg-red-50 text-error text-sm"
                  >
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 rounded-[var(--radius-md)] bg-green-50 text-success text-sm"
                  >
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Login View */}
              {view === "login" && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  {/* Google Sign In */}
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-border rounded-[var(--radius-md)] hover:bg-beige transition-colors font-medium text-text-primary disabled:opacity-50"
                  >
                    <GoogleIcon className="w-5 h-5 shrink-0" />
                    Continue with Google
                  </button>

                  <div className="flex items-center gap-4 my-5">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-text-muted text-xs uppercase tracking-wider">
                      or
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <form
                    onSubmit={loginForm.handleSubmit(handleEmailLogin)}
                    className="space-y-4"
                  >
                    <div>
                      <div className="relative">
                        <Mail
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                        />
                        <input
                          type="email"
                          placeholder="Email address"
                          className="input-base pl-10"
                          {...loginForm.register("email")}
                        />
                      </div>
                      {loginForm.formState.errors.email && (
                        <p className="text-error text-xs mt-1">
                          {loginForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="relative">
                        <Lock
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                        />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          className="input-base pl-10 pr-10"
                          {...loginForm.register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                      {loginForm.formState.errors.password && (
                        <p className="text-error text-xs mt-1">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => switchView("forgot")}
                        className="text-warm-brown text-sm hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary w-full disabled:opacity-50"
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </button>
                  </form>

                  <p className="text-center text-sm text-text-secondary mt-5">
                    Don&apos;t have an account?{" "}
                    <button
                      onClick={() => switchView("signup")}
                      className="text-warm-brown font-semibold hover:underline"
                    >
                      Sign up
                    </button>
                  </p>
                </motion.div>
              )}

              {/* Signup View */}
              {view === "signup" && (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-border rounded-[var(--radius-md)] hover:bg-beige transition-colors font-medium text-text-primary disabled:opacity-50"
                  >
                    <GoogleIcon className="w-5 h-5 shrink-0" />
                    Continue with Google
                  </button>

                  <div className="flex items-center gap-4 my-5">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-text-muted text-xs uppercase tracking-wider">
                      or
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <form
                    onSubmit={signupForm.handleSubmit(handleSignup)}
                    className="space-y-4"
                  >
                    <div>
                      <div className="relative">
                        <User
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                        />
                        <input
                          type="text"
                          placeholder="Full name"
                          className="input-base pl-10"
                          {...signupForm.register("displayName")}
                        />
                      </div>
                      {signupForm.formState.errors.displayName && (
                        <p className="text-error text-xs mt-1">
                          {signupForm.formState.errors.displayName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="relative">
                        <Mail
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                        />
                        <input
                          type="email"
                          placeholder="Email address"
                          className="input-base pl-10"
                          {...signupForm.register("email")}
                        />
                      </div>
                      {signupForm.formState.errors.email && (
                        <p className="text-error text-xs mt-1">
                          {signupForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="relative">
                        <Lock
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                        />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          className="input-base pl-10 pr-10"
                          {...signupForm.register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                      {signupForm.formState.errors.password && (
                        <p className="text-error text-xs mt-1">
                          {signupForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="relative">
                        <Lock
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                        />
                        <input
                          type="password"
                          placeholder="Confirm password"
                          className="input-base pl-10"
                          {...signupForm.register("confirmPassword")}
                        />
                      </div>
                      {signupForm.formState.errors.confirmPassword && (
                        <p className="text-error text-xs mt-1">
                          {signupForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary w-full disabled:opacity-50"
                    >
                      {isLoading ? "Creating account..." : "Create Account"}
                    </button>
                  </form>

                  <p className="text-center text-sm text-text-secondary mt-5">
                    Already have an account?{" "}
                    <button
                      onClick={() => switchView("login")}
                      className="text-warm-brown font-semibold hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </motion.div>
              )}

              {/* Forgot Password View */}
              {view === "forgot" && (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <form
                    onSubmit={forgotForm.handleSubmit(handleForgotPassword)}
                    className="space-y-4"
                  >
                    <div>
                      <div className="relative">
                        <Mail
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                        />
                        <input
                          type="email"
                          placeholder="Email address"
                          className="input-base pl-10"
                          {...forgotForm.register("email")}
                        />
                      </div>
                      {forgotForm.formState.errors.email && (
                        <p className="text-error text-xs mt-1">
                          {forgotForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary w-full disabled:opacity-50"
                    >
                      {isLoading ? "Sending..." : "Send Reset Link"}
                    </button>
                  </form>

                  <p className="text-center text-sm text-text-secondary mt-5">
                    Remember your password?{" "}
                    <button
                      onClick={() => switchView("login")}
                      className="text-warm-brown font-semibold hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
