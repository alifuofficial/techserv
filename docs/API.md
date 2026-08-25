# API Architecture

## 1. RESTful Structure
All business APIs will reside under `/api/v1/`. Server Actions will be used for UI forms where appropriate, but core domain actions should be exposed as REST endpoints to allow future mobile apps to consume them.

### Campaigns
- `GET /api/v1/campaigns` - List active campaigns
- `GET /api/v1/campaigns/:id` - Campaign details
- `POST /api/v1/campaigns` - (Admin) Create campaign

### Entries
- `GET /api/v1/entries` - List user's entries
- `POST /api/v1/entries` - (Internal/System) Generate entry (called by Payment Webhook or Admin Approval)

### Payments
- `POST /api/v1/payments/initialize` - Start offline manual payment (returns payment intent ID)
- `POST /api/v1/payments/:id/proof` - Upload screenshot and TX ID
- `POST /api/v1/payments/:id/approve` - (Admin) Approve offline payment -> Triggers Entry generation

### Telegram
- `POST /api/v1/telegram/webhook` - Receives messages from Telegram Bot API
- `POST /api/v1/telegram/auth` - Validates TMA `initData` and returns auth token

## 2. Shared Domain Modules
The API Route Handlers should strictly act as HTTP interfaces (parsing requests, validating schemas). They must delegate to `src/modules/` for business logic.

```typescript
// Example: src/app/api/v1/campaigns/route.ts
import { CampaignService } from '@/modules/campaigns/campaign-service';

export async function GET(req: Request) {
  const campaigns = await CampaignService.listActive();
  return NextResponse.json(campaigns);
}
```
