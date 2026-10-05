import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { prisma } from "../../config/prisma";
import { requireActingEmployee, startOfToday, visibleEmployeeIds } from "../../utils/actor";

export const dashboardRouter = Router();

function formatTime(d: Date | null | undefined): string | null {
  return d ? d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : null;
}

function formatDuration(from: Date, to: Date): string {
  const minutes = Math.max(0, Math.floor((to.getTime() - from.getTime()) / 60000));
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

dashboardRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) throw ApiError.unauthorized();
    const date = startOfToday();

    if (req.user.role === "EMPLOYEE") {
      const me = await requireActingEmployee(req.user);
      const [attendance, update, taskGroups] = await Promise.all([
        prisma.attendance.findUnique({ where: { employeeId_date: { employeeId: me.id, date } } }),
        prisma.dailyUpdate.findUnique({ where: { employeeId_date: { employeeId: me.id, date } } }),
        prisma.task.groupBy({ by: ["status"], where: { assigneeId: me.id }, _count: { _all: true } }),
      ]);

      const count = (s: string) => taskGroups.find((g) => g.status === s)?._count._all ?? 0;
      const total = taskGroups.reduce((n, g) => n + g._count._all, 0);
      const now = new Date();

      res.json({
        role: "EMPLOYEE",
        employee: { fullName: me.fullName, designation: me.designation },
        today: {
          workStatus: !attendance ? "NOT_STARTED" : attendance.checkOutAt ? "ENDED" : "WORKING",
          loginTime: formatTime(attendance?.checkInAt),
          workingTime: attendance
            ? formatDuration(attendance.checkInAt, attendance.checkOutAt ?? now)
            : null,
          dailyUpdateStatus: update ? update.status : "NOT_SUBMITTED",
        },
        tasks: {
          total,
          completed: count("COMPLETED"),
          inProgress: count("IN_PROGRESS"),
          notStarted: count("NOT_STARTED"),
          blocked: count("BLOCKED"),
        },
      });
      return;
    }

    if (req.user.role === "MANAGER") {
      const ids = await visibleEmployeeIds(req.user);
      const scope = ids === "all" ? {} : { employeeId: { in: ids } };
      const [teamSize, present, pendingReview, taskGroups] = await Promise.all([
        ids === "all" ? prisma.employee.count() : Promise.resolve(ids.length),
        prisma.attendance.count({ where: { date, ...scope } }),
        prisma.dailyUpdate.count({ where: { date, status: "SUBMITTED", ...scope } }),
        prisma.task.groupBy({
          by: ["status"],
          where: ids === "all" ? {} : { assigneeId: { in: ids } },
          _count: { _all: true },
        }),
      ]);
      const count = (s: string) => taskGroups.find((g) => g.status === s)?._count._all ?? 0;
      res.json({
        role: "MANAGER",
        team: {
          totalEmployees: teamSize,
          present,
          absent: Math.max(0, teamSize - present),
          updatesPending: pendingReview,
        },
        tasks: {
          total: taskGroups.reduce((n, g) => n + g._count._all, 0),
          completed: count("COMPLETED"),
          inProgress: count("IN_PROGRESS"),
          blocked: count("BLOCKED"),
        },
      });
      return;
    }

    const [totalEmployees, totalDepartments, totalTeams, present, pendingReview, taskGroups] = await Promise.all([
      prisma.employee.count(),
      prisma.department.count(),
      prisma.team.count(),
      prisma.attendance.count({ where: { date } }),
      prisma.dailyUpdate.count({ where: { date, status: "SUBMITTED" } }),
      prisma.task.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);
    const count = (s: string) => taskGroups.find((g) => g.status === s)?._count._all ?? 0;
    res.json({
      role: req.user.role,
      organization: { totalEmployees, totalDepartments, totalTeams },
      team: {
        totalEmployees,
        present,
        absent: Math.max(0, totalEmployees - present),
        updatesPending: pendingReview,
      },
      tasks: {
        total: taskGroups.reduce((n, g) => n + g._count._all, 0),
        completed: count("COMPLETED"),
        inProgress: count("IN_PROGRESS"),
        blocked: count("BLOCKED"),
      },
    });
  })
);
