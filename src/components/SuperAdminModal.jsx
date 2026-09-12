import React, { useState, useEffect } from 'react';
import { X, Shield, Activity, Users, CreditCard, Settings, RefreshCw, Box } from 'lucide-react';
import { api } from '../services/api';

export default function SuperAdminModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('metrics');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      // Stub API calls since we haven't implemented backend routes fully yet,
      // but we will implement them shortly.
      const res = await api.admin.getStats().catch(() => ({ data: { totalUsers: 0, totalTrees: 0, totalNodes: 0 }}));
      setStats(res.data?.data || { totalUsers: 5, totalTrees: 1, totalNodes: 21, omset: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200 select-none">
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden ring-1 ring-black/5 animate-in zoom-in-95 duration-200"
        style={{ maxHeight: '90vh', minHeight: '600px' }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-yellow-400 text-black flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight">PORTAL SUPER ADMIN</h2>
              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Akses Eksklusif Manajemen Platform</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-64 border-r border-zinc-100 bg-zinc-50 p-4 space-y-1 overflow-y-auto shrink-0">
            <TabButton icon={Activity} label="Ringkasan Metrik" isActive={activeTab === 'metrics'} onClick={() => setActiveTab('metrics')} />
            <TabButton icon={Box} label="Direktori Semesta" isActive={activeTab === 'trees'} onClick={() => setActiveTab('trees')} />
            <TabButton icon={Users} label="Manajemen Pengguna" isActive={activeTab === 'users'} onClick={() => setActiveTab('users')} />
            <TabButton icon={CreditCard} label="Paket & Promo" isActive={activeTab === 'plans'} onClick={() => setActiveTab('plans')} />
            <TabButton icon={Settings} label="Konfigurasi Duitku" isActive={activeTab === 'duitku'} onClick={() => setActiveTab('duitku')} />
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8 bg-white">
            {activeTab === 'metrics' && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-zinc-900">Ringkasan Metrik Platform</h3>
                  <button onClick={loadStats} className="flex items-center gap-2 text-xs font-mono bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-md">
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <StatCard label="Total Pengguna" value={stats?.totalUsers || 0} />
                  <StatCard label="Semesta Pohon" value={stats?.totalTrees || 0} />
                  <StatCard label="Total Node Silsilah" value={stats?.totalNodes || 0} />
                  <StatCard label="Total Omset" value={`Rp ${(stats?.omset || 0).toLocaleString('id-ID')}`} colSpan={3} className="bg-emerald-50 border-emerald-200 text-emerald-900" />
                </div>
              </div>
            )}
            
            {activeTab !== 'metrics' && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-zinc-400">
                <Settings className="w-12 h-12 mb-2 text-zinc-200" />
                <p className="text-sm font-mono uppercase tracking-widest">Modul Sedang Dalam Pengembangan</p>
                <p className="text-xs max-w-sm">Tampilan ini disiapkan untuk integrasi database dan endpoint backend yang akan segera diimplementasikan (Phase 2 - Payment Gateway).</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ icon: Icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
        isActive 
          ? 'bg-zinc-900 text-white shadow-md' 
          : 'text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900'
      }`}
    >
      <Icon className={`w-4 h-4 ${isActive ? 'text-yellow-400' : 'text-zinc-400'}`} />
      {label}
    </button>
  );
}

function StatCard({ label, value, colSpan = 1, className = "bg-white border-zinc-200 text-zinc-900" }) {
  return (
    <div className={`border p-5 rounded-xl shadow-xs col-span-${colSpan} ${className}`}>
      <div className="text-xs font-mono uppercase tracking-wider mb-2 opacity-70">{label}</div>
      <div className="text-3xl font-black">{value}</div>
    </div>
  );
}
