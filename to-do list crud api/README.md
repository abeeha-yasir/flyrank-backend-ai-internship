# FlyRank Internship Week 2 Assignment A1

## What this is

This project is a small in-memory CRUD API for a to-do list, built with Node.js, Express, and Swagger UI.

## How to run

From the `to-do list crud api` folder:

```bash
npm start
```

That starts the server on `http://localhost:3000`.

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

## Example curl output

```bash
curl -i http://localhost:3000/tasks/99
```

```text
HTTP/1.1 404 Not Found
Content-Type: application/json; charset=utf-8

{"error":"Task 99 not found"}
```

## Swagger UI

Swagger UI is available at `http://localhost:3000/docs/`.

![Swagger UI screenshot](to-do%20list%20crud%20api/swagger-ui.png)

## Notes

The API stores tasks only in memory, so data resets when the server restarts.

## Optional extras

I added query filtering and search on `GET /tasks`, a `GET /stats` endpoint, and `POST /reset` to restore the seeded tasks.

On restart, all created tasks disappear because they only live in memory. That is the intended behavior for this stage and the reason the next week introduces persistence.