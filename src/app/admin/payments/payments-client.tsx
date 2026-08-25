"use client";

import { useState } from "react";
import { Search, Receipt, MoreVertical, Download, Eye, CheckCircle2, XCircle, Clock, CheckCircle, XOctagon, ShieldCheck, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

export default function PaymentsClient({ initialPayments }: { initialPayments: any[] }) {
  const [payments, setPayments] = useState(initialPayments);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  const updateStatus = async (id: string, newStatus: string) => {
    // Optimistic update
    setPayments(prev => prev.map(payment => payment.id === id ? { ...payment, status: newStatus } : payment));
    
    // Call real API
    try {
      await fetch(`/api/admin/payments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.error(e);
      // Revert on error (skipped for brevity)
    }
  };

  const pendingCount = payments.filter(p => p.status === 'PENDING').length;
  const approvedToday = payments.filter(p => p.status === 'APPROVED').length; // Mock metric
  const rejectedCount = payments.filter(p => p.status === 'REJECTED').length;
  
  const totalProcessed = payments
    .filter(p => p.status === 'APPROVED')
    .reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payment Approvals</h1>
          <p className="text-sm text-slate-500">Review and approve offline transactions (Telebirr, CBE) and manage ledger balances.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Pending Reviews</p>
            <div className="p-2 bg-amber-50 text-amber-500 rounded-lg"><Clock className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{pendingCount}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Total Approved</p>
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg"><CheckCircle className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{approvedToday}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Total Processed</p>
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Receipt className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{totalProcessed.toLocaleString()} ETB</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Rejected / Fraud</p>
            <div className="p-2 bg-red-50 text-red-500 rounded-lg"><XOctagon className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{rejectedCount}</h3>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Transaction ID or Email..." 
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition-all">
            <option>All Providers</option>
            <option>Telebirr</option>
            <option>CBE Birr</option>
          </select>
          <select className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition-all">
            <option>All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">TxID / Note</th>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-mono font-medium text-slate-900 mb-1">
                      <Receipt className="w-4 h-4 text-slate-400" /> {payment.transactionId}
                    </div>
                    <div className="text-xs text-slate-500 max-w-[200px] truncate" title={payment.adminNote}>
                      {payment.adminNote || 'No notes'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 mb-0.5">{payment.user?.name || 'Unknown User'}</div>
                    <div className="text-xs text-slate-500">{payment.user?.email || 'No email'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wider">
                      {payment.provider}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">{payment.amount.toLocaleString()} {payment.currency}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">
                    {format(new Date(payment.createdAt), 'MMM d, yyyy, HH:mm')}
                  </td>
                  <td className="px-6 py-4">
                    {payment.status === 'APPROVED' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-sm">Approved</span>}
                    {payment.status === 'PENDING' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200/60 shadow-sm">Pending Review</span>}
                    {payment.status === 'REJECTED' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200/60 shadow-sm">Rejected</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors outline-none focus:ring-2 focus:ring-emerald-500/20">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-100 shadow-lg rounded-xl">
                        <DropdownMenuLabel className="text-xs text-slate-500 font-semibold uppercase tracking-wider px-3 py-2">Payment Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-100" />
                        
                        {payment.screenshotUrl && (
                          <DropdownMenuItem className="cursor-pointer flex items-center gap-2 text-slate-600 focus:bg-slate-50 focus:text-slate-900 text-sm py-2 px-3" onClick={() => setSelectedScreenshot(payment.screenshotUrl)}>
                            <Eye className="w-4 h-4" /> View Screenshot
                          </DropdownMenuItem>
                        )}
                        
                        {payment.status === 'PENDING' && (
                          <>
                            <DropdownMenuItem 
                              className="cursor-pointer flex items-center gap-2 text-blue-600 focus:bg-blue-50 focus:text-blue-700 text-sm py-2 px-3 font-semibold"
                            >
                              <ShieldCheck className="w-4 h-4" /> Auto-Verify (Verify.ET)
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <DropdownMenuItem 
                              onClick={() => updateStatus(payment.id, 'APPROVED')}
                              className="cursor-pointer flex items-center gap-2 text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700 text-sm py-2 px-3"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Approve & Credit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updateStatus(payment.id, 'REJECTED')}
                              className="cursor-pointer flex items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-700 text-sm py-2 px-3"
                            >
                              <XCircle className="w-4 h-4" /> Reject Payment
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              
              {payments.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    No payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Screenshot Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedScreenshot(null)}>
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h2 className="font-bold text-slate-900">Proof of Transfer</h2>
              <button 
                onClick={() => setSelectedScreenshot(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 flex items-center justify-center bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={selectedScreenshot} 
                alt="Payment Screenshot" 
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-sm border border-slate-200 bg-white"
              />
            </div>
            <div className="p-4 border-t border-slate-100 bg-white shrink-0 text-center">
              <p className="text-xs text-slate-500">Please verify the amount, date, and transaction ID against the database records.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
