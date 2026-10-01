import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { prisma } from "../../config/prisma";

export const rolesRouter = Router();

rolesRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (_req, res) => {
    const roles = await prisma.role.findMany({
      select: { id: true, name: true, description: true },
      orderBy: { name: "asc" },
    });
    res.json(roles);
  })
);
