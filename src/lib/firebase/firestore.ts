// ============================================
// CookWithPrem — Firestore CRUD Helpers
// ============================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "./config";
import type {
  Recipe,
  Category,
  Comment,
  Bookmark,
  ContactMessage,
  NewsletterSubscriber,
  UserProfile,
  RecipeFilters,
} from "@/types";

// ==================== RECIPES ====================

/**
 * Get all recipes with optional filtering.
 */
export async function getRecipes(filters?: RecipeFilters): Promise<Recipe[]> {
  const constraints: QueryConstraint[] = [];

  if (filters?.category) {
    constraints.push(where("category", "==", filters.category));
  }
  if (filters?.difficulty) {
    constraints.push(where("difficulty", "==", filters.difficulty));
  }
  if (filters?.cuisine) {
    constraints.push(where("cuisine", "==", filters.cuisine));
  }
  if (filters?.isVeg !== undefined) {
    constraints.push(where("isVeg", "==", filters.isVeg));
  }

  constraints.push(orderBy("createdAt", "desc"));

  const q = query(collection(db, "recipes"), ...constraints);
  const snapshot = await getDocs(q);

  let recipes = snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Recipe
  );

  // Client-side filter for cook time (Firestore doesn't support range + other filters well)
  if (filters?.cookTime) {
    const maxTime = parseInt(filters.cookTime);
    if (maxTime <= 60) {
      recipes = recipes.filter((r) => r.totalTime <= maxTime);
    } else {
      recipes = recipes.filter((r) => r.totalTime > 60);
    }
  }

  // Client-side search (for simple text matching)
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    recipes = recipes.filter(
      (r) =>
        r.title.toLowerCase().includes(searchLower) ||
        r.description.toLowerCase().includes(searchLower) ||
        r.tags.some((t) => t.toLowerCase().includes(searchLower))
    );
  }

  return recipes;
}

/**
 * Get a single recipe by slug.
 */
export async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
  const q = query(collection(db, "recipes"), where("slug", "==", slug));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Recipe;
}

/**
 * Get a single recipe by ID.
 */
