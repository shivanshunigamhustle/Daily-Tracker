import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { authRouter } from "./modules/auth/auth.routes";
import { rolesRouter } from "./modules/roles/roles.routes";
import { departmentsRouter } from "./modules/departments/departments.routes";
import { teamsRouter } from "./modules/teams/teams.routes";
import { employeesRouter } from "./modules/employees/employees.routes";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/roles", rolesRouter);
app.use("/api/v1/departments", departmentsRouter);
app.use("/api/v1/teams", teamsRouter);
app.use("/api/v1/employees", employeesRouter);
app.use("/api/v1/dashboard", dashboardRouter);

app.use(notFoundHandler);
app.use(errorHandler);
