# Hackathon Management Platform – (Presentation Version)

## Abstract [slide-1]

Full‑stack platform that unifies hackathon operations—creation, registration, team formation, scheduling, submissions, and external discovery—into one cohesive, role‑aware system. It replaces fragmented spreadsheets and manual coordination with transparent status tracking and consistent UX.

Delivered lifecycle management (draft → completed), approval‑aware registration, dynamic team handling, submission-ready structure, Devpost integration, and a reusable UI component system—establishing a scalable foundation for judging, analytics, and future innovation features.

## Introduction [slide-2]

**Background:** Hackathon ops are often fragmented (forms, sheets, chats) → slow approvals, poor visibility, inconsistent participant experience.

**Problem:** No unified lifecycle tool covering registration gating, team dynamics, status transitions, submissions, and discovery in one system.

**Objectives:**

- Model full lifecycle (draft → completed)
- Structured + approval-aware registration
- Flexible team formation (manual / future auto)
- Submission-ready team domain foundation
- External discovery via Devpost integration
- Extensible base for judging & analytics

**Scope (current):** Core domain models, lifecycle states, registration flow, team management, Devpost listing page, reusable UI system.

**Deferred:** Judging engine, scoring rubric, notifications center, certificates, analytics dashboard, real-time collaboration.

**Motivation:** Reduce manual overhead + ambiguity; create a scalable innovation operations layer.

**Impact:** Faster setup, clearer participant journey now; platform for scoring, insights, ecosystem growth later.

## Related Work / Landscape [slide-3]

- Devpost: great for public submissions & visibility; limited for gated registration & internal lifecycle control.
- Common stack (Forms + Sheets + Discord): flexible but fragmented → manual reconciliation & poor status traceability.
- Event platforms (Eventbrite): optimized for ticketing, not team dynamics or submission pipelines.
- Starter repos/templates: accelerate auth/UI, rarely provide cohesive lifecycle + approval + team domain modeling.
- Enterprise idea suites (IdeaScale/Brightidea): rich analytics but heavyweight & overkill for agile hackathons.
- Our positioning: opinionated lifecycle + modular domain without enterprise overhead; integration‑ready (Devpost today, scoring & credentials next).

## Architecture Overview [slide-4]

- React SPA + Node/Express API + MongoDB
- JWT auth (roles) + planned WebSocket layer
- Domain services: Hackathon, Registration, Team, Devpost Adapter
- Modular UI system (Card, Pill, Modal, Table, Progress)
- Clear separation: presentation / domain / persistence

## Domain Model Snapshot [slide-5]

- Core aggregates: User, Hackathon, Registration, Team
- Hackathon state drives allowed actions
- Registration enforces gating + 1/user per hackathon
- Teams hold embedded member roles (leader/member)
- Audit log for traceability / future analytics

## Lifecycle States [slide-6]

- draft → upcoming → registration-open → active → judging → completed
- Guards: temporal windows + admin overrides
- Deterministic UI badges & transitions
- Future: add cancelled / archived states

## Registration Flow [slide-7]

- User submits → status pending
- Admin review → approve / reject
- Only approved can create / join teams
- Unique composite (user,hackathon) enforced
- Future: auto-approval policies & waitlists

## Team Management [slide-8]

- Create team: first member = leader
- Join: validation (approved + not already member + not locked)
- Future: capacity, invitations, recommendation engine
- Potential auto-grouping by skills/interests

## External Ingestion (Devpost) [slide-9]

- Python scraper → normalize → store cached list
- Exposed via /api/devpost/hackathons
- Expands discovery & context for participants
- Pluggable adapter boundary (future sources)

## Technology Stack [slide-10]

- Frontend: React + Vite + Tailwind-style utilities
- Backend: Node.js / Express
- DB: MongoDB (document agility)
- Real-time (planned): Socket.io
- Tooling: PlantUML docs, future Jest/Vitest tests

## Key Design Choices [slide-11]

- Explicit lifecycle state machine
- Domain-first modeling (aggregates)
- REST first (defer GraphQL)
- Custom lightweight UI system
- External adapter isolation for ingestion
- Minimal CQRS (can evolve to events)

## Scaling & Extensibility [slide-12]

- Caching: Redis for hot reads
- Event pipeline for analytics (Kafka/NATS future)
- Multi-tenant: tenantId or DB namespace
- Security: token rotation, rate limiting, audit depth
- Horizontal scale via stateless API + DB indexing

## Roadmap (Next) [slide-13]

- Judging & scoring rubrics
- Submission metadata schema + validation
- Notification / messaging layer
- Credentials & badges integration
- Analytics dashboards (funnel & retention)

## Research & Innovation Potential [slide-14]

- Skill graph & participant profiling
- Intelligent team formation recommendations
- Automated scoring pipelines (ML-assisted)
- Longitudinal hackathon outcome metrics
- Credential interoperability (Open Badges / VC)

