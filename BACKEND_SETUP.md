# PostgreSQL + Prisma Setup (pgAdmin compatible)

## 1) Create DB in pgAdmin
Create database: `saas_rbac`

## 2) Configure env
Create `.env` in project root:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>:5432/saas_rbac?schema=public"
```

Example local:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/saas_rbac?schema=public"
```

## 3) Generate Prisma client and apply schema
```bash
npm run db:generate
npm run db:migrate -- --name init
```

If you prefer push (no migration files):
```bash
npm run db:push
```

## 4) Start app
```bash
npm run dev
```

## 5) Available dynamic backend APIs
- `GET/POST /api/organizations`
- `GET/PATCH/DELETE /api/organizations/:id`
- `GET/POST /api/roles`
- `GET/PATCH/DELETE /api/roles/:id`

Each create/update/delete writes to `AuditLog` table.

## Notes
- Static `data/*.ts` is still used by many pages until they are migrated to API fetches.
- Next step is wiring all pages (users/invites/organizations/roles/subscriptions/payments/activity) to these APIs.
