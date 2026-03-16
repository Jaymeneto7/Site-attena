// File: src/app/models/product.model.ts
/**
 * Product model used across the app.
 * - `id` is a string (compatible with Date.now().toString() or backend UUID).
 * - `colors` and `sizes` are arrays for easy processing.
 * - `image` is optional to allow products without an image URL.
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  colors: string[];
  sizes: string[];
}
