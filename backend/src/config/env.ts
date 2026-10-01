import "dotenv/config";

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),

  databaseUrl: required("DATABASE_URL"),
  redisUrl: required("REDIS_URL"),

  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",

  corsOrigin: process.env.CORS_ORIGIN ?? "*",

  seed: {
    superAdminEmail: process.env.SEED_SUPER_ADMIN_EMAIL ?? "admin@tracker.local",
    superAdminPassword: process.env.SEED_SUPER_ADMIN_PASSWORD ?? "Admin@12345",
    managerEmail: process.env.SEED_MANAGER_EMAIL ?? "manager@tracker.local",
    managerPassword: process.env.SEED_MANAGER_PASSWORD ?? "Manager@12345",
    employeeEmail: process.env.SEED_EMPLOYEE_EMAIL ?? "employee@tracker.local",
    employeePassword: process.env.SEED_EMPLOYEE_PASSWORD ?? "Employee@12345",
  },
};
