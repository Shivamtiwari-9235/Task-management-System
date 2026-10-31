# Team Task Board: easy setup and code flow

This guide is written for a learner who is building the project step by step.

## 1. Install and run the website

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## 2. Create the Supabase project

1. Create a project at Supabase.
2. Open **SQL Editor** and run [`supabase/schema.sql`](./supabase/schema.sql).
   You can safely rerun the file after an earlier partial setup; it upgrades existing `profiles` and `tasks` tables and fills missing task ownership from the project owner.
3. Open **Project Settings -> API**.
4. Put only these two values in your local `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Never paste the service-role key into `.env`, screenshots, GitHub, or browser code. `.env` is ignored by Git; do not remove that protection.
If you change [`supabase/schema.sql`](./supabase/schema.sql), rerun the complete file in Supabase SQL Editor before testing membership changes.

## 3. Understand the flow

`src/app/layout.js` renders the navigation around every page. `src/lib/supabase.js` creates one browser-safe Supabase client. Auth pages call `supabase.auth`. Project and task pages call the database. Supabase RLS makes the final authorization decision even if somebody changes the browser request.

When a user registers, Supabase Auth creates `auth.users`. The database trigger copies the display name and email into `profiles`. Creating a project uses the `create_project` function, which creates both the project and the owner's membership in one operation. Every later query is filtered by membership policies.

## 4. Add another team member for testing

For a classroom demo, create a second account. Copy only that account's UUID from Supabase Auth (not its password), then use the project settings form to add it. Test all three roles:

- owner: edit settings and tasks;
- member: edit tasks, not membership;
- viewer: read tasks, but edit buttons are disabled and RLS rejects writes.

The add-member action requires an active internet connection and a valid signed-in session. If the browser console shows `ERR_INTERNET_DISCONNECTED` while refreshing a Supabase token, reconnect and sign in again before retrying.

## 5. What to test

- Register with valid and invalid data.
- Log in and log out.
- Create a project and confirm it appears only for its members.
- Try an empty project and an empty task list.
- Create, edit status, and delete a task.
- Test owner/member/viewer permissions with separate accounts.
- Stop the network or use an invalid request and confirm a visible error appears.
- Take screenshots only after hiding emails, UUIDs, URLs, and environment values.

## 6. Deploy

Push the code to a private or public Git repository without `.env`. Add the two public environment variables in the hosting provider's project settings, run the production build, and add the deployed URL to Supabase Auth redirect URLs. Run the three-account test again after deployment.

## 7. Known boundary

This MVP uses a project ID for joining because it is easy to understand and test. A production product should replace that with expiring invite links or an invite table and server-side email workflow. File uploads and realtime subscriptions are intentionally optional assignment extensions and are not enabled by this starter implementation.
