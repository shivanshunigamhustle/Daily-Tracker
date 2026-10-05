import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { prisma } from "../../config/prisma";
import { MANAGER_ROLES, requireActingEmployee, startOfToday, visibleEmployeeIds } from "../../utils/actor";

export const attendanceRouter = Router();
attendanceRouter.use(requireAuth);

const checkInSchema = z.object({
  workMode: z.enum(["OFFICE", "WFH", "HYBRID", "FIELD"]).default("OFFICE"),
});

attendanceRouter.get(
  "/today",
  asyncHandler(async (req, res) => {
    const me = await requireActingEmployee(req.user!);
    const record = await prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId: me.id, date: startOfToday() } },
    });
    res.json(record);
  })
);

attendanceRouter.post(
  "/check-in",
  asyncHandler(async (req, res) => {
    const me = await requireActingEmployee(req.user!);
    const input = checkInSchema.parse(req.body ?? {});
    const date = startOfToday();
    const existing = await prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId: me.id, date } },
    });
    if (existing) throw ApiError.conflict("You have already checked in today");
    const record = await prisma.attendance.create({
      data: { employeeId: me.id, date, checkInAt: new Date(), workMode: input.workMode },
    });
    res.status(201).json(record);
  })
);

attendanceRouter.post(
  "/check-out",
  asyncHandler(async (req, res) => {
    const me = await requireActingEmployee(req.user!);
    const date = startOfToday();
    const existing = await prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId: me.id, date } },
    });
    if (!existing) throw ApiError.badRequest("Check in before you check out");
    if (existing.checkOutAt) throw ApiError.conflict("You have already checked out today");
    const record = await prisma.attendance.update({
      where: { id: existing.id },
      data: { checkOutAt: new Date() },
    });
    res.json(record);
  })
);

// Manager/admin view: today's attendance for everyone they can see.
attendanceRouter.get(
  "/team/today",
  asyncHandler(async (req, res) => {
    if (!MANAGER_ROLES.includes(req.user!.role)) throw ApiError.forbidden();
    const ids = await visibleEmployeeIds(req.user!);
    const employees = await prisma.employee.findMany({
      where: ids === "all" ? {} : { id: { in: ids } },
      select: {
        id: true,
        fullName: true,
        designation: true,
        team: { select: { name: true } },
        attendances: { where: { date: startOfToday() }, select: { checkInAt: true, checkOutAt: true, workMode: true } },
      },
      orderBy: { fullName: "asc" },
    });
    res.json(
      employees.map((e) => ({
        employeeId: e.id,
        fullName: e.fullName,
        designation: e.designation,
        teamName: e.team?.name ?? null,
        attendance: e.attendances[0] ?? null,
      }))
    );
  })
);
