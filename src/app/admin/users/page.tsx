"use client";

import { useState, useEffect } from "react";
import { Search, User, MoreVertical, Download, Eye, Edit3, Ban, ShieldCheck, Wallet, CheckCircle2, Plus, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner"; // Assuming sonner is installed, if not we'll just use basic state or alert

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // New User Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "USER" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete user", error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers([data, ...users]);
        setIsModalOpen(false);
        setFormData({ name: "", email: "", password: "", role: "USER" });
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500">View and manage platform users, balances, and permissions.</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all">
                <Plus className="w-4 h-4" /> Add New User
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:outline-emerald-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:outline-emerald-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:outline-emerald-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:outline-emerald-500 bg-white">
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                    <option value="MERCHANT">Merchant</option>
                  </select>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-2 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 disabled:opacity-50 mt-4">
                  {isSubmitting ? "Creating..." : "Create User"}
                </button>
              </form>
            </DialogContent>
          </Dialog>

          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Total Users</p>
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><User className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{users.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Admins/Merchants</p>
            <div className="p-2 bg-purple-50 text-purple-500 rounded-lg"><ShieldCheck className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{users.filter(u => u.role !== 'USER').length}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Total Ledger Balances</p>
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg"><Wallet className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            {users.reduce((acc, user) => acc + (user.ledgerAccount?.balance || 0), 0).toLocaleString()} ETB
          </h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Suspended Users</p>
            <div className="p-2 bg-red-50 text-red-500 rounded-lg"><Ban className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{users.filter(u => u.status === 'SUSPENDED').length}</h3>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4">Ledger Balance</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-8">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8">No users found.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
                        {user.name ? user.name.charAt(0) : user.email?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 mb-0.5">{user.name || 'Unnamed'}</div>
                        <div className="text-xs text-slate-500">{user.email || user.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'ADMIN' && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 uppercase tracking-wider">Admin</span>}
                      {user.role === 'MERCHANT' && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider">Merchant</span>}
                      {user.role === 'USER' && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wider">User</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {user.ledgerAccount ? `${user.ledgerAccount.balance} ETB` : '0 ETB'}
                    </td>
                    <td className="px-6 py-4">
                      {user.status === 'ACTIVE' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-sm">Active</span>}
                      {user.status === 'SUSPENDED' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200/60 shadow-sm">Suspended</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors outline-none focus:ring-2 focus:ring-emerald-500/20">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-100 shadow-lg rounded-xl">
                          <DropdownMenuLabel className="text-xs text-slate-500 font-semibold uppercase tracking-wider px-3 py-2">User Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-slate-100" />
                          
                          <DropdownMenuItem className="cursor-pointer flex items-center gap-2 text-slate-600 focus:bg-slate-50 focus:text-slate-900 text-sm py-2 px-3">
                            <Eye className="w-4 h-4" /> View Profile
                          </DropdownMenuItem>
                          
                          {user.status === 'ACTIVE' ? (
                            <DropdownMenuItem 
                              onClick={() => updateStatus(user.id, 'SUSPENDED')}
                              className="cursor-pointer flex items-center gap-2 text-amber-600 focus:bg-amber-50 focus:text-amber-700 text-sm py-2 px-3"
                            >
                              <Ban className="w-4 h-4" /> Suspend User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => updateStatus(user.id, 'ACTIVE')}
                              className="cursor-pointer flex items-center gap-2 text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700 text-sm py-2 px-3"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Reactivate User
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator className="bg-slate-100" />
                          
                          <DropdownMenuItem 
                            onClick={() => deleteUser(user.id)}
                            className="cursor-pointer flex items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-700 text-sm py-2 px-3"
                          >
                            <Trash2 className="w-4 h-4" /> Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
