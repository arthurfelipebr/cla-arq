# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Start the API server (uses SQLite):
   `npm run server`
4. Run the app:
   `npm run dev`

## Deploying on CapRover

This repo includes a `captain-definition` file so you can deploy directly to a CapRover server. Build and push your image, or use CapRover's one-click deploy with this repository. The app exposes port `3000` by default.
