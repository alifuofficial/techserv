"use client";

import { useState, useEffect } from "react";
import { Wallet, ArrowDownToLine, ArrowUpRight, Clock, CheckCircle2, History, CreditCard, Banknote, ShieldCheck, X, Upload } from "lucide-react";
import { format } from "date-fns";

export default function UserWalletClient({ 
  initialBalance, 
  initialTransactions 
}: { 
  initialBalance: number;
  initialTransactions: any[];
}) {
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositMethod, setDepositMethod] = useState("MANUAL_TELEBIRR");
  const [depositAmount, setDepositAmount] = useState("");
  const [senderName, setSenderName] = useState("");
  const [txId, setTxId] = useState("");
  const [transferDate, setTransferDate] = useState("");
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [balance, setBalance] = useState(initialBalance);

  useEffect(() => {
    setTransactions(initialTransactions);
    setBalance(initialBalance);
  }, [initialTransactions, initialBalance]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: depositAmount,
          provider: depositMethod,
          txId: txId,
          senderName: senderName,
          date: transferDate,
          screenshot: screenshotBase64,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to process deposit");
      }

      const newTxn = {
        id: data.payment.transactionId,
        type: "DEPOSIT",
        title: depositMethod === "MANUAL_TELEBIRR" ? "Telebirr Deposit" : "CBE Birr Deposit",
        date: format(new Date(), 'MMM d, yyyy, HH:mm'),
        amount: `+${Number(depositAmount).toLocaleString()}.00 ETB`,
        status: "PENDING",
      };
      
      setTransactions([newTxn, ...transactions]);
      setShowDepositModal(false);
      
      // Reset form
      setDepositAmount("");
      setSenderName("");
      setTxId("");
      setTransferDate("");
      setScreenshotBase64(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Wallet & Funds</h1>
          <p className="text-sm text-slate-500">Manage your balance, add funds securely, and view your transaction history.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Balance & Actions */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Main Balance Card */}
          <div className="bg-[#0B0F19] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl -ml-5 -mb-5"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-slate-400 font-medium text-sm mb-4">
                <Wallet className="w-4 h-4" /> Available Balance
              </div>
              <div className="text-4xl font-extrabold tracking-tight mb-1">
                {balance.toLocaleString()}<span className="text-xl text-slate-400 font-semibold">.00 ETB</span>
              </div>
              <div className="flex items-center gap-2 mt-6 pt-6 border-t border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-slate-400 font-medium">Funds securely stored & encrypted</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setShowDepositModal(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-colors shadow-sm shadow-emerald-500/20"
            >
              <ArrowDownToLine className="w-6 h-6" />
              <span className="text-sm font-bold">Deposit</span>
            </button>
            <button className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-colors shadow-sm">
              <ArrowUpRight className="w-6 h-6" />
              <span className="text-sm font-bold">Withdraw</span>
            </button>
          </div>

          {/* Payment Methods Snippet */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Linked Methods</h3>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">TB</div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">Telebirr Account</p>
                <p className="text-xs text-slate-500">+251 911 *** 892</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Right Column: Transaction History */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-400" /> Recent Transactions
            </h2>
            <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Download Statement</button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {transactions.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {transactions.map((txn) => {
                  const isPositive = txn.type === "DEPOSIT" || txn.type === "REWARD";
                  
                  return (
                    <div key={txn.id} className="p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors group">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                        txn.type === 'DEPOSIT' ? 'bg-emerald-100 text-emerald-600' :
                        txn.type === 'REWARD' ? 'bg-amber-100 text-amber-600' :
                        txn.type === 'WITHDRAWAL' ? 'bg-slate-100 text-slate-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {txn.type === 'DEPOSIT' && <ArrowDownToLine className="w-5 h-5" />}
                        {txn.type === 'REWARD' && <Banknote className="w-5 h-5" />}
                        {txn.type === 'WITHDRAWAL' && <ArrowUpRight className="w-5 h-5" />}
                        {txn.type === 'PURCHASE' && <CreditCard className="w-5 h-5" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{txn.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500">{txn.date}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className="text-[10px] font-mono text-slate-400">{txn.id}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold ${isPositive ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {txn.amount}
                        </p>
                        <div className="mt-1 flex justify-end">
                          {txn.status === 'APPROVED' ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Approved
                            </span>
                          ) : txn.status === 'REJECTED' ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">
                              <X className="w-3 h-3 text-red-500" /> Rejected
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 flex flex-col items-center justify-center text-center h-full">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <History className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No transactions yet</h3>
                <p className="text-slate-500 max-w-sm mb-6 text-sm">Your transaction history will appear here once you make a deposit or purchase a ticket.</p>
                <button 
                  onClick={() => setShowDepositModal(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold transition-colors text-sm"
                >
                  Make your first deposit
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ArrowDownToLine className="w-5 h-5 text-emerald-500" />
                Deposit Funds
              </h2>
              <button 
                onClick={() => setShowDepositModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="deposit-form" onSubmit={handleDepositSubmit} className="space-y-5">
                
                {/* Provider Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">1. Select Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDepositMethod("MANUAL_TELEBIRR")}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        depositMethod === "MANUAL_TELEBIRR"
                          ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20' 
                          : 'border-slate-200 bg-white hover:border-emerald-200'
                      }`}
                    >
                      <span className="font-bold text-slate-900 text-sm">Telebirr</span>
                      <span className="text-[10px] text-slate-500 mt-1">Pay to: 0911234567</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDepositMethod("MANUAL_CBE")}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        depositMethod === "MANUAL_CBE"
                          ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20' 
                          : 'border-slate-200 bg-white hover:border-emerald-200'
                      }`}
                    >
                      <span className="font-bold text-slate-900 text-sm">CBE Birr</span>
                      <span className="text-[10px] text-slate-500 mt-1">Pay to: 1000123456789</span>
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">2. Deposit Amount (ETB)</label>
                  <input 
                    type="number" 
                    required
                    min="100"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                    placeholder="e.g. 1000"
                  />
                </div>

                {/* Sender Details */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-700">3. Proof of Transfer</h3>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Sender Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-all"
                      placeholder="Abebe Kebede"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600">Transaction ID</label>
                      <input 
                        type="text" 
                        required
                        value={txId}
                        onChange={(e) => setTxId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm uppercase font-mono focus:outline-none focus:border-emerald-500 transition-all"
                        placeholder="AB1234XYZ"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600">Date</label>
                      <input 
                        type="date" 
                        required
                        value={transferDate}
                        onChange={(e) => setTransferDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Screenshot Upload */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Upload Screenshot (Required)</label>
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {screenshotBase64 ? (
                          <span className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Image Uploaded
                          </span>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-slate-400 mb-1" />
                            <p className="text-xs text-slate-500"><span className="font-semibold text-emerald-600">Click to upload</span> or drag and drop</p>
                          </>
                        )}
                      </div>
                      <input type="file" className="hidden" accept="image/*" required onChange={handleFileChange} />
                    </label>
                  </div>
                  
                </div>

              </form>
            </div>
            
            <div className="p-5 border-t border-slate-100 bg-white shrink-0">
              <button 
                type="submit" 
                form="deposit-form"
                disabled={isSubmitting}
                className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-70 flex justify-center items-center"
              >
                {isSubmitting ? "Submitting..." : "Submit Deposit Request"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
