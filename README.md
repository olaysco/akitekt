# Akitekt

Akitekt is a visual architecture workspace. The architecture document is the source of truth; the canvas and AI assistant both work through document operations.

## Run locally

Start the API server from `apps/api`:

```sh
OPENAI_API_KEY=your-key go run ./cmd/server
```

Optionally select a model with `OPENAI_MODEL`; it defaults to `gpt-5.2`.

Then start the web app from `apps/web`:

```sh
npm run dev
```

Vite proxies `/api` requests to the local API server on port `8080`.

## AI architecture proposals

The Architect tab sends the user request and a domain-only architecture snapshot to the API. The API calls OpenAI server-side and returns an operation proposal for review. Applying a proposal always goes through `architectureStore.execute()` with a `COMPOSITE` `DocumentOperation`.

`OPENAI_API_KEY` is read only by the API server and must not be added to the web app or committed to the repository.
