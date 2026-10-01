import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { CreateDepartmentInput, UpdateDepartmentInput } from "./departments.schema";

export function listDepartments() {
  return prisma.department.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { teams: true, employees: true } } },
  });
}

export async function getDepartment(id: string) {
  const department = await prisma.department.findUnique({ where: { id } });
  if (!department) throw ApiError.notFound("Department not found");
  return department;
}

export async function createDepartment(input: CreateDepartmentInput) {
  const existing = await prisma.department.findUnique({ where: { name: input.name } });
  if (existing) throw ApiError.conflict("A department with this name already exists");
  return prisma.department.create({ data: input });
}

export async function updateDepartment(id: string, input: UpdateDepartmentInput) {
  await getDepartment(id);
  return prisma.department.update({ where: { id }, data: input });
}

export async function deleteDepartment(id: string) {
  await getDepartment(id);
  await prisma.department.delete({ where: { id } });
}
