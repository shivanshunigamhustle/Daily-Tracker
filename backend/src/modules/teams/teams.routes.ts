import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requirePermission } from "../../middleware/rbac";
import { PERMISSIONS } from "../../config/permissions";
import {
  createTeamHandler,
  deleteTeamHandler,
  getTeamHandler,
  listTeamsHandler,
  updateTeamHandler,
} from "./teams.controller";

export const teamsRouter = Router();

teamsRouter.use(requireAuth);

teamsRouter.get("/", requirePermission(PERMISSIONS.TEAMS_READ), listTeamsHandler);
teamsRouter.get("/:id", requirePermission(PERMISSIONS.TEAMS_READ), getTeamHandler);
teamsRouter.post("/", requirePermission(PERMISSIONS.TEAMS_WRITE), createTeamHandler);
teamsRouter.patch("/:id", requirePermission(PERMISSIONS.TEAMS_WRITE), updateTeamHandler);
teamsRouter.delete("/:id", requirePermission(PERMISSIONS.TEAMS_WRITE), deleteTeamHandler);
