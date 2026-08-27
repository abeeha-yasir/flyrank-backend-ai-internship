# Auth Login API

Secure Express API built with Supabase Auth. It supports account creation, login, logout, JWT verification, protected routes, and interactive Swagger documentation.

## Setup

1. Create a Supabase project and copy its project URL and anon key.
2. Copy `.env.example` to `.env` and set the values:

```env
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_anon_key
PORT=3000
```

3. Install dependencies and start the server:

```bash
npm install
npm start
```

The API runs at `http://localhost:3000`. Swagger UI is available at `http://localhost:3000/docs`.

Never commit `.env` or use the Supabase `service_role` key. Use the public `anon` key for this application.

## API Reference

| Method | Endpoint | Purpose | Authentication |
| --- | --- | --- | --- |
| POST | `/auth/signup` | Create a user account | None |
| POST | `/auth/login` | Authenticate and return access and refresh tokens | None |
| POST | `/auth/logout` | End the current session | Bearer token |
| GET | `/protected/profile` | Return safe current-user metadata | Bearer token |
| GET | `/protected/dashboard` | Return protected dashboard data | Bearer token |
| GET | `/public/info` | Return public information | None |

Protected requests use this header:

```text
Authorization: Bearer <access_token>
```

## Example Requests

```bash
curl -i -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

curl -i http://localhost:3000/public/info

curl -i http://localhost:3000/protected/profile \
  -H "Authorization: Bearer <access_token>"
```

## Status Codes

- `200` successful login and reads
- `201` successful signup
- `204` successful logout
- `400` missing signup or login fields
- `401` missing, malformed, invalid, or expired bearer token
- `503` Supabase configuration is unavailable

## Security Flow

Supabase stores credentials and issues signed JWTs. The reusable `requireAuth` middleware extracts the bearer token, asks Supabase to verify it, attaches the verified user to `req.user`, and only then allows a protected route to run.