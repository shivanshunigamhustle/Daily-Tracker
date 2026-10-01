import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { writeAuditLog } from "../../utils/audit";
import { createDepartmentSchema, updateDepartmentSchema } from "./departments.schema";
import * as departmentsService from "./departments.service";

export const listDepartmentsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const departments = await departmentsService.listDepartments();
  res.json(departments);
});

export const getDepartmentHandler = asyncHandler(async (req: Request, res: Response) => {
  const department = await departmentsService.getDepartment(req.params.id);
  res.json(department);
});

export const createDepartmentHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = createDepartmentSchema.parse(req.body);
  const department = await departmentsService.createDepartment(input);
  await writeAuditLog({ req, action: "CREATE", entity: "Department", entityId: department.id, newValue: department });
  res.status(201).json(department);
});

export const updateDepartmentHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = updateDepartmentSchema.parse(req.body);
  const before = await departmentsService.getDepartment(req.params.id);
  const department = await departmentsService.updateDepartment(req.params.id, input);
  await writeAuditLog({
    req,
    action: "UPDATE",
    entity: "Department",
    entityId: department.id,
    oldValue: before,
    newValue: department,
  });
  res.json(department);
});

export const deleteDepartmentHandler = asyncHandler(async (req: Request, res: Response) => {
  const before = await departmentsService.getDepartment(req.params.id);
  await departmentsService.deleteDepartment(req.params.id);
  await writeAuditLog({ req, action: "DELETE", entity: "Department", entityId: before.id, oldValue: before });
  res.status(204).send();
});
