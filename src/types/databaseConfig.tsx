export interface DatabaseConfig {
  dbHost: string;
  dbPort: number;
  dbUser: string;
  dbPassword: string;
  dbName: string;
  dbCharset?: string;
}

export interface DatabaseConfigResponse {
  success: boolean;
  message: string;
  data?: DatabaseConfig;
}

export interface DatabaseConfigRequest {
  dbHost: string;
  dbPort: number;
  dbUser: string;
  dbPassword: string;
  dbName: string;
  dbCharset?: string;
}
