import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

/**
 * KnotNode — Titik simpul virtual "Family Knot" untuk routing garis silsilah.
 *
 * Diletakkan di tengah garis horizontal antara dua pasangan (Ayah & Ibu).
 * - Sisi kiri menerima garis dari pasangan kiri (spouse-right -> knot-left)
 * - Sisi kanan meneruskan garis ke pasangan kanan (knot-right -> spouse-left)
 * - Sisi bawah mengalirkan garis silsilah ke anak-anak (knot-bottom -> child-top)
 *
 * Mendukung drag-and-drop mandiri sehingga posisi simpul bisa disesuaikan pengguna.
 */
const KnotNode = ({ selected }) => {
  return (
    <div
      className={`group relative flex items-center justify-center cursor-grab active:cursor-grabbing select-none transition-transform hover:scale-125 ${
        selected ? 'ring-2 ring-amber-900 ring-offset-2 scale-110' : ''
      }`}
      style={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: '#fef3c7',
        border: '2px solid #f59e0b',
        boxShadow: '0 2px 5px rgba(245, 158, 11, 0.3)',
      }}
      title="Simpul Silsilah Keluarga (Klik & geser untuk mengatur posisi)"
    >
      <span className="text-[11px] leading-none pointer-events-none select-none">
        💍
      </span>

      {/* Handle Kiri: Menerima/meneruskan garis pasangan dari kiri */}
      <Handle
        type="target"
        position={Position.Left}
        id="knot-left"
        style={{
          width: 2,
          height: 2,
          background: 'transparent',
          border: 'none',
          left: -1,
          top: '50%',
        }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="knot-left-src"
        style={{
          width: 2,
          height: 2,
          background: 'transparent',
          border: 'none',
          left: -1,
          top: '50%',
        }}
      />

      {/* Handle Kanan: Meneruskan/menerima garis pasangan ke kanan */}
      <Handle
        type="source"
        position={Position.Right}
        id="knot-right"
        style={{
          width: 2,
          height: 2,
          background: 'transparent',
          border: 'none',
          right: -1,
          top: '50%',
        }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="knot-right-tgt"
        style={{
          width: 2,
          height: 2,
          background: 'transparent',
          border: 'none',
          right: -1,
          top: '50%',
        }}
      />

      {/* Handle Atas */}
      <Handle
        type="target"
        position={Position.Top}
        id="knot-top"
        style={{
          width: 2,
          height: 2,
          background: 'transparent',
          border: 'none',
          top: -1,
          left: '50%',
        }}
      />

      {/* Handle Bawah: Mengalirkan garis ke anak-anak */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="knot-bottom"
        style={{
          width: 2,
          height: 2,
          background: 'transparent',
          border: 'none',
          bottom: -1,
          left: '50%',
        }}
      />
    </div>
  );
};

export default memo(KnotNode);

