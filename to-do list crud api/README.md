# FlyRank Internship Week 3 Assignment A2

## What this is

This project is a CRUD API for a to-do list backed by Postgres instead of an in-memory array or SQLite file. The route and service contract stays the same from the caller’s perspective, and only the repository behind the storage boundary was swapped.

## Architecture note

The app keeps the same API surface, but the storage layer now uses a Postgres repository in `storage/taskStorage.js`. The service still calls methods such as `getAllTasks`, `getTaskById`, `createTask`, `updateTask`, and `deleteTask`, while the repository implementation talks to Postgres using `pg`.

## Why Postgres?

Postgres gives us durable data, SQL transactions, real table semantics, and a local stack that resembles later assignments with jobs, caching, and retrieval services.

## Environment setup

Create a local `.env` file from the example:

```bash
cp .env.example .env
```

The defaults are:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/taskdb
PORT=3000
```

## Run locally with Docker

From the project folder:

```bash
docker compose up --build
```

The app is available at `http://localhost:3000` and the Postgres database is exposed on `localhost:5432`.

## Database initialization

The database is created automatically by Postgres, and the script in `db/init.sql` creates the `tasks` table and seeds it only when it is empty.

## Endpoints

| Method | Route | Purpose | Success status |
| --- | --- | --- | --- |
| GET | `/` | Returns API metadata | `200` |
| GET | `/health` | Returns server health | `200` |
| GET | `/tasks` | Lists all tasks | `200` |
| GET | `/tasks/:id` | Returns one task | `200` |
| POST | `/tasks` | Creates a new task | `201` |
| PUT | `/tasks/:id` | Updates a task | `200` |
| DELETE | `/tasks/:id` | Deletes a task | `204` |

## Example SQL query

```sql
SELECT * FROM tasks ORDER BY id;
```

## Swagger UI

Swagger UI is available at `http://localhost:3000/docs/`.

![Swagger UI screenshot](swagger-ui.png)

## Persistence proof

The task data lives in the Postgres volume, so it survives container restarts. To check persistence:

```bash
docker compose up -d
curl -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Persist me"}'
docker compose down
docker compose up -d
curl http://localhost:3000/tasks
```

The row created before the restart remains available after the stack restarts.

## Redis integration

The Docker stack also includes a Redis service. The app connects to Redis using the `REDIS_URL` environment value and the `/health` endpoint verifies Redis is reachable by calling `PING`.

```bash
docker compose up --build
curl http://localhost:3000/health
```

This should return a healthy response when both Postgres and Redis are online.

## Notes

This codebase intentionally keeps the service and route layers consistent while swapping only the repository behind the storage boundary. That is the architectural proof that the app can move from in-memory or SQLite to Postgres without reworking the API layer.