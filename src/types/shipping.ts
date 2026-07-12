/* =====================================================================
   Shipping types — mirroring the PHP backend responses
   ===================================================================== */

export interface ShippingTier {
  id: number;
  minKm: number;
  maxKm: number;
  minOrderAmount: number;
  label: string;
  isEnabled: boolean;
  sortOrder: number;
}

export interface StoreConfig {
  id: number;
  storeName: string;
  address: string;
  lat: number;
  lng: number;
  updatedAt: string;
}

export interface ShippingConfigResponse {
  success: boolean;
  storeConfig: StoreConfig;
  tiers: ShippingTier[];
  message?: string;
}

export interface ShippingCheckRequest {
  deliveryAddress: string;
  orderAmount: number;
  /** Sent separately so PHP can use city + pincode as a geocoding fallback */
  city?: string;
  pincode?: string;
}

export interface ShippingCheckResult {
  success: boolean;
  eligible: boolean;
  /** true when geocoding itself failed (rate-limited, network error, or truly unfindable) */
  geocodingError: boolean;
  distanceKm: number | null;
  matchedTier: ShippingTier | null;
  requiredAmount: number | null;
  geocodedLat: number | null;
  geocodedLng: number | null;
  deliveryAddress: string;
  /** Which query string Nominatim finally resolved (full address / city+pin / pin only) */
  resolvedBy?: string;
  message: string;
}
