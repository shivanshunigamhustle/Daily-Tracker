import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requirePermission } from "../../middleware/rbac";
import { PERMISSIONS } from "../../config/permissions";
import {
  createDepartmentHandler,
  deleteDepartmentHandler,
  getDepartmentHandler,
  listDepartmentsHandler,
  updateDepartmentHandler,
} from "./departments.controller";

export const departmentsRouter = Router();

departmentsRouter.use(requireAuth);

departmentsRouter.get("/", requirePermission(PERMISSIONS.DEPARTMENTS_READ), listDepartmentsHandler);
departmentsRouter.get("/:id", requirePermission(PERMISSIONS.DEPARTMENTS_READ), getDepartmentHandler);
departmentsRouter.post("/", requirePermission(PERMISSIONS.DEPARTMENTS_WRITE), createDepartmentHandler);
departmentsRouter.patch("/:id", requirePermission(PERMISSIONS.DEPARTMENTS_WRITE), updateDepartmentHandler);
departmentsRouter.delete("/:id", requirePermission(PERMISSIONS.DEPARTMENTS_WRITE), deleteDepartmentHandler);
