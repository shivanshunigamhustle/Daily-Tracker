import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { prisma } from "../../config/prisma";
import { MANAGER_ROLES, requireActingEmployee, startOfToday, visibleEmployeeIds } from "../../utils/actor";

export const dailyUpdatesRouter = Router();
dailyUpdatesRouter.use(requireAuth);

const submitSchema = z.object({
  summary: z.string().trim().min(10, "Describe today's work in at least 10 characters").max(4000),
  blockers: z.string().trim().max(2000).optional(),
  tomorrowPlan: z.string().trim().max(2000).optional(),
});

const reviewSchema = z.object({
  decision: z.enum(["APPROVED", "NEEDS_CHANGES"]),
  comment: z.string().trim().max(1000).optional(),
});

dailyUpdatesRouter.get(
  "/today",
  asyncHandler(async (req, res) => {
    const me = await requireActingEmployee(req.user!);
    const update = await prisma.dailyUpdate.findUnique({
      where: { employeeId_date: { employeeId: me.id, date: startOfToday() } },
    });
    res.json(update);
  })
);

dailyUpdatesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const me = await requireActingEmployee(req.user!);
    const input = submitSchema.parse(req.body);
    const date = startOfToday();
    const existing = await prisma.dailyUpdate.findUnique({
      where: { employeeId_date: { employeeId: me.id, date } },
    });

    if (existing && existing.status !== "NEEDS_CHANGES") {
      throw ApiError.conflict("You have already submitted today's update");
    }

    const data = {
      summary: input.summary,
      blockers: input.blockers || null,
      tomorrowPlan: input.tomorrowPlan || null,
      status: "SUBMITTED" as const,
      reviewComment: null,
      reviewedById: null,
    };

    const saved = existing
      ? await prisma.dailyUpdate.update({ where: { id: existing.id }, data })
      : await prisma.dailyUpdate.create({ data: { ...data, employeeId: me.id, date } });
    res.status(existing ? 200 : 201).json(saved);
  })
);

// Manager/admin: updates from the people they can see for a given day (default today).
dailyUpdatesRouter.get(
  "/review",
  asyncHandler(async (req, res) => {
    if (!MANAGER_ROLES.includes(req.user!.role)) throw ApiError.forbidden();
    const ids = await visibleEmployeeIds(req.user!);
    const date = startOfToday();
    const updates = await prisma.dailyUpdate.findMany({
      where: {
        date,
        ...(ids === "all" ? {} : { employeeId: { in: ids } }),
      },
      include: { employee: { select: { id: true, fullName: true, designation: true } } },
      orderBy: { updatedAt: "desc" },
    });
    res.json(updates);
  })
);

dailyUpdatesRouter.post(
  "/:id/review",
  asyncHandler(async (req, res) => {
    if (!MANAGER_ROLES.includes(req.user!.role)) throw ApiError.forbidden();
    const input = reviewSchema.parse(req.body);
    const update = await prisma.dailyUpdate.findUnique({ where: { id: req.params.id } });
    if (!update) throw ApiError.notFound("Daily update not found");

    const ids = await visibleEmployeeIds(req.user!);
    if (ids !== "all" && !ids.includes(update.employeeId)) throw ApiError.forbidden();
    if (input.decision === "NEEDS_CHANGES" && !input.comment) {
      throw ApiError.badRequest("Add a comment explaining what needs to change");
    }

    const reviewer = await prisma.employee.findUnique({ where: { userId: req.user!.sub } });
    const updated = await prisma.dailyUpdate.update({
      where: { id: update.id },
      data: {
        status: input.decision,
        reviewComment: input.comment || null,
        reviewedById: reviewer?.id ?? null,
      },
    });
    res.json(updated);
  })
);
