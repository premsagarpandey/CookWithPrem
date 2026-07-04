// ============================================
// CookWithPrem — App Constants
// ============================================

export const APP_NAME = "CookWithPrem";
export const APP_TAGLINE = "Step-by-Step Recipes by Prem Sagar Pandey";
export const APP_DESCRIPTION =
  "Learn cooking one step at a time with CookWithPrem. Discover detailed step-by-step recipes, cooking tips, and tutorials by Prem Sagar Pandey.";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://cookwithprem.com";

export const NAV_ITEMS = [
  { label: "Home", href: "/", requiresAuth: false },
  { label: "Recipes", href: "/recipes", requiresAuth: true },
  { label: "Categories", href: "/categories", requiresAuth: true },
  { label: "About", href: "/about", requiresAuth: false },
  { label: "Contact", href: "/contact", requiresAuth: false },
] as const;

export const CATEGORIES = [
  { name: "Breakfast", slug: "breakfast" },
  { name: "Lunch", slug: "lunch" },
  { name: "Dinner", slug: "dinner" },
  { name: "Snacks", slug: "snacks" },
  { name: "Desserts", slug: "desserts" },
  { name: "Indian", slug: "indian" },
  { name: "Chinese", slug: "chinese" },
  { name: "Italian", slug: "italian" },
  { name: "South Indian", slug: "south-indian" },
  { name: "Street Food", slug: "street-food" },
  { name: "Healthy Food", slug: "healthy-food" },
  { name: "Vegetarian", slug: "vegetarian" },
] as const;

export const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"] as const;

export const CUISINE_OPTIONS = [
  "Indian",
  "Chinese",
  "Italian",
  "South Indian",
  "Continental",
  "Mexican",
  "Thai",
  "Japanese",
] as const;

export const COOK_TIME_OPTIONS = [
  { label: "Under 15 min", value: "15" },
  { label: "Under 30 min", value: "30" },
  { label: "Under 60 min", value: "60" },
  { label: "60+ min", value: "61" },
] as const;

export const SOCIAL_LINKS = {
  youtube: "https://youtube.com/@cookwithprem",
  instagram: "https://instagram.com/cookwithprem",
  twitter: "https://twitter.com/cookwithprem",
  facebook: "https://facebook.com/cookwithprem",
} as const;

export const LOGIN_PROMPT_MESSAGE =
  "Please sign in to unlock all recipes and start cooking with CookWithPrem.";
