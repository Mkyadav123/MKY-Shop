export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  isEnabled: boolean;
  webhookSecret?: string;
  storeName?: string;
  currency?: string;
}

export interface RazorpayConfigResponse {
  success: boolean;
  message: string;
  data?: RazorpayConfig;
}

export interface RazorpayConfigRequest {
  keyId: string;
  keySecret: string;
  isEnabled: boolean;
  webhookSecret?: string;
  storeName?: string;
  currency?: string;
}
