import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { CreateTeamInput, UpdateTeamInput } from "./teams.schema";

export function listTeams() {
  return prisma.team.findMany({
    orderBy: { name: "asc" },
    include: {
      department: { select: { id: true, name: true } },
      manager: { select: { id: true, fullName: true } },
      _count: { select: { members: true } },
    },
  });
}

export async function getTeam(id: string) {
  const team = await prisma.team.findUnique({
    where: { id },
    include: { department: true, manager: true, members: true },
  });
  if (!team) throw ApiError.notFound("Team not found");
  return team;
}

async function assertDepartmentExists(departmentId: string) {
  const department = await prisma.department.findUnique({ where: { id: departmentId } });
  if (!department) throw ApiError.badRequest("departmentId does not reference an existing department");
}

export async function createTeam(input: CreateTeamInput) {
  await assertDepartmentExists(input.departmentId);
  return prisma.team.create({ data: input });
}

export async function updateTeam(id: string, input: UpdateTeamInput) {
  await getTeam(id);
  if (input.departmentId) await assertDepartmentExists(input.departmentId);
  return prisma.team.update({ where: { id }, data: input });
}

export async function deleteTeam(id: string) {
  await getTeam(id);
  await prisma.team.delete({ where: { id } });
}