export async function getRecipeById(id: string): Promise<Recipe | null> {
  const docRef = doc(db, "recipes", id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Recipe;
}

/**
 * Get featured recipes.
 */
export async function getFeaturedRecipes(
  maxCount: number = 6
): Promise<Recipe[]> {
  const q = query(
    collection(db, "recipes"),
    where("isFeatured", "==", true),
    orderBy("createdAt", "desc"),
    limit(maxCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Recipe
  );
}

/**
 * Get latest recipes.
 */
export async function getLatestRecipes(
  maxCount: number = 8
): Promise<Recipe[]> {
  const q = query(
    collection(db, "recipes"),
    orderBy("createdAt", "desc"),
    limit(maxCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Recipe
  );
}

/**
 * Get recipes by category slug.
 */
export async function getRecipesByCategory(
  categorySlug: string
): Promise<Recipe[]> {
  const q = query(
    collection(db, "recipes"),
    where("category", "==", categorySlug),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Recipe
  );
}

/**
 * Get related recipes (same category, excluding current).
 */
export async function getRelatedRecipes(
  category: string,
  excludeId: string,
  maxCount: number = 4
): Promise<Recipe[]> {
  const q = query(
    collection(db, "recipes"),
    where("category", "==", category),
    orderBy("createdAt", "desc"),
    limit(maxCount + 1)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Recipe)
    .filter((r) => r.id !== excludeId)
    .slice(0, maxCount);
}

// Admin: Add recipe
export async function addRecipe(
  data: Omit<Recipe, "id" | "createdAt" | "updatedAt" | "averageRating" | "totalRatings">
): Promise<string> {
  const docRef = await addDoc(collection(db, "recipes"), {
    ...data,
    averageRating: 0,
    totalRatings: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// Admin: Update recipe
export async function updateRecipe(
  id: string,
  data: Partial<Recipe>
): Promise<void> {
  const docRef = doc(db, "recipes", id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// Admin: Delete recipe
export async function deleteRecipe(id: string): Promise<void> {
  await deleteDoc(doc(db, "recipes", id));
}

// ==================== CATEGORIES ====================

export async function getCategories(): Promise<Category[]> {
  const q = query(collection(db, "categories"), orderBy("order", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Category
  );
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  const q = query(collection(db, "categories"), where("slug", "==", slug));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...d.data() } as Category;
}

export async function addCategory(
  data: Omit<Category, "id">
): Promise<string> {
  const docRef = await addDoc(collection(db, "categories"), data);
  return docRef.id;
}

export async function updateCategory(
  id: string,
  data: Partial<Category>
): Promise<void> {
  await updateDoc(doc(db, "categories", id), data);
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, "categories", id));
}

// ==================== BOOKMARKS ====================

export async function addBookmark(
  userId: string,
  recipeId: string
): Promise<void> {
  await addDoc(collection(db, "bookmarks"), {
    userId,
    recipeId,
    createdAt: serverTimestamp(),
  });
  // Also add to user's bookmarks array
  await updateDoc(doc(db, "users", userId), {
    bookmarks: arrayUnion(recipeId),
  });
}

export async function removeBookmark(
  userId: string,
  recipeId: string
): Promise<void> {
  const q = query(
    collection(db, "bookmarks"),
    where("userId", "==", userId),
    where("recipeId", "==", recipeId)
  );
  const snapshot = await getDocs(q);
  for (const d of snapshot.docs) {
    await deleteDoc(doc(db, "bookmarks", d.id));
  }
  await updateDoc(doc(db, "users", userId), {
    bookmarks: arrayRemove(recipeId),
  });
}

export async function getUserBookmarks(userId: string): Promise<Bookmark[]> {
  const q = query(
    collection(db, "bookmarks"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Bookmark
  );
}

export async function isBookmarked(
  userId: string,
  recipeId: string
): Promise<boolean> {
  const q = query(
    collection(db, "bookmarks"),
    where("userId", "==", userId),
    where("recipeId", "==", recipeId)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

// ==================== RATINGS ====================

export async function addOrUpdateRating(
  userId: string,
  recipeId: string,
  score: number
): Promise<void> {
  // Check for existing rating
  const q = query(
    collection(db, "ratings"),
    where("userId", "==", userId),
    where("recipeId", "==", recipeId)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    // New rating
    await addDoc(collection(db, "ratings"), {
      userId,
      recipeId,
      score,
      createdAt: serverTimestamp(),
    });
    // Update recipe aggregate
    const recipeRef = doc(db, "recipes", recipeId);
    const recipeSnap = await getDoc(recipeRef);
    if (recipeSnap.exists()) {
      const data = recipeSnap.data();
      const newTotal = (data.totalRatings || 0) + 1;
      const newAvg =
        ((data.averageRating || 0) * (data.totalRatings || 0) + score) /
        newTotal;
      await updateDoc(recipeRef, {
        totalRatings: newTotal,
        averageRating: Math.round(newAvg * 10) / 10,
      });
    }
  } else {
    // Update existing rating
    const existingDoc = snapshot.docs[0];
    const oldScore = existingDoc.data().score;
    await updateDoc(doc(db, "ratings", existingDoc.id), { score });

    // Recalculate average
    const recipeRef = doc(db, "recipes", recipeId);
    const recipeSnap = await getDoc(recipeRef);
    if (recipeSnap.exists()) {
      const data = recipeSnap.data();
      const total = data.totalRatings || 1;
      const newAvg =
        ((data.averageRating || 0) * total - oldScore + score) / total;
      await updateDoc(recipeRef, {
        averageRating: Math.round(newAvg * 10) / 10,
      });
    }
  }
}

export async function getUserRating(
  userId: string,
  recipeId: string
): Promise<number | null> {
  const q = query(
    collection(db, "ratings"),
    where("userId", "==", userId),
    where("recipeId", "==", recipeId)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].data().score;
}

// ==================== COMMENTS ====================

export async function getRecipeComments(recipeId: string): Promise<Comment[]> {
  const q = query(
    collection(db, "comments"),
    where("recipeId", "==", recipeId),
    where("isApproved", "==", true),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Comment
  );
}

export async function addComment(
  data: Omit<Comment, "id" | "createdAt" | "isApproved">
): Promise<string> {
  const docRef = await addDoc(collection(db, "comments"), {
    ...data,
    isApproved: true, // Auto-approve for now
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function deleteComment(id: string): Promise<void> {
  await deleteDoc(doc(db, "comments", id));
}

export async function getAllComments(): Promise<Comment[]> {
  const q = query(
    collection(db, "comments"),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Comment
  );
}

export async function approveComment(id: string): Promise<void> {
  await updateDoc(doc(db, "comments", id), { isApproved: true });
}

// ==================== CONTACT MESSAGES ====================

export async function submitContactMessage(
  data: Omit<ContactMessage, "id" | "createdAt" | "isRead">
): Promise<string> {
  const docRef = await addDoc(collection(db, "contactMessages"), {
    ...data,
    isRead: false,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const q = query(
    collection(db, "contactMessages"),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as ContactMessage
  );
}

export async function markMessageAsRead(id: string): Promise<void> {
  await updateDoc(doc(db, "contactMessages", id), { isRead: true });
}

// ==================== NEWSLETTER ====================

export async function subscribeNewsletter(email: string): Promise<string> {
  // Check if already subscribed
  const q = query(
    collection(db, "newsletter"),
    where("email", "==", email)
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    throw new Error("Already subscribed");
  }

  const docRef = await addDoc(collection(db, "newsletter"), {
    email,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getNewsletterSubscribers(): Promise<
  NewsletterSubscriber[]
> {
  const q = query(
    collection(db, "newsletter"),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as NewsletterSubscriber
  );
}

// ==================== USERS (Admin) ====================

export async function getAllUsers(): Promise<UserProfile[]> {
  const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ ...d.data(), uid: d.id }) as UserProfile
  );
}

export async function updateUserRole(
  uid: string,
  role: "user" | "admin"
): Promise<void> {
  await updateDoc(doc(db, "users", uid), { role });
}
