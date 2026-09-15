export interface AppConfig {
  port: number;
  environment: string;
  database: {
    uri: string;
    dbName: string;
  };
  auth: {
    secret: string;
    issuer?: string;
  };
  r2: {
    accountId?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    bucketName?: string;
    publicUrl?: string;
  };
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT || '3001', 10),
  environment: process.env.NODE_ENV || 'development',
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    dbName: process.env.MONGODB_DB_NAME || 'invitation_platform',
  },
  auth: {
    secret: process.env.AUTH_SECRET || 'dev_secret',
    issuer: process.env.AUTH_ISSUER,
  },
  r2: {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME || 'invitation-assets',
    publicUrl: process.env.R2_PUBLIC_URL,
  },
});
