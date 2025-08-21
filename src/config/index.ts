import dotenv from "dotenv";

// Load environment variables
dotenv.config();

interface Config {
  // Server Configuration
  port: number;
  nodeEnv: string;

  // Database Configuration
  databaseUrl: string;

  // Authentication Configuration
  jwtSecret: string;
  jwtExpiresIn: string | number;
  bcryptSaltRounds: number;

  // Room Configuration
  inviteCodeLength: number;

  // Rate Limiting Configuration
  rateLimitMaxRequests: number;
  rateLimitWindowMs: number;
  messageLimitPerWindow: number;
  messageLimitWindowMs: number;

  // Socket.IO Configuration
  corsOrigin: string;

  // Security Configuration
  allowedOrigins: string[];
}

function validateEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value;
}

function validateEnvVarNumber(name: string, defaultValue?: number): number {
  const value = process.env[name];
  if (value) {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new Error(`Environment variable ${name} must be a valid number`);
    }
    return parsed;
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  throw new Error(`Environment variable ${name} is required but not set`);
}

export const config: Config = {
  // Server Configuration
  port: validateEnvVarNumber("PORT", 4000),
  nodeEnv: validateEnvVar("NODE_ENV", "development"),

  // Database Configuration
  databaseUrl: validateEnvVar("DATABASE_URL"),

  // Authentication Configuration
  jwtSecret: validateEnvVar("JWT_SECRET"),
  jwtExpiresIn: validateEnvVar("JWT_EXPIRES_IN", "24h"),
  bcryptSaltRounds: validateEnvVarNumber("BCRYPT_SALT_ROUNDS", 12),

  // Room Configuration
  inviteCodeLength: validateEnvVarNumber("INVITE_CODE_LENGTH", 10),

  // Rate Limiting Configuration
  rateLimitMaxRequests: validateEnvVarNumber("RATE_LIMIT_MAX_REQUESTS", 100),
  rateLimitWindowMs: validateEnvVarNumber("RATE_LIMIT_WINDOW_MS", 900000), // 15 minutes
  messageLimitPerWindow: validateEnvVarNumber("MESSAGE_LIMIT_PER_WINDOW", 5),
  messageLimitWindowMs: validateEnvVarNumber("MESSAGE_LIMIT_WINDOW_MS", 10000), // 10 seconds

  // Socket.IO Configuration
  corsOrigin: validateEnvVar("CORS_ORIGIN", "http://localhost:3000"),

  // Security Configuration
  allowedOrigins: validateEnvVar("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001")
    .split(",")
    .map((origin) => origin.trim()),
};

// Validate critical configuration on startup
export function validateConfig(): void {
  console.log("🔧 Validating configuration...");

  // Validate JWT secret strength
  if (config.jwtSecret.length < 32) {
    console.warn("⚠️  JWT_SECRET should be at least 32 characters long for security");
  }

  // Validate bcrypt salt rounds
  if (config.bcryptSaltRounds < 10) {
    console.warn("⚠️  BCRYPT_SALT_ROUNDS should be at least 10 for security");
  }

  // Log configuration (without sensitive data)
  console.log("✅ Configuration loaded successfully:");
  console.log(`   - Environment: ${config.nodeEnv}`);
  console.log(`   - Port: ${config.port}`);
  console.log(`   - CORS Origin: ${config.corsOrigin}`);
  console.log(`   - Bcrypt Salt Rounds: ${config.bcryptSaltRounds}`);
  console.log(`   - Invite Code Length: ${config.inviteCodeLength}`);
  console.log(
    `   - Message Rate Limit: ${config.messageLimitPerWindow} per ${config.messageLimitWindowMs}ms`
  );
}

export default config;
