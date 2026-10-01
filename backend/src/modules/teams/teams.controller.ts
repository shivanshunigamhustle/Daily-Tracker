import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { writeAuditLog } from "../../utils/audit";
import { createTeamSchema, updateTeamSchema } from "./teams.schema";
import * as teamsService from "./teams.service";

export const listTeamsHandler = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await teamsService.listTeams());
});

export const getTeamHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await teamsService.getTeam(req.params.id));
});

export const createTeamHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = createTeamSchema.parse(req.body);
  const team = await teamsService.createTeam(input);
  await writeAuditLog({ req, action: "CREATE", entity: "Team", entityId: team.id, newValue: team });
  res.status(201).json(team);
});

export const updateTeamHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = updateTeamSchema.parse(req.body);
  const before = await teamsService.getTeam(req.params.id);
  const team = await teamsService.updateTeam(req.params.id, input);
  await writeAuditLog({ req, action: "UPDATE", entity: "Team", entityId: team.id, oldValue: before, newValue: team });
  res.json(team);
});

export const deleteTeamHandler = asyncHandler(async (req: Request, res: Response) => {
  const before = await teamsService.getTeam(req.params.id);
  await teamsService.deleteTeam(req.params.id);
  await writeAuditLog({ req, action: "DELETE", entity: "Team", entityId: before.id, oldValue: before });
  res.status(204).send();
});
