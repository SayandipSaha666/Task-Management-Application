# Microservices Architecture Design — TaskFlow

> **Document Type**: Architecture Design & Migration Plan  
> **Author**: System Architect  
> **Date**: March 2026  
> **Status**: Design Phase — No Implementation Code

---

## Table of Contents

1. [Current Monolithic Analysis](#1-current-monolithic-analysis)
2. [Target Architecture Overview](#2-target-architecture-overview)
3. [Service Decomposition](#3-service-decomposition)
4. [Folder Structure](#4-folder-structure)
5. [Service Communication & RabbitMQ Message Flow](#5-service-communication--rabbitmq-message-flow)
6. [API Gateway Design](#6-api-gateway-design)
7. [Docker & Docker Compose Design](#7-docker--docker-compose-design)
8. [Step-by-Step Migration Workflow](#8-step-by-step-migration-workflow)
9. [Database Strategy](#9-database-strategy)
10. [Authentication Flow in Microservices](#10-authentication-flow-in-microservices)
11. [Best Practices](#11-best-practices)
12. [Common Mistakes to Avoid](#12-common-mistakes-to-avoid)
13. [Testing Strategy](#13-testing-strategy)
14. [Observability & Reliability](#14-observability--reliability)
15. [Rollout Plan](#15-rollout-plan)

---

## 1. Current Monolithic Analysis

### What You Have Today

Your current `Server/` directory is a **single Express.js application** that handles everything:

```
Server/
├── index.js                  ← Single entry point (Express server on port 5000)
├── controllers/
│   ├── user-controller.js    ← Register, Login, Logout (bcrypt + JWT)
│   └── task-controller.js    ← Add, Get All, Update, Delete tasks (Joi validation)
├── middleware/
│   └── auth-middleware.js    ← JWT cookie verification
├── models/
│   ├── user.js               ← Mongoose User schema (name, email, password)
│   └── tasks.js              ← Mongoose Task schema (title, description, status, userId, priority)
├── routes/
│   ├── user-routes.js        ← /api/user/* routes
│   └── task-routes.js        ← /api/task/* routes
├── database/
│   └── database.js           ← Single MongoDB connection (mongodb://localhost:27017/Task_Management_App)
└── .env                      ← PORT, SECRET_KEY, MONGO_URI
```

### Current API Surface

| Method | Route                | Handler          | Responsibility |
|--------|----------------------|------------------|----------------|
| POST   | `/api/user/register` | `registerUser`   | Sign up + JWT cookie |
| POST   | `/api/user/login`    | `loginUser`      | Sign in + JWT cookie |
| POST   | `/api/user/auth`     | `userAuthVerification` | Verify JWT cookie → return user info |
| POST   | `/api/user/logout`   | `logoutUser`     | Clear JWT cookie |
| POST   | `/api/task/add`      | `addNewTask`     | Create task |
| GET    | `/api/task/all/:id`  | `getAllTasks`     | Get all tasks for a user |
| PUT    | `/api/task/update`   | `updateTask`     | Update task |
| DELETE | `/api/task/delete/:id` | `deleteTask`   | Delete task |

### Problems with the Monolith

| Problem | Impact |
|---------|--------|
| Single point of failure | If the server crashes, both auth and tasks go down |
| No independent scaling | Can't scale task processing without also scaling auth |
| Shared database | User and Task collections live in the same DB — tight coupling |
| Deployment coupling | Any change (even a typo fix in tasks) requires redeploying everything |
| No event system | No way to react to events (e.g., "send notification when task is done") |

---

## 2. Target Architecture Overview

### High-Level Architecture Diagram (Textual)

```
                            ┌─────────────────────┐
                            │    React Frontend    │
                            │   (Client, :5173)    │
                            └──────────┬──────────┘
                                       │
                                       │  HTTP (REST)
                                       ▼
                            ┌─────────────────────┐
                            │    API Gateway       │
                            │     (:3000)          │
                            │  ┌───────────────┐   │
                            │  │  JWT Verify    │   │
                            │  │  Middleware    │   │
                            │  └───────────────┘   │
                            │  ┌───────────────┐   │
                            │  │  Rate Limiter  │   │
                            │  └───────────────┘   │
                            │  ┌───────────────┐   │
                            │  │  Route Proxy   │   │
                            │  └───────────────┘   │
                            └───┬──────┬──────┬───┘
                                │      │      │
                   ┌────────────┘      │      └────────────┐
                   │                   │                   │
                   ▼                   ▼                   ▼
         ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
         │  User Service   │ │  Task Service   │ │ Notification    │
         │    (:4001)      │ │    (:4002)      │ │   Service       │
         │                 │ │                 │ │    (:4003)      │
         │ • Register      │ │ • Add Task      │ │ • Process       │
         │ • Login         │ │ • Get Tasks     │ │   Events        │
         │ • Logout        │ │ • Update Task   │ │ • Send Alerts   │
         │ • Auth Verify   │ │ • Delete Task   │ │ • Log Activity  │
         └────────┬────────┘ └────────┬────────┘ └────────┬────────┘
                  │                   │                   │
                  ▼                   ▼                   ▼
         ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
         │  MongoDB        │ │  MongoDB        │ │  MongoDB        │
         │  (user_db)      │ │  (task_db)      │ │  (notif_db)     │
         │  :27017         │ │  :27018         │ │  :27019         │
         └─────────────────┘ └─────────────────┘ └─────────────────┘

                   │                   │                   │
                   └───────────┬───────┘───────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     RabbitMQ        │
                    │   Message Broker    │
                    │     (:5672)         │
                    │  Management: :15672 │
                    └─────────────────────┘
```

### Key Design Principles

| Principle | How It Applies |
|-----------|---------------|
| **Single Responsibility** | Each service does ONE domain well |
| **Database Per Service** | No shared collections — full isolation |
| **Async Communication** | Services talk through RabbitMQ, not direct HTTP calls |
| **API Gateway Pattern** | One entry point for the frontend, routes to internal services |
| **Stateless Services** | JWT-based auth, no server-side sessions |
| **Container Isolation** | Each service runs in its own Docker container |

---

## 3. Service Decomposition

### 3.1 User Service (`:4001`)

**Responsibility**: Everything about user identity and authentication.

| What Moves Here | Source in Monolith |
|---|---|
| `registerUser` controller | `controllers/user-controller.js` |
| `loginUser` controller | `controllers/user-controller.js` |
| `logoutUser` controller | `controllers/user-controller.js` |
| `userAuthVerification` middleware | `middleware/auth-middleware.js` |
| User Mongoose model | `models/user.js` |
| JWT generation (`generateToken`) | `controllers/user-controller.js` |
| Joi schemas (register, login) | `controllers/user-controller.js` |

**Own Database**: `user_db` — contains the `users` collection only

**Events Published to RabbitMQ**:
| Event | When | Payload |
|---|---|---|
| `user.registered` | After successful registration | `{ userId, name, email, timestamp }` |
| `user.loggedIn` | After successful login | `{ userId, timestamp }` |
| `user.loggedOut` | After logout | `{ userId, timestamp }` |

**API Endpoints Exposed (internal)**:
| Method | Route | Purpose |
|---|---|---|
| POST | `/register` | Create account |
| POST | `/login` | Login + JWT cookie |
| POST | `/logout` | Clear cookie |
| POST | `/auth` | Verify JWT → return user info |
| GET | `/user/:id` | Get user by ID (internal, used by Task Service) |

---

### 3.2 Task Service (`:4002`)

**Responsibility**: Task CRUD operations, scrum board state, and task lifecycle.

| What Moves Here | Source in Monolith |
|---|---|
| `addNewTask` controller | `controllers/task-controller.js` |
| `getAllTasks` controller | `controllers/task-controller.js` |
| `updateTask` controller | `controllers/task-controller.js` |
| `deleteTask` controller | `controllers/task-controller.js` |
| Task Mongoose model | `models/tasks.js` |
| Joi schema (addTask) | `controllers/task-controller.js` |

**Own Database**: `task_db` — contains the `tasks` collection only

**Events Published to RabbitMQ**:
| Event | When | Payload |
|---|---|---|
| `task.created` | After new task added | `{ taskId, userId, title, status, priority, timestamp }` |
| `task.updated` | After task updated | `{ taskId, userId, oldStatus, newStatus, timestamp }` |
| `task.deleted` | After task deleted | `{ taskId, userId, timestamp }` |
| `task.statusChanged` | When status changes | `{ taskId, userId, from, to, timestamp }` |

**Events Consumed from RabbitMQ**:
| Event | Action |
|---|---|
| `user.registered` | *(Optional)* Cache user name locally for display |

**API Endpoints Exposed (internal)**:
| Method | Route | Purpose |
|---|---|---|
| POST | `/add` | Create task |
| GET | `/all/:userId` | Get all tasks for a user |
| PUT | `/update` | Update task |
| DELETE | `/delete/:id` | Delete task |

---

### 3.3 Notification Service (`:4003`)

**Responsibility**: Listen to events and generate notifications, activity logs, or future email/push alerts.

**This is a NEW service** — it does not exist in your monolith. It's purely event-driven and has no REST API initially.

**Own Database**: `notification_db` — stores notification records and activity logs

**Events Consumed from RabbitMQ**:
| Event | Action |
|---|---|
| `user.registered` | Log "New user signed up", optionally send welcome email |
| `task.created` | Log "User X created task Y" |
| `task.updated` | Log activity entry |
| `task.deleted` | Log "Task deleted" |
| `task.statusChanged` | If status = `done`, log "Task completed 🎉" |

**Data Model** (new):
```
Notification {
  userId: String,
  type: String,        // "task.created" | "task.completed" | "user.welcome"
  message: String,
  metadata: Object,    // { taskId, taskTitle, ... }
  read: Boolean,
  createdAt: Date
}
```

**Reliability features**:
- Retry queue + dead-letter queue for failed deliveries
- Idempotency key (using `correlationId`) to avoid duplicate notifications on re-delivery

---

### 3.4 API Gateway (`:3000`)

**Responsibility**: Single entry point for the React frontend. Routes requests to the correct internal service.

**Key Behaviors**:
1. **Receives** all HTTP requests from the frontend at `/api/*`
2. **Verifies** JWT token on every request (except `/api/user/register` and `/api/user/login`)
3. **Proxies** the request to the correct internal service based on URL prefix
4. **Handles** CORS, rate limiting, and request logging

**Routing Table**:
| Frontend Request | Gateway Routes To |
|---|---|
| `/api/user/*` | `http://user-service:4001/*` |
| `/api/task/*` | `http://task-service:4002/*` |
| `/api/notifications/*` | `http://notification-service:4003/*` |

---

## 4. Folder Structure

```
Task-Management-Application/
├── Client/                          ← (unchanged — your React frontend)
│
├── services/                        ← All microservices live here
│   │
│   ├── api-gateway/                 ← Entry point for all API requests
│   │   ├── src/
│   │   │   ├── index.js             ← Express server (:3000)
│   │   │   ├── middleware/
│   │   │   │   ├── auth.js          ← JWT verification (calls User Service)
│   │   │   │   ├── rate-limiter.js  ← Rate limiting middleware
│   │   │   │   └── logger.js        ← Request logging
│   │   │   ├── routes/
│   │   │   │   └── proxy.js         ← Route definitions → proxy to services
│   │   │   └── config/
│   │   │       └── services.js      ← Service URLs and port mappings
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── .env
│   │
│   ├── user-service/                ← User domain
│   │   ├── src/
│   │   │   ├── index.js             ← Express server (:4001)
│   │   │   ├── controllers/
│   │   │   │   └── user-controller.js
│   │   │   ├── models/
│   │   │   │   └── user.js
│   │   │   ├── routes/
│   │   │   │   └── user-routes.js
│   │   │   ├── middleware/
│   │   │   │   └── auth-middleware.js
│   │   │   ├── events/
│   │   │   │   └── publisher.js     ← Publishes user.* events to RabbitMQ
│   │   │   ├── database/
│   │   │   │   └── database.js      ← Connects to user_db
│   │   │   └── config/
│   │   │       └── rabbitmq.js      ← RabbitMQ connection setup
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── .env
│   │
│   ├── task-service/                ← Task domain
│   │   ├── src/
│   │   │   ├── index.js             ← Express server (:4002)
│   │   │   ├── controllers/
│   │   │   │   └── task-controller.js
│   │   │   ├── models/
│   │   │   │   └── task.js
│   │   │   ├── routes/
│   │   │   │   └── task-routes.js
│   │   │   ├── events/
│   │   │   │   ├── publisher.js     ← Publishes task.* events
│   │   │   │   └── consumer.js      ← Consumes user.* events (optional)
│   │   │   ├── database/
│   │   │   │   └── database.js      ← Connects to task_db
│   │   │   └── config/
│   │   │       └── rabbitmq.js
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── .env
│   │
│   └── notification-service/        ← Notification domain (NEW)
│       ├── src/
│       │   ├── index.js             ← Express or standalone consumer (:4003)
│       │   ├── models/
│       │   │   └── notification.js
│       │   ├── events/
│       │   │   └── consumer.js      ← Listens to user.* and task.* events
│       │   ├── handlers/
│       │   │   ├── task-handler.js   ← Processes task events
│       │   │   └── user-handler.js   ← Processes user events
│       │   ├── database/
│       │   │   └── database.js       ← Connects to notification_db
│       │   └── config/
│       │       └── rabbitmq.js
│       ├── Dockerfile
│       ├── package.json
│       └── .env
│
├── docker-compose.yml               ← Orchestrates all containers
├── .env                              ← Shared env variables (optional)
└── README.md
```

---

## 5. Service Communication & RabbitMQ Message Flow

### Communication Rules

| Type | When to Use | Protocol |
|------|------------|----------|
| **Synchronous (HTTP)** | Frontend → Gateway → Service | REST over HTTP |
| **Asynchronous (RabbitMQ)** | Service → Service events | AMQP (message queue) |

> **Critical Rule**: Services NEVER call each other directly via HTTP.  
> The only exception is the **API Gateway** proxying requests to services.

### RabbitMQ Topology

```
                        ┌──────────────────────────────────────┐
                        │           RabbitMQ Broker             │
                        │                                      │
 ┌──────────────┐       │   ┌──────────────────────────────┐   │
 │ User Service │ ──────┼──▶│  Exchange: "user.events"     │   │
 │  (Publisher)  │       │   │  Type: topic                 │   │
 └──────────────┘       │   └──────────┬───────────────────┘   │
                        │              │                       │
                        │              │ Routing Keys:         │
                        │              │ • user.registered     │
                        │              │ • user.loggedIn       │
                        │              │ • user.loggedOut      │
                        │              │                       │
                        │              ▼                       │
                        │   ┌──────────────────────────────┐   │       ┌─────────────────────┐
                        │   │  Queue: "notif.user.events"  │───┼──────▶│ Notification Service│
                        │   └──────────────────────────────┘   │       │   (Consumer)         │
                        │                                      │       └─────────────────────┘
                        │                                      │
 ┌──────────────┐       │   ┌──────────────────────────────┐   │
 │ Task Service │ ──────┼──▶│  Exchange: "task.events"     │   │
 │  (Publisher)  │       │   │  Type: topic                 │   │
 └──────────────┘       │   └──────────┬───────────────────┘   │
                        │              │                       │
                        │              │ Routing Keys:         │
                        │              │ • task.created        │
                        │              │ • task.updated        │
                        │              │ • task.deleted        │
                        │              │ • task.statusChanged  │
                        │              │                       │
                        │              ▼                       │
                        │   ┌──────────────────────────────┐   │       ┌─────────────────────┐
                        │   │  Queue: "notif.task.events"  │───┼──────▶│ Notification Service│
                        │   └──────────────────────────────┘   │       │   (Consumer)         │
                        │                                      │       └─────────────────────┘
                        └──────────────────────────────────────┘
```

### Message Format (Standard Envelope)

Every message published to RabbitMQ should follow this consistent envelope:

```json
{
  "eventType": "task.created",
  "timestamp": "2026-03-09T12:00:00Z",
  "source": "task-service",
  "correlationId": "uuid-v4-value",
  "payload": {
    "taskId": "65f...",
    "userId": "65e...",
    "title": "Fix login bug",
    "status": "todo",
    "priority": "high"
  }
}
```

### API Contract & Event Contract Design

Before splitting code, define contracts with versioning:

- **Sync APIs** (REST):
  - User: `/v1/auth/register`, `/v1/auth/login`, `/v1/auth/me`
  - Task: `/v1/tasks`, `/v1/tasks/:id`
- **Async events** (broker):
  - `user.created`, `user.loggedIn`, `user.loggedOut`
  - `task.created`, `task.updated`, `task.deleted`, `task.statusChanged`
- Notification service subscribes to all of these.

> Add versioning now (e.g., `/v1/...`) to avoid future breaking changes.

### End-to-End Flow Example: User Creates a Task

```
Step 1: Frontend sends POST /api/task/add to API Gateway
Step 2: Gateway verifies JWT → extracts userId from token
Step 3: Gateway proxies request to Task Service (:4002)
Step 4: Task Service validates input (Joi), creates task in task_db
Step 5: Task Service publishes "task.created" event to RabbitMQ
Step 6: Notification Service consumes the event from the queue
Step 7: Notification Service creates a notification record in notification_db
Step 8: Task Service responds to Gateway with { success: true, data: task }
Step 9: Gateway forwards the response to Frontend
```

### End-to-End Flow Example: User Registers

```
Step 1: Frontend sends POST /api/user/register to API Gateway
Step 2: Gateway allows this route without JWT (public route)
Step 3: Gateway proxies to User Service (:4001)
Step 4: User Service validates (Joi), hashes password (bcrypt), saves to user_db
Step 5: User Service generates JWT and sets httpOnly cookie
Step 6: User Service publishes "user.registered" to RabbitMQ
Step 7: Notification Service consumes → logs "New user signed up"
Step 8: User Service responds with { success: true, userData: {...} }
Step 9: Gateway forwards response (with Set-Cookie header) to Frontend
```

### End-to-End Flow Example: Task Status Changed on Scrum Board

```
Step 1: Frontend sends PUT /api/task/update (drag & drop on scrum board)
Step 2: Gateway verifies JWT → proxies to Task Service
Step 3: Task Service detects status field changed (e.g., "todo" → "inProgress")
Step 4: Task Service updates task in task_db
Step 5: Task Service publishes "task.statusChanged" with { from: "todo", to: "inProgress" }
Step 6: Notification Service consumes → logs activity, OR
        if to === "done" → creates "Task completed! 🎉" notification
Step 7: Response flows back: Task Service → Gateway → Frontend
```

---

## 6. API Gateway Design

### Gateway Responsibilities

```
┌───────────────────────────────────────────────────┐
│                   API Gateway                     │
│                                                   │
│  1. CORS handling                                 │
│     └─ Allow origin: Frontend URL                 │
│     └─ Allow credentials: true (for cookies)      │
│                                                   │
│  2. Authentication middleware                      │
│     └─ Extract JWT from cookie                    │
│     └─ Verify with SECRET_KEY                     │
│     └─ Attach userId to request headers           │
│     └─ Skip for public routes (login, register)   │
│                                                   │
│  3. Route proxying                                 │
│     └─ /api/user/* → http://user-service:4001/*   │
│     └─ /api/task/* → http://task-service:4002/*   │
│     └─ /api/notifications/* → http://notif:4003/* │
│                                                   │
│  4. Rate limiting                                  │
│     └─ Prevent abuse (e.g., 100 req/min)          │
│                                                   │
│  5. Request logging                                │
│     └─ Log method, path, status, duration          │
│                                                   │
│  6. Error handling                                 │
│     └─ Catch proxy failures → 503 Service          │
│        Unavailable                                 │
└───────────────────────────────────────────────────┘
```

### Public vs Protected Routes

| Route | Auth Required? | Why |
|---|---|---|
| `POST /api/user/register` | ❌ No | User doesn't have a token yet |
| `POST /api/user/login` | ❌ No | User doesn't have a token yet |
| `POST /api/user/auth` | ✅ Yes | Verifies existing session |
| `POST /api/user/logout` | ✅ Yes | Needs to know who's logging out |
| `POST /api/task/add` | ✅ Yes | Must know the userId |
| `GET /api/task/all/:id` | ✅ Yes | Must verify ownership |
| `PUT /api/task/update` | ✅ Yes | Must verify ownership |
| `DELETE /api/task/delete/:id` | ✅ Yes | Must verify ownership |

### How JWT Flows Through the System

```
Frontend                 Gateway                    User / Task Service
   │                       │                              │
   │── POST with cookie ──▶│                              │
   │                       │── Verify JWT locally ──┐     │
   │                       │                        │     │
   │                       │◀─ userId extracted ────┘     │
   │                       │                              │
   │                       │── Proxy + X-User-Id header ─▶│
   │                       │                              │── Process request
   │                       │◀──────── Response ──────────│
   │◀──── Response ────────│                              │
```

> **Key insight**: The Gateway verifies the JWT itself (it has access to `SECRET_KEY`). It then passes the decoded `userId` as a custom header (`X-User-Id`) to downstream services. The downstream services **trust** this header because they are only reachable through the Gateway (Docker network isolation).

---

## 7. Docker & Docker Compose Design

### Dockerfile Template (Same Pattern for All Services)

Each service follows the same Dockerfile structure:

```
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY ./src ./src
EXPOSE <service-port>
CMD ["node", "src/index.js"]
```

### Docker Compose Design Plan

```yaml
# docker-compose.yml — Design Plan (NOT implementation code)
#
# Services:
#   1. api-gateway         (:3000)  → exposed to host
#   2. user-service        (:4001)  → internal only
#   3. task-service        (:4002)  → internal only
#   4. notification-service (:4003) → internal only
#   5. rabbitmq            (:5672, :15672) → management UI exposed
#   6. mongo-user          (:27017) → internal only
#   7. mongo-task          (:27018) → internal only
#   8. mongo-notification  (:27019) → internal only
#
# Networks:
#   - app-network (bridge) → all services communicate here
#
# Volumes:
#   - mongo-user-data      → persist user database
#   - mongo-task-data      → persist task database
#   - mongo-notif-data     → persist notification database
#   - rabbitmq-data        → persist message queues
```

### Container Dependency Order

```
        rabbitmq
          │
          ├── mongo-user ──▶ user-service ──┐
          │                                  │
          ├── mongo-task ──▶ task-service ──┼──▶ api-gateway
          │                                  │
          └── mongo-notif ──▶ notification-service
                              (no gateway dependency)
```

**Startup dependencies**:
1. **RabbitMQ** starts first (all services depend on it)
2. **MongoDB** containers start next (each service needs its DB)
3. **Microservices** start after their DB and RabbitMQ are healthy
4. **API Gateway** starts last (needs all services to be ready)

### Port Mapping Summary

| Container | Internal Port | Exposed to Host? | Purpose |
|---|---|---|---|
| api-gateway | 3000 | ✅ `3000:3000` | Frontend connects here |
| user-service | 4001 | ❌ internal | Only reachable within Docker network |
| task-service | 4002 | ❌ internal | Only reachable within Docker network |
| notification-service | 4003 | ❌ internal | Only reachable within Docker network |
| rabbitmq | 5672, 15672 | ✅ `15672:15672` | Management dashboard for debugging |
| mongo-user | 27017 | ❌ internal | User Service connects to this |
| mongo-task | 27017 | ❌ internal | Task Service connects to this |
| mongo-notification | 27017 | ❌ internal | Notification Service connects to this |

> **Security**: Only the API Gateway and RabbitMQ management UI are exposed to the host. All services are isolated inside the Docker network.

---

## 8. Step-by-Step Migration Workflow (Strangler Pattern)

> **Do NOT rewrite everything at once.** Use the Strangler Fig Pattern — extract one service at a time while the monolith still runs.

### Phase 1: Preparation (Week 1)

```
Step 1.1  Create the top-level folder structure
          └─ services/api-gateway/
          └─ services/user-service/
          └─ services/task-service/
          └─ services/notification-service/

Step 1.2  Initialize each service with its own package.json
          └─ npm init in each service directory
          └─ Install common deps: express, mongoose, dotenv, amqplib

Step 1.3  Set up Docker environment
          └─ Write Dockerfiles for each service
          └─ Write docker-compose.yml with all 8 containers
          └─ Verify all containers start with `docker-compose up`
```

### Phase 2: Extract User Service (Week 2)

```
Step 2.1  Copy user-related code from monolith
          └─ user-controller.js → services/user-service/src/controllers/
          └─ user.js (model) → services/user-service/src/models/
          └─ user-routes.js → services/user-service/src/routes/
          └─ auth-middleware.js → services/user-service/src/middleware/

Step 2.2  Create User Service entry point
          └─ index.js: Express app on port 4001
          └─ Connect to mongo-user container (mongodb://mongo-user:27017/user_db)

Step 2.3  Add RabbitMQ publisher
          └─ Create events/publisher.js
          └─ After register → publish "user.registered"
          └─ After login → publish "user.loggedIn"

Step 2.4  Test User Service in isolation
          └─ docker-compose up user-service mongo-user rabbitmq
          └─ Test with Postman / curl against localhost:4001

Step 2.5  Wire up API Gateway
          └─ Gateway routes /api/user/* → user-service:4001
          └─ Canary route a small percentage of traffic
          └─ Observe metrics and have a rollback policy
```

### Phase 3: Extract Task Service (Week 2–3)

```
Step 3.1  Copy task-related code from monolith
          └─ task-controller.js → services/task-service/src/controllers/
          └─ tasks.js (model) → services/task-service/src/models/
          └─ task-routes.js → services/task-service/src/routes/

Step 3.2  Create Task Service entry point
          └─ index.js: Express app on port 4002
          └─ Connect to mongo-task container (mongodb://mongo-task:27017/task_db)

Step 3.3  Add RabbitMQ publisher
          └─ After add → publish "task.created"
          └─ After update → publish "task.updated"
          └─ After delete → publish "task.deleted"
          └─ Detect status change → publish "task.statusChanged"

Step 3.4  Remove userId dependency
          └─ Task Service trusts X-User-Id header from Gateway
          └─ No longer calls User model directly

Step 3.5  Test Task Service in isolation
```

### Phase 4: Build Notification Service (Week 3)

```
Step 4.1  Create Notification Service from scratch (new service)
          └─ No code to copy from monolith
          └─ This is a consumer-only service

Step 4.2  Create RabbitMQ consumer
          └─ Subscribe to "user.events" exchange
          └─ Subscribe to "task.events" exchange
          └─ Process events → save to notification_db

Step 4.3  Create Notification model
          └─ { userId, type, message, metadata, read, createdAt }

Step 4.4  (Optional) Add REST endpoint for frontend
          └─ GET /notifications/:userId → return recent notifications

Step 4.5  Implement reliability
          └─ Retry queue + dead-letter queue
          └─ Idempotency key via correlationId
```

### Phase 5: Build API Gateway (Week 3–4)

```
Step 5.1  Create Gateway entry point
          └─ Express app on port 3000
          └─ CORS config (allow frontend origin, credentials)

Step 5.2  Implement JWT middleware
          └─ Extract token from cookie
          └─ Verify with SECRET_KEY
          └─ Attach decoded userId to X-User-Id header
          └─ Whitelist public routes (register, login)

Step 5.3  Implement route proxy
          └─ Use `http-proxy-middleware` npm package
          └─ /api/user/* → http://user-service:4001
          └─ /api/task/* → http://task-service:4002
          └─ /api/notifications/* → http://notification-service:4003

Step 5.4  Add rate limiting and request logging

Step 5.5  Test full flow
          └─ docker-compose up (all services)
          └─ Frontend → Gateway → Services
```

### Phase 6: Frontend Update (Week 4)

```
Step 6.1  Update API base URL
          └─ Client's api_service.js: change baseURL from
             http://localhost:5000 → http://localhost:3000
          └─ This is the ONLY frontend change needed
          └─ No direct service URLs in frontend

Step 6.2  (Optional) Add notification polling/display
          └─ Fetch from /api/notifications/:userId
```

### Phase 7: Integration Testing (Week 4)

```
Step 7.1  Run full docker-compose up
Step 7.2  Test all user flows end-to-end
          └─ Register → Login → Create Task → View Tasks → Scrum Board → Logout
Step 7.3  Verify RabbitMQ messages in Management UI (localhost:15672)
Step 7.4  Check notification_db has activity logs
Step 7.5  Test error scenarios (service down, RabbitMQ down)
```

---

## 9. Database Strategy

### Database Isolation

| Service | Database Name | Container Name | Data Ownership |
|---|---|---|---|
| User Service | `user_db` | `mongo-user` | `users` collection |
| Task Service | `task_db` | `mongo-task` | `tasks` collection |
| Notification Service | `notification_db` | `mongo-notification` | `notifications` collection |

### Ownership Rules

- Task Service stores only `userId` reference, never user profile internals.
- User Service is the source of truth for identity/auth.
- Notification Service never owns task/user core data, only notification records/events.
- For cross-service reads, **avoid direct DB joins**; use API call or denormalized read model.

### Data Consistency Concern: `userId` in Tasks

**Problem**: The Task model has a `userId` field, but Task Service has no access to the User database. How does it validate that the userId exists?

**Solution (Event Sourcing Lite)**:
1. **Gateway** verifies the JWT and passes `X-User-Id` header to Task Service
2. Task Service **trusts** this userId because the Gateway already validated it
3. Task Service does **not** need to query the user database
4. If you need user names for display, Task Service can listen to `user.registered` events and maintain a lightweight **user cache** (just `{ userId, name }`)

### Data Migration

When splitting the monolith database:

```
Current: mongodb://localhost:27017/Task_Management_App
         └── users collection
         └── tasks collection

After:   mongo-user:27017/user_db
         └── users collection (migrated)

         mongo-task:27017/task_db
         └── tasks collection (migrated)

         mongo-notification:27017/notification_db
         └── notifications collection (new, empty)
```

**Migration steps**:
1. Export `users` collection from monolith → import into `user_db`
2. Export `tasks` collection from monolith → import into `task_db`
3. `notification_db` starts empty (new service)

---

## 10. Authentication Flow in Microservices

### JWT Token Lifecycle

```
┌──────────┐   register/login   ┌─────────┐   creates JWT   ┌──────────┐
│ Frontend │ ─────────────────▶ │ Gateway │ ──────────────▶ │  User    │
│          │                    │ (proxy) │                  │  Service │
│          │ ◀──── Set-Cookie ──│         │ ◀── Set-Cookie ─│          │
└──────────┘     (httpOnly)     └─────────┘    (httpOnly)    └──────────┘
                                    │
     Subsequent requests:           │
┌──────────┐   request + cookie ┌───▼─────┐   X-User-Id header   ┌──────────┐
│ Frontend │ ────────────────▶ │ Gateway │ ────────────────────▶ │  Task    │
│          │                    │ verifies│                       │  Service │
│          │                    │   JWT   │                       │  (trusts │
│          │ ◀──── response ───│         │ ◀──── response ──────│  header) │
└──────────┘                    └─────────┘                       └──────────┘
```

### Where the SECRET_KEY Lives

| Service | Has SECRET_KEY? | Why |
|---|---|---|
| User Service | ✅ Yes | Needs it to **create** JWTs |
| API Gateway | ✅ Yes | Needs it to **verify** JWTs |
| Task Service | ❌ No | Trusts Gateway's `X-User-Id` header |
| Notification Service | ❌ No | Never handles HTTP auth |

### Auth & Security Plan

- User Service is the auth authority.
- JWT contains minimal claims (`sub`, `email`, roles).
- Gateway validates token for protected routes.
- Service-to-service auth via internal token/API key + network policy.
- Move secrets from `.env` to a secret manager in the deployment stage.

---

## 11. Best Practices

### Service Design

| Practice | Details |
|---|---|
| **One database per service** | Never let services share a database. This eliminates tight coupling. |
| **Idempotent consumers** | RabbitMQ may deliver a message twice. Design your consumers to handle duplicates (use `correlationId` to deduplicate). |
| **Health check endpoints** | Each service should expose `GET /health` → `{ status: "ok" }`. Docker Compose can use this for `healthcheck`. |
| **Graceful shutdown** | Handle `SIGTERM` in each service — close DB connections, drain RabbitMQ queues, then exit. |
| **Environment-based config** | All connection strings (MongoDB, RabbitMQ, ports) come from `.env` files — never hardcoded. |

### RabbitMQ

| Practice | Details |
|---|---|
| **Use topic exchanges** | More flexible than direct exchanges. Allows pattern-based routing. |
| **Persist messages** | Set `persistent: true` when publishing so messages survive broker restarts. |
| **Acknowledge manually** | Don't use auto-ack. Manually `channel.ack(msg)` after successful processing. |
| **Dead letter queues** | Configure a DLQ for failed messages so they don't disappear silently. |
| **Retry with backoff** | If a consumer fails, retry with exponential backoff before sending to DLQ. |

### Docker

| Practice | Details |
|---|---|
| **Use Alpine images** | `node:20-alpine` is ~50MB vs ~350MB for full `node:20`. Faster builds. |
| **Multi-stage builds** | Separate build stage from runtime stage to exclude `devDependencies`. |
| **Named volumes** | Use named Docker volumes for MongoDB data persistence. |
| **`.dockerignore`** | Ignore `node_modules`, `.git`, and test files to keep images small. |
| **Container names** | Use descriptive names in `docker-compose.yml` for easy debugging. |

### Code Organization

| Practice | Details |
|---|---|
| **Shared message schema** | Create a shared npm package or JSON schema for event envelope format. |
| **Connection retry logic** | Both MongoDB and RabbitMQ connections should retry with backoff on failure. |
| **Structured logging** | Use a logger like `winston` or `pino` with JSON output for easy aggregation. |
| **Central error handling** | Express error middleware in each service for consistent error responses. |

---

## 12. Common Mistakes to Avoid

### ❌ Mistake 1: Direct HTTP Between Services

```
BAD:  Task Service calls http://user-service:4001/user/123 to get user info
GOOD: Task Service listens to "user.registered" events and caches user data locally
```
**Why**: Direct HTTP creates tight coupling. If User Service is down, Task Service breaks.

---

### ❌ Mistake 2: Shared Database

```
BAD:  User Service and Task Service both connect to mongodb://mongo:27017/app_db
GOOD: Each service has its own database (user_db, task_db)
```
**Why**: Shared databases are the #1 killer of microservice independence. One schema migration can break all services.

---

### ❌ Mistake 3: Gateway Does Business Logic

```
BAD:  Gateway fetches user from User Service, then creates task in Task Service
GOOD: Gateway only proxies and verifies JWT. Task Service handles its own logic.
```
**Why**: Gateway should be a dumb router. Business logic belongs in domain services.

---

### ❌ Mistake 4: Not Handling RabbitMQ Connection Failures

```
BAD:  Service crashes if RabbitMQ isn't ready at startup
GOOD: Retry connection with exponential backoff (1s, 2s, 4s, 8s...)
```
**Why**: In Docker, RabbitMQ may take 10–15 seconds to be ready. Services start faster.

---

### ❌ Mistake 5: Synchronous Notifications

```
BAD:  Task Service calls Notification Service via HTTP after creating a task
GOOD: Task Service publishes event to RabbitMQ. Notification Service consumes async.
```
**Why**: Synchronous calls make the task creation slower and create a dependency chain.

---

### ❌ Mistake 6: No Correlation IDs

```
BAD:  Events have no unique identifier — can't trace a request across services
GOOD: Every event includes a UUID correlationId that's passed through the chain
```
**Why**: When debugging in production, you need to trace a request from Gateway → Service → RabbitMQ → Consumer.

---

### ❌ Mistake 7: Auto-Acknowledging Messages

```
BAD:  channel.consume(queue, handler, { noAck: true })
GOOD: channel.consume(queue, handler, { noAck: false })
      // Then explicitly: channel.ack(msg) after processing
```
**Why**: Auto-ack removes the message from the queue immediately. If your handler crashes, the message is lost forever.

---

### ❌ Mistake 8: Huge Docker Images

```
BAD:  COPY . .  (copies node_modules, .git, tests into image)
GOOD: Use .dockerignore + only copy src/ and package*.json
```
**Why**: A 500MB image takes forever to deploy. An Alpine image with only production deps is ~60MB.

---

### ❌ Mistake 9: Hardcoded Service URLs

```
BAD:  const userServiceUrl = "http://localhost:4001"
GOOD: const userServiceUrl = process.env.USER_SERVICE_URL || "http://user-service:4001"
```
**Why**: Hardcoded URLs break when moving between environments (local, Docker, cloud).

---

### ❌ Mistake 10: No Health Checks in Docker Compose

```
BAD:  depends_on: [rabbitmq]  (only waits for container to START, not be READY)
GOOD: Use healthcheck with test command to verify the service is actually accepting connections
```
**Why**: MongoDB and RabbitMQ containers can take 5–15 seconds after starting to accept connections.

---

## 13. Testing Strategy

| Level | What to Test | Tools |
|---|---|---|
| **Unit tests** | Individual controllers, validators, event handlers per service | Jest, Mocha |
| **Contract tests** | API schemas & event envelope formats between services | Pact, JSON Schema |
| **Integration tests** | Service + its own DB + RabbitMQ connection | Docker Compose + supertest |
| **End-to-end tests** | Full flow through Gateway → all services, from client perspective | Cypress, Playwright |

- API schema checks (OpenAPI) and contract tests should run in CI.
- Each service should have its own test suite that runs independently.

---

## 14. Observability & Reliability

| Area | Implementation |
|---|---|
| **Correlation ID** | Propagated from Gateway headers across all services and into RabbitMQ messages |
| **Centralized logs** | JSON-formatted logs collected by a log aggregator (ELK, Loki) |
| **Metrics** | Latency, error rates, request counts per service (Prometheus + Grafana) |
| **Tracing** | Distributed tracing across services (OpenTelemetry, Jaeger) |
| **Circuit breaker** | Timeouts and circuit breakers for any synchronous inter-service calls |
| **Health endpoints** | `GET /health` and `GET /ready` on every service for Docker healthchecks |

---

## 15. Rollout Plan

| Step | Action | Risk Mitigation |
|---|---|---|
| 1 | Deploy Gateway + User Service first | Keep monolith running as fallback |
| 2 | Canary route a small % of traffic to the new User Service | Monitor error rates |
| 3 | Once stable, route 100% of user traffic | Have rollback policy ready |
| 4 | Deploy Task Service, repeat canary strategy | Same monitoring |
| 5 | Deploy Notification Service | Low risk — purely async consumer |
| 6 | Decommission monolith | Only after all services are stable |

---

## Summary: What Changes vs. What Stays

| What Changes | What Stays |
|---|---|
| Backend splits into 4 services | All business logic is preserved |
| Single MongoDB → 3 separate MongoDBs | Mongoose models stay the same |
| Direct function calls → RabbitMQ events | API routes stay the same |
| Single `index.js` → 4 entry points | JWT authentication pattern stays |
| New: API Gateway, Notification Service | Frontend code (only baseURL changes) |
| Docker containers for everything | Joi validation, bcrypt hashing |

---

## Suggested Execution Order (Milestones)

1. Architecture docs + API/event contracts
2. Setup gateway and service skeletons
3. Extract User Service
4. Extract Task Service
5. Introduce broker and Notification Service
6. Observability + CI/CD hardening
7. Production gradual rollout

---

*End of Architecture Design Document*