import React from 'react';
import {
  Plus,
  CheckSquare,
  LogOut,
  Shield,
  ChevronDown,
  Users,
  HelpCircle,
  Edit3,
  Settings,
  Sparkles,
  MessageSquarePlus,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import logoApp from '../assets/logo-nexus.svg';

export default function Navbar({
  trees = [],
  currentTree,
  onSelectTree,
  onOpenCreateTree,
  onOpenRenameTree,
  onOpenAddMember,
  onOpenApprovals,
  onOpenCollaborators,
  onOpenGuide,
  onOpenAboutFaq,
  pendingCount = 0,
  user,
  onLogout,
  memberCount = 0,
  maxMembers = 30,
  onOpenLimitModal,
  onOpenSuperAdmin,
  onOpenUserPanel,
  onOpenUpgrade,
  onOpenFeedback,
}) {
  const remainingNodes = Math.max(0, maxMembers - memberCount);
  const percentUsed = Math.min(100, Math.round((memberCount / maxMembers) * 100));

  // Kalkulasi Status & Countdown Membership Tahunan
  const planCode =
    currentTree?.membership_plan ||
    (maxMembers >= 200 ? 'DINASTI' : maxMembers >= 100 ? 'KELUARGA_BESAR' : 'FREE');
  const membershipStatus =
    currentTree?.membership_status || (planCode === 'FREE' ? 'LIFETIME' : 'ACTIVE');
  const expiresAtStr =
    currentTree?.membership_expires_at ||
    currentTree?.subscription_expires_at ||
    (typeof window !== 'undefined' && currentTree?.id
      ? localStorage.getItem(`silsilah_sub_${currentTree.id}`)
      : null);

  const PLAN_NAMES = {
    FREE: 'Paket Dasar (Gratis)',
    KELUARGA_BESAR: 'Paket Keluarga Besar',
    DINASTI: 'Paket Dinasti',
  };

  const isPaidPlan = planCode !== 'FREE' && maxMembers > 30;
  let membershipInfo = {
    isPaid: false,
    planCode,
    planName: 'Paket Dasar (Gratis)',
    diffDays: null,
    formattedDate: 'Akses Selamanya',
    isExpired: false,
    isExpiringSoon: false,
  };

  if (isPaidPlan) {
    const planName =
      PLAN_NAMES[planCode] ||
      currentTree?.plan_name ||
      (typeof window !== 'undefined' && currentTree?.id
        ? localStorage.getItem(`silsilah_plan_${currentTree.id}`)
        : null) ||
      (maxMembers >= 200 ? 'Paket Dinasti' : 'Paket Keluarga Besar');

    let diffDays = 365;
    let formattedDate = '1 Tahun';
    let isExpired = membershipStatus === 'EXPIRED';
    let isExpiringSoon = false;

    if (expiresAtStr) {
      const expDate = new Date(expiresAtStr);
      if (!isNaN(expDate.getTime())) {
        const now = new Date();
        const diffMs = expDate.getTime() - now.getTime();
        diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        formattedDate = expDate.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
        isExpired = membershipStatus === 'EXPIRED' || diffDays <= 0;
        isExpiringSoon = !isExpired && diffDays > 0 && diffDays <= 30;
      }
    }

    membershipInfo = {
      isPaid: true,
      planCode,
      planName,
      diffDays,
      formattedDate,
      isExpired,
      isExpiringSoon,
    };
  }

  return (
    <header className="bg-white border-b border-zinc-200 select-none z-20 shrink-0">
      {/* Top Editorial Ticker */}
      <div className="h-7 border-b border-zinc-100 px-3 sm:px-6 flex items-center justify-between text-[11px] font-mono tracking-widest text-zinc-400 uppercase overflow-hidden [@media(max-height:500px)]:hidden">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="text-zinc-500 font-semibold truncate">SILSILAH KELUARGA</span>
          <span className="text-zinc-300 shrink-0">—</span>
          <span className="font-medium text-zinc-700 truncate">RAWAT SILSILAH BERSAMA</span>
        </div>

        {/* Center Architectural Crosshair */}
        <div className="hidden md:flex items-center gap-1 text-zinc-300 font-mono text-xs shrink-0">
          <span>—</span>
          <span>┼</span>
          <span>—</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <span className="text-zinc-500 font-medium">
            {membershipInfo.isPaid
              ? `${membershipInfo.planName.toUpperCase()} • ${
                  membershipInfo.isExpired
                    ? 'KEDALUWARSA'
                    : `AKTIF HINGGA ${membershipInfo.formattedDate} (${membershipInfo.diffDays} HARI LAGI)`
                }`
              : `KUOTA ${maxMembers} ANGGOTA (PAKET DASAR)`}
          </span>
          <span className="text-zinc-300">•</span>
          <span className="font-semibold text-zinc-700">PRIVAT & AMAN</span>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="h-14 sm:h-16 [@media(max-height:500px)]:!h-10 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand Emblem & Multi-Universe Dropdown */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Brand Logo Nexus Emblem */}
          <div className="flex items-center gap-2.5">
            <img
              src={logoApp}
              alt="Logo Silsilah"
              className="w-8 h-8 object-contain"
            />
            <div className="hidden sm:block [@media(max-height:500px)]:hidden">
              <h1 className="font-black text-zinc-900 text-base leading-none tracking-tight">
                Silsilah<span className="font-black"> Keluarga Indonesia</span>
              </h1>
            </div>
          </div>

          <div className="h-6 w-px bg-zinc-200 hidden sm:block" />

          {/* Multi-Universe Dropdown & Rename Action */}
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <select
                value={currentTree?.id || ''}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    const ownedTrees = (trees || []).filter(
                      (t) => t.role === 'ADMIN_UTAMA' || t.created_by_user_id === user?.id
                    );
                    if (ownedTrees.length >= 1) {
                      if (onOpenLimitModal) onOpenLimitModal('TREE_LIMIT');
                    } else {
                      onOpenCreateTree();
                    }
                  } else {
                    const selected = trees.find((t) => t.id === e.target.value);
                    if (selected) onSelectTree(selected);
                  }
                }}
                className="appearance-none bg-zinc-50 hover:bg-zinc-100 border border-zinc-300 text-zinc-900 font-bold text-xs sm:text-sm rounded-md py-1.5 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-zinc-900 cursor-pointer transition-colors"
              >
                {trees.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nama_silsilah}
                  </option>
                ))}
                <option value="__new__">+ Buat Semesta Baru...</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Tombol Ganti Nama Semesta (Khusus ADMIN_UTAMA) */}
            {currentTree?.role === 'ADMIN_UTAMA' && (
              <button
                type="button"
                onClick={onOpenRenameTree}
                className="p-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-300 hover:border-zinc-400 text-zinc-600 hover:text-zinc-900 rounded-md transition-colors shadow-2xs flex items-center justify-center"
                title={`Ubah nama semesta "${currentTree?.nama_silsilah}"`}
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Role Badge */}
          {currentTree?.role && (
            <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-sm uppercase bg-zinc-100 border border-zinc-200 text-zinc-700">
              <Shield className="w-2.5 h-2.5" />
              {currentTree.role}
            </span>
          )}

          {/* Lencana & Timer Membership Tahunan */}
          {membershipInfo.isPaid ? (
            membershipInfo.isExpired ? (
              <div className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-300 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span className="font-bold uppercase">{membershipInfo.planName} • Kedaluwarsa</span>
                {onOpenUpgrade && currentTree?.role === 'ADMIN_UTAMA' && (
                  <button
                    type="button"
                    onClick={onOpenUpgrade}
                    className="ml-1 px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-[9px] uppercase tracking-wider cursor-pointer"
                  >
                    Perpanjang
                  </button>
                )}
              </div>
            ) : membershipInfo.isExpiringSoon ? (
              <div className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-bold">{membershipInfo.planName}</span>
                <span className="text-amber-700 font-semibold">• Sisa {membershipInfo.diffDays} hari</span>
                {onOpenUpgrade && currentTree?.role === 'ADMIN_UTAMA' && (
                  <button
                    type="button"
                    onClick={onOpenUpgrade}
                    className="ml-1 px-1.5 py-0.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded text-[9px] uppercase tracking-wider cursor-pointer"
                  >
                    Perpanjang
                  </button>
                )}
              </div>
            ) : (
              <div className="hidden xl:inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-0.5 rounded bg-zinc-900 text-white border border-zinc-800 shadow-2xs">
                <Sparkles className="w-3 h-3 text-[#f7e043]" />
                <span className="font-bold text-[#f7e043]">{membershipInfo.planName}</span>
                <span className="text-zinc-400">•</span>
                <span className="text-zinc-300">
                  Aktif s/d {membershipInfo.formattedDate} ({membershipInfo.diffDays} hari lagi)
                </span>
              </div>
            )
          ) : (
            <span className="hidden 2xl:inline-flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-sm uppercase bg-zinc-100 border border-zinc-200 text-zinc-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Paket Dasar (Akses Selamanya)
            </span>
          )}
        </div>

        {/* Center: Capacity & Metrics Widget (Directly inspired by reference status bars) */}
        <div className="hidden md:flex [@media(max-height:500px)]:!hidden items-center gap-4 bg-zinc-50 border border-zinc-200 px-3.5 py-1.5 rounded-md">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-zinc-400">
                Anggota
              </div>
              <div className="text-xs font-black font-mono text-zinc-900">
                {memberCount}
              </div>
            </div>
            <div className="w-px h-5 bg-zinc-200" />
            <div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-zinc-400">
                Sisa Kuota
              </div>
              <div className="text-xs font-black font-mono text-zinc-900">
                {remainingNodes}
              </div>
            </div>
          </div>

          {/* Minimalist Dual-tone Bar (Black for Used, Yellow for Remaining) */}
          <div className="w-24 flex flex-col gap-1">
            <div className="w-full h-2 rounded-xs bg-zinc-200 overflow-hidden flex">
              <div
                className="h-full bg-zinc-900 transition-all duration-300"
                style={{ width: `${percentUsed}%` }}
                title={`Terpakai: ${memberCount}`}
              />
              <div
                className="h-full bg-[#f7e043] transition-all duration-300"
                style={{ width: `${100 - percentUsed}%` }}
                title={`Sisa: ${remainingNodes}`}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-zinc-400 leading-none">
              <span>{percentUsed}%</span>
              <span>MAX {maxMembers}</span>
            </div>
          </div>

          {onOpenUpgrade && currentTree?.role === 'ADMIN_UTAMA' && (
            <button
              type="button"
              onClick={onOpenUpgrade}
              className="flex items-center gap-1 text-[10px] font-mono font-black uppercase px-2 py-1 bg-[#f7e043] hover:bg-yellow-400 text-black rounded transition-all shadow-2xs border border-yellow-500 cursor-pointer"
              title="Upgrade Kuota & Paket Silsilah (Duitku Sandbox)"
            >
              <Sparkles className="w-3 h-3" />
              <span>Upgrade</span>
            </button>
          )}
        </div>

        {/* Right: Action Buttons & User Menu */}
        <div className="flex items-center gap-1 sm:gap-2.5">
          {/* Tombol Tambah Anggota */}
          {['ADMIN_UTAMA', 'KONTRIBUTOR'].includes(currentTree?.role) && (
            <button
              type="button"
              onClick={() => {
                if (memberCount >= maxMembers) {
                  if (onOpenLimitModal) onOpenLimitModal('NODE_LIMIT');
                } else {
                  onOpenAddMember();
                }
              }}
              className="flex items-center gap-1.5 text-xs font-bold bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-800 px-3 py-1.5 rounded-md transition-all shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-zinc-600" />
              <span className="hidden sm:inline">Tambah Anggota</span>
            </button>
          )}

          {/* Tombol Usulan Perubahan */}
          {['ADMIN_UTAMA', 'KONTRIBUTOR'].includes(currentTree?.role) && (
            <button
              type="button"
              onClick={onOpenApprovals}
              className="relative flex items-center gap-1.5 text-xs font-bold bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-800 px-3 py-1.5 rounded-md transition-all shadow-2xs"
            >
              <CheckSquare className="w-3.5 h-3.5 text-zinc-600" />
              <span className="hidden sm:inline">Usulan</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#f7e043] text-black border border-yellow-500">
                  {pendingCount}
                </span>
              )}
            </button>
          )}

          {/* Tombol Kolaborator (Kelola & Undang Anggota) — hidden di mobile, ada di FAB */}
          {currentTree && (
            <button
              type="button"
              onClick={onOpenCollaborators}
              className="hidden sm:flex [@media(max-height:500px)]:!hidden items-center gap-1.5 text-xs font-bold bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-800 px-3 py-1.5 rounded-md transition-all shadow-2xs"
              title="Kelola & Undang Kolaborator"
            >
              <Users className="w-3.5 h-3.5 text-zinc-600" />
              <span className="hidden sm:inline">Kolaborator</span>
            </button>
          )}

          {/* Tombol Buku Panduan UX — hidden di mobile, ada di FAB */}
          <button
            type="button"
            onClick={onOpenGuide}
            className="hidden sm:flex [@media(max-height:500px)]:!hidden items-center gap-1.5 text-xs font-mono font-bold uppercase px-2.5 py-1.5 rounded-md border border-zinc-200 hover:bg-zinc-100 text-zinc-700 transition-colors"
            title="Buku Panduan & Alur Kerja Aplikasi"
          >
            <span className="w-4 h-4 rounded-xs bg-[#f7e043] text-black text-[10px] font-bold flex items-center justify-center">
              ?
            </span>
            <span className="hidden xl:inline">Panduan</span>
          </button>

          {/* Tombol About & FAQ — hidden di mobile, ada di FAB */}
          <button
            type="button"
            onClick={onOpenAboutFaq}
            className="hidden sm:flex [@media(max-height:500px)]:!hidden items-center gap-1.5 text-xs font-mono font-bold uppercase px-2.5 py-1.5 rounded-md border border-zinc-200 hover:bg-zinc-100 text-zinc-700 transition-colors"
            title="Tentang Platform, Matriks Hak Akses & FAQ"
          >
            <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden xl:inline">About</span>
          </button>

          {/* Tombol Beri Masukan & Saran */}
          {onOpenFeedback && (
            <button
              type="button"
              onClick={onOpenFeedback}
              className="hidden sm:flex [@media(max-height:500px)]:!hidden items-center gap-1.5 text-xs font-mono font-bold uppercase px-2.5 py-1.5 rounded-md border border-zinc-200 hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
              title="Kirim Masukan, Laporan Masalah, atau Usulan Fitur"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden xl:inline">Beri Masukan</span>
            </button>
          )}

          {/* Super Admin Panel */}
          {user?.system_role === 'SUPER_ADMIN' && (
            <button
              type="button"
              onClick={onOpenSuperAdmin}
              className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white transition-colors"
              title="Super Admin Portal"
            >
              <Shield className="w-3.5 h-3.5 text-yellow-400" />
              <span className="hidden xl:inline">Portal Admin</span>
            </button>
          )}

          {/* User Profile Control Panel Trigger & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-200">
            <button
              type="button"
              onClick={onOpenUserPanel}
              className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-md border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 transition-all text-left group"
              title={`Pusat Kontrol Pengguna (${user?.email || 'Akun'})`}
            >
              <div className="w-7 h-7 rounded-sm bg-zinc-900 text-[#f7e043] flex items-center justify-center font-black text-xs font-mono group-hover:scale-105 transition-transform shadow-2xs">
                {user?.nama_lengkap?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="hidden md:block leading-none">
                <div className="text-[11px] font-bold text-zinc-800 truncate max-w-[80px]">
                  {user?.nama_lengkap?.split(' ')[0] || 'User'}
                </div>
                <div className="text-[9px] font-mono text-zinc-400 uppercase mt-0.5">
                  {user?.system_role === 'SUPER_ADMIN' ? 'ADMIN' : currentTree?.role || 'PANEL'}
                </div>
              </div>
              <Settings className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-700 hidden sm:block ml-0.5" />
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
              title="Keluar (Logout)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
