import "dotenv/config";
import { PrismaClient, RoleName } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ROLE_PERMISSIONS } from "../src/config/permissions";

const prisma = new PrismaClient();

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.length < 12) throw new Error(`${name} must be set (min 12 chars) before seeding`);
  return value;
}

const env = {
  superAdminEmail: requiredEnv("SEED_SUPER_ADMIN_EMAIL"),
  superAdminPassword: requiredEnv("SEED_SUPER_ADMIN_PASSWORD"),
  managerEmail: process.env.SEED_MANAGER_EMAIL ?? "manager@tracker.local",
  managerPassword: process.env.SEED_MANAGER_PASSWORD ?? "Manager@12345",
  employeeEmail: process.env.SEED_EMPLOYEE_EMAIL ?? "employee@tracker.local",
  employeePassword: process.env.SEED_EMPLOYEE_PASSWORD ?? "Employee@12345",
};

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

async function ensureRolesAndPermissions() {
  const roleNames = Object.keys(ROLE_PERMISSIONS) as RoleName[];
  const allPermissionKeys = Array.from(new Set(roleNames.flatMap((name) => ROLE_PERMISSIONS[name])));

  const permissionsByKey = new Map<string, string>();
  for (const key of allPermissionKeys) {
    const permission = await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key },
    });
    permissionsByKey.set(key, permission.id);
  }

  const rolesByName = new Map<RoleName, string>();
  for (const name of roleNames) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    rolesByName.set(name, role.id);

    for (const key of ROLE_PERMISSIONS[name]) {
      const permissionId = permissionsByKey.get(key)!;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId } },
        update: {},
        create: { roleId: role.id, permissionId },
      });
    }
  }

  return rolesByName;
}

async function ensureUserWithEmployee(opts: {
  email: string;
  password: string;
  roleId: string;
  fullName: string;
  employeeCode: string;
  designation: string;
  departmentId?: string;
  teamId?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: opts.email } });
  if (existing) return existing;

  const passwordHash = await hash(opts.password);
  const user = await prisma.user.create({
    data: { email: opts.email, passwordHash, roleId: opts.roleId },
  });

  await prisma.employee.create({
    data: {
      userId: user.id,
      employeeCode: opts.employeeCode,
      fullName: opts.fullName,
      designation: opts.designation,
      departmentId: opts.departmentId,
      teamId: opts.teamId,
      employmentStatus: "ACTIVE",
      workMode: "OFFICE",
      joiningDate: new Date(),
    },
  });

  return user;
}

async function main() {
  console.log("Seeding roles and permissions...");
  const rolesByName = await ensureRolesAndPermissions();

  console.log("Seeding super admin...");
  await ensureUserWithEmployee({
    email: env.superAdminEmail,
    password: env.superAdminPassword,
    roleId: rolesByName.get("SUPER_ADMIN")!,
    fullName: "Super Admin",
    employeeCode: "EMP-0001",
    designation: "Super Administrator",
  });

  if (process.env.SEED_DEMO === "true") {
    console.log("Seeding sample department and team...");
    const department = await prisma.department.upsert({
      where: { name: "Technology" },
      update: {},
      create: { name: "Technology", description: "Engineering and product teams" },
    });

    const team = await prisma.team.upsert({
      where: { departmentId_name: { departmentId: department.id, name: "Team A" } },
      update: {},
      create: { name: "Team A", departmentId: department.id },
    });

    console.log("Seeding manager...");
    const managerUser = await ensureUserWithEmployee({
      email: env.managerEmail,
      password: env.managerPassword,
      roleId: rolesByName.get("MANAGER")!,
      fullName: "Sample Manager",
      employeeCode: "EMP-0002",
      designation: "Engineering Manager",
      departmentId: department.id,
      teamId: team.id,
    });

    const managerEmployee = await prisma.employee.findUnique({ where: { userId: managerUser.id } });
    if (managerEmployee) {
      await prisma.team.update({ where: { id: team.id }, data: { managerId: managerEmployee.id } });
    }

    console.log("Seeding employee...");
    const employeeUser = await ensureUserWithEmployee({
      email: env.employeeEmail,
      password: env.employeePassword,
      roleId: rolesByName.get("EMPLOYEE")!,
      fullName: "Sample Employee",
      employeeCode: "EMP-0003",
      designation: "Software Engineer",
      departmentId: department.id,
      teamId: team.id,
    });

    if (managerEmployee) {
      const employeeRecord = await prisma.employee.findUnique({ where: { userId: employeeUser.id } });
      if (employeeRecord) {
        await prisma.employee.update({ where: { id: employeeRecord.id }, data: { managerId: managerEmployee.id } });
      }
    }

  }

  console.log("Seed complete.");
  console.log(`  Super admin: ${env.superAdminEmail}`);
  if (process.env.SEED_DEMO === "true") console.log("  Demo data created (SEED_DEMO=true).");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
