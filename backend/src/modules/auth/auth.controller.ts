import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { loginSchema, refreshSchema } from "./auth.schema";
import * as authService from "./auth.service";

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);
  const result = await authService.login(input.email, input.password);
  res.json(result);
});

export const refreshHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = refreshSchema.parse(req.body);
  const result = await authService.refresh(input.refreshToken);
  res.json(result);
});

export const logoutHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await authService.logout(req.user.sub);
  res.status(204).send();
});

export const meHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const user = await authService.getMe(req.user.sub);
  res.json(user);
});
