# Node.js Social Feed API

A REST API for a social publishing app. It supports JWT-based authentication, profile status, author-owned post management, paginated feeds, and image uploads. MongoDB stores user and post data.

## Requirements

- Node.js 20.19 or later
- MongoDB 7 or later, local or hosted

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` and a unique `JWT_SECRET` of at least 32 characters.
3. Start the API with `npm run dev`.
4. The API listens on `http://localhost:8080`; `GET /health` reports service status.

The client origin defaults to `http://localhost:3000`. Set `CLIENT_ORIGIN` to a comma-separated list of allowed origins when needed.

## API

Authenticated routes expect `Authorization: Bearer <token>`.

| Method | Path | Purpose |
| --- | --- | --- |
| PUT | `/auth/signup` | Create an account |
| POST | `/auth/login` | Sign in and receive a one-hour JWT |
| GET | `/auth/status` | Read the signed-in user's status |
| PATCH | `/auth/status` | Update the signed-in user's status |
| GET | `/feed/posts?page=1` | Read a paginated feed |
| POST | `/feed/post` | Create a post using multipart fields `title`, `content`, and `image` |
| GET | `/feed/post/:postId` | Read one post |
| PUT | `/feed/post/:postId` | Update an owned post; an image is optional |
| DELETE | `/feed/post/:postId` | Delete an owned post |

Uploads accept JPEG, PNG, or WebP images up to 5 MB. Feed pages retain the two-post page size expected by the companion course client.

## Security notes

Secrets belong in local environment variables and must never be committed. The server uses Helmet, a configured CORS allowlist, password hashing, signed expiring tokens, bounded JSON and upload sizes, and ownership checks for post changes. Local image uploads are ignored by Git.

## License

MIT
