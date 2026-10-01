# WatchParty 🎬

> **Real-Time YouTube Watch Party Web Application** with server-authoritative playback synchronization, granular role-based access control (Host, Moderator, Participant), live chat, and control requests.

![WatchParty Cover](https://images.unsplash.com/photo-1578022761797-b8636ac1773c?auto=format&fit=crop&w=1200&q=80)

---

## 1. Overview

**WatchParty** allows multiple users across different browsers and devices to watch the same YouTube video together with millisecond-accurate synchronization. When the Host or a Moderator plays, pauses, seeks, or changes the video, every participant's player reflects the update instantly.

### Core Flow:
1. A user creates a Watch Party and automatically becomes the **Host**.
2. The room gets a unique code (e.g. `WK-7F29Q`) and a shareable link (`/join/WK-7F29Q` or `/room/WK-7F29Q`).
3. Others join via code or link and become **Participants**.
4. Everyone watches the same video at the exact same position with continuous drift correction.
5. Host and Moderators control playback directly. Participants can submit control requests (Play, Pause, Seek, Change Video) for Host/Moderator approval.
6. Host can promote/demote Moderators, transfer Host status, remove participants, and end the room.
7. Room state and playback stay consistent for late joiners and reconnecting users.

---

## 2. Key Features

- **⚡ Server-Authoritative Synchronization:** Playback state, monotonic versioning, and time calculation reside on the backend. Clients are purely renderers of truth.
- **🛡️ Granular Role-Based Access Control (RBAC):** Every single WebSocket event is validated server-side by checking `socket.id -> participant -> room -> role`. Unauthorized events are rejected with `UNAUTHORIZED`.
- **🔄 Loop & Echo Prevention:** `isApplyingRemoteUpdate` guards ensure remote state applications never re-emit events back to the server.
- **🕒 Clock Offset Estimation:** NTP-like ping exchange calculates client-to-server clock offset for sub-second precision across time zones.
- **📡 Resilient Reconnection & Identity:** Session tokens stored in `localStorage` allow seamless reconnection on page refresh or network drop without losing identity or role.
- **✋ Control Request System:** Participants can request Play, Pause, Seek, or Video changes, appearing in the Host/Moderator inbox for one-click approval or rejection.
- **💬 Real-Time Live Chat:** Fast, rate-limited, and HTML-sanitized chat with role badges and system messages.
- **🎨 Dark-First Modern UI:** Built with Tailwind CSS, custom glassmorphism, Lucide icons, Sonner toasts, and mobile/tablet responsive tabs.
- **🔊 Autoplay Restriction Handling:** Graceful "Join Live Playback" overlay handles browser audio autoplay restrictions smoothly.

---

## 3. Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, React Router v6, Socket.IO Client, YouTube IFrame Player API, Sonner.
- **Backend:** Node.js, Express, TypeScript, Socket.IO, Zod, Helmet, CORS, Express Rate Limit.
- **Database:** SQLite via Prisma ORM for development; schema is 100% PostgreSQL-compatible (string-based validated enums, standard indices).
- **Testing:** Vitest for unit and integration testing.
- **Monorepo:** npm workspaces (`@watchparty/shared`, `@watchparty/backend`, `@watchparty/frontend`).

---

## 4. Architecture & Data Flow

```mermaid
graph TD
    ClientA[Client A (Host)] <-->|WebSocket / REST| Server[Node.js + Socket.IO Server]
    ClientB[Client B (Moderator)] <-->|WebSocket| Server
    ClientC[Client C (Participant)] <-->|WebSocket| Server
    Server <-->|Authoritative State| InMem[(In-Memory Room Store)]
    Server <-->|Durable Persistence| DB[(SQLite / PostgreSQL via Prisma)]
```

---

## 5. Project Structure

```
watch-party/
├── package.json               # Root npm workspaces configuration
├── .gitignore
├── shared/                    # Shared types, Zod schemas, and event maps
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── types.ts           # Domain models & payload interfaces
│       ├── schemas.ts         # Zod schemas for all events and REST requests
│       ├── events.ts          # Typed ClientToServer & ServerToClient events
│       └── index.ts
├── backend/                   # Express + Socket.IO + Prisma Backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   └── schema.prisma      # SQLite / PostgreSQL schema
│   ├── src/
│   │   ├── config/env.ts      # Validated environment config
│   │   ├── controllers/       # REST controllers (health, check room)
│   │   ├── models/            # Room and Participant OOP classes
│   │   ├── services/          # RoomManager, PermissionService, RateLimiter
│   │   ├── websocket/         # Socket.IO setup and event handlers
│   │   ├── utils/             # youtube.ts, roomCode.ts, token.ts, sanitize.ts
│   │   ├── __tests__/         # Vitest unit and integration test suite
│   │   └── server.ts          # Server bootstrap
├── frontend/                  # React + Vite + Tailwind Frontend
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── vercel.json            # SPA routing configuration
│   └── src/
│       ├── components/        # VideoPlayer, Controls, ParticipantList, Chat, Modals
│       ├── context/           # RoomProvider & reducer
│       ├── hooks/             # useYouTubePlayer, usePermissions, useRoom
│       ├── pages/             # Landing, CreateRoom, JoinRoom, RoomPage, NotFound
│       ├── services/          # typed Socket.IO singleton & REST client
│       ├── utils/             # youtube parsing, storage, tailwind merge
│       ├── App.tsx
│       └── main.tsx
```

---

## 6. Local Setup & Running

```bash
# 1. Install all monorepo dependencies
npm install

# 2. Setup environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Initialize Database
npx prisma db push --schema=backend/prisma/schema.prisma

# 4. Build shared types
npm run build --workspace=@watchparty/shared

# 5. Run both frontend and backend concurrently
npm run dev
```

The frontend will start at `http://localhost:5173` and the backend server at `http://localhost:4000`.
