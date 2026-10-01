import { redis } from "../config/redis";
import { comparePassword, hashPassword } from "./password";

const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days, mirrors JWT_REFRESH_EXPIRES_IN default

function refreshKey(userId: string) {
  return `refresh:${userId}`;
}

export async function storeRefreshToken(userId: string, refreshToken: string) {
  const hash = await hashPassword(refreshToken);
  await redis.set(refreshKey(userId), hash, "EX", REFRESH_TTL_SECONDS);
}

export async function verifyStoredRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
  const hash = await redis.get(refreshKey(userId));
  if (!hash) return false;
  return comparePassword(refreshToken, hash);
}

export async function revokeRefreshToken(userId: string) {
  await redis.del(refreshKey(userId));
}
