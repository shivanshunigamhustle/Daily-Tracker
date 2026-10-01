import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { comparePassword } from "../../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { revokeRefreshToken, storeRefreshToken, verifyStoredRefreshToken } from "../../utils/session";

async function loadUserWithRole(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { role: true, employee: true },
  });
}

function toAuthenticatedUser(user: NonNullable<Awaited<ReturnType<typeof loadUserWithRole>>>) {
  return {
    id: user.id,
    email: user.email,
    role: user.role.name,
    isActive: user.isActive,
    employee: user.employee
      ? {
          id: user.employee.id,
          employeeCode: user.employee.employeeCode,
          fullName: user.employee.fullName,
          designation: user.employee.designation,
          departmentId: user.employee.departmentId,
          teamId: user.employee.teamId,
          managerId: user.employee.managerId,
          workMode: user.employee.workMode,
        }
      : null,
  };
}

async function issueTokens(userId: string, role: string) {
  const accessToken = signAccessToken({ sub: userId, role });
  const refreshToken = signRefreshToken({ sub: userId });
  await storeRefreshToken(userId, refreshToken);
  return { accessToken, refreshToken };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true, employee: true },
  });

  if (!user || !user.isActive) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const passwordMatches = await comparePassword(password, user.passwordHash);
  if (!passwordMatches) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const tokens = await issueTokens(user.id, user.role.name);
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  return { ...tokens, user: toAuthenticatedUser(user) };
}

export async function refresh(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const isValid = await verifyStoredRefreshToken(payload.sub, refreshToken);
  if (!isValid) {
    throw ApiError.unauthorized("Refresh token has been revoked");
  }

  const user = await loadUserWithRole(payload.sub);
  if (!user || !user.isActive) {
    throw ApiError.unauthorized("Account is no longer active");
  }

  const tokens = await issueTokens(user.id, user.role.name);
  return { ...tokens, user: toAuthenticatedUser(user) };
}

export async function logout(userId: string) {
  await revokeRefreshToken(userId);
}

export async function getMe(userId: string) {
  const user = await loadUserWithRole(userId);
  if (!user) throw ApiError.notFound("User not found");
  return toAuthenticatedUser(user);
}
