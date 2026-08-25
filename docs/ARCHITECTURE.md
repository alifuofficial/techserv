# Architecture Overview

## 1. Core Principles
The platform is a **Modular Monolith** built on **Next.js 16+ (App Router)** and **Supabase (PostgreSQL)**. 
The fundamental principle is that **Web and Telegram are two interfaces to one platform—not two separate products.**

## 2. System Components

```mermaid
graph TD
    Client_Web[Web Browser] --> |HTTPS| App[Next.js App]
    Client_TMA[Telegram Mini App] --> |HTTPS| App
    Client_Bot[Telegram Bot] --> |Webhook| App
    
    subgraph Next.js Modular Monolith
        App --> Auth[Auth Module]
        App --> UI[Shared UI Components]
        App --> APIs[Route Handlers /api/v1]
        
        subgraph Domain Modules
            APIs --> Campaigns[Campaigns]
            APIs --> Entries[Entries]
            APIs --> Ledger[Ledger]
            APIs --> Draws[Draw Engine]
            APIs --> Payments[Payment Service]
        end
    end
    
    Domain Modules --> |Prisma / Supabase JS| DB[(Supabase PostgreSQL)]
    Auth --> |Supabase Auth| DB
```

## 3. Modular Monolith Structure
The `src/` directory will be partitioned strictly:
- `src/app/`: Next.js Routing only (UI assembly, layouts, pages, API routes). No raw business logic.
- `src/modules/`: Domain logic. (e.g., `src/modules/campaigns/campaign-service.ts`). This ensures the API, Web UI, and TMA can call the exact same logic.
- `src/components/`: Reusable React components (shadcn UI, layout shells).
- `src/lib/`: Technical infrastructure (Supabase client, Telegram API wrappers).

## 4. Multi-Channel Abstraction
When a request is made (e.g., purchasing an entry), the payload contains a `channel` context (e.g., `WEB`, `TELEGRAM`). The core `EntryService` does not alter validation based on the channel, but stores it for attribution and analytics. 

## 5. Risk Assessment
- **Concurrency & Double Spending:** Extremely high risk during campaign closure or high-volume sales. Mitigated by using strict PostgreSQL row locking and atomic operations in the Ledger module.
- **Bot/TMA Desync:** Mitigated by having the bot provide Deep Links that open the TMA to the same Next.js routes, rendering identical state to the web version.
