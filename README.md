## Competition Platform

This is a [Next.js](https://nextjs.org) workspace for running cybersecurity hackathons with an admin dashboard, task management, and team portal.

## Getting Started

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the UI.

## Persistent Data Store

- Runtime data (teams, assignments, custom tasks) now persists to `data/store.json`.
- On first boot the file is created with the default cyber range tasks and empty team/assignment lists.
- Ensure the `data/` directory is writable in your deployment target; back it up if you redeploy or scale horizontally.
- Delete `data/store.json` if you want to reset the environment.

For production you can mount a volume, point the app to shared storage, or replace `src/lib/store.ts` with a proper database adapter.

## Environment

- `ADMIN_USERNAME` / `ADMIN_PASSWORD` override the default admin credentials.
- Set `NODE_ENV=production` when deploying.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js in dev mode |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
