# Run and deploy your AI Studio app

This contains everything you need to run your app locally. All data is persisted
using a local **SQLite** database so no external database server is required.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Start the API server (uses SQLite):
   `npm run server`
4. Run the app:
   `npm run dev`

### Database

Running the server for the first time creates a `database.sqlite` file in the
project root. You can inspect or modify this file with any SQLite tool, e.g.:

```
sqlite3 database.sqlite
```

## Deploying on CapRover

This repo includes a `captain-definition` file so you can deploy directly to a CapRover server. Build and push your image, or use CapRover's one-click deploy with this repository. The app exposes port `3000` by default.
