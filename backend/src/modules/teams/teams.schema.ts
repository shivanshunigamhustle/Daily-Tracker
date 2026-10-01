import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().min(1).max(120),
  departmentId: z.string().uuid(),
  managerId: z.string().uuid().optional(),
});

export const updateTeamSchema = createTeamSchema.partial();

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
