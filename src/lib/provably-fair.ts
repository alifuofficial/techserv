import * as crypto from "crypto";

export interface ProvablyFairCalculationResult {
  combinedInput: string;
  combinedHash: string;
  hashDecimal: string;
  winningIndex: number;
  winningEntryNumber: number;
  totalEntries: number;
  snapshotHash: string;
  randomSeed: string;
  isMatch?: boolean;
}

/**
 * Mathematically verifiable algorithm for provably fair draw winner selection
 */
export function calculateProvablyFairWinner(
  snapshotHash: string,
  randomSeed: string,
  totalEntries: number
): ProvablyFairCalculationResult {
  if (!snapshotHash || !randomSeed || totalEntries <= 0) {
    throw new Error("Invalid parameters for provably fair calculation");
  }

  const cleanSnapshot = snapshotHash.trim();
  const cleanSeed = randomSeed.trim();
  const combinedInput = `${cleanSnapshot}:${cleanSeed}`;

  // 1. Calculate SHA-256 HMAC of snapshot with seed
  const combinedHash = crypto
    .createHmac("sha256", cleanSeed)
    .update(cleanSnapshot)
    .digest("hex");

  // 2. Take the first 13 hex characters (52 bits of entropy) to avoid float precision loss
  const hexSub = combinedHash.substring(0, 13);
  const decimalValue = parseInt(hexSub, 16);

  // 3. Modulo total valid entries + 1 (1-indexed entry number)
  const winningIndex = decimalValue % totalEntries;
  const winningEntryNumber = winningIndex + 1;

  return {
    combinedInput,
    combinedHash,
    hashDecimal: decimalValue.toString(),
    winningIndex,
    winningEntryNumber,
    totalEntries,
    snapshotHash: cleanSnapshot,
    randomSeed: cleanSeed,
  };
}
