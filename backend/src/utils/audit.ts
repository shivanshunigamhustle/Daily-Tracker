import { Request } from "express";
import { prisma } from "../config/prisma";

interface AuditParams {
  req: Request;
  action: string;
  entity: string;
  entityId?: string;
  oldValue?: unknown;
  newValue?: unknown;
}

export async function writeAuditLog({ req, action, entity, entityId, oldValue, newValue }: AuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: req.user?.sub,
        action,
        entity,
        entityId,
        oldValue: oldValue === undefined ? undefined : JSON.parse(JSON.stringify(oldValue)),
        newValue: newValue === undefined ? undefined : JSON.parse(JSON.stringify(newValue)),
        ip: req.ip,
      },
    });
  } catch (err) {
    console.error("[audit] failed to write audit log:", err);
  }
}
