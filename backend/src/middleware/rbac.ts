import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { PermissionKey } from "../config/permissions";

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Requires one of roles: ${roles.join(", ")}`));
    }
    next();
  };
}

export function requirePermission(permission: PermissionKey) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());

    const role = await prisma.role.findUnique({
      where: { name: req.user.role as any },
      include: { permissions: { include: { permission: true } } },
    });

    const keys = role?.permissions.map((rp) => rp.permission.key) ?? [];
    if (!keys.includes(permission)) {
      return next(ApiError.forbidden(`Missing required permission: ${permission}`));
    }
    next();
  };
}
