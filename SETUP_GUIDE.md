# Team Task Board: easy setup and code flow

This guide is written for a learner who is building the project step by step.

## 1. Install and run the website

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.



## 2. Add another team member for testing

For a classroom demo, create a second account. Copy only that account's UUID from Supabase Auth (not its password), then use the project settings form to add it. Test all three roles:

- owner: edit settings and tasks;
- member: edit tasks, not membership;
- viewer: read tasks, but edit buttons are disabled and RLS rejects writes.

The add-member action requires an active internet connection and a valid signed-in session. If the browser console shows `ERR_INTERNET_DISCONNECTED` while refreshing a Supabase token, reconnect and sign in again before retrying.

## 3. What to test

- Register with valid and invalid data.
- Log in and log out.
- Create a project and confirm it appears only for its members.
- Try an empty project and an empty task list.
- Create, edit status, and delete a task.
- Test owner/member/viewer permissions with separate accounts.
- Stop the network or use an invalid request and confirm a visible error appears.
- Take screenshots only after hiding emails, UUIDs, URLs, and environment values.

## 4. Deploy

Push the code to a private or public Git repository without `.env`. Add the two public environment variables in the hosting provider's project settings, run the production build, and add the deployed URL to Supabase Auth redirect URLs. Run the three-account test again after deployment.

## 7. Known boundary

This MVP uses a project ID for joining because it is easy to understand and test. A production product should replace that with expiring invite links or an invite table and server-side email workflow. File uploads and realtime subscriptions are intentionally optional assignment extensions and are not enabled by this starter implementation.
