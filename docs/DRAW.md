# Draw Engine Architecture

## 1. Principles
The draw engine must be strictly separated from the frontend. It executes as a server-side job (or triggered Admin action). 

## 2. Draw Lifecycle

1. **Campaign Closes:** Status transitions to `CLOSED`. No further entries accepted.
2. **Snapshotting:** The system freezes all valid `entries` for this campaign. A cryptographic hash (e.g., SHA-256) of the ordered list of entry IDs is generated and saved to the `draws` record to prove the entry pool was not manipulated post-closure.
3. **Randomness Generation:** The system requests a random number. For offline MVP, this can be a cryptographically secure pseudo-random number generator (CSPRNG) on the server, or input from an external verifiable randomness beacon (e.g., random.org).
4. **Selection:** The winning entry is selected.
5. **Lock & Publish:** The `draws` record is locked (status `COMPLETED`). The campaign status updates to `COMPLETED`. The `winning_entry_id` is published.

## 3. Anti-Tampering
- Never use `Math.random()`. Use `crypto.getRandomValues()` or Node `crypto.randomInt`.
- The snapshot hash allows auditors to verify that the pool of participants was frozen prior to the random seed generation.
