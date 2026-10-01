import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AccessTokenPayload {
  sub: string;
  role: string;
}

export interface RefreshTokenPayload {
  sub: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const options: jwt.SignOptions = { expiresIn: env.jwtAccessExpiresIn as jwt.SignOptions["expiresIn"] };
  return jwt.sign(payload, env.jwtAccessSecret, options);
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  const options: jwt.SignOptions = { expiresIn: env.jwtRefreshExpiresIn as jwt.SignOptions["expiresIn"] };
  return jwt.sign(payload, env.jwtRefreshSecret, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as RefreshTokenPayload;
}
