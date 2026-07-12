import type {
  ShippingConfigResponse,
  ShippingCheckRequest,
  ShippingCheckResult,
} from "../types/shipping";

const BASE = "/api";

/** Admin — get shipping tiers + store config */
export async function fetchShippingConfig(): Promise<ShippingConfigResponse> {
  const res = await fetch(`${BASE}/admin/shipping-config`, { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Admin — save shipping tiers + store config */
export async function saveShippingConfig(
  payload: Partial<Pick<ShippingConfigResponse, "storeConfig" | "tiers">>
): Promise<ShippingConfigResponse> {
  const res = await fetch(`${BASE}/admin/shipping-config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Save failed");
  return data;
}

/**
 * Storefront — check if a delivery address + amount qualifies.
 *
 * ALWAYS returns a ShippingCheckResult — never throws for business-logic
 * failures (ineligible zone, geocoding error, address not found).
 * Only throws on hard network failures (fetch itself fails).
 *
 * Callers MUST inspect `result.eligible` and `result.geocodingError`
 * before allowing an order. A returned result !== "eligible".
 */
export async function checkShippingEligibility(
  req: ShippingCheckRequest
): Promise<ShippingCheckResult> {
  const res = await fetch(`${BASE}/check-shipping`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  // Hard failure — server totally unreachable
  if (!res.ok) {
    let message = `Server error (HTTP ${res.status})`;
    try { const err = await res.json(); if (err?.message) message = err.message; } catch { /* ignore */ }
    return {
      success: false, eligible: false, geocodingError: true,
      distanceKm: null, matchedTier: null, requiredAmount: null,
      geocodedLat: null, geocodedLng: null,
      deliveryAddress: req.deliveryAddress, message,
    };
  }

  // PHP always returns HTTP 200 for business-logic outcomes.
  // The `eligible` and `geocodingError` flags drive the UI.
  const data: ShippingCheckResult = await res.json();
  return data;
}
