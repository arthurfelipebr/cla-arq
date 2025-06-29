# Run and deploy your AI Studio app

This contains everything you need to run your app locally. All data is persisted
using a local **SQLite** database so no external database server is required.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and update the values:
   `cp .env.example .env.local`
   - Set `GEMINI_API_KEY` to your Gemini API key
   - (Optional) adjust `VITE_API_BASE` if the API runs on another host
3. Start the API server (uses SQLite):
   `PORT=3005 npm run server`
4. Run the frontend (Vite dev server on port `5173` by default):
   `npm run dev`

### Database

Running the server for the first time creates a `database.sqlite` file in the
project root. You can inspect or modify this file with any SQLite tool, e.g.:

```
sqlite3 database.sqlite
```

The database is initialized with a demo administrator account using the
credentials `demo@dev.com` / `demopass`. You can log in with these credentials
or modify the `server/database.js` file to seed a different user.

## Running with PM2

Install [PM2](https://pm2.keymetrics.io) globally:

```
npm install -g pm2
```

Use the provided `ecosystem.config.cjs` to run both the API server and the
frontend under PM2:

```
pm2 start ecosystem.config.cjs
```

This starts two processes:

* `gestao-api` &ndash; runs `server/index.js` on port `3005`
* `gestao-app` &ndash; runs `npm run dev` (Vite dev server)

You can view logs with `pm2 logs` and persist the process list with:

```
pm2 save
```
