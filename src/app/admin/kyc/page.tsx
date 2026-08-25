"use client";

import { useState } from "react";
import { Search, FileText, MoreVertical, Download, Eye, CheckCircle2, XCircle, UserCheck, Clock, AlertTriangle, ShieldAlert } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const initialKyc = [
  { id: "KYC-90214", user: "Dawit T.", email: "dawit@example.com", type: "National ID", date: "Aug 21, 2026", risk: "Low", status: "PENDING" },
  { id: "KYC-38412", user: "Sara M.", email: "sara@example.com", type: "Passport", date: "Aug 20, 2026", risk: "Low", status: "VERIFIED" },
  { id: "KYC-10921", user: "Henok B.", email: "henok.b@example.com", type: "Driver's License", date: "Aug 19, 2026", risk: "High", status: "REJECTED" },
  { id: "KYC-55829", user: "Kaleb Y.", email: "kaleb.y@example.com", type: "National ID", date: "Aug 18, 2026", risk: "Medium", status: "PENDING" },
  { id: "KYC-48192", user: "Betelhem A.", email: "beti@example.com", type: "Passport", date: "Aug 15, 2026", risk: "Low", status: "VERIFIED" },
];

export default function AdminKycPage() {
  const [kycRequests, setKycRequests] = useState(initialKyc);

  const updateStatus = (id: string, newStatus: string) => {
    setKycRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req));
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">KYC & Verification</h1>
          <p className="text-sm text-slate-500">Review user identity documents and approve accounts for withdrawals.</p>
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
          <h3 className="text-2xl font-bold text-slate-900">42</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Verified (24h)</p>
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg"><UserCheck className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">128</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Rejection Rate</p>
            <div className="p-2 bg-red-50 text-red-500 rounded-lg"><AlertTriangle className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">4.2%</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">High Risk Profiles</p>
            <div className="p-2 bg-purple-50 text-purple-500 rounded-lg"><ShieldAlert className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">7</h3>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by ID or Email..." 
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition-all">
            <option>All Types</option>
            <option>National ID</option>
            <option>Passport</option>
            <option>Driver's License</option>
          </select>
          <select className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition-all">
            <option>All Status</option>
            <option>Pending</option>
            <option>Verified</option>
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
                <th className="px-6 py-4">Reference ID</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Document Type</th>
                <th className="px-6 py-4">Risk Level</th>
                <th className="px-6 py-4">Submitted Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kycRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" /> {req.id}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 mb-0.5">{req.user}</div>
                    <div className="text-xs text-slate-500">{req.email}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{req.type}</td>
                  <td className="px-6 py-4">
                    {req.risk === 'Low' && <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-100">Low</span>}
                    {req.risk === 'Medium' && <span className="text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded text-xs border border-amber-100">Medium</span>}
                    {req.risk === 'High' && <span className="text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded text-xs border border-red-100">High</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{req.date}</td>
                  <td className="px-6 py-4">
                    {req.status === 'VERIFIED' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-sm">Verified</span>}
                    {req.status === 'PENDING' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200/60 shadow-sm">Pending Review</span>}
                    {req.status === 'REJECTED' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200/60 shadow-sm">Rejected</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors outline-none focus:ring-2 focus:ring-emerald-500/20">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-100 shadow-lg rounded-xl">
                        <DropdownMenuLabel className="text-xs text-slate-500 font-semibold uppercase tracking-wider px-3 py-2">Verification Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-100" />
                        
                        <DropdownMenuItem className="cursor-pointer flex items-center gap-2 text-slate-600 focus:bg-slate-50 focus:text-slate-900 text-sm py-2 px-3">
                          <Eye className="w-4 h-4" /> View Documents
                        </DropdownMenuItem>
                        
                        {req.status === 'PENDING' && (
                          <>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <DropdownMenuItem 
                              onClick={() => updateStatus(req.id, 'VERIFIED')}
                              className="cursor-pointer flex items-center gap-2 text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700 text-sm py-2 px-3"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Approve & Verify
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updateStatus(req.id, 'REJECTED')}
                              className="cursor-pointer flex items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-700 text-sm py-2 px-3"
                            >
                              <XCircle className="w-4 h-4" /> Reject Documents
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        {req.status === 'REJECTED' && (
                          <DropdownMenuItem 
                            onClick={() => updateStatus(req.id, 'PENDING')}
                            className="cursor-pointer flex items-center gap-2 text-amber-600 focus:bg-amber-50 focus:text-amber-700 text-sm py-2 px-3"
                          >
                            <AlertTriangle className="w-4 h-4" /> Request Re-upload
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Dummy */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <div>Showing 1 to {kycRequests.length} of 3,109 requests</div>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors" disabled>Prev</button>
            <button className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg font-bold shadow-md shadow-emerald-500/20">1</button>
            <button className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">2</button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
