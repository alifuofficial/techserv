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

export function verifyTmaAuth(initData: string, botToken: string) {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get("hash");
    urlParams.delete("hash");

    // 1. Sort the keys alphabetically
    const params = Array.from(urlParams.entries());
    params.sort(([a], [b]) => a.localeCompare(b));

    // 2. Build the data string
    const dataCheckString = params
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    // 3. Create the secret key
    // For TMA, the secret key is HMAC-SHA256 of the token using "WebAppData" as key
    const secretKey = createHmac("sha256", "WebAppData")
      .update(botToken)
      .digest();

    // 4. Calculate the hash
    const hmac = createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    return hmac === hash;
  } catch (error) {
    console.error("TMA verification error:", error);
    return false;
  }
}
