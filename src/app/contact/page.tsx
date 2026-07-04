"use client";

// ============================================
// CookWithPrem — Contact Page
// ============================================

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  Send,
  CheckCircle,
  MessageCircle,
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
import { contactSchema, type ContactFormData } from "@/lib/validators";
import { submitContactMessage } from "@/lib/firebase/firestore";
import { sanitizeText } from "@/lib/utils";
import { SOCIAL_LINKS } from "@/lib/constants";

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      await submitContactMessage({
        name: sanitizeText(data.name),
        email: data.email,
        subject: sanitizeText(data.subject),
        message: sanitizeText(data.message),
      });
      setIsSubmitted(true);
      reset();
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error("Error submitting contact form:", error);
    }
  };

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
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Get in Touch
            </h1>
            <p className="text-text-secondary text-lg">
              Have a question, suggestion, or recipe request? We&apos;d love to
              hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-white">
        <div className="container-custom mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-5xl mx-auto">
            {/* Contact Form */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-sage/10 rounded-[var(--radius-xl)] p-12 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        damping: 15,
                        delay: 0.2,
                      }}
                    >
                      <CheckCircle
                        size={64}
                        className="text-sage mx-auto mb-4"
                      />
                    </motion.div>
                    <h3 className="font-heading text-2xl font-bold text-text-primary mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-text-secondary">
                      Thank you for reaching out. We&apos;ll get back to you
                      soon.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label
                          htmlFor="contact-name"
                          className="block text-sm font-medium text-text-primary mb-2"
                        >
                          Your Name
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          placeholder="John Doe"
                          className="input-base"
                          {...register("name")}
                        />
                        {errors.name && (
                          <p className="text-error text-xs mt-1">
                            {errors.name.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="contact-email"
                          className="block text-sm font-medium text-text-primary mb-2"
                        >
                          Email Address
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          placeholder="john@example.com"
                          className="input-base"
                          {...register("email")}
                        />
                        {errors.email && (
                          <p className="text-error text-xs mt-1">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-subject"
                        className="block text-sm font-medium text-text-primary mb-2"
                      >
                        Subject
                      </label>
                      <input
                        id="contact-subject"
                        type="text"
                        placeholder="Recipe Request, Feedback, etc."
                        className="input-base"
                        {...register("subject")}
                      />
                      {errors.subject && (
                        <p className="text-error text-xs mt-1">
                          {errors.subject.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="contact-message"
                        className="block text-sm font-medium text-text-primary mb-2"
                      >
                        Message
                      </label>
                      <textarea
                        id="contact-message"
                        rows={6}
                        placeholder="Tell us what's on your mind..."
                        className="input-base resize-none"
                        {...register("message")}
                      />
                      {errors.message && (
                        <p className="text-error text-xs mt-1">
                          {errors.message.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary w-full sm:w-auto disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send size={16} />
                          Send Message
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              className="lg:col-span-2 space-y-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {/* Email */}
              <div className="bg-cream rounded-[var(--radius-lg)] p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-warm-brown/10 rounded-[var(--radius-md)] flex items-center justify-center">
                    <Mail size={18} className="text-warm-brown" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-text-primary">
                    Email Us
                  </h3>
                </div>
                <a
                  href="mailto:hello@cookwithprem.com"
                  className="text-warm-brown hover:underline text-sm"
                >
                  hello@cookwithprem.com
                </a>
              </div>

              {/* Social */}
              <div className="bg-cream rounded-[var(--radius-lg)] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-warm-brown/10 rounded-[var(--radius-md)] flex items-center justify-center">
                    <MessageCircle size={18} className="text-warm-brown" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-text-primary">
                    Follow Us
                  </h3>
                </div>
                <div className="space-y-3">
                  <a
                    href={SOCIAL_LINKS.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-text-secondary hover:text-warm-brown transition-colors text-sm"
                  >
                    <YoutubeIcon className="w-[18px] h-[18px] shrink-0" />
                    YouTube
                  </a>
                  <a
                    href={SOCIAL_LINKS.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-text-secondary hover:text-warm-brown transition-colors text-sm"
                  >
                    <InstagramIcon className="w-[18px] h-[18px] shrink-0" />
                    Instagram
                  </a>
                  <a
                    href={SOCIAL_LINKS.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-text-secondary hover:text-warm-brown transition-colors text-sm"
                  >
                    <TwitterIcon className="w-[18px] h-[18px] shrink-0" />
                    Twitter
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
