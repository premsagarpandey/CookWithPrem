// ============================================
// CookWithPrem — TypeScript Type Definitions
// ============================================

import { Timestamp } from "firebase/firestore";

// ---------- User ----------
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: "user" | "admin";
  bookmarks: string[];
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// ---------- Recipe ----------
export interface Recipe {
  id: string;
  slug: string;
  title: string;
  description: string;
  heroImage: string;
  cookTime: number; // minutes
  prepTime: number; // minutes
  totalTime: number; // minutes
  difficulty: "Easy" | "Medium" | "Hard";
  servings: number;
  calories: number;
  cuisine: string;
  category: string;
  isVeg: boolean;
  isFeatured: boolean;
  ingredients: Ingredient[];
  tools: string[];
  steps: RecipeStep[];
  nutrition: NutritionInfo;
  faqs: FAQ[];
  tags: string[];
  averageRating: number;
  totalRatings: number;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface RecipeStep {
  stepNumber: number;
  title: string;
  description: string;
  imageUrl?: string;
}

export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

export interface NutritionInfo {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  sugar: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

// ---------- Category ----------
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  recipeCount: number;
  order: number;
}

// ---------- Bookmark ----------
export interface Bookmark {
  id: string;
  userId: string;
  recipeId: string;
  createdAt: Timestamp;
}

// ---------- Rating ----------
export interface Rating {
  id: string;
  userId: string;
  recipeId: string;
  score: number; // 1-5
  createdAt: Timestamp;
}

// ---------- Comment ----------
export interface Comment {
  id: string;
  userId: string;
  recipeId: string;
  text: string;
  userName: string;
  userPhoto: string;
  isApproved: boolean;
  createdAt: Timestamp;
}

// ---------- Contact Message ----------
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: Timestamp;
}

// ---------- Newsletter ----------
export interface NewsletterSubscriber {
  id: string;
  email: string;
  createdAt: Timestamp;
}

// ---------- Cooking Tip ----------
export interface CookingTip {
  title: string;
  description: string;
  icon: string;
}

// ---------- Testimonial ----------
export interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatarUrl: string;
  rating: number;
}

// ---------- Nav Item ----------
export interface NavItem {
  label: string;
  href: string;
  requiresAuth?: boolean;
}

// ---------- Filter Options ----------
export interface RecipeFilters {
  category?: string;
  difficulty?: string;
  cuisine?: string;
  cookTime?: string;
  isVeg?: boolean;
  search?: string;
}
