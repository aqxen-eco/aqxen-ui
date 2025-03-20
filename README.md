## Getting Started

### 1. Run the docker compose to up the database.

```bash
docker compose up -d
```

|          |          |
| -------- | -------- |
| Image    | Postgres |
| Database | upscale  |
| User     | docker   |
| Password | docker   |

```bash
docker compose down
```

### 2. Run migrate to create database schema.

[Link to doc migrate](https://www.prisma.io/docs/orm/reference/prisma-cli-reference#prisma-migrate)

```bash
pnpm prisma:migrate
```

### 3. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Open prisma studio

Prisma Studio is a visual editor for the data in your database.

```bash
pnpm prisma:studio
```
