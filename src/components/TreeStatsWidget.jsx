import React, { useState } from 'react';
import { Users, ChevronDown, ChevronUp, Layers, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function TreeStatsWidget({
  currentTree,
  treeName = 'Semesta Pohon',
  members = [],
  pendingCount = 0,
  maxMembers = 30,
  onOpenUpgrade,
}) {
  const [collapsed, setCollapsed] = useState(false);

  const effectiveMaxMembers = currentTree?.max_members || maxMembers;
  const total = members.length;
  const maleCount = members.filter((m) => m.jenis_kelamin === 'L').length;
  const femaleCount = members.filter((m) => m.jenis_kelamin === 'P').length;
  const remaining = Math.max(0, effectiveMaxMembers - total);

  const planCode =
    currentTree?.membership_plan ||
    (effectiveMaxMembers >= 200 ? 'DINASTI' : effectiveMaxMembers >= 100 ? 'KELUARGA_BESAR' : 'FREE');
  const membershipStatus = currentTree?.membership_status || (planCode === 'FREE' ? 'LIFETIME' : 'ACTIVE');
  const isExpired = membershipStatus === 'EXPIRED';

  const PLAN_LABELS = {
    FREE: 'Paket Dasar',
    KELUARGA_BESAR: 'Paket Keluarga Besar',
    DINASTI: 'Paket Dinasti',
  };
  const planLabel =
    PLAN_LABELS[planCode] ||
    (effectiveMaxMembers >= 200 ? 'Paket Dinasti' : effectiveMaxMembers >= 100 ? 'Paket Keluarga Besar' : 'Paket Dasar');

  // Hitung jumlah generasi
  const depthMap = new Map();
  const memberMap = new Map(members.map((m) => [m.id, m]));
  function getDepth(id, visited = new Set()) {
    if (!id || visited.has(id)) return 0;
    if (depthMap.has(id)) return depthMap.get(id);
    visited.add(id);
    const m = memberMap.get(id);
    if (!m) return 0;
    const ayahDepth = m.ayah_id ? getDepth(m.ayah_id, new Set(visited)) + 1 : 0;
    const ibuDepth = m.ibu_id ? getDepth(m.ibu_id, new Set(visited)) + 1 : 0;
    const depth = Math.max(ayahDepth, ibuDepth);
    depthMap.set(id, depth);
    return depth;
  }
  members.forEach((m) => getDepth(m.id));
  const maxDepth = members.length > 0 ? Math.max(...Array.from(depthMap.values()), 0) + 1 : 0;

  const percentTotal = Math.min(100, Math.round((total / effectiveMaxMembers) * 100));

  return (
    <div className="absolute top-4 left-4 z-10 w-80 bg-white/95 backdrop-blur-md rounded-lg border border-zinc-200 shadow-md overflow-hidden transition-all duration-300 select-none">
      {/* Header Bar */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="px-4 py-3 bg-white border-b border-zinc-100 flex items-center justify-between cursor-pointer hover:bg-zinc-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {/* Yellow Geometric Emblem */}
          <div className="w-5 h-5 rounded-xs bg-[#f7e043] text-black font-mono font-black text-[10px] flex items-center justify-center">
            ✦
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-zinc-900 leading-none">
              Overview Silsilah
            </h2>
            <span className="text-[10px] text-zinc-400 font-mono truncate block max-w-[160px]">
              {treeName}
            </span>
          </div>
        </div>
        <button
          type="button"
          className="text-zinc-400 hover:text-zinc-700 p-1"
          aria-label={collapsed ? 'Perluas widget' : 'Ciutkan widget'}
        >
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="p-4 space-y-4">
          {/* Metric Cards Row (Inspired by Total Sales / Units Sold in reference) */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-md bg-zinc-50 border border-zinc-100">
              <div className="text-[9px] font-mono uppercase tracking-wider text-zinc-400">
                Total
              </div>
              <div className="text-base font-black font-mono text-zinc-900 leading-tight mt-0.5">
                {total}
              </div>
            </div>

            <div className="p-2.5 rounded-md bg-zinc-50 border border-zinc-100">
              <div className="text-[9px] font-mono uppercase tracking-wider text-zinc-400">
                Generasi
              </div>
              <div className="text-base font-black font-mono text-zinc-900 leading-tight mt-0.5">
                {maxDepth}
              </div>
            </div>

            <div className="p-2.5 rounded-md bg-zinc-50 border border-zinc-100">
              <div className="text-[9px] font-mono uppercase tracking-wider text-zinc-400">
                Usulan
              </div>
              <div className="text-base font-black font-mono text-zinc-900 leading-tight mt-0.5 flex items-center gap-1">
                {pendingCount}
                {pendingCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-[#f7e043] animate-ping" />
                )}
              </div>
            </div>
          </div>

          {/* Gender Distribution */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-700">
              <span>Komposisi Gender</span>
              <span className="text-zinc-400 font-mono font-normal">
                {maleCount} L / {femaleCount} P
              </span>
            </div>
            <div className="w-full h-2 rounded-xs bg-zinc-100 overflow-hidden flex">
              <div
                className="bg-zinc-800 transition-all duration-300"
                style={{ width: `${total ? (maleCount / total) * 100 : 0}%` }}
                title={`Laki-laki: ${maleCount}`}
              />
              <div
                className="bg-zinc-300 transition-all duration-300"
                style={{ width: `${total ? (femaleCount / total) * 100 : 0}%` }}
                title={`Perempuan: ${femaleCount}`}
              />
            </div>
          </div>

          {/* Quota Status (Inspired by "Units per Status" in reference) */}
          <div className="pt-2 border-t border-zinc-100 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 font-bold truncate">
                  {planLabel} (Max {effectiveMaxMembers})
                </span>
                {isExpired ? (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">
                    Kedaluwarsa
                  </span>
                ) : planCode !== 'FREE' ? (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">
                    Aktif
                  </span>
                ) : null}
              </div>
              <span className="text-[11px] font-mono font-bold text-zinc-900 shrink-0">
                {total} / {effectiveMaxMembers}
              </span>
            </div>

            {/* Reference Multi-segment Bar (Black, Gray, Yellow) */}
            <div className="w-full h-3 rounded-xs bg-zinc-200 overflow-hidden flex border border-zinc-300/80">
              <div
                className="bg-zinc-900 transition-all duration-300"
                style={{ width: `${percentTotal}%` }}
                title={`Terisi: ${total} anggota`}
              />
              <div
                className="bg-[#f7e043] transition-all duration-300"
                style={{ width: `${100 - percentTotal}%` }}
                title={`Sisa Kuota: ${remaining} anggota`}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-2xs bg-zinc-900 inline-block" />
                <span>Terpakai ({total})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-2xs bg-[#f7e043] inline-block border border-yellow-400" />
                <span>Sisa Kuota ({remaining})</span>
              </div>
            </div>

            {isExpired && (
              <div className="p-2 bg-rose-50 border border-rose-200 rounded text-rose-800 text-[10px] font-mono font-bold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                <span>Masa aktif paket telah kedaluwarsa.</span>
              </div>
            )}

            {onOpenUpgrade && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onOpenUpgrade}
                  className="w-full py-1.5 px-2 bg-[#f7e043] hover:bg-yellow-400 text-black font-mono text-[10px] font-black uppercase tracking-wider rounded border border-yellow-500 shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  title="Tingkatkan kuota anggota silsilah dengan Duitku Sandbox"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{isExpired ? 'Perpanjang Langganan' : 'Upgrade Kuota Silsilah'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
