"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { ChevronLeft, ShieldCheck, Upload, CheckCircle2, AlertCircle, X, Loader2, Copy, Check, Landmark, Wallet } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchTelegramApi } from "@/lib/telegram-client";

interface PaymentMethodOption {
  id: string;
  name: string;
  shortCode: string;
  category: "MOBILE_MONEY" | "BANK_TRANSFER";
  accountName: string;
  accountNumber: string;
  instructions: string;
  enabled: boolean;
  color: string;
}

function DepositForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [amount, setAmount] = useState(searchParams.get("amount") || "");
  const [methods, setMethods] = useState<PaymentMethodOption[]>([
    {
      id: "telebirr",
      name: "Telebirr Direct",
      shortCode: "TB",
      category: "MOBILE_MONEY",
      accountName: "MilkyTech Online",
      accountNumber: "0911000000",
      instructions: "Transfer to the Telebirr number above and upload your screenshot receipt.",
      enabled: true,
      color: "blue",
    },
    {
      id: "cbe",
      name: "Commercial Bank of Ethiopia (CBE)",
      shortCode: "CBE",
      category: "BANK_TRANSFER",
      accountName: "MilkyTech Online PLC",
      accountNumber: "1000123456789",
      instructions: "Transfer to the CBE account number above and upload your screenshot receipt.",
      enabled: true,
      color: "purple",
    },
  ]);
  const [selectedMethodId, setSelectedMethodId] = useState<string>("telebirr");
  const [txId, setTxId] = useState("");
  const [senderName, setSenderName] = useState("");
  const [screenshot, setScreenshot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/settings/public")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          if (data.settings.paymentMethods && data.settings.paymentMethods.length > 0) {
            setMethods(data.settings.paymentMethods);
            setSelectedMethodId(data.settings.paymentMethods[0].id);
          } else {
            const defaultList: PaymentMethodOption[] = [];
            if (data.settings.telebirr?.enabled) {
              defaultList.push({
                id: "telebirr",
                name: "Telebirr Direct",
                shortCode: "TB",
                category: "MOBILE_MONEY",
                accountName: data.settings.telebirr.accountName,
                accountNumber: data.settings.telebirr.accountNumber,
                instructions: data.settings.telebirr.instructions,
                enabled: true,
                color: "blue",
              });
            }
            if (data.settings.cbe?.enabled) {
              defaultList.push({
                id: "cbe",
                name: "Commercial Bank of Ethiopia",
                shortCode: "CBE",
                category: "BANK_TRANSFER",
                accountName: data.settings.cbe.accountName,
                accountNumber: data.settings.cbe.accountNumber,
                instructions: data.settings.cbe.instructions,
                enabled: true,
                color: "purple",
              });
            }
            if (defaultList.length > 0) {
              setMethods(defaultList);
              setSelectedMethodId(defaultList[0].id);
            }
          }
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const amt = searchParams.get("amount");
    if (amt && !amount) {
      setAmount(amt);
    }
  }, [searchParams]);

  const handleCopyAccount = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setScreenshot(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const selectedMethod = methods.find((m) => m.id === selectedMethodId) || methods[0];

  const handleDeposit = async () => {
    if (!amount || Number(amount) < 50) {
      setError("Minimum deposit is 50 ETB.");
      return;
    }
    if (!txId.trim()) {
      setError("Transaction ID (TxID) is required.");
      return;
    }
    if (!screenshot) {
      setError("Payment receipt screenshot is required.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetchTelegramApi("/api/wallet/deposit", {
        method: "POST",
        body: JSON.stringify({
          amount: Number(amount),
          provider: selectedMethod ? selectedMethod.name : "TELEBIRR",
          txId: txId.trim(),
          senderName: senderName.trim() || undefined,
          screenshot,
        }),
      });

      if (res.ok && res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/telegram");
        }, 2500);
      } else {
        setError(res.data.error || "Deposit failed. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setError("An error occurred while submitting deposit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBadgeColor = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-500 text-white";
      case "purple":
        return "bg-purple-600 text-white";
      case "emerald":
        return "bg-emerald-500 text-white";
      case "amber":
        return "bg-amber-500 text-slate-950";
      case "rose":
        return "bg-rose-500 text-white";
      case "indigo":
        return "bg-indigo-600 text-white";
      case "orange":
        return "bg-orange-500 text-white";
      default:
        return "bg-slate-700 text-white";
    }
  };

  if (success) {
    return (
      <div className="pb-24 px-5 min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 text-emerald-400 border border-emerald-500/30 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Deposit Submitted!</h1>
        <p className="text-slate-400 text-sm text-center mb-8 max-w-xs leading-relaxed">
          Your payment receipt for <b>{amount} ETB</b> via <b>{selectedMethod?.name}</b> has been received and is being verified. Your wallet will be credited shortly.
        </p>
        <Link href="/telegram" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-8 rounded-xl text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-24 px-5 min-h-screen bg-[#0B0F19] text-white">
      <div className="pt-14 pb-6 flex items-center gap-4 sticky top-0 bg-[#0B0F19]/90 backdrop-blur-lg z-10">
        <Link href="/telegram" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center active:scale-95 transition-transform">
          <ChevronLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-xl font-bold text-white">Deposit Funds</h1>
      </div>

      {/* Payment Provider Selector */}
      <div className="bg-[#121826] border border-slate-800/60 rounded-3xl p-5 mt-2 space-y-3">
        <h2 className="text-slate-300 font-semibold text-xs uppercase tracking-wider">Select Bank / Payment Method</h2>
        
        <div className="grid grid-cols-2 gap-2.5">
          {methods.map((method) => {
            const isSelected = selectedMethodId === method.id;
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => setSelectedMethodId(method.id)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-500/15 text-white ring-2 ring-emerald-500/20"
                    : "border-slate-700/60 bg-slate-800/40 text-slate-400 hover:bg-slate-800/80"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 font-black text-[10px] uppercase shadow-sm ${getBadgeColor(method.color)}`}>
                  {method.shortCode || "PAY"}
                </div>
                <p className="text-xs font-bold text-white truncate">{method.name}</p>
                <p className="text-[10px] font-mono text-emerald-400 mt-0.5 truncate">
                  {method.accountNumber}
                </p>
              </button>
            );
          })}
        </div>

        {/* Dynamic Account Info Card */}
        {selectedMethod && (
          <div className="p-4 bg-[#0B0F19] border border-slate-800 rounded-2xl space-y-2 mt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">Account Name:</span>
              <span className="text-white font-bold">{selectedMethod.accountName}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">Account Number:</span>
              <button
                type="button"
                onClick={() => handleCopyAccount(selectedMethod.accountNumber)}
                className="flex items-center gap-1 font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 active:scale-95 transition-all"
              >
                <span>{selectedMethod.accountNumber}</span>
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 leading-relaxed">
              {selectedMethod.instructions}
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 space-y-4">
        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Amount to Deposit (ETB) <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 200"
              className="w-full bg-[#121826] border border-slate-700 rounded-xl px-4 py-3.5 text-white text-lg font-black focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">ETB</span>
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Transaction ID (TxID) <span className="text-red-400">*</span>
          </label>
          <input 
            type="text" 
            value={txId}
            onChange={(e) => setTxId(e.target.value)}
            placeholder="e.g. TB123456789 or CBE-REF-001 or AWASH-998"
            className="w-full bg-[#121826] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Sender Name (Optional)
          </label>
          <input 
            type="text" 
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Name on bank account"
            className="w-full bg-[#121826] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Payment Receipt Screenshot <span className="text-red-400">*</span>
          </label>
          {screenshot ? (
            <div className="relative rounded-2xl overflow-hidden border border-emerald-500/50 bg-[#121826]">
              <img src={screenshot} alt="Receipt" className="w-full max-h-48 object-cover" />
              <button 
                type="button" 
                onClick={() => setScreenshot("")}
                className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full hover:bg-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-[#121826] rounded-2xl p-6 cursor-pointer transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-bold text-slate-300">Upload Receipt Screenshot</span>
              <span className="text-[10px] text-slate-500 mt-1">PNG, JPG, or JPEG</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          )}
        </div>

        <button
          type="button"
          onClick={handleDeposit}
          disabled={isSubmitting}
          className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 disabled:opacity-50 text-white font-extrabold py-4 rounded-2xl text-base shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Submitting Deposit...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" />
              <span>Submit for Verification</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function DepositPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    }>
      <DepositForm />
    </Suspense>
  );
}
