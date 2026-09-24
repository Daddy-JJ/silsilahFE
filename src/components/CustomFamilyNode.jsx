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
      className={`relative w-64 h-[160px] bg-white rounded-lg border shadow-sm transition-all duration-200 group select-none cursor-pointer flex flex-col justify-between ${
        data.isSelected
          ? 'border-zinc-900 ring-2 ring-[#f7e043] shadow-md'
          : 'border-zinc-200 hover:border-zinc-900 hover:shadow-md'
      }`}
    >
      {/* Target Handle: Garis dari orang tua */}
      <Handle
        type="target"
        position={Position.Top}
        id="child-top"
        className="!w-2.5 !h-2.5 !bg-zinc-900 !border-2 !border-white !-top-1.5 transition-transform group-hover:scale-125"
      />

      {/* Horizontal Handles untuk Relasi Pernikahan / Pasangan */}
      <Handle
        type="target"
        position={Position.Left}
        id="spouse-left"
        className="!w-2 !h-2 !bg-[#f7e043] !border-2 !border-zinc-900 !-left-1 !top-1/2 opacity-60 hover:opacity-100"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="spouse-right"
        className="!w-2 !h-2 !bg-[#f7e043] !border-2 !border-zinc-900 !-right-1 !top-1/2 opacity-60 hover:opacity-100"
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
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-zinc-100 bg-zinc-50/70">
        <div className="flex items-center gap-2">
          {/* Yellow square emblem reminiscent of the reference UI */}
          <div className="w-5 h-5 rounded-xs bg-[#f7e043] text-black font-mono font-black text-[10px] flex items-center justify-center shadow-xs">
            {isMale ? 'L' : 'P'}
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-500">
            {isMale ? 'Laki-laki' : 'Perempuan'}
          </span>
        </div>

        {/* Status Badges: Version + Relationship Indicators */}
        <div className="flex items-center gap-1">
          {/* Spouse indicator */}
          {data.hasSpouse && (
            <span
              className="text-[10px] font-mono px-1 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-500 flex items-center gap-0.5"
              title="Memiliki pasangan (inferred)"
            >
              <Heart className="w-2.5 h-2.5 text-pink-500 fill-pink-500/20" />
            </span>
          )}
          {/* Children count */}
          {data.childrenCount > 0 && (
            <span
              className="text-[10px] font-mono px-1 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-600 flex items-center gap-0.5"
              title={`${data.childrenCount} anak`}
            >
              <Users className="w-2.5 h-2.5 text-zinc-400" />
              <span className="font-bold">{data.childrenCount}</span>
            </span>
          )}
          {/* Version Badge (Optimistic Locking indicator) */}
          <span
            className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700"
            title={`Versi data saat ini: v${data.version || 1}`}
          >
            v{data.version || 1}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-3.5">
        <div className="flex items-center gap-3 mb-1">
          {data.foto_profil ? (
            <div className="w-10 h-10 rounded-full bg-zinc-200 shrink-0 overflow-hidden border border-zinc-200">
              <img src={data.foto_profil} alt={data.nama_lengkap} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-400 border border-zinc-200 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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

        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mb-3">
          <Calendar className="w-3 h-3 text-zinc-400" />
          <span className="font-mono text-[11px]">
            {data.tanggal_lahir ? data.tanggal_lahir.split('T')[0] : 'Tgl tdk tercatat'}
          </span>
        </div>

        {/* Minimalist Architectural Action Buttons — 3 columns */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-zinc-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (data.onEdit) data.onEdit(data);
            }}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-md text-[11px] font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 hover:text-black transition-colors"
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
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-md text-[11px] font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 hover:text-black transition-colors"
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
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-md text-[11px] font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 hover:text-black transition-colors"
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
        className="!w-2.5 !h-2.5 !bg-zinc-900 !border-2 !border-white !-bottom-1.5 transition-transform group-hover:scale-125"
      />
    </div>
  );
};

export default memo(CustomFamilyNode);
