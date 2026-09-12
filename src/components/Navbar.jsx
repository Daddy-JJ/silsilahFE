import React from 'react';
import { Plus, CheckSquare, LogOut, Shield, ChevronDown, Users, HelpCircle, Edit3 } from 'lucide-react';

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
}) {
  const remainingNodes = Math.max(0, maxMembers - memberCount);
  const percentUsed = Math.min(100, Math.round((memberCount / maxMembers) * 100));

  return (
    <header className="bg-white border-b border-zinc-200 select-none z-20 shrink-0">
      {/* Editorial Top Ticker (Inspired by PROJECT — AIRES / FIELD — REAL ESTATE) */}
      <div className="h-7 border-b border-zinc-100 px-6 flex items-center justify-between text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
        <div className="flex items-center gap-2">
          <span>PROJECT</span>
          <span className="text-zinc-300">—</span>
          <span className="font-semibold text-zinc-700">SILSILAH KELUARGA</span>
        </div>

        {/* Center Architectural Crosshair */}
        <div className="hidden md:flex items-center gap-1 text-zinc-300 font-mono text-xs">
          <span>—</span>
          <span>┼</span>
          <span>—</span>
        </div>

        <div className="flex items-center gap-2">
          <span>PHASE 1</span>
          <span className="text-zinc-300">—</span>
          <span className="font-semibold text-zinc-700">30 NODES SANDBOX</span>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="h-16 px-6 flex items-center justify-between gap-4">
        {/* Left: Brand Emblem & Multi-Universe Dropdown */}
        <div className="flex items-center gap-4">
          {/* Yellow Geometric Emblem (Inspired by yellow square 'H' badge) */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-[#f7e043] text-black font-black font-mono text-sm flex items-center justify-center shadow-xs border border-yellow-400">
              S
            </div>
            <div className="hidden sm:block">
              <h1 className="font-black text-zinc-900 text-base leading-none tracking-tight">
                Silsilah
              </h1>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                Collaborative Tree
              </span>
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
        </div>

        {/* Center: Capacity & Metrics Widget (Directly inspired by reference status bars) */}
        <div className="hidden md:flex items-center gap-4 bg-zinc-50 border border-zinc-200 px-3.5 py-1.5 rounded-md">
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
          <div className="w-28 flex flex-col gap-1">
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
        </div>

        {/* Right: Action Buttons & User Menu */}
        <div className="flex items-center gap-2.5">
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

          {/* Tombol Kolaborator (Kelola & Undang Anggota) */}
          {currentTree && (
            <button
              type="button"
              onClick={onOpenCollaborators}
              className="flex items-center gap-1.5 text-xs font-bold bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-800 px-3 py-1.5 rounded-md transition-all shadow-2xs"
              title="Kelola & Undang Kolaborator"
            >
              <Users className="w-3.5 h-3.5 text-zinc-600" />
              <span className="hidden sm:inline">Kolaborator</span>
            </button>
          )}

          {/* Tombol Buku Panduan UX */}
          <button
            type="button"
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase px-2.5 py-1.5 rounded-md border border-zinc-200 hover:bg-zinc-100 text-zinc-700 transition-colors"
            title="Buku Panduan & Alur Kerja Aplikasi"
          >
            <span className="w-4 h-4 rounded-xs bg-[#f7e043] text-black text-[10px] font-bold flex items-center justify-center">
              ?
            </span>
            <span className="hidden xl:inline">Panduan</span>
          </button>

          {/* Tombol About & FAQ */}
          <button
            type="button"
            onClick={onOpenAboutFaq}
            className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase px-2.5 py-1.5 rounded-md border border-zinc-200 hover:bg-zinc-100 text-zinc-700 transition-colors"
            title="Tentang Platform, Matriks Hak Akses & FAQ"
          >
            <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden xl:inline">About</span>
          </button>

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

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-200">
            <div
              className="w-7 h-7 rounded-sm bg-zinc-100 border border-zinc-200 text-zinc-800 flex items-center justify-center font-bold text-xs font-mono"
              title={user?.email}
            >
              {user?.nama_lengkap?.[0]?.toUpperCase() || 'U'}
            </div>
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
