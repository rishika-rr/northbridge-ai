# Northbridge AI — web client

React + TypeScript + Vite front end for the Enterprise RAG API
(`enterprise-rag` repository).

## Run locally

1. Start the backend (`uvicorn app.main:app` in `enterprise-rag`) with
   `ADMIN_USERNAME` / `ADMIN_PASSWORD` set in its `.env`.
2. Here:

   ```bash
   cp .env.example .env     # VITE_API_URL=http://127.0.0.1:8000
   npm install
   npm run dev              # http://localhost:5173
   ```

3. Sign in with the administrator account. Create more users under
   **Administration**.

`npm run build` type-checks and builds to `dist/`; `npm run lint` runs ESLint.

## Deploying

Set `VITE_API_URL` to the backend's `https://` address at build time, and add
this site's exact origin to the backend's `CORS_ORIGINS`.

## How it works

| Area | Where |
| --- | --- |
| API calls, bearer token, error contract → user messages | `src/services/http.ts`, `src/services/api.ts` |
| Sign-in state; a rejected token returns the user to sign-in | `src/auth/` |
| What each role is offered (the server enforces the same rules) | `src/auth/permissions.ts` |
| Ask, answer with citation chips, sources, citation checks | `src/pages/ChatPage.tsx`, `src/components/results/` |
| Upload, ingestion status and failures, sharing, deletion | `src/pages/KnowledgeBasePage.tsx` |
| Users and audit log (administrators) | `src/pages/AdminPage.tsx` |
| Own profile and password | `src/pages/AccountPage.tsx` |

The access token is kept in memory and `sessionStorage`: it survives a page
refresh and is discarded when the tab closes.

| Role | Sees |
| --- | --- |
| Reader | Chat, Knowledge Base (read-only), Account |
| Document Manager | + upload, sharing, delete, ingestion status and failure reasons |
| Administrator | + Administration (users, audit log) |
