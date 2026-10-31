# Team Task Board: one-page plan

## Users

- **Visitor:** can see the public landing page and registration/login links.
- **Authenticated user:** can see projects they belong to, create a project, and work on tasks according to their role.
- **Owner:** created the project; manages project details and membership roles.
- **Member:** reads the project and creates/updates/deletes tasks.
- **Viewer:** reads the project and tasks but cannot change them.

## Pages and journey

1. `/` explains the product and sends a visitor to registration or login.
2. `/register` creates a Supabase Auth account and profile.
3. `/login` signs an existing user in.
4. `/projects` lists the user's projects, creates a project, and accepts a project ID to join.
5. `/projects/[id]` shows the authorized project and its tasks. Members create and update tasks.
6. `/projects/[id]/settings` shows members. Owners can change roles or remove members.

Happy path: register -> create project -> add a second account using its user ID -> assign a role -> create and update tasks -> verify a viewer cannot edit -> sign out.

## Database records

| Table | Why it exists | Important relationship |
|---|---|---|
| `profiles` | Safe display name and email metadata | one row per `auth.users` account |
| `projects` | Team workspaces | one owner, many memberships |
| `memberships` | Connects users to projects and stores `owner/member/viewer` | composite key `(project_id, user_id)` |
| `tasks` | Work items and progress | each task belongs to one project |

## Access rules

RLS is enabled on every application table. A user can only read a project, membership, or task when their membership exists. Owners manage projects and memberships. Owners and members manage tasks. Viewers are read-only. The browser only receives the Supabase publishable key; no service-role key belongs in `.env` or client code.

## Expected states

Every data page needs loading, empty, success, and error states. If Supabase is unavailable, the UI keeps the form values and displays a clear retry message rather than pretending that a write succeeded.

## Evidence checklist

- Screenshots: landing, login, projects empty state, project with tasks, settings, and a denied viewer action. Hide email addresses and all environment variables.
- Diagram: `profiles -> memberships <- projects -> tasks`.
- Test three accounts across two projects and confirm cross-project isolation.
- Record a short walkthrough of registration, project creation, role assignment, task updates, and logout.
