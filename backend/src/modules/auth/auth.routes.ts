import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { loginHandler, logoutHandler, meHandler, refreshHandler } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/login", loginHandler);
authRouter.post("/refresh", refreshHandler);
authRouter.post("/logout", requireAuth, logoutHandler);
authRouter.get("/me", requireAuth, meHandler);
