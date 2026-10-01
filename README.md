# Team Daily Tracker — Phase 1: Foundation

A multi-role (Super Admin / Admin / Manager / Employee) team tracker. This phase ships the foundation: authentication, RBAC, departments, teams, employees, and a role-aware mobile home screen. Attendance, tasks, daily updates, and everything else in the PRD come in later phases.

## Stack

- **Backend**: Node.js, Express, TypeScript, PostgreSQL (via Prisma), Redis (refresh-token sessions), JWT auth
- **Mobile**: Expo (React Native + TypeScript), React Navigation, Axios
- **Local dev**: Docker Compose for Redis (Postgres is a hosted Neon database — see below)

## Project layout

```
backend/   Express API (auth, roles, departments, teams, employees, dashboard)
mobile/    Expo app (iOS + Android)
docker-compose.yml   Redis (+ optional local Postgres, Postgres+backend containers)
```

## Backend setup

The backend's database is a hosted **Neon Postgres** instance, configured via `DATABASE_URL` in `backend/.env` (already created locally — not committed). Redis runs locally via Docker.

1. Start Redis:
   ```bash
   docker compose up -d redis
   ```
2. Install dependencies and set up the database:
   ```bash
   cd backend
   npm install
   npx prisma migrate dev --name init   # already run once against the Neon DB
   npm run seed                          # already run once — creates roles + sample users
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
   The API listens on `http://localhost:4000`. Health check: `GET /health`.

If you'd rather run Postgres locally instead of Neon, `docker-compose.yml` also defines a `postgres` service — point `DATABASE_URL` in `backend/.env` at it (`postgresql://tracker:tracker@localhost:5432/tracker`) and re-run the migration.

### Seeded accounts

| Role        | Email                   | Password      |
|-------------|--------------------------|----------------|
| Super Admin | admin@tracker.local      | Admin@12345    |
| Manager     | manager@tracker.local    | Manager@12345  |
| Employee    | employee@tracker.local   | Employee@12345 |

### API surface (Phase 1)

```
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/me

GET    /api/v1/roles

GET/POST/PATCH/DELETE /api/v1/departments[/:id]
GET/POST/PATCH/DELETE /api/v1/teams[/:id]
GET/POST/PATCH/DELETE /api/v1/employees[/:id]

GET    /api/v1/dashboard/me
```

RBAC is permission-based (seeded in `prisma/seed.ts` via `src/config/permissions.ts`): Super Admin/Admin have full access, Managers can read their team, Employees can read their own record. Every write goes through `AuditLog`.

## Mobile app setup

```bash
cd mobile
npm install
npx expo start
```

- **iOS Simulator / Android Emulator**: works out of the box against `http://localhost:4000` (Android emulator auto-maps to `10.0.2.2`).
- **Physical device via Expo Go**: copy `mobile/.env.example` to `mobile/.env` and set `EXPO_PUBLIC_API_URL` to your computer's LAN IP, e.g. `http://192.168.1.50:4000/api/v1`. Your phone and computer must be on the same network.

Log in with any of the seeded accounts above. The bottom tabs (Employees / Departments / Teams) only appear for Admin and Super Admin roles; Managers and Employees see Dashboard + Profile.

## Verification performed

- `npx tsc --noEmit` passes in both `backend/` and `mobile/`.
- `npx prisma migrate dev` applied cleanly against the Neon database.
- `npm run seed` created the 4 roles, their permissions, and the 3 sample users above.
- `GET /health` returns `{ "status": "ok" }`.

## What's next (Phase 2+)

Attendance (check-in/check-out, breaks, work mode), task management, daily updates and manager review workflow, dashboards with real data, leave, notifications, reporting, and AI features — per the original PRD's phase breakdown.
