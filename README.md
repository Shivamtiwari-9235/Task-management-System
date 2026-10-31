# TeamTasker

TeamTasker is a simple task-management app for small teams. Create projects, invite teammates, assign roles, and track work across **To do**, **In progress**, and **Done**.

## How it works

1. Create an account and log in.
2. Create a project or join one with its project ID.
3. Add tasks with descriptions and priorities.
4. Move tasks across the board as work progresses.
5. Add teammates from **Team settings**.

Roles:

- **Owner**: manage the project, members, and tasks.
- **Member**: create and update tasks.
- **Viewer**: view tasks only.

## Run locally

```bash
npm install
copy .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Add your Supabase URL and publishable key to `.env`. Then run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL Editor to create the tables, policies, and project function.

## Useful commands

```bash
npm run dev
npm run lint
npm run build
```

## Tech stack

Next.js, React, Tailwind CSS, and Supabase Auth/Postgres with Row Level Security.

Never commit `.env` or any Supabase service-role key. Use [`.env.example`](./.env.example) as the safe configuration template.
