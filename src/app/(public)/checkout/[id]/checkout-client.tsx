"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

import { Wallet } from "lucide-react";

export default function CheckoutClient({ 
  campaign,
  userBalance = 0,
  isLoggedIn = false,
  userPhone = "",
  userName = "",
  userId = ""
}: { 
  campaign: any;
  userBalance?: number;
  isLoggedIn?: boolean;
  userPhone?: string;
  userName?: string;
  userId?: string;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [provider, setProvider] = useState("MANUAL_TELEBIRR");
  const [txId, setTxId] = useState("");
  
  // Minimal auth info for MVP
  const [name, setName] = useState(userName);
  const [phone, setPhone] = useState(userPhone);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const totalPrice = campaign.entryPrice * quantity;
  const canUseWallet = isLoggedIn && userBalance >= totalPrice;

  // Auto-switch to wallet if they can afford it when component loads or quantity changes
  useEffect(() => {
    if (canUseWallet && provider !== "WALLET") {
      setProvider("WALLET");
    } else if (!canUseWallet && provider === "WALLET") {
      setProvider("MANUAL_TELEBIRR");
    }
  }, [canUseWallet, provider]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (provider !== "WALLET" && !txId) {
      setError("Please enter a Transaction ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId: campaign.id,
          quantity,
          provider,
          txId: provider === "WALLET" ? `WALLET-${Date.now()}` : txId,
          name,
          phone,
          amount: totalPrice,
          userId: userId || undefined, // For demo purposes
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to process payment");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-200 text-center max-w-2xl mx-auto mt-12">
        <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
        
        {provider === 'WALLET' ? (
          <>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Purchase Successful!</h1>
            <p className="text-slate-600 mb-8 text-lg">
              Your payment of <span className="font-bold">{totalPrice} {campaign.currency}</span> was successfully deducted from your wallet. 
              Your entry tickets have been generated instantly!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="w-full sm:w-auto h-12 px-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-lg font-bold">
                <Link href={`/dashboard/tickets`}>View My Tickets</Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto h-12 px-8 rounded-xl text-lg font-bold border-slate-200 text-slate-700">
                <Link href={`/campaigns/${campaign.slug}`}>Back to Campaign</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Payment Pending!</h1>
            <p className="text-slate-600 mb-8 text-lg">
              Your payment of <span className="font-bold">{totalPrice} {campaign.currency}</span> has been received and is being verified. 
              Once verified by our admins, your entry tickets will be generated.
            </p>
            <Button asChild className="w-full sm:w-auto h-12 px-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-lg font-bold">
              <Link href={`/campaigns/${campaign.slug}`}>Return to Campaign</Link>
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
      {/* Checkout Form */}
      <div className="lg:col-span-7 xl:col-span-8">
        <div className="mb-6">
          <Link href={`/campaigns/${campaign.slug}`} className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Campaign
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 mb-8 pb-4 border-b border-slate-100">Secure Checkout</h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Ticket Quantity */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">1. Select Tickets</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {[1, 2, 5, 10, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuantity(num)}
                    className={`h-12 rounded-xl border font-bold text-sm transition-all ${
                      quantity === num 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20' 
                        : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/50'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4">
                <span className="text-sm font-medium text-slate-500">Or enter custom amount:</span>
                <input 
                  type="number" 
                  min="1"
                  max="1000"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">2. Payment Method</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Wallet Option */}
                {isLoggedIn && (
                  <button
                    type="button"
                    disabled={!canUseWallet}
                    onClick={() => setProvider("WALLET")}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all sm:col-span-2 ${
                      provider === "WALLET"
                        ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20' 
                        : !canUseWallet
                          ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                          : 'border-slate-200 bg-white hover:border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Wallet className={`w-5 h-5 ${provider === "WALLET" ? "text-emerald-500" : "text-slate-400"}`} />
                      <span className="font-bold text-slate-900">MilkyTech Wallet</span>
                    </div>
                    <span className={`text-xs ${!canUseWallet ? 'text-red-500 font-medium' : 'text-slate-500'}`}>
                      Balance: {userBalance.toLocaleString()} ETB {(!canUseWallet && totalPrice > 0) && `(Need ${totalPrice.toLocaleString()} ETB)`}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setProvider("MANUAL_TELEBIRR")}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                    provider === "MANUAL_TELEBIRR"
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20' 
                      : 'border-slate-200 bg-white hover:border-emerald-200'
                  }`}
                >
                  <span className="font-bold text-slate-900">Telebirr</span>
                  <span className="text-xs text-slate-500 mt-1">Pay to: 0911234567</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProvider("MANUAL_CBE")}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                    provider === "MANUAL_CBE"
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20' 
                      : 'border-slate-200 bg-white hover:border-emerald-200'
                  }`}
                >
                  <span className="font-bold text-slate-900">CBE Birr</span>
                  <span className="text-xs text-slate-500 mt-1">Pay to: 1000123456789</span>
                </button>
              </div>
            </div>

            {/* User Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">3. Your Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                    placeholder="Abebe Kebede"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                    placeholder="0911..."
                  />
                </div>
              </div>
            </div>

            {/* Verification (Only for Manual) */}
            {provider !== "WALLET" && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">4. Payment Verification</h3>
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 mb-4">
                  <p className="text-sm text-amber-800 font-medium leading-relaxed">
                    Please transfer <span className="font-bold">{totalPrice} {campaign.currency}</span> to the account provided above. 
                    After completing the transfer, enter the Transaction ID (TxID) below so we can verify your payment using Verify.ET.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Transaction ID (TxID) <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required={provider !== "WALLET"}
                    value={txId}
                    onChange={e => setTxId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 uppercase font-mono"
                    placeholder="e.g. AB1234XYZ"
                  />
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-lg font-bold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : `Complete Purchase (${totalPrice} ${campaign.currency})`}
            </Button>
          </form>
        </div>
      </div>

      {/* Order Summary Sidebar */}
      <div className="lg:col-span-5 xl:col-span-4">
        <div className="sticky top-8 bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
          <h3 className="font-bold text-slate-900 text-xl mb-6">Order Summary</h3>
          
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            {campaign.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={campaign.imageUrl} alt="Campaign" className="w-16 h-16 rounded-lg object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-400">IMG</span>
              </div>
            )}
            <div>
              <h4 className="font-bold text-slate-900 line-clamp-1">{campaign.title}</h4>
              <p className="text-sm text-slate-500">{campaign.entryPrice} {campaign.currency} / ticket</p>
            </div>
          </div>

          <div className="space-y-4 mb-6 pb-6 border-b border-slate-100">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tickets</span>
              <span className="font-semibold text-slate-900">{quantity}x</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-semibold text-slate-900">{totalPrice} {campaign.currency}</span>
            </div>
          </div>

          <div className="flex justify-between items-end mb-8">
            <span className="text-base font-bold text-slate-900">Total</span>
            <div className="text-right">
              <span className="block text-3xl font-black text-emerald-600">{totalPrice}</span>
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{campaign.currency}</span>
            </div>
          </div>
          
          <p className="text-xs text-center text-slate-500 leading-relaxed px-2">
            By clicking "Complete Purchase", you agree to our Terms of Service and Privacy Policy. All sales are final.
          </p>
        </div>
      </div>
    </div>
  );
}
