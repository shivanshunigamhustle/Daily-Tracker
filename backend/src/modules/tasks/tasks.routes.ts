import { Router } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requireAuth } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { prisma } from "../../config/prisma";
import { MANAGER_ROLES, requireActingEmployee, visibleEmployeeIds } from "../../utils/actor";

export const tasksRouter = Router();
tasksRouter.use(requireAuth);

const taskInclude = {
  assignee: { select: { id: true, fullName: true } },
  assignedBy: { select: { id: true, fullName: true } },
} satisfies Prisma.TaskInclude;

const statusEnum = z.enum(["NOT_STARTED", "IN_PROGRESS", "BLOCKED", "COMPLETED", "CANCELLED"]);
const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

const createSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(2000).optional(),
  priority: priorityEnum.default("MEDIUM"),
  assigneeId: z.string().uuid(),
  dueDate: z.coerce.date().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  description: z.string().max(2000).nullable().optional(),
  priority: priorityEnum.optional(),
  dueDate: z.coerce.date().nullable().optional(),
  status: statusEnum.optional(),
  completion: z.number().int().min(0).max(100).optional(),
});

async function assertCanSee(taskId: string, user: Parameters<typeof visibleEmployeeIds>[0]) {
  const task = await prisma.task.findUnique({ where: { id: taskId }, include: taskInclude });
  if (!task) throw ApiError.notFound("Task not found");
  const visible = await visibleEmployeeIds(user);
  if (visible !== "all" && !visible.includes(task.assigneeId)) throw ApiError.forbidden();
  return task;
}

tasksRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const visible = await visibleEmployeeIds(req.user!);
    const tasks = await prisma.task.findMany({
      where: visible === "all" ? {} : { assigneeId: { in: visible } },
      include: taskInclude,
      orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    });
    res.json(tasks);
  })
);

tasksRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    if (!MANAGER_ROLES.includes(req.user!.role)) throw ApiError.forbidden("Only managers can assign tasks");
    const input = createSchema.parse(req.body);
    const visible = await visibleEmployeeIds(req.user!);
    if (visible !== "all" && !visible.includes(input.assigneeId)) {
      throw ApiError.forbidden("You can only assign tasks to your team");
    }
    const actor = await prisma.employee.findUnique({ where: { userId: req.user!.sub } });
    const task = await prisma.task.create({
      data: { ...input, assignedById: actor?.id ?? null },
      include: taskInclude,
    });
    res.status(201).json(task);
  })
);

tasksRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const input = updateSchema.parse(req.body);
    const task = await assertCanSee(req.params.id, req.user!);
    const isManager = MANAGER_ROLES.includes(req.user!.role);

    if (!isManager) {
      const me = await requireActingEmployee(req.user!);
      if (task.assigneeId !== me.id) throw ApiError.forbidden();
      const disallowed = Object.keys(input).filter((k) => !["status", "completion"].includes(k));
      if (disallowed.length) throw ApiError.forbidden("You can only update the status and progress of your tasks");
    }

    const data: Prisma.TaskUpdateInput = { ...input };
    if (input.status === "COMPLETED") {
      if (input.completion !== undefined && input.completion < 100) {
        throw ApiError.badRequest("A completed task must be at 100%");
      }
      data.completion = 100;
    }
    if (input.status && input.status !== "COMPLETED" && input.completion === 100) {
      throw ApiError.badRequest("Set the status to Completed when a task reaches 100%");
    }

    const updated = await prisma.task.update({ where: { id: task.id }, data, include: taskInclude });
    res.json(updated);
  })
);

tasksRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    if (!MANAGER_ROLES.includes(req.user!.role)) throw ApiError.forbidden();
    const task = await assertCanSee(req.params.id, req.user!);
    await prisma.task.delete({ where: { id: task.id } });
    res.status(204).send();
  })
);
