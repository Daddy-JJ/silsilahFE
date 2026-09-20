import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Activity,
  Users,
  CreditCard,
  Settings,
  RefreshCw,
  Box,
  Search,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Edit2,
  Sparkles,
  CheckCircle2,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';

const AVAILABLE_PAYMENT_METHODS = [
  { id: 'SP', code: 'SHOPEEPAY', label: 'ShopeePay' },
  { id: 'NQ', code: 'QRIS', label: 'QRIS (Semua E-Wallet)' },
  { id: 'OV', code: 'OVO', label: 'OVO' },
  { id: 'DA', code: 'DANA', label: 'DANA' },
  { id: 'BC', code: 'BCA_VA', label: 'BCA Virtual Account' },
  { id: 'M2', code: 'MANDIRI_VA', label: 'Mandiri Virtual Account' },
  { id: 'I1', code: 'BNI_VA', label: 'BNI Virtual Account' },
  { id: 'BR', code: 'BRI_VA', label: 'BRI Virtual Account' },
];

export default function SuperAdminModal({
  isOpen,
  onClose,
  currentUser,
  showNotification,
}) {
  const [activeTab, setActiveTab] = useState('metrics');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 1. Metrics State
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);

  // 2. Trees Directory State
  const [trees, setTrees] = useState([]);
  const [treeSearch, setTreeSearch] = useState('');
  const [editingTreeMembership, setEditingTreeMembership] = useState(null);
  const [membershipForm, setMembershipForm] = useState({
    membership_plan: 'KELUARGA_BESAR',
    max_members: 100,
    membership_status: 'ACTIVE',
    duration_preset: '12',
    custom_expires_at: '',
  });
  const [savingMembership, setSavingMembership] = useState(false);

  // 3. Users Management State
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);

  // 4. Plans & Promo State
  const [plans, setPlans] = useState([]);
  const [editingPlan, setEditingPlan] = useState(null);

  // 5. Duitku Settings State
  const [duitkuEnv, setDuitkuEnv] = useState('sandbox');
  const [merchantCode, setMerchantCode] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [enabledMethods, setEnabledMethods] = useState([
    'QRIS',
    'SHOPEEPAY',
    'OVO',
    'DANA',
  ]);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setSuccessMessage('');
      loadTabData(activeTab);
    }
  }, [isOpen, activeTab]);

  const loadTabData = async (tab) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      if (tab === 'metrics') {
        const [statsRes, txRes] = await Promise.all([
          api.admin.getStats().catch(() => ({ data: null })),
          api.admin.getTransactions(10, 0).catch(() => ({ data: [] })),
        ]);
        if (statsRes?.data) setStats(statsRes.data);
        if (Array.isArray(txRes?.data)) setRecentTransactions(txRes.data);
      } else if (tab === 'trees') {
        const res = await api.admin.getTrees().catch(() => ({ data: [] }));
        if (Array.isArray(res?.data)) setTrees(res.data);
      } else if (tab === 'users') {
        const res = await api.admin.getAllUsers
          ? api.admin.getAllUsers().catch(() => ({ data: [] }))
          : api.admin.getUsers().catch(() => ({ data: [] }));
        if (Array.isArray(res?.data)) setUsers(res.data);
      } else if (tab === 'plans') {
        const res = await api.admin.getPlans().catch(() => ({ data: [] }));
        if (Array.isArray(res?.data)) setPlans(res.data);
      } else if (tab === 'duitku') {
        const res = await api.admin.getSettings().catch(() => ({ data: null }));
        if (res?.data?.settings) {
          const s = res.data.settings;
          setDuitkuEnv(s.duitku_environment || 'sandbox');
          setMerchantCode(s.duitku_merchant_code || '');
          setApiKey(s.duitku_api_key_preview || s.duitku_api_key || '');
          if (s.duitku_enabled_methods) {
            try {
              const parsed = JSON.parse(s.duitku_enabled_methods);
              if (Array.isArray(parsed)) setEnabledMethods(parsed);
            } catch {
              // Abaikan jika bukan JSON string
            }
          }
        }
      }
    } catch (err) {
      console.error(`[SuperAdminModal] Gagal memuat data tab ${tab}:`, err);
      setErrorMessage(err.message || 'Gagal mengambil data dari server.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Handlers: Users ---
  const handleToggleUserRole = async (targetUser) => {
    if (targetUser.id === currentUser?.id) {
      setErrorMessage('Anda tidak dapat mengubah hak akses akun Anda sendiri.');
      return;
    }
    const newRole = targetUser.system_role === 'SUPER_ADMIN' ? 'USER' : 'SUPER_ADMIN';
    const confirmMsg = `Ubah peran "${targetUser.nama_lengkap}" menjadi ${newRole}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.admin.updateUserRole(targetUser.id, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, system_role: newRole } : u))
      );
      if (showNotification) {
        showNotification(`Peran akun "${targetUser.nama_lengkap}" diubah menjadi ${newRole}.`);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Gagal memperbarui peran akun.');
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (targetUser.id === currentUser?.id) {
      setErrorMessage('Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }
    try {
      await api.admin.deleteUser(targetUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
      setConfirmDeleteUser(null);
      if (showNotification) {
        showNotification(`Pengguna "${targetUser.nama_lengkap}" berhasil dihapus.`);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menghapus pengguna.');
    }
  };

  // --- Handlers: Tree Membership (Manual Upgrade) ---
  const handleOpenUpgradeTree = (tree) => {
    setEditingTreeMembership(tree);
    const plan =
      tree.membership_plan ||
      (tree.max_members >= 200
        ? 'DINASTI'
        : tree.max_members >= 100
        ? 'KELUARGA_BESAR'
        : 'FREE');
    setMembershipForm({
      membership_plan: plan,
      max_members: tree.max_members || 30,
      membership_status: tree.membership_status || 'ACTIVE',
      duration_preset: tree.membership_status === 'LIFETIME' ? 'lifetime' : '12',
      custom_expires_at: tree.membership_expires_at
        ? new Date(tree.membership_expires_at).toISOString().slice(0, 10)
        : '',
    });
  };

  const handleSelectPlanPreset = (planCode) => {
    if (planCode === 'FREE') {
      setMembershipForm((prev) => ({
        ...prev,
        membership_plan: 'FREE',
        max_members: 30,
      }));
    } else if (planCode === 'KELUARGA_BESAR') {
      setMembershipForm((prev) => ({
        ...prev,
        membership_plan: 'KELUARGA_BESAR',
        max_members: 100,
      }));
    } else if (planCode === 'DINASTI') {
      setMembershipForm((prev) => ({
        ...prev,
        membership_plan: 'DINASTI',
        max_members: 200,
      }));
    }
  };

  const handleSaveTreeMembership = async (e) => {
    e.preventDefault();
    if (!editingTreeMembership) return;
    setSavingMembership(true);
    setErrorMessage('');
    try {
      const payload = {
        membership_plan: membershipForm.membership_plan,
        max_members: Number(membershipForm.max_members),
        membership_status:
          membershipForm.duration_preset === 'lifetime'
            ? 'LIFETIME'
            : membershipForm.membership_status,
      };

      if (membershipForm.duration_preset === 'lifetime') {
        payload.membership_status = 'LIFETIME';
        payload.membership_expires_at = null;
      } else if (
        membershipForm.duration_preset === 'custom' &&
        membershipForm.custom_expires_at
      ) {
        payload.membership_expires_at = `${membershipForm.custom_expires_at} 23:59:59`;
      } else {
        payload.duration_months = Number(membershipForm.duration_preset) || 12;
      }

      const res = await api.admin.updateTreeMembership(
        editingTreeMembership.id,
        payload
      );
      if (res?.data) {
        setTrees((prev) =>
          prev.map((t) =>
            t.id === editingTreeMembership.id ? { ...t, ...res.data } : t
          )
        );
      }
      setSuccessMessage(
        `Paket semesta "${editingTreeMembership.nama_silsilah}" berhasil diperbarui ke ${membershipForm.membership_plan}!`
      );
      setEditingTreeMembership(null);
      if (showNotification) {
        showNotification(
          `Paket semesta "${editingTreeMembership.nama_silsilah}" berhasil diperbarui!`,
          'success'
        );
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'Gagal memperbarui paket keanggotaan semesta.'
      );
    } finally {
      setSavingMembership(false);
    }
  };

  // --- Handlers: Plans ---
  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!editingPlan) return;
    try {
      await api.admin.updatePlan(editingPlan.id, {
        nama_paket: editingPlan.nama_paket,
        harga_normal: Number(editingPlan.harga_normal),
        harga_promo: editingPlan.harga_promo ? Number(editingPlan.harga_promo) : null,
        is_promo_active: Boolean(editingPlan.is_promo_active),
        target_max_members: Number(editingPlan.target_max_members),
        target_max_collaborators: Number(editingPlan.target_max_collaborators || 3),
        is_active: Boolean(editingPlan.is_active),
      });
      setPlans((prev) =>
        prev.map((p) => (p.id === editingPlan.id ? { ...editingPlan } : p))
      );
      setEditingPlan(null);
      if (showNotification) {
        showNotification(`Paket "${editingPlan.nama_paket}" berhasil diperbarui!`);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Gagal memperbarui data paket.');
    }
  };

  // --- Handlers: Duitku Settings ---
  const handleSaveDuitkuSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        duitku_environment: duitkuEnv,
        duitku_merchant_code: merchantCode.trim(),
        duitku_enabled_methods: JSON.stringify(enabledMethods),
      };

      // Hanya kirim apiKey jika bukan placeholder masked (tidak diawali ****)
      if (apiKey && !apiKey.startsWith('****')) {
        payload.duitku_api_key = apiKey.trim();
      }

      await api.admin.updateSettings(payload);
      setSuccessMessage('Konfigurasi Duitku Gateway berhasil disimpan ke sistem!');
      if (showNotification) {
        showNotification('Pengaturan Duitku Payment Gateway berhasil disimpan.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menyimpan pengaturan Duitku.');
    } finally {
      setSavingSettings(false);
    }
  };

  const toggleMethod = (methodId) => {
    setEnabledMethods((prev) =>
      prev.includes(methodId)
        ? prev.filter((m) => m !== methodId)
        : [...prev, methodId]
    );
  };

  if (!isOpen) return null;

  // Filtered lists
  const filteredTrees = trees.filter(
    (t) =>
      t.nama_silsilah?.toLowerCase().includes(treeSearch.toLowerCase()) ||
      t.creator_name?.toLowerCase().includes(treeSearch.toLowerCase()) ||
      t.creator_email?.toLowerCase().includes(treeSearch.toLowerCase())
  );

  const filteredUsers = users.filter(
    (u) =>
      u.nama_lengkap?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200 select-none">
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl flex flex-col overflow-hidden border border-zinc-200 ring-1 ring-black/5 animate-in zoom-in-95 duration-200"
        style={{ height: '88vh', maxHeight: '900px' }}
      >
        {/* Header Modal */}
        <div className="px-5 sm:px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 text-[#f7e043] flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black tracking-tight uppercase font-mono">
                  Portal Super Admin
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#f7e043] text-black">
                  PLATFORM ROOT
                </span>
              </div>
              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                Akses Eksklusif Manajemen & Integrasi Gateway Duitku
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="px-6 py-2.5 bg-red-50 border-b border-red-200 text-red-700 text-xs font-mono flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="text-red-500 hover:text-red-800 font-bold"
            >
              ✕
            </button>
          </div>
        )}
        {successMessage && (
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-mono flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage('')}
              className="text-emerald-600 hover:text-emerald-900 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Modal Body: Sidebar & Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Navigation */}
          <div className="w-56 sm:w-64 border-r border-zinc-200 bg-zinc-50 p-3 space-y-1 overflow-y-auto shrink-0 font-mono">
            <TabButton
              icon={Activity}
              label="Ringkasan Metrik"
              badge="LIVE"
              isActive={activeTab === 'metrics'}
              onClick={() => setActiveTab('metrics')}
            />
            <TabButton
              icon={Box}
              label="Direktori Semesta"
              badge={trees.length > 0 ? String(trees.length) : undefined}
              isActive={activeTab === 'trees'}
              onClick={() => setActiveTab('trees')}
            />
            <TabButton
              icon={Users}
              label="Manajemen Pengguna"
              badge={users.length > 0 ? String(users.length) : undefined}
              isActive={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
            />
            <TabButton
              icon={CreditCard}
              label="Paket & Promo"
              isActive={activeTab === 'plans'}
              onClick={() => setActiveTab('plans')}
            />
            <TabButton
              icon={Settings}
              label="Konfigurasi Duitku"
              badge={duitkuEnv === 'sandbox' ? 'SANDBOX' : 'PROD'}
              badgeColor={
                duitkuEnv === 'sandbox'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }
              isActive={activeTab === 'duitku'}
              onClick={() => setActiveTab('duitku')}
            />

            <div className="pt-6 px-3 text-[10px] text-zinc-400 font-sans leading-relaxed border-t border-zinc-200 mt-4">
              <div className="font-bold uppercase font-mono text-zinc-500 mb-1">
                Super Admin Active
              </div>
              <div>{currentUser?.email}</div>
              <div className="text-zinc-400 mt-1 font-mono">Sistem v2.0 • Phase 2</div>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 bg-white">
            {/* 1. TAB RINGKASAN METRIK */}
            {activeTab === 'metrics' && (
              <div className="space-y-6 animate-in slide-in-from-right-3 duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-zinc-900 uppercase font-mono">
                      Ringkasan Kinerja Platform
                    </h3>
                    <p className="text-xs text-zinc-500 font-sans">
                      Statistik akun, pohon keluarga, volume transaksi, dan omset gateway.
                    </p>
                  </div>
                  <button
                    onClick={() => loadTabData('metrics')}
                    className="flex items-center gap-1.5 text-xs font-mono font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Perbarui</span>
                  </button>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <StatCard label="Total Pengguna" value={stats?.totalUsers || 0} />
                  <StatCard label="Semesta Pohon" value={stats?.totalTrees || 0} />
                  <StatCard label="Total Anggota" value={stats?.totalNodes || 0} />
                  <StatCard
                    label="Transaksi Sukses"
                    value={`${stats?.successfulTransactions || 0} / ${stats?.totalTransactions || 0}`}
                  />
                </div>

                {/* Omset Banner */}
                <div className="p-4 sm:p-5 rounded-xl border border-emerald-200 bg-emerald-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-mono font-bold uppercase text-emerald-800 tracking-wider">
                      Total Omset Terverifikasi (Duitku Gateway)
                    </div>
                    <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-950 mt-1">
                      Rp {Number(stats?.omset || 0).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className="text-xs font-mono text-emerald-700 sm:text-right">
                    <span>Transaksi Otomatis</span>
                    <div className="text-[10px] text-emerald-600">Terverifikasi Webhook Callback</div>
                  </div>
                </div>

                {/* Recent Transactions Table */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-mono font-bold text-zinc-900 uppercase tracking-wider">
                    10 Transaksi Terakhir
                  </h4>
                  {recentTransactions.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-zinc-200 rounded-lg text-zinc-400 text-xs font-mono">
                      Belum ada transaksi pembayaran yang tercatat di platform.
                    </div>
                  ) : (
                    <div className="border border-zinc-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs font-sans">
                        <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-mono text-[11px] uppercase">
                          <tr>
                            <th className="p-3">Order ID</th>
                            <th className="p-3">Pengguna</th>
                            <th className="p-3">Nominal</th>
                            <th className="p-3">Metode</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Waktu</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                          {recentTransactions.map((tx) => (
                            <tr key={tx.id || tx.merchant_order_id} className="hover:bg-zinc-50/50">
                              <td className="p-3 font-mono text-zinc-900 font-bold">
                                {tx.merchant_order_id}
                              </td>
                              <td className="p-3 text-zinc-700">{tx.user_email || tx.user_id}</td>
                              <td className="p-3 font-mono font-bold text-zinc-900">
                                Rp {Number(tx.amount || 0).toLocaleString('id-ID')}
                              </td>
                              <td className="p-3 font-mono text-zinc-600 uppercase">
                                {tx.payment_method || '-'}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                    tx.status === 'SUCCESS'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : tx.status === 'PENDING'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {tx.status}
                                </span>
                              </td>
                              <td className="p-3 font-mono text-zinc-500 text-[11px]">
                                {new Date(tx.created_at).toLocaleString('id-ID')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. TAB DIREKTORI SEMESTA */}
            {activeTab === 'trees' && (
              <div className="space-y-4 animate-in slide-in-from-right-3 duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black text-zinc-900 uppercase font-mono">
                      Direktori Semesta Pohon Silsilah
                    </h3>
                    <p className="text-xs text-zinc-500 font-sans">
                      Daftar semua semesta silsilah yang aktif di platform beserta pemilik dan kapasitasnya.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Cari semesta / email..."
                        value={treeSearch}
                        onChange={(e) => setTreeSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 border border-zinc-300 rounded-md text-xs font-sans focus:outline-none focus:border-zinc-900 w-56"
                      />
                    </div>
                    <button
                      onClick={() => loadTabData('trees')}
                      className="p-2 border border-zinc-300 hover:bg-zinc-100 rounded-md text-zinc-700 cursor-pointer"
                      title="Perbarui data"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="border border-zinc-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-mono text-[11px] uppercase">
                      <tr>
                        <th className="p-3">Nama Semesta</th>
                        <th className="p-3">Pemilik (Admin Utama)</th>
                        <th className="p-3">Anggota / Kuota</th>
                        <th className="p-3">Paket Keanggotaan</th>
                        <th className="p-3">Masa Aktif</th>
                        <th className="p-3">Dibuat Pada</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {filteredTrees.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-zinc-400 font-mono">
                            Tidak ada data pohon silsilah yang cocok.
                          </td>
                        </tr>
                      ) : (
                        filteredTrees.map((tree) => {
                          const members = Number(tree.total_members || 0);
                          const maxMem = Number(tree.max_members || 30);
                          const percent = Math.min(100, Math.round((members / maxMem) * 100));
                          return (
                            <tr key={tree.id} className="hover:bg-zinc-50/50">
                              <td className="p-3">
                                <div className="font-bold text-zinc-900">{tree.nama_silsilah}</div>
                                <div className="text-[10px] font-mono text-zinc-400">ID: {tree.id}</div>
                              </td>
                              <td className="p-3">
                                <div className="font-medium text-zinc-800">{tree.creator_name || 'User'}</div>
                                <div className="text-[11px] font-mono text-zinc-500">{tree.creator_email}</div>
                              </td>
                              <td className="p-3">
                                <div className="font-mono font-bold text-zinc-900">
                                  {members} / {maxMem} <span className="text-[10px] text-zinc-400">({percent}%)</span>
                                </div>
                                <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden mt-1">
                                  <div
                                    className={`h-full ${percent >= 90 ? 'bg-rose-500' : 'bg-zinc-900'}`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                    maxMem >= 200
                                      ? 'bg-purple-100 text-purple-800'
                                      : maxMem >= 100
                                      ? 'bg-amber-100 text-amber-900'
                                      : 'bg-zinc-100 text-zinc-700'
                                  }`}
                                >
                                  {tree.membership_plan || (maxMem >= 200 ? 'DINASTI' : maxMem >= 100 ? 'KELUARGA BESAR' : 'GRATIS')}
                                </span>
                              </td>
                              <td className="p-3 font-mono text-[11px] text-zinc-600">
                                {tree.membership_status === 'LIFETIME'
                                  ? 'Akses Selamanya (LIFETIME)'
                                  : tree.membership_expires_at
                                  ? new Date(tree.membership_expires_at).toLocaleDateString('id-ID')
                                  : 'Akses Selamanya'}
                              </td>
                              <td className="p-3 font-mono text-[11px] text-zinc-500">
                                {new Date(tree.created_at).toLocaleDateString('id-ID')}
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleOpenUpgradeTree(tree)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 hover:bg-black text-white rounded text-[11px] font-mono font-bold transition-colors cursor-pointer shadow-xs"
                                  title="Ubah Paket & Kuota"
                                >
                                  <Sparkles className="w-3 h-3 text-yellow-400" />
                                  <span>Ubah Paket</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Edit Tree Membership Panel */}
                {editingTreeMembership && (
                  <div className="p-5 rounded-xl border border-zinc-300 bg-zinc-50 space-y-4 animate-in fade-in shadow-xs">
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                      <div>
                        <div className="font-bold text-xs font-mono uppercase text-zinc-900 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span>Pengangkatan / Perubahan Paket Semesta: {editingTreeMembership.nama_silsilah}</span>
                        </div>
                        <div className="text-[11px] font-mono text-zinc-500 mt-0.5">
                          Pemilik: <strong>{editingTreeMembership.creator_name || 'User'}</strong> ({editingTreeMembership.creator_email}) • ID: {editingTreeMembership.id}
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingTreeMembership(null)}
                        className="text-zinc-400 hover:text-zinc-800 font-bold p-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleSaveTreeMembership} className="space-y-4 text-xs font-mono">
                      {/* Pilihan Paket Cepat */}
                      <div>
                        <label className="block text-zinc-600 font-bold mb-1.5">Pilih Preset Paket Resmi:</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => handleSelectPlanPreset('FREE')}
                            className={`py-2 px-3 rounded-lg border text-left cursor-pointer transition-all ${
                              membershipForm.membership_plan === 'FREE'
                                ? 'border-zinc-900 bg-zinc-900 text-white shadow-xs'
                                : 'border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-800'
                            }`}
                          >
                            <div className="font-bold">Paket Dasar (FREE)</div>
                            <div className="text-[10px] opacity-80 font-sans">Maks. 30 Anggota</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectPlanPreset('KELUARGA_BESAR')}
                            className={`py-2 px-3 rounded-lg border text-left cursor-pointer transition-all ${
                              membershipForm.membership_plan === 'KELUARGA_BESAR'
                                ? 'border-amber-500 bg-amber-500 text-white shadow-xs'
                                : 'border-zinc-200 bg-white hover:bg-amber-50/50 text-zinc-800'
                            }`}
                          >
                            <div className="font-bold">Keluarga Besar</div>
                            <div className="text-[10px] opacity-80 font-sans">Maks. 100 Anggota</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectPlanPreset('DINASTI')}
                            className={`py-2 px-3 rounded-lg border text-left cursor-pointer transition-all ${
                              membershipForm.membership_plan === 'DINASTI'
                                ? 'border-purple-600 bg-purple-600 text-white shadow-xs'
                                : 'border-zinc-200 bg-white hover:bg-purple-50/50 text-zinc-800'
                            }`}
                          >
                            <div className="font-bold">Paket Dinasti</div>
                            <div className="text-[10px] opacity-80 font-sans">Maks. 200 Anggota</div>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div>
                          <label className="block text-zinc-600 font-bold mb-1">Kode / Nama Paket:</label>
                          <input
                            type="text"
                            value={membershipForm.membership_plan}
                            onChange={(e) => setMembershipForm({ ...membershipForm, membership_plan: e.target.value })}
                            className="w-full px-3 py-2 rounded border border-zinc-300 bg-white focus:outline-none focus:border-zinc-900 uppercase"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-600 font-bold mb-1">Kapasitas Maks. Anggota (Quota):</label>
                          <input
                            type="number"
                            min="1"
                            value={membershipForm.max_members}
                            onChange={(e) => setMembershipForm({ ...membershipForm, max_members: e.target.value })}
                            className="w-full px-3 py-2 rounded border border-zinc-300 bg-white focus:outline-none focus:border-zinc-900"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-600 font-bold mb-1">Status Keanggotaan:</label>
                          <select
                            value={membershipForm.membership_status}
                            onChange={(e) => setMembershipForm({ ...membershipForm, membership_status: e.target.value })}
                            className="w-full px-3 py-2 rounded border border-zinc-300 bg-white focus:outline-none focus:border-zinc-900"
                          >
                            <option value="ACTIVE">ACTIVE (Aktif)</option>
                            <option value="LIFETIME">LIFETIME (Selamanya)</option>
                            <option value="EXPIRED">EXPIRED (Kedaluwarsa)</option>
                          </select>
                        </div>
                      </div>

                      {/* Durasi / Masa Aktif */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-zinc-200">
                        <div>
                          <label className="block text-zinc-600 font-bold mb-1">Masa Perpanjangan / Durasi:</label>
                          <select
                            value={membershipForm.duration_preset}
                            onChange={(e) => setMembershipForm({ ...membershipForm, duration_preset: e.target.value })}
                            className="w-full px-3 py-2 rounded border border-zinc-300 bg-white focus:outline-none focus:border-zinc-900"
                          >
                            <option value="1">+1 Bulan</option>
                            <option value="3">+3 Bulan</option>
                            <option value="6">+6 Bulan</option>
                            <option value="12">+1 Tahun (12 Bulan)</option>
                            <option value="24">+2 Tahun (24 Bulan)</option>
                            <option value="lifetime">Akses Selamanya (LIFETIME)</option>
                            <option value="custom">Pilih Tanggal Kedaluwarsa Kustom</option>
                          </select>
                        </div>

                        {membershipForm.duration_preset === 'custom' && (
                          <div>
                            <label className="block text-zinc-600 font-bold mb-1">Pilih Tanggal Kedaluwarsa:</label>
                            <input
                              type="date"
                              value={membershipForm.custom_expires_at}
                              onChange={(e) => setMembershipForm({ ...membershipForm, custom_expires_at: e.target.value })}
                              className="w-full px-3 py-2 rounded border border-zinc-300 bg-white focus:outline-none focus:border-zinc-900"
                              required
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-200">
                        <button
                          type="button"
                          onClick={() => setEditingTreeMembership(null)}
                          className="px-4 py-2 border border-zinc-300 rounded hover:bg-zinc-100 cursor-pointer font-bold"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={savingMembership}
                          className="px-5 py-2 bg-zinc-900 hover:bg-black text-white font-bold rounded flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {savingMembership ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Menyimpan...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Simpan & Terapkan Perubahan</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* 3. TAB MANAJEMEN PENGGUNA */}
            {activeTab === 'users' && (
              <div className="space-y-4 animate-in slide-in-from-right-3 duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black text-zinc-900 uppercase font-mono">
                      Manajemen Pengguna Platform
                    </h3>
                    <p className="text-xs text-zinc-500 font-sans">
                      Kelola hak akses role Super Admin, status akun, dan data autentikasi user.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Cari nama / email user..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 border border-zinc-300 rounded-md text-xs font-sans focus:outline-none focus:border-zinc-900 w-56"
                      />
                    </div>
                    <button
                      onClick={() => loadTabData('users')}
                      className="p-2 border border-zinc-300 hover:bg-zinc-100 rounded-md text-zinc-700 cursor-pointer"
                      title="Perbarui data"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="border border-zinc-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-mono text-[11px] uppercase">
                      <tr>
                        <th className="p-3">Pengguna</th>
                        <th className="p-3">Provider</th>
                        <th className="p-3">Status Verifikasi</th>
                        <th className="p-3">Peran (Role)</th>
                        <th className="p-3">Terdaftar</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-zinc-400 font-mono">
                            Tidak ada pengguna yang sesuai dengan pencarian.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const isSelf = u.id === currentUser?.id;
                          return (
                            <tr key={u.id} className="hover:bg-zinc-50/50">
                              <td className="p-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded bg-zinc-900 text-[#f7e043] flex items-center justify-center font-mono font-bold text-xs shrink-0">
                                    {u.nama_lengkap?.[0]?.toUpperCase() || 'U'}
                                  </div>
                                  <div>
                                    <div className="font-bold text-zinc-900 flex items-center gap-1.5">
                                      <span>{u.nama_lengkap}</span>
                                      {isSelf && (
                                        <span className="text-[9px] font-mono bg-zinc-200 text-zinc-700 px-1 rounded">
                                          ANDA
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] font-mono text-zinc-500">{u.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 font-mono text-[11px] text-zinc-600">
                                {u.auth_provider || 'LOCAL'}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                    u.is_verified
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-zinc-100 text-zinc-500'
                                  }`}
                                >
                                  {u.is_verified ? 'Terverifikasi' : 'Belum'}
                                </span>
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                    u.system_role === 'SUPER_ADMIN'
                                      ? 'bg-zinc-900 text-yellow-400'
                                      : 'bg-zinc-100 text-zinc-700'
                                  }`}
                                >
                                  {u.system_role}
                                </span>
                              </td>
                              <td className="p-3 font-mono text-[11px] text-zinc-500">
                                {new Date(u.created_at).toLocaleDateString('id-ID')}
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleUserRole(u)}
                                    disabled={isSelf}
                                    className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase border transition-colors ${
                                      isSelf
                                        ? 'opacity-40 cursor-not-allowed border-zinc-200 text-zinc-400'
                                        : 'border-zinc-300 hover:bg-zinc-100 text-zinc-700 cursor-pointer'
                                    }`}
                                    title={
                                      isSelf
                                        ? 'Tidak dapat mengubah peran diri sendiri'
                                        : 'Ubah role Super Admin / User'
                                    }
                                  >
                                    {u.system_role === 'SUPER_ADMIN' ? 'Jadikan User' : 'Jadikan Admin'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteUser(u)}
                                    disabled={isSelf}
                                    className={`p-1 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ${
                                      isSelf ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                                    }`}
                                    title={isSelf ? 'Tidak dapat menghapus akun sendiri' : 'Hapus akun pengguna'}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Confirm Delete User Dialog */}
                {confirmDeleteUser && (
                  <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs font-sans flex items-center justify-between animate-in fade-in">
                    <div>
                      <div className="font-bold font-mono uppercase">
                        Konfirmasi Hapus Pengguna: {confirmDeleteUser.nama_lengkap} ({confirmDeleteUser.email})
                      </div>
                      <div className="text-[11px] text-rose-700 mt-0.5">
                        Tindakan ini akan menghapus seluruh data semesta dan akun pengguna tersebut secara permanen.
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setConfirmDeleteUser(null)}
                        className="px-3 py-1.5 rounded bg-white border border-zinc-300 text-zinc-700 font-mono text-xs font-bold uppercase cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => handleDeleteUser(confirmDeleteUser)}
                        className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs font-bold uppercase cursor-pointer"
                      >
                        Hapus Akun
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. TAB PAKET & PROMO */}
            {activeTab === 'plans' && (
              <div className="space-y-5 animate-in slide-in-from-right-3 duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-zinc-900 uppercase font-mono">
                      Manajemen Paket Keanggotaan & Promo
                    </h3>
                    <p className="text-xs text-zinc-500 font-sans">
                      Sesuaikan harga resmi, diskon promo musiman, serta batas kapasitas anggota platform.
                    </p>
                  </div>
                  <button
                    onClick={() => loadTabData('plans')}
                    className="p-2 border border-zinc-300 hover:bg-zinc-100 rounded-md text-zinc-700 cursor-pointer"
                    title="Perbarui data"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map((p) => {
                    const isGratis = Number(p.harga_normal) === 0;
                    return (
                      <div
                        key={p.id}
                        className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                          p.is_promo_active
                            ? 'border-yellow-400 bg-yellow-50/20 shadow-md ring-1 ring-yellow-400'
                            : 'border-zinc-200 bg-white shadow-xs'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-zinc-900 text-[#f7e043]">
                              {p.kode_paket}
                            </span>
                            <span
                              className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                                p.is_active
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-zinc-200 text-zinc-600'
                              }`}
                            >
                              {p.is_active ? 'AKTIF' : 'NONAKTIF'}
                            </span>
                          </div>

                          <h4 className="font-black text-zinc-900 text-base uppercase">
                            {p.nama_paket}
                          </h4>
                          <p className="text-xs text-zinc-500 mt-1 mb-4 leading-relaxed">
                            {p.deskripsi || 'Paket keanggotaan resmi pohon silsilah.'}
                          </p>

                          <div className="space-y-1 mb-4">
                            <div className="text-2xl font-black font-mono text-zinc-900">
                              Rp {Number(p.harga_normal).toLocaleString('id-ID')}
                              <span className="text-xs font-normal text-zinc-500"> / tahun</span>
                            </div>
                            {p.is_promo_active && p.harga_promo && (
                              <div className="text-xs font-mono text-emerald-700 font-bold">
                                Promo: Rp {Number(p.harga_promo).toLocaleString('id-ID')}
                              </div>
                            )}
                          </div>

                          <div className="text-xs font-mono space-y-1.5 pt-3 border-t border-zinc-200 text-zinc-600">
                            <div>• Kuota Anggota: <strong>{p.target_max_members} Orang</strong></div>
                            <div>• Semesta Silsilah: <strong>{p.target_max_trees || 1} Semesta</strong></div>
                            <div>• Kolaborator: <strong>{p.target_max_collaborators || 3} Orang</strong></div>
                          </div>
                        </div>

                        <div className="pt-5 border-t border-zinc-100 mt-4">
                          <button
                            type="button"
                            onClick={() => setEditingPlan({ ...p })}
                            className="w-full py-2 px-3 rounded-lg border border-zinc-300 hover:border-zinc-900 bg-zinc-50 hover:bg-white text-zinc-900 font-mono text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Ubah Harga & Kuota</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Edit Plan Modal Overlay */}
                {editingPlan && (
                  <div className="p-5 rounded-xl border border-zinc-300 bg-zinc-50 space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                      <div className="font-bold text-xs font-mono uppercase text-zinc-900">
                        Ubah Pengaturan: {editingPlan.nama_paket} ({editingPlan.kode_paket})
                      </div>
                      <button
                        onClick={() => setEditingPlan(null)}
                        className="text-zinc-400 hover:text-zinc-800 font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleSavePlan} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                      <div>
                        <label className="block text-zinc-600 mb-1">Harga Normal (Rp):</label>
                        <input
                          type="number"
                          value={editingPlan.harga_normal}
                          onChange={(e) =>
                            setEditingPlan({ ...editingPlan, harga_normal: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded border border-zinc-300 bg-white focus:outline-none focus:border-zinc-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-600 mb-1">Kapasitas Maks. Anggota:</label>
                        <input
                          type="number"
                          value={editingPlan.target_max_members}
                          onChange={(e) =>
                            setEditingPlan({ ...editingPlan, target_max_members: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded border border-zinc-300 bg-white focus:outline-none focus:border-zinc-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-600 mb-1">Kapasitas Kolaborator:</label>
                        <input
                          type="number"
                          value={editingPlan.target_max_collaborators || 3}
                          onChange={(e) =>
                            setEditingPlan({ ...editingPlan, target_max_collaborators: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded border border-zinc-300 bg-white focus:outline-none focus:border-zinc-900"
                        />
                      </div>

                      <div className="sm:col-span-3 flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingPlan.is_active}
                            onChange={(e) =>
                              setEditingPlan({ ...editingPlan, is_active: e.target.checked })
                            }
                            className="rounded text-zinc-900"
                          />
                          <span className="text-zinc-800 font-bold">Aktifkan Paket Ini untuk Pelanggan</span>
                        </label>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingPlan(null)}
                            className="px-4 py-2 border border-zinc-300 rounded hover:bg-zinc-100 cursor-pointer"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-zinc-900 hover:bg-black text-white font-bold rounded cursor-pointer"
                          >
                            Simpan Perubahan
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* 5. TAB KONFIGURASI DUITKU (Live Payment Gateway Settings) */}
            {activeTab === 'duitku' && (
              <div className="space-y-6 animate-in slide-in-from-right-3 duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-zinc-900 uppercase font-mono">
                      Konfigurasi Duitku Payment Gateway
                    </h3>
                    <p className="text-xs text-zinc-500 font-sans">
                      Kelola kredensial Merchant Code, API Key, serta lingkungan transaksi Duitku.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                        duitkuEnv === 'sandbox'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      {duitkuEnv === 'sandbox' ? 'Mode Sandbox Aktif' : 'Mode Production Aktif'}
                    </span>
                    <button
                      onClick={() => loadTabData('duitku')}
                      className="p-2 border border-zinc-300 hover:bg-zinc-100 rounded-md text-zinc-700 cursor-pointer"
                      title="Muat ulang pengaturan"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSaveDuitkuSettings} className="space-y-5">
                  {/* Lingkungan Gateway (Sandbox vs Production) */}
                  <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 space-y-3">
                    <label className="block text-xs font-mono font-bold uppercase text-zinc-800">
                      Lingkungan Eksekusi Transaksi (Environment):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          duitkuEnv === 'sandbox'
                            ? 'border-amber-400 bg-amber-50/60 shadow-xs'
                            : 'border-zinc-200 bg-white hover:bg-zinc-100/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="duitkuEnv"
                          value="sandbox"
                          checked={duitkuEnv === 'sandbox'}
                          onChange={() => setDuitkuEnv('sandbox')}
                          className="text-zinc-900"
                        />
                        <div>
                          <div className="text-xs font-mono font-bold text-zinc-900 uppercase">
                            Sandbox (Uji Coba)
                          </div>
                          <div className="text-[11px] text-zinc-500 font-sans">
                            Menggunakan API Sandbox Duitku untuk simulasi verifikasi pembayaran.
                          </div>
                        </div>
                      </label>

                      <label
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          duitkuEnv === 'production'
                            ? 'border-emerald-500 bg-emerald-50/60 shadow-xs'
                            : 'border-zinc-200 bg-white hover:bg-zinc-100/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="duitkuEnv"
                          value="production"
                          checked={duitkuEnv === 'production'}
                          onChange={() => setDuitkuEnv('production')}
                          className="text-zinc-900"
                        />
                        <div>
                          <div className="text-xs font-mono font-bold text-zinc-900 uppercase">
                            Production (Live Gateway)
                          </div>
                          <div className="text-[11px] text-zinc-500 font-sans">
                            Memproses transaksi riil dengan Bank Indonesia & e-wallet resmi.
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Kredensial API */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <label className="block font-bold text-zinc-700 uppercase mb-1.5">
                        Merchant Code Duitku:
                      </label>
                      <input
                        type="text"
                        value={merchantCode}
                        onChange={(e) => setMerchantCode(e.target.value)}
                        placeholder="Contoh: D12345"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 text-zinc-900 font-mono text-xs outline-none"
                        required
                      />
                      <span className="text-[10px] text-zinc-400 mt-1 block">
                        Dapat dilihat pada menu Proyek di dashboard Duitku Merchant.
                      </span>
                    </div>

                    <div>
                      <label className="block font-bold text-zinc-700 uppercase mb-1.5">
                        API Key (Kunci Rahasia):
                      </label>
                      <div className="relative">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="Masukkan API Key Duitku..."
                          className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-zinc-300 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 text-zinc-900 font-mono text-xs outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <span className="text-[10px] text-zinc-400 mt-1 block">
                        Biarkan tersamar (****) jika tidak bermaksud mengubah kunci yang sudah tersimpan.
                      </span>
                    </div>
                  </div>

                  {/* Kanal Pembayaran yang Diaktifkan */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-mono font-bold uppercase text-zinc-800">
                      Kanal Pembayaran yang Diaktifkan untuk Pengguna:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {AVAILABLE_PAYMENT_METHODS.map((method) => {
                        const isChecked = enabledMethods.includes(method.code) || enabledMethods.includes(method.id);
                        return (
                          <label
                            key={method.id}
                            className={`flex items-center gap-2 p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                              isChecked
                                ? 'border-zinc-900 bg-zinc-900 text-white shadow-2xs'
                                : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleMethod(method.code)}
                              className="rounded text-yellow-400"
                            />
                            <span className="font-mono font-bold text-[11px]">{method.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Technical Guidance Callback Box */}
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2 text-xs font-mono">
                    <div className="font-bold text-zinc-800 uppercase flex items-center gap-2">
                      <span>🔗 Informasi Integrasi Webhook Duitku Portal:</span>
                    </div>
                    <div className="space-y-1 text-zinc-600 text-[11px]">
                      <div>
                        • <strong>Callback URL (Notifikasi Pembayaran):</strong>{' '}
                        <code className="bg-white px-2 py-0.5 rounded border border-zinc-300 text-zinc-900">
                          https://silsilahkeluarga.id/api/v1/payments/callback
                        </code>
                      </div>
                      <div>
                        • <strong>Return URL (Arahkan Pengguna):</strong>{' '}
                        <code className="bg-white px-2 py-0.5 rounded border border-zinc-300 text-zinc-900">
                          https://silsilahkeluarga.id/
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end pt-3 border-t border-zinc-200">
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-zinc-900 hover:bg-black disabled:bg-zinc-400 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer"
                    >
                      <Save className="w-4 h-4 text-[#f7e043]" />
                      <span>{savingSettings ? 'Menyimpan Konfigurasi...' : 'Simpan Konfigurasi Duitku'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ icon: Icon, label, badge, badgeColor = 'bg-zinc-200 text-zinc-800', isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
        isActive
          ? 'bg-zinc-900 text-white shadow-sm'
          : 'text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900'
      }`}
    >
      <div className="flex items-center gap-2.5 truncate">
        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#f7e043]' : 'text-zinc-400'}`} />
        <span className="truncate">{label}</span>
      </div>
      {badge && (
        <span
          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
            isActive ? 'bg-zinc-800 text-[#f7e043] border border-zinc-700' : badgeColor
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="border border-zinc-200 p-4 rounded-xl bg-white shadow-2xs">
      <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
        {label}
      </div>
      <div className="text-xl sm:text-2xl font-black font-mono text-zinc-900">{value}</div>
    </div>
  );
}
