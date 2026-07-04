"use client";

// ============================================
// CookWithPrem — Recipe Detail Page
// ============================================

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  Users,
  Flame,
  Bookmark,
  BookmarkCheck,
  Printer,
  Share2,
  ChevronRight,
  Star,
  Send,
  ChefHat,
  UtensilsCrossed,
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RecipeCard from "@/components/recipe/RecipeCard";
import { useAuth } from "@/contexts/AuthContext";
import {
  getRecipeBySlug,
  getRelatedRecipes,
  getRecipeComments,
  addComment,
  addOrUpdateRating,
  getUserRating,
  addBookmark,
  removeBookmark,
  isBookmarked,
} from "@/lib/firebase/firestore";
import { formatTime, sanitizeText } from "@/lib/utils";
import { commentSchema, type CommentFormData } from "@/lib/validators";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Recipe, Comment as CommentType } from "@/types";

export default function RecipeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { user, userProfile } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [related, setRelated] = useState<Recipe[]>([]);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const recipeData = await getRecipeBySlug(slug);
        if (recipeData) {
          setRecipe(recipeData);

          const [relatedData, commentsData] = await Promise.all([
            getRelatedRecipes(recipeData.category, recipeData.id),
            getRecipeComments(recipeData.id),
          ]);
          setRelated(relatedData);
          setComments(commentsData);

          if (user) {
            const [isBookmarkedResult, rating] = await Promise.all([
              isBookmarked(user.uid, recipeData.id),
              getUserRating(user.uid, recipeData.id),
            ]);
            setBookmarked(isBookmarkedResult);
            setUserRating(rating);
          }
        }
      } catch (error) {
        console.error("Error fetching recipe:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, user]);

  const handleBookmark = async () => {
    if (!user || !recipe) return;
    try {
      if (bookmarked) {
        await removeBookmark(user.uid, recipe.id);
        setBookmarked(false);
      } else {
        await addBookmark(user.uid, recipe.id);
        setBookmarked(true);
      }
    } catch (error) {
      console.error("Bookmark error:", error);
    }
  };

  const handleRating = async (score: number) => {
    if (!user || !recipe) return;
    try {
      await addOrUpdateRating(user.uid, recipe.id, score);
      setUserRating(score);
    } catch (error) {
      console.error("Rating error:", error);
    }
  };

  const handleComment = async (data: CommentFormData) => {
    if (!user || !recipe || !userProfile) return;
    try {
      await addComment({
        userId: user.uid,
        recipeId: recipe.id,
        text: sanitizeText(data.text),
        userName: userProfile.displayName || "User",
        userPhoto: userProfile.photoURL || "",
      });
      const updatedComments = await getRecipeComments(recipe.id);
      setComments(updatedComments);
      reset();
    } catch (error) {
      console.error("Comment error:", error);
    }
  };

  const handlePrint = () => window.print();
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-warm-brown/20 border-t-warm-brown rounded-full animate-spin" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!recipe) {
    return (
      <ProtectedRoute>
        <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
          <div>
            <span className="text-5xl block mb-4">🍽️</span>
            <h2 className="font-heading text-2xl font-bold text-text-primary mb-2">
              Recipe Not Found
            </h2>
            <p className="text-text-secondary mb-6">
              The recipe you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link href="/recipes" className="btn-primary">
              Browse Recipes
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      {/* Dynamic SEO Tags */}
      <title>{`${recipe.title} Recipe — CookWithPrem`}</title>
      <meta name="description" content={recipe.description} />
      <meta property="og:title" content={`${recipe.title} Recipe — CookWithPrem`} />
      <meta property="og:description" content={recipe.description} />
      <meta property="og:image" content={recipe.heroImage} />
      <meta name="twitter:title" content={`${recipe.title} Recipe — CookWithPrem`} />
      <meta name="twitter:description" content={recipe.description} />
      <meta name="twitter:image" content={recipe.heroImage} />
      <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL || "https://cookwithprem.com"}/recipes/${recipe.slug}`} />

      {/* Structured Data (JSON-LD) for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Recipe",
            "name": recipe.title,
            "image": recipe.heroImage,
            "description": recipe.description,
            "prepTime": `PT${recipe.prepTime}M`,
            "cookTime": `PT${recipe.cookTime}M`,
            "totalTime": `PT${recipe.totalTime}M`,
            "recipeYield": `${recipe.servings} servings`,
            "recipeCategory": recipe.category,
            "recipeCuisine": recipe.cuisine,
            "nutrition": {
              "@type": "NutritionInformation",
              "calories": `${recipe.nutrition?.calories || recipe.calories} calories`,
            },
            "recipeIngredient": recipe.ingredients.map(
              (i) => `${i.quantity} ${i.unit} ${i.name}`.trim()
            ),
            "recipeInstructions": recipe.steps.map((s, idx) => ({
              "@type": "HowToStep",
              "position": idx + 1,
              "text": s.description,
              "name": s.title || `Step ${idx + 1}`,
              "url": s.imageUrl ? s.imageUrl : undefined,
            })),
            "aggregateRating": recipe.totalRatings > 0 ? {
              "@type": "AggregateRating",
              "ratingValue": recipe.averageRating,
              "ratingCount": recipe.totalRatings,
            } : undefined,
            "author": {
              "@type": "Person",
              "name": "Prem Sagar Pandey",
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://cookwithprem.com"}`
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Recipes",
                "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://cookwithprem.com"}/recipes`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": recipe.title,
                "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://cookwithprem.com"}/recipes/${recipe.slug}`
              }
            ]
          }),
        }}
      />

      {/* Breadcrumb */}
      <div className="bg-cream py-3">
        <div className="container-custom mx-auto px-4 md:px-6">
          <nav className="flex items-center gap-2 text-sm text-text-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-warm-brown transition-colors">
              Home
            </Link>
            <ChevronRight size={14} />
            <Link href="/recipes" className="hover:text-warm-brown transition-colors">
              Recipes
            </Link>
            <ChevronRight size={14} />
            <span className="text-text-primary font-medium truncate">
              {recipe.title}
            </span>
          </nav>
        </div>
      </div>

      <article className="section-padding bg-white">
        <div className="container-custom mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Hero Image */}
            <motion.div
              className="relative aspect-video rounded-[var(--radius-xl)] overflow-hidden mb-8 shadow-[var(--shadow-card)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {recipe.heroImage ? (
                <Image
                  src={recipe.heroImage}
                  alt={recipe.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-beige flex items-center justify-center">
                  <ChefHat size={64} className="text-text-muted" />
                </div>
              )}
            </motion.div>

            {/* Title & Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-warm-brown/10 text-warm-brown text-xs font-medium rounded-[var(--radius-full)]">
                      {recipe.category}
                    </span>
                    <span className="px-3 py-1 bg-sage/10 text-sage-dark text-xs font-medium rounded-[var(--radius-full)]">
                      {recipe.cuisine}
                    </span>
                    {recipe.isVeg && (
                      <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-[var(--radius-full)]">
                        Vegetarian
                      </span>
                    )}
                  </div>
                  <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
                    {recipe.title}
                  </h1>
                </div>
              </div>

              <p className="text-text-secondary text-lg leading-relaxed mb-6">
                {recipe.description}
              </p>

              {/* Meta Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { icon: Clock, label: "Prep Time", value: formatTime(recipe.prepTime) },
                  { icon: Clock, label: "Cook Time", value: formatTime(recipe.cookTime) },
                  { icon: Users, label: "Servings", value: `${recipe.servings}` },
                  { icon: Flame, label: "Difficulty", value: recipe.difficulty },
                ].map((meta) => (
                  <div
                    key={meta.label}
                    className="bg-cream rounded-[var(--radius-md)] p-3 text-center"
                  >
                    <meta.icon size={18} className="text-warm-brown mx-auto mb-1" />
                    <p className="text-xs text-text-muted">{meta.label}</p>
                    <p className="text-sm font-semibold text-text-primary">{meta.value}</p>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mb-10 flex-wrap">
                <button
                  onClick={handleBookmark}
                  className={`flex items-center gap-2 px-4 py-2 rounded-[var(--radius-full)] text-sm font-medium transition-all ${
                    bookmarked
                      ? "bg-warm-brown text-white"
                      : "border border-border text-text-secondary hover:bg-beige"
                  }`}
                >
                  {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  {bookmarked ? "Saved" : "Save"}
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 border border-border rounded-[var(--radius-full)] text-sm font-medium text-text-secondary hover:bg-beige transition-colors"
                >
                  <Printer size={16} />
                  Print
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 border border-border rounded-[var(--radius-full)] text-sm font-medium text-text-secondary hover:bg-beige transition-colors"
                >
                  <Share2 size={16} />
                  Share
                </button>
              </div>
            </motion.div>

            {/* Ingredients */}
            <motion.section
              className="mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <UtensilsCrossed size={22} className="text-warm-brown" />
                Ingredients
              </h2>
              <div className="bg-cream rounded-[var(--radius-lg)] p-6">
                <ul className="space-y-3">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-warm-brown flex-shrink-0" />
                      <span className="text-text-secondary">
                        <span className="font-medium text-text-primary">
                          {ing.quantity} {ing.unit}
                        </span>{" "}
                        {ing.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.section>

            {/* Kitchen Tools */}
            {recipe.tools.length > 0 && (
              <motion.section
                className="mb-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-2xl font-bold text-text-primary mb-4">
                  Kitchen Tools Needed
                </h2>
                <div className="flex flex-wrap gap-2">
                  {recipe.tools.map((tool, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-beige rounded-[var(--radius-full)] text-sm text-text-secondary"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Step-by-Step Instructions */}
            <motion.section
              className="mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-2xl font-bold text-text-primary mb-6">
                Step-by-Step Instructions
              </h2>
              <div className="space-y-6">
                {recipe.steps.map((step, i) => (
                  <motion.div
                    key={i}
                    className="flex gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-warm-brown text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {step.stepNumber}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary mb-1">
                        {step.title}
                      </h3>
                      <p className="text-text-secondary leading-relaxed">
                        {step.description}
                      </p>
                      {step.imageUrl && (
                        <div className="mt-3 relative aspect-video rounded-[var(--radius-md)] overflow-hidden max-w-md">
                          <Image
                            src={step.imageUrl}
                            alt={`Step ${step.stepNumber}: ${step.title}`}
                            fill
                            sizes="400px"
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Nutrition */}
            {recipe.nutrition && (
              <motion.section
                className="mb-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-2xl font-bold text-text-primary mb-4">
                  Nutrition Information
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {[
                    { label: "Calories", value: `${recipe.nutrition.calories} kcal` },
                    { label: "Protein", value: recipe.nutrition.protein },
                    { label: "Carbs", value: recipe.nutrition.carbs },
                    { label: "Fat", value: recipe.nutrition.fat },
                    { label: "Fiber", value: recipe.nutrition.fiber },
                    { label: "Sugar", value: recipe.nutrition.sugar },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-cream rounded-[var(--radius-md)] p-3 text-center"
                    >
                      <p className="text-xs text-text-muted">{item.label}</p>
                      <p className="text-sm font-semibold text-text-primary mt-1">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* FAQs */}
            {recipe.faqs.length > 0 && (
              <motion.section
                className="mb-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-2xl font-bold text-text-primary mb-4">
                  FAQs
                </h2>
                <div className="space-y-4">
                  {recipe.faqs.map((faq, i) => (
                    <details
                      key={i}
                      className="bg-cream rounded-[var(--radius-md)] p-4 group"
                    >
                      <summary className="font-medium text-text-primary cursor-pointer list-none flex items-center justify-between">
                        {faq.question}
                        <ChevronRight
                          size={16}
                          className="text-text-muted group-open:rotate-90 transition-transform"
                        />
                      </summary>
                      <p className="text-text-secondary mt-3 text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Rating */}
            <motion.section
              className="mb-10 bg-cream rounded-[var(--radius-lg)] p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="font-heading text-xl font-bold text-text-primary mb-2">
                Rate this Recipe
              </h3>
              <p className="text-text-muted text-sm mb-4">
                {userRating ? "Thanks for your rating!" : "How was this recipe?"}
              </p>
              <div className="flex items-center justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-2xl transition-transform hover:scale-110"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      size={28}
                      className={`${
                        star <= (hoverRating || userRating || 0)
                          ? "text-warm-brown-light fill-current"
                          : "text-beige-dark"
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
            </motion.section>

            {/* Comments */}
            <motion.section
              className="mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-2xl font-bold text-text-primary mb-6">
                Comments ({comments.length})
              </h2>

              {/* Comment Form */}
              <form
                onSubmit={handleSubmit(handleComment)}
                className="mb-8 flex gap-3"
              >
                <div className="flex-1">
                  <textarea
                    rows={3}
                    placeholder="Share your thoughts about this recipe..."
                    className="input-base resize-none"
                    {...register("text")}
                  />
                  {errors.text && (
                    <p className="text-error text-xs mt-1">{errors.text.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary self-end px-4 py-3"
                  aria-label="Submit comment"
                >
                  <Send size={16} />
                </button>
              </form>

              {/* Comment List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex gap-3 p-4 bg-cream rounded-[var(--radius-md)]"
                  >
                    <div className="w-9 h-9 rounded-full bg-warm-brown/10 flex items-center justify-center flex-shrink-0">
                      {comment.userPhoto ? (
                        <Image
                          src={comment.userPhoto}
                          alt={comment.userName || "User"}
                          width={36}
                          height={36}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-warm-brown text-sm font-semibold">
                          {comment.userName[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        {comment.userName}
                      </p>
                      <p className="text-text-secondary text-sm mt-1">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))}

                {comments.length === 0 && (
                  <p className="text-text-muted text-sm text-center py-6">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                )}
              </div>
            </motion.section>

            {/* Related Recipes */}
            {related.length > 0 && (
              <section>
                <h2 className="font-heading text-2xl font-bold text-text-primary mb-6">
                  Related Recipes
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {related.map((r, i) => (
                    <RecipeCard key={r.id} recipe={r} index={i} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </article>
    </ProtectedRoute>
  );
}
