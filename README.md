# AVISHU Superapp Core

Project scope in this repository:

- `Expo Router` frontend for web/mobile
- `Express + Socket.io` core API
- `Prisma + PostgreSQL` data layer
- Project `#2` (`AI Vision`) is intentionally out of scope here

## What is included

- Public landing page for the brand and store story
- Role-based demo login for `client`, `franchisee`, `production`
- Client vitrina with product cards, preorder flow, payment stub
- Franchisee dashboard with live incoming orders
- Production tablet queue with large action controls
- Manual light/dark theme switching
- Realtime order sync through `Socket.io`

## Run the project

1. Start PostgreSQL in Docker:

```bash
npm run db:up
```

2. Run Prisma migration:

```bash
npm run db:migrate
```

3. Seed demo data:

```bash
npm run db:seed
```

4. Start frontend and API together:

```bash
npm run dev
```

## Useful commands

```bash
npm run dev:web
npm run dev:core
npm run db:down
```

## Environment

Root `.env`

```bash
EXPO_PUBLIC_CORE_API_URL=http://localhost:3000
```

`server/core-api/.env`

```bash
PORT=3000
JWT_SECRET=super_hackathon_secret_avishu
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/avishu_core?schema=public
```

## Demo flow

1. Open the landing page `/`
2. Go to demo login and enter as `client`
3. Create an order from a product card
4. Switch to `franchisee` and move the order to production
5. Switch to `production` and finish the stage
6. Return to `client` and confirm the status changed to `ready`
