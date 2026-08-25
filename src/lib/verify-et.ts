/**
 * Verify.ET Integration Service
 * 
 * This service acts as a wrapper around the Verify.ET Payment Verification API.
 * It is used to programmatically verify if offline deposits (e.g., Telebirr, CBE) 
 * are authentic by checking their Transaction IDs against the provider.
 */

const VERIFY_ET_API_URL = process.env.VERIFY_ET_API_URL || "https://api.verify.et/v1";
const VERIFY_ET_API_KEY = process.env.VERIFY_ET_API_KEY || "";

export interface VerifyEtPaymentResponse {
  isValid: boolean;
  transactionId: string;
  provider: string;
  amount: number;
  currency: string;
  senderName?: string;
  senderPhone?: string;
  timestamp?: string;
  rawPayload?: any;
}

export class VerifyEtService {
  /**
   * Verifies a bank or mobile money transaction ID against Verify.ET
   * 
   * @param provider The payment provider (e.g., 'TELEBIRR', 'CBE')
   * @param transactionId The transaction reference ID submitted by the user
   * @param expectedAmount Optional amount to cross-check against the receipt
   * @returns The verification details and boolean validity
   */
  static async verifyTransaction(
    provider: 'TELEBIRR' | 'CBE' | string, 
    transactionId: string,
    expectedAmount?: number
  ): Promise<VerifyEtPaymentResponse> {
    
    // In development or if API key is missing, mock the response
    if (!VERIFY_ET_API_KEY) {
      console.warn("Verify.ET API Key is missing. Returning MOCK success response.");
      return {
        isValid: true,
        transactionId,
        provider,
        amount: expectedAmount || 1000,
        currency: "ETB",
        senderName: "Mock User",
        timestamp: new Date().toISOString()
      };
    }

    try {
      const response = await fetch(`${VERIFY_ET_API_URL}/payments/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${VERIFY_ET_API_KEY}`
        },
        body: JSON.stringify({
          provider: provider.toUpperCase(),
          transaction_id: transactionId,
          expected_amount: expectedAmount
        })
      });

      if (!response.ok) {
        throw new Error(`Verify.ET API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Map Verify.ET response to our internal structure
      return {
        isValid: data.is_valid,
        transactionId: data.transaction_id,
        provider: data.provider,
        amount: data.amount,
        currency: data.currency,
        senderName: data.sender_name,
        senderPhone: data.sender_phone,
        timestamp: data.timestamp,
        rawPayload: data
      };
      
    } catch (error) {
      console.error("Failed to verify transaction via Verify.ET:", error);
      throw error;
    }
  }
}
