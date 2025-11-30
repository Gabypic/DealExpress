# DealExpress - API (TP)

Stack: Node.js, Express, MongoDB (Mongoose), JWT, express-validator, bcryptjs.

## Installation

1. Copier `.env.example` en `.env` et remplir.
2. `npm install`
3. `npm run dev` (ou `npm start`)

## Endpoints (rapide)

- `POST /api/auth/register` : { username, email, password }
- `POST /api/auth/login` : { email, password }
- `GET /api/auth/me` : auth

Deals:
- `GET /api/deals` : liste (pagination)
- `GET /api/deals/search?q=term`
- `GET /api/deals/:id`
- `POST /api/deals` : create (auth)
- `PUT /api/deals/:id` : update (owner only if pending)
- `DELETE /api/deals/:id` : delete (owner/admin)
- `POST /api/deals/:id/vote` : { type: "hot"|"cold" } (auth)
- `DELETE /api/deals/:id/vote` : retirer son vote

Comments:
- `GET /api/comments/deal/:dealId`
- `POST /api/comments/deal/:dealId` : { content } (auth)
- `PUT /api/comments/:id` : update own
- `DELETE /api/comments/:id` : delete own or admin

Admin / Modération:
- `GET /api/admin/deals/pending` (moderator/admin)
- `PATCH /api/admin/deals/:id/moderate` : { status: "approved"|"rejected" } (moderator/admin)
- `GET /api/admin/users` (admin)
- `PATCH /api/admin/users/:id/role` : { role } (admin)

## Notes

- JWT payload contains `{ id, role }`.
- Passwords bcrypt-hashed.
- Votes deduplicated (unique index on userId+dealId); re-vote remplace l'ancien vote.
- Temperature calculée = (#hot) - (#cold).
