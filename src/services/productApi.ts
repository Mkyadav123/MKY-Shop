import type { AdminProduct, AdminProductPayload, Product } from "../types/product";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

function toAdminProduct(product: Product): AdminProduct {
  return {
    id: product.id,
    name: product.name,
    price: product.price.amount,
    stock: product.inventory.quantity ?? 0,
    inStock: product.inventory.inStock ?? false,
    category: product.category?.name ?? "",
    sku: product.sku,
    imageUrl: product.images[0]?.url ?? "",
    description: product.description ?? "",
  };
}

function toApiPayload(payload: AdminProductPayload) {
  return {
    name: payload.name,
    price: payload.price,
    stock: payload.stock,
    inStock: payload.inStock,
    category: payload.category,
    sku: payload.sku,
    imageUrl: payload.imageUrl,
    description: payload.description,
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text.trim()) {
    throw new Error(
      `Empty response from server (HTTP ${response.status}). Is the PHP backend running?`
    );
  }

  let data: ApiResponse<T>;
  try {
    data = JSON.parse(text) as ApiResponse<T>;
  } catch {
    throw new Error(`Invalid JSON from server (HTTP ${response.status})`);
  }

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Request failed");
  }

  return data.data as T;
}

export async function fetchStoreProducts(): Promise<Product[]> {
  const response = await fetch("/api/products");
  return parseResponse<Product[]>(response);
}

export async function fetchStoreProductById(id: string): Promise<Product | null> {
  const products = await fetchStoreProducts();
  return products.find((product) => product.id === id) ?? null;
}

export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  const response = await fetch("/api/admin/products");
  const products = await parseResponse<Product[]>(response);
  return products.map(toAdminProduct);
}

export async function createAdminProduct(
  payload: AdminProductPayload
): Promise<AdminProduct> {
  const response = await fetch("/api/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toApiPayload(payload)),
  });

  const product = await parseResponse<Product>(response);
  return toAdminProduct(product);
}

export async function updateAdminProduct(
  id: string,
  payload: AdminProductPayload
): Promise<AdminProduct> {
  const response = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toApiPayload(payload)),
  });

  const product = await parseResponse<Product>(response);
  return toAdminProduct(product);
}

export async function deleteAdminProduct(id: string): Promise<void> {
  const response = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  await parseResponse<null>(response);
}
