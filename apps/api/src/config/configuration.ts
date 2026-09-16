export interface AppConfig {
  port: number;
  environment: string;
  allowedOrigins: string[];
  webUrl: string;
  database: {
    uri: string;
    dbName: string;
  };
  supabase: {
    url: string;
    secretKey: string;
    jwksUrl?: string;
  };
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT || '3001', 10),
  environment: process.env.NODE_ENV || 'development',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  webUrl: process.env.WEB_URL || 'http://localhost:3000',
  database: {
    uri: process.env.MONGODB_URI || '',
    dbName: process.env.MONGODB_DB_NAME || 'invity-db-dev',
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    secretKey:
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      '',
    jwksUrl: process.env.SUPABASE_JWKS_URL,
  },
});
