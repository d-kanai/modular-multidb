# modular-multidb

Modular monolith application with multiple databases (SQLite) and separate frontends.

## Architecture

```
/customer-frontend (Next.js) - Port 3001
/admin-frontend (Next.js) - Port 3000
/backend/modules/user (Hono) - Port 4000
/backend/modules/screening (Hono) - Port 4001
```

## Features

- **Modular Monolith Backend**: Each module has its own database and API
- **Separate Databases**: User module and Screening module each have their own SQLite database
- **Event-Driven Communication**: Modules communicate via HTTP events for inter-module operations
- **Type-Safe Forms**: Frontend uses Zod for validation and React Hook Form
- **Real-time Updates**: Admin frontend uses TanStack Query with auto-refresh

## Workflow

1. **Customer Signup**: Customer signs up via customer frontend → calls user.signup API
2. **Apply Screening**: Customer applies for screening → calls screening.apply API
3. **Admin Review**: Admin views screening list → calls screening.list API
4. **Pass Screening**: Admin passes screening → calls screening.pass API → publishes "screening.passed" event → user module updates user status to ACTIVE

## Setup

### Install Dependencies

```bash
npm install
cd backend/modules/user && npm install
cd ../screening && npm install
cd ../../customer-frontend && npm install
cd ../admin-frontend && npm install
```

### Initialize Databases

```bash
# User module
cd backend/modules/user
npm run db:generate
npm run db:push

# Screening module
cd ../screening
npm run db:generate
npm run db:push
```

## Run

### Start All Services

```bash
# Terminal 1: User API
cd backend/modules/user
npm run dev

# Terminal 2: Screening API
cd backend/modules/screening
npm run dev

# Terminal 3: Customer Frontend
cd customer-frontend
npm run dev

# Terminal 4: Admin Frontend
cd admin-frontend
npm run dev
```

Or use concurrently from root:

```bash
npm run dev:all
```

## Access

- Customer Frontend: http://localhost:3001
- Admin Frontend: http://localhost:3000
- User API: http://localhost:4000
- Screening API: http://localhost:4001

## API Endpoints

### User Module (Port 4000)

- `POST /api/users/signup` - Create new user
- `GET /api/users/:id` - Get user by ID
- `POST /api/events` - Receive events from other modules

### Screening Module (Port 4001)

- `POST /api/screenings/apply` - Apply for screening
- `GET /api/screenings/list` - List all screenings
- `POST /api/screenings/:id/pass` - Pass a screening

## Tech Stack

### Backend
- Hono (Web framework)
- Prisma (ORM)
- SQLite (Database)
- TypeScript

### Frontend
- Next.js 14 (App Router)
- React Hook Form
- Zod (Validation)
- TanStack Query
- Tailwind CSS
- TypeScript
