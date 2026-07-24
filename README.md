# Car Portal Frontend

Next.js 16 + TypeScript personal cabinet UI for Car Portal. Ukrainian-language driver dashboard with garage, maintenance plans, service logs, reminders, and admin CMS screens.

## Prerequisites

- Node.js 22+
- Running backend API — see [carportal-backend](https://github.com/ICS-Vortex/carportal-backend) or the Docker stack below

## Quick start (Docker stack)

The recommended local setup runs frontend, backend, nginx, and PostgreSQL together from [carportal-infra](https://github.com/ICS-Vortex/carportal-infra):

```bash
git clone git@github.com:ICS-Vortex/carportal-infra.git car-portal
cd car-portal
git clone git@github.com:ICS-Vortex/carportal-frontend.git frontend
git clone git@github.com:ICS-Vortex/carportal-backend.git backend
cp .env.example .env
docker compose up -d
```

Open:

- `http://carmain.localhost.com`
- `http://carmain.localhost.com/dashboard`
- `http://carmain.localhost.com/admin`

Add these hosts entries first:

```
127.0.0.1 carmain.local carmain.localhost.com
127.0.0.1 api.carmain.local api.carmain.localhost.com
```

See the [infra README](https://github.com/ICS-Vortex/carportal-infra#local-setup) for the full setup guide.

## Standalone development

Use this when you want to run Next.js directly on your machine.

1. Ensure the backend API is reachable (for example at `http://api.carmain.localhost.com` or `http://localhost:4000`).

2. Install dependencies:

```bash
npm install
```

3. Create `.env.local` (optional — defaults work if backend and nginx are on the usual local hosts):

```env
NEXT_PUBLIC_API_BASE_URL=http://api.carmain.localhost.com
INTERNAL_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

`INTERNAL_API_BASE_URL` is used for server-side fetches during SSR. Point it at the backend directly when not going through nginx.

4. Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

For Google Sign-In, configure the same OAuth client ID in both `NEXT_PUBLIC_GOOGLE_CLIENT_ID` here and `GOOGLE_CLIENT_ID` on the backend. See the [infra README](https://github.com/ICS-Vortex/carportal-infra#google-oauth-setup) for Google Cloud Console steps.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Next.js dev server with HMR |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

## Production build

```bash
npm run build
npm run start
```

Or use the production compose file from [carportal-infra](https://github.com/ICS-Vortex/carportal-infra):

```bash
docker compose -f docker-compose.prod.yml up --build -d
```
