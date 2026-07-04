// ============================================
// CookWithPrem — Firebase Storage Helpers
// ============================================

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./config";

/**
 * Upload an image to Firebase Storage.
 * Returns the download URL.
 */
export async function uploadImage(
  file: File,
  path: string
): Promise<string> {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

/**
 * Delete an image from Firebase Storage.
 */
export async function deleteImage(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

/**
 * Generate a unique path for recipe images.
 */
export function getRecipeImagePath(
  recipeId: string,
  fileName: string
): string {
  const timestamp = Date.now();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.]/g, "_");
  return `recipes/${recipeId}/${timestamp}_${sanitizedName}`;
}

/**
 * Generate a unique path for category images.
 */
export function getCategoryImagePath(
  categoryId: string,
  fileName: string
): string {
  const timestamp = Date.now();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.]/g, "_");
  return `categories/${categoryId}/${timestamp}_${sanitizedName}`;
}
