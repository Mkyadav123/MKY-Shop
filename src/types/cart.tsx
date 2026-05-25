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

export interface Order {
  id: number;
  order_id: string;
  customer_name: string;
  amount: number;
  payment_id: string;
  created_at: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  payment_status: string;

  items: any[];
}

export interface OrdersPageProps {
  setCart: React.Dispatch<any>;
}