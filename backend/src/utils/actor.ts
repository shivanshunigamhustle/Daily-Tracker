import { prisma } from "../config/prisma";
import { ApiError } from "./ApiError";
import { AccessTokenPayload } from "./jwt";

export const MANAGER_ROLES = ["MANAGER", "ADMIN", "SUPER_ADMIN"];
export const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"];

export function startOfToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function requireActingEmployee(user: AccessTokenPayload) {
  const employee = await prisma.employee.findUnique({ where: { userId: user.sub } });
  if (!employee) throw ApiError.forbidden("This account has no employee profile");
  return employee;
}

/** Employee ids that a manager may act on: members of teams they manage. Admins get everyone. */
export async function visibleEmployeeIds(user: AccessTokenPayload): Promise<string[] | "all"> {
  if (ADMIN_ROLES.includes(user.role)) return "all";
  const me = await requireActingEmployee(user);
  const members = await prisma.employee.findMany({
    where: { OR: [{ id: me.id }, { team: { managerId: me.id } }] },
    select: { id: true },
  });
  return members.map((m) => m.id);
}
