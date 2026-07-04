// ============================================
// CookWithPrem — Zod Validation Schemas
// ============================================

import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    displayName: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be under 50 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email address"),
  subject: z
    .string()
    .min(3, "Subject must be at least 3 characters")
    .max(200, "Subject is too long"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message is too long"),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const commentSchema = z.object({
  text: z
    .string()
    .min(2, "Comment must be at least 2 characters")
    .max(1000, "Comment is too long"),
});

export type CommentFormData = z.infer<typeof commentSchema>;

export const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type NewsletterFormData = z.infer<typeof newsletterSchema>;

export const recipeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  heroImage: z.string().url("Please provide a valid image URL").or(z.string().min(1)),
  cookTime: z.coerce.number().min(1, "Cook time is required"),
  prepTime: z.coerce.number().min(0),
  totalTime: z.coerce.number().min(1),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  servings: z.coerce.number().min(1, "Servings must be at least 1"),
  calories: z.coerce.number().min(0),
  cuisine: z.string().min(1, "Cuisine is required"),
  category: z.string().min(1, "Category is required"),
  isVeg: z.boolean(),
  isFeatured: z.boolean(),
  tags: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
});

export type RecipeFormData = z.infer<typeof recipeSchema>;

export const ingredientSchema = z.object({
  name: z.string().min(1, "Ingredient name is required"),
  quantity: z.string().min(1, "Quantity is required"),
  unit: z.string(),
});

export type IngredientFormData = z.infer<typeof ingredientSchema>;

export const recipeStepSchema = z.object({
  stepNumber: z.coerce.number().min(1),
  title: z.string().min(1, "Step title is required"),
  description: z.string().min(1, "Step description is required"),
  imageUrl: z.string().optional(),
});

export type RecipeStepFormData = z.infer<typeof recipeStepSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().min(5, "Description is required"),
  imageUrl: z.string().min(1, "Image is required"),
  order: z.coerce.number().min(0),
  recipeCount: z.coerce.number().min(0).default(0),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
