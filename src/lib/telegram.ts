import { createHash, createHmac } from "crypto";

export function verifyTelegramAuth(data: Record<string, string>, botToken: string) {
  const { hash, ...rest } = data;
  
  // 1. Sort the keys alphabetically
  const keys = Object.keys(rest).sort();
  
  // 2. Build the data string
  const dataCheckString = keys
    .map((key) => `${key}=${rest[key]}`)
    .join("\n");
  
  // 3. Create the secret key
  const secretKey = createHash("sha256")
    .update(botToken)
    .digest();
  
  // 4. Calculate the hash
  const hmac = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");
  
  return hmac === hash;
}
