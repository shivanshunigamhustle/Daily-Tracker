import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { writeAuditLog } from "../../utils/audit";
import { createEmployeeSchema, updateEmployeeSchema } from "./employees.schema";
import * as employeesService from "./employees.service";

export const listEmployeesHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  res.json(await employeesService.listEmployees(req.user));
});

export const getEmployeeHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  res.json(await employeesService.getEmployee(req.params.id, req.user));
});

export const createEmployeeHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = createEmployeeSchema.parse(req.body);
  const employee = await employeesService.createEmployee(input);
  await writeAuditLog({ req, action: "CREATE", entity: "Employee", entityId: employee.id, newValue: employee });
  res.status(201).json(employee);
});

export const updateEmployeeHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = updateEmployeeSchema.parse(req.body);
  const before = await employeesService.getEmployee(req.params.id, req.user);
  const employee = await employeesService.updateEmployee(req.params.id, input);
  await writeAuditLog({
    req,
    action: "UPDATE",
    entity: "Employee",
    entityId: employee.id,
    oldValue: before,
    newValue: employee,
  });
  res.json(employee);
});

export const deleteEmployeeHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const before = await employeesService.getEmployee(req.params.id, req.user);
  await employeesService.deleteEmployee(req.params.id);
  await writeAuditLog({ req, action: "DELETE", entity: "Employee", entityId: before.id, oldValue: before });
  res.status(204).send();
});
