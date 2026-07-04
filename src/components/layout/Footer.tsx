"use client";

// ============================================
// CookWithPrem — Footer Component
// ============================================

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChefHat,
  Send,
  Heart,
} from "lucide-react";

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.002 3.002 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  APP_NAME,
  APP_TAGLINE,
  CATEGORIES,
  SOCIAL_LINKS,
} from "@/lib/constants";
import { subscribeNewsletter } from "@/lib/firebase/firestore";
import {
  newsletterSchema,
  type NewsletterFormData,
} from "@/lib/validators";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Recipes", href: "/recipes" },
  { label: "Categories", href: "/categories" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
];

export default function Footer() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribeError, setSubscribeError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubscribe = async (data: NewsletterFormData) => {
    setSubscribeError("");
    try {
      await subscribeNewsletter(data.email);
      setIsSubscribed(true);
      reset();
      setTimeout(() => setIsSubscribed(false), 5000);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Subscription failed";
      if (message.includes("Already subscribed")) {
        setSubscribeError("You're already subscribed!");
      } else {
        setSubscribeError(message);
      }
    }
  };

  return (
    <footer className="bg-cream border-t border-border-light">
      {/* Newsletter Section */}
      <div className="bg-warm-brown text-white">
        <div className="container-custom mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="font-heading text-2xl md:text-3xl mb-3">
              Get Fresh Recipes Weekly
            </h3>
            <p className="text-white/80 mb-6">
              Subscribe to our newsletter and never miss a new recipe.
            </p>

            {isSubscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 text-white"
              >
                <Heart size={20} className="fill-current" />
                <span className="font-medium">Thank you for subscribing!</span>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubscribe)}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <div className="flex-1">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 rounded-[var(--radius-full)] bg-white/15 text-white placeholder:text-white/60 border border-white/20 focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-white/80 text-xs mt-1 text-left pl-4">
                      {errors.email.message}
                    </p>
                  )}
                  {subscribeError && (
                    <p className="text-white/80 text-xs mt-1 text-left pl-4">
                      {subscribeError}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-white text-warm-brown font-semibold rounded-[var(--radius-full)] hover:bg-cream transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send size={16} />
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 mb-4 group"
            >
              <ChefHat
                size={28}
                className="text-warm-brown group-hover:rotate-12 transition-transform duration-300"
              />
              <span className="font-heading text-xl font-bold text-text-primary">
                {APP_NAME}
              </span>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              {APP_TAGLINE}. Learn cooking one step at a time with easy-to-follow
              recipes and tutorials.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href={SOCIAL_LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-beige hover:bg-warm-brown hover:text-white text-text-secondary transition-all duration-200"
                aria-label="YouTube"
              >
                <YoutubeIcon className="w-[18px] h-[18px]" />
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-beige hover:bg-warm-brown hover:text-white text-text-secondary transition-all duration-200"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-[18px] h-[18px]" />
              </a>
              <a
                href={SOCIAL_LINKS.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-beige hover:bg-warm-brown hover:text-white text-text-secondary transition-all duration-200"
                aria-label="Twitter"
              >
                <TwitterIcon className="w-[18px] h-[18px]" />
              </a>
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-beige hover:bg-warm-brown hover:text-white text-text-secondary transition-all duration-200"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-[18px] h-[18px]" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-text-primary mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-secondary hover:text-warm-brown transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-secondary hover:text-warm-brown transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-text-primary mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5">
              {CATEGORIES.slice(0, 8).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="text-text-secondary hover:text-warm-brown transition-colors text-sm"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-text-primary mb-4">
              Get in Touch
            </h4>
            <div className="space-y-3 text-sm text-text-secondary">
              <p>
                Have a question or suggestion?
              </p>
              <p>
                <a
                  href="mailto:hello@cookwithprem.com"
                  className="hover:text-warm-brown transition-colors"
                >
                  hello@cookwithprem.com
                </a>
              </p>
              <Link
                href="/contact"
                className="inline-block mt-2 text-warm-brown font-medium hover:underline"
              >
                Contact Us →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border-light">
        <div className="container-custom mx-auto px-4 md:px-6 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-text-muted">
            <p>
              © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
            <p className="flex items-center gap-1">
              Made with <Heart size={14} className="text-error fill-current" />{" "}
              by Prem Sagar Pandey
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
