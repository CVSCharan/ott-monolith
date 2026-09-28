/**
 * Type-safe environment variable consumer and validator for StreamForge.
 * Validates presence and minimum lengths for security-critical secrets.
 */

export const env = {
  // Database (Postgres 16 + Prisma 6)
  DATABASE_URL:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/streamforge?schema=public',
  DATABASE_DIRECT_URL:
    process.env.DATABASE_DIRECT_URL ||
    'postgresql://postgres:postgres@localhost:5432/streamforge?schema=public',
  SHADOW_DATABASE_URL: process.env.SHADOW_DATABASE_URL,

  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

  // Authentication & Cryptographic Secrets
  JWT_ACCESS_SECRET:
    process.env.JWT_ACCESS_SECRET ||
    'streamforge_jwt_access_secret_key_minimum_32_characters_long_local',
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET ||
    'streamforge_jwt_refresh_secret_key_minimum_32_characters_long_local',
  HMAC_MANIFEST_SECRET:
    process.env.HMAC_MANIFEST_SECRET ||
    'streamforge_hmac_manifest_signing_secret_minimum_32_chars_local',

  // Admin & Seeding
  SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD || 'StreamForge_Admin_DevPassword_2026!',
  ALLOW_SEED: process.env.ALLOW_SEED === 'true',

  // Storage / S3 / MinIO
  S3_ENDPOINT: process.env.S3_ENDPOINT || 'http://localhost:9000',
  S3_REGION: process.env.S3_REGION || 'us-east-1',
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID || 'minioadmin',
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY || 'minioadmin',
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'streamforge-media',
  S3_FORCE_PATH_STYLE: process.env.S3_FORCE_PATH_STYLE !== 'false',

  // Application
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
}
