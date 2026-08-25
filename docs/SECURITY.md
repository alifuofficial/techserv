# Security Architecture

## 1. Supabase Row Level Security (RLS)
The database will leverage Supabase RLS heavily to prevent IDOR (Insecure Direct Object Reference) and privilege escalation.

- **Users:** Can only SELECT/UPDATE their own rows (where `id = auth.uid()`).
- **User Identities:** Can only SELECT their own linked accounts.
- **Campaigns:** SELECT is PUBLIC. INSERT/UPDATE/DELETE requires Admin role.
- **Entries:** SELECT where `user_id = auth.uid()`. INSERT via Service Role only (application backend).
- **Payments:** SELECT where `user_id = auth.uid()`. INSERT where `user_id = auth.uid()`. UPDATE via Service Role / Admin only.
- **Ledger:** SELECT where `user_id = auth.uid()`. INSERT/UPDATE strictly disabled for all (only Service Role).

## 2. Authentication Flow
- Users authenticate via Supabase Auth (Email/Password or Magic Link) on the Web.
- Telegram Mini App authenticates by validating the `initData` cryptographically using the Telegram Bot Token. Once validated, the backend issues a Supabase JWT or custom session token linking to the user's Supabase account.

## 3. Threat Model Mitigation
- **Race Conditions (Over-selling):** Enforced at the PostgreSQL transaction level.
- **Fake Payments:** Admin manual verification requires matching Transaction ID. DB uniqueness on Transaction ID.
- **Data Tampering:** All critical actions (Entries, Ledgers, Draws) are handled server-side using the `SERVICE_ROLE` key. The client never inserts entries directly.
