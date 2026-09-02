# Akitekt

Akitekt is a visual architecture workspace. The architecture document is the source of truth; the canvas and AI assistant both work through document operations.

## Run locally

Start the API server from `apps/api`:

```sh
OPENAI_API_KEY=your-key go run ./cmd/server
```

Optionally select a model with `OPENAI_MODEL`; it defaults to `gpt-5.2`.

For a web app served from a different origin, set `AKITEKT_WEB_ORIGIN` to that exact origin. It defaults to `http://localhost:5173`.

Then start the web app from `apps/web`:

```sh
VITE_API_URL=http://127.0.0.1:18080 npm run dev
```

`VITE_API_URL` sets the API origin for local development. When it is omitted, the web app uses the relative `/api` path for same-origin deployments; Vite proxies that path to port `8080` in development.

## AI architecture proposals

The Architect tab sends the user request and a domain-only architecture snapshot to the API. The API calls OpenAI server-side and returns an operation proposal for review. Applying a proposal always goes through `architectureStore.execute()` with a `COMPOSITE` `DocumentOperation`.

`OPENAI_API_KEY` is read only by the API server and must not be added to the web app or committed to the repository.
