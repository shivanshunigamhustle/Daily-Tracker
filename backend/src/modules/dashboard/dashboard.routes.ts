import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { prisma } from "../../config/prisma";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) throw ApiError.unauthorized();

    if (req.user.role === "EMPLOYEE") {
      const employee = await prisma.employee.findUnique({ where: { userId: req.user.sub } });
      res.json({
        role: "EMPLOYEE",
        employee,
        // Attendance/tasks land in later phases — placeholders keep the UI shape stable now.
        today: { workStatus: "NOT_STARTED", loginTime: null, workingTime: null, dailyUpdateStatus: "NOT_SUBMITTED" },
        tasks: { total: 0, completed: 0, inProgress: 0 },
      });
      return;
    }

    if (req.user.role === "MANAGER") {
      const employee = await prisma.employee.findUnique({ where: { userId: req.user.sub } });
      const teamSize = employee
        ? await prisma.employee.count({ where: { team: { managerId: employee.id } } })
        : 0;
      res.json({
        role: "MANAGER",
        employee,
        team: { totalEmployees: teamSize, present: 0, absent: 0, onLeave: 0, updatesPending: 0 },
      });
      return;
    }

    const [totalEmployees, totalDepartments, totalTeams] = await Promise.all([
      prisma.employee.count(),
      prisma.department.count(),
      prisma.team.count(),
    ]);
    res.json({
      role: req.user.role,
      organization: { totalEmployees, totalDepartments, totalTeams },
    });
  })
);
