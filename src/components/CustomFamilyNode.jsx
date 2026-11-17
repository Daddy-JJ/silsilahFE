import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Plus, Edit3, Calendar, Heart, Users } from 'lucide-react';

const CustomFamilyNode = ({ data }) => {
  const isMale = data.jenis_kelamin === 'L';

  return (
    <div
      onClick={() => {
        if (data.onSelect) data.onSelect(data);
      }}
      className={`relative w-64 h-[160px] bg-white rounded-xl border shadow-xs transition-all duration-200 ease-out group select-none cursor-pointer flex flex-col justify-between ${
        data.isSelected
          ? 'border-zinc-900 ring-2 ring-[#f7e043] shadow-md'
          : 'border-zinc-200/90 hover:border-zinc-400 hover:shadow-md'
      }`}
    >
      {/* Target Handle: Garis dari orang tua */}
      <Handle
        type="target"
        position={Position.Top}
        id="child-top"
        className="!w-2.5 !h-2.5 !bg-zinc-900 !border-2 !border-white !-top-1.5 transition-transform duration-150 group-hover:scale-125"
      />

      {/* Horizontal Handles untuk Relasi Pernikahan / Pasangan */}
      <Handle
        type="target"
        position={Position.Left}
        id="spouse-left"
        className="!w-2 !h-2 !bg-[#f7e043] !border-2 !border-zinc-900 !-left-1 !top-1/2 opacity-70 hover:opacity-100 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="spouse-right"
        className="!w-2 !h-2 !bg-[#f7e043] !border-2 !border-zinc-900 !-right-1 !top-1/2 opacity-70 hover:opacity-100 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="spouse-left-src"
        className="!w-1.5 !h-1.5 !bg-[#f7e043] !border-2 !border-zinc-900 !-left-1 !top-1/2 opacity-0 pointer-events-none"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="spouse-right-tgt"
        className="!w-1.5 !h-1.5 !bg-[#f7e043] !border-2 !border-zinc-900 !-right-1 !top-1/2 opacity-0 pointer-events-none"
      />

      {/* Top Accent Strip with Yellow Highlight */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-100 bg-zinc-50/90 rounded-t-xl">
        <div className="flex items-center gap-1.5">
          {/* Yellow square emblem reminiscent of the reference UI */}
          <div className="w-5 h-5 rounded bg-[#f7e043] text-zinc-950 font-mono font-black text-[10px] flex items-center justify-center shadow-2xs">
            {isMale ? 'L' : 'P'}
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-600">
            {isMale ? 'Laki-laki' : 'Perempuan'}
          </span>
        </div>

        {/* Status Badges: Version + Relationship Indicators */}
        <div className="flex items-center gap-1">
          {/* Spouse indicator */}
          {data.hasSpouse && (
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-600 flex items-center gap-1"
              title="Memiliki pasangan (inferred)"
            >
              <Heart className="w-2.5 h-2.5 text-pink-500 fill-pink-500/20" />
            </span>
          )}
          {/* Children count */}
          {data.childrenCount > 0 && (
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-700 flex items-center gap-1"
              title={`${data.childrenCount} anak`}
            >
              <Users className="w-2.5 h-2.5 text-zinc-400" />
              <span className="font-bold">{data.childrenCount}</span>
            </span>
          )}
          {/* Version Badge (Optimistic Locking indicator) */}
          <span
            className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-700"
            title={`Versi data saat ini: v${data.version || 1}`}
          >
            v{data.version || 1}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-3.5 pt-2 pb-2 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            {data.foto_profil ? (
              <div className="w-9 h-9 rounded-full bg-zinc-100 shrink-0 overflow-hidden border border-zinc-200 shadow-2xs">
                <img src={data.foto_profil} alt={data.nama_lengkap} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-zinc-100 text-zinc-400 border border-zinc-200 flex items-center justify-center shrink-0">
                <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4
                className="font-extrabold text-zinc-900 text-sm leading-snug truncate tracking-tight"
                title={data.nama_lengkap}
              >
                {data.nama_lengkap}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <Calendar className="w-3 h-3 text-zinc-400 shrink-0" />
            <span className="font-mono text-[11px]">
              {data.tanggal_lahir ? data.tanggal_lahir.split('T')[0] : 'Tgl tdk tercatat'}
            </span>
          </div>
        </div>

        {/* Minimalist Architectural Action Buttons — 3 columns */}
        <div className="flex items-center gap-1.5 pt-1.5 border-t border-zinc-100 select-none">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (data.onEdit) data.onEdit(data);
            }}
            className="relative flex-1 flex items-center justify-center gap-1 py-2 px-2 min-h-[32px] rounded-md text-[11px] font-bold text-zinc-700 bg-zinc-100/90 hover:bg-zinc-200 hover:text-zinc-950 active:scale-[0.97] transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-800 cursor-pointer after:absolute after:inset-[-2px] after:content-['']"
            title="Edit / Usulkan Perubahan"
          >
            <Edit3 className="w-3 h-3 text-zinc-500" />
            <span>Ubah</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (data.onAddSpouse) data.onAddSpouse(data);
            }}
            className="relative flex-1 flex items-center justify-center gap-1 py-2 px-2 min-h-[32px] rounded-md text-[11px] font-bold text-zinc-700 bg-zinc-100/90 hover:bg-pink-50 hover:text-pink-900 active:scale-[0.97] transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500 cursor-pointer after:absolute after:inset-[-2px] after:content-['']"
            title="Tambah Pasangan (Suami/Istri)"
          >
            <Heart className="w-3 h-3 text-pink-500 fill-pink-500/20" />
            <span>Pasangan</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (data.onAddChild) data.onAddChild(data);
            }}
            className="relative flex-1 flex items-center justify-center gap-1 py-2 px-2 min-h-[32px] rounded-md text-[11px] font-bold text-zinc-700 bg-zinc-100/90 hover:bg-zinc-200 hover:text-zinc-950 active:scale-[0.97] transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-800 cursor-pointer after:absolute after:inset-[-2px] after:content-['']"
            title="Tambah Anak Baru"
          >
            <Plus className="w-3 h-3 text-zinc-500" />
            <span>Anak</span>
          </button>
        </div>
      </div>

      {/* Source Handle: Menghubungkan ke keturunan */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="parent-bottom"
        className="!w-2.5 !h-2.5 !bg-zinc-900 !border-2 !border-white !-bottom-1.5 transition-transform duration-150 group-hover:scale-125"
      />
    </div>
  );
};

export default memo(CustomFamilyNode);
