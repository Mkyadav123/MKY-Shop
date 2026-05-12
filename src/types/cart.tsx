export interface ProductImage {
  url: string;
}

export interface ProductPrice {
  amount: number;
}

export interface ProductInventory {
  quantity?: number;
  inStock?: boolean;
}

export interface ProductDimensions {
  width?: number;
  height?: number;
  depth?: number;
  length?: number;
  unit?: string;
}

export interface ProductCategory {
  id?: number | string;
  name?: string;
}

export interface CartItem {
  id: number | string;

  name: string;

  qty: number;

  shortDescription?: string;

  description?: string;

  images: ProductImage[];

  inventory?: ProductInventory;

  price: ProductPrice;

  tags?: string[];

  attributes?: Record<
    string,
    string | number | boolean
  >;

  dimensions?: ProductDimensions;

  category?: ProductCategory;
}