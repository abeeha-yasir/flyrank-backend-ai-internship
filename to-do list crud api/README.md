# FlyRank Internship Week 3 Assignment A2

## What this is

This project is a CRUD API for a to-do list that now uses SQLite for persistent storage instead of an in-memory array. The API keeps the same endpoints as the Week 2 version, but tasks now survive server restarts because they live in a local database file.

## Why SQLite?

SQLite was chosen because it is a single-file database with zero setup. It is simple to run locally, creates the database automatically, and works well for small apps and learning projects like this one.

## How to run

From the `to-do list crud api` folder:

```bash
npm start
```

That starts the server on `http://localhost:3000`.

## Database file

The database file is created automatically as `tasks.db` in the project folder. It is created on first run and the `tasks` table is created automatically if it does not already exist.

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
SELECT * FROM tasks;
```

## Swagger UI

Swagger UI is available at `http://localhost:3000/docs/`.

![Swagger UI screenshot](swagger-ui.png)

## Notes

The API now reads and writes task data from SQLite, so created tasks remain available after a restart. The initial seed runs once and is protected by the database table being empty before insertion.