import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requirePermission } from "../../middleware/rbac";
import { PERMISSIONS } from "../../config/permissions";
import {
  createEmployeeHandler,
  deleteEmployeeHandler,
  getEmployeeHandler,
  listEmployeesHandler,
  updateEmployeeHandler,
} from "./employees.controller";

export const employeesRouter = Router();

employeesRouter.use(requireAuth);

employeesRouter.get("/", requirePermission(PERMISSIONS.EMPLOYEES_READ), listEmployeesHandler);
employeesRouter.get("/:id", requirePermission(PERMISSIONS.EMPLOYEES_READ), getEmployeeHandler);
employeesRouter.post("/", requirePermission(PERMISSIONS.EMPLOYEES_WRITE), createEmployeeHandler);
employeesRouter.patch("/:id", requirePermission(PERMISSIONS.EMPLOYEES_WRITE), updateEmployeeHandler);
employeesRouter.delete("/:id", requirePermission(PERMISSIONS.EMPLOYEES_WRITE), deleteEmployeeHandler);
