# Saucemed — Vercel build (Gemini only)

A trimmed-down, deploy-ready version of Saucemed. Single project, no separate backend:

- Frontend = Vite + React (in `src/`)
- Backend = Vercel serverless functions (in `api/`)
- Engine = Google Gemini only (text + Nano Banana image generation)

## File map

```
saucemed-vercel/
├── api/
│   ├── text.js      → POST /api/text   (Gemini text)
│   ├── image.js     → POST /api/image  (Gemini Nano Banana image)
│   └── health.js    → GET  /api/health
├── src/
│   ├── App.jsx
│   ├── api.js
│   ├── index.css
│   └── main.jsx
├── public/
│   └── favicon.svg
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
├── .env.example
└── .gitignore
```

## Local dev

```bash
npm install
cp .env.example .env
# put your real GEMINI_API_KEY into .env
npx vercel dev
# → http://localhost:3000
```

`vercel dev` runs Vite for the frontend AND the serverless functions in `api/`
together on a single port, which mirrors how it works in production.

If you don't want to install the Vercel CLI yet, you can also run `npm run dev`
and the frontend will start — but the `/api/*` calls won't work until you
deploy or use `vercel dev`.

## Production deployment

See the deployment walkthrough in chat.

## Environment variables

| Variable | Required | Default |
|---|---|---|
| `GEMINI_API_KEY` | Yes | — |
| `GEMINI_TEXT_MODEL` | No | `gemini-3-flash-preview` |
| `GEMINI_IMAGE_MODEL` | No | `gemini-3.1-flash-image-preview` |
