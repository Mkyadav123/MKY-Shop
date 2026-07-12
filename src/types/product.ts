import type {
  ProductCategory,
  ProductDimensions,
  ProductImage,
  ProductInventory,
  ProductPrice,
} from "./cart";

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  shortDescription?: string;
  brand?: string;
  category?: ProductCategory;
  price: ProductPrice & { currency?: string };
  inventory: ProductInventory;
  attributes?: Record<string, string | number | boolean>;
  dimensions?: ProductDimensions;
  images: ProductImage[];
  tags?: string[];
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  inStock: boolean;
  category: string;
  sku: string;
  imageUrl: string;
  description: string;
}

export interface AdminProductPayload {
  name: string;
  price: number;
  stock: number;
  inStock: boolean;
  category: string;
  sku: string;
  imageUrl: string;
  description: string;
}
