import React from 'react';
import { BaseEdge, getSmoothStepPath, EdgeLabelRenderer } from '@xyflow/react';

/**
 * JumpEdge — Custom Edge dengan Line Jump (busur kecil) di titik persimpangan garis.
 *
 * Cara kerja:
 * 1. Hitung path normal menggunakan getSmoothStepPath.
 * 2. Bandingkan dengan semua edge lain untuk cari titik persimpangan.
 * 3. Di setiap titik persilangan, sisipkan busur kecil (arc) ke dalam path SVG.
 *
 * Catatan: Deteksi persilangan dilakukan menggunakan data dari prop `data.allEdgePositions`
 * yang di-inject oleh App.jsx ke setiap edge.
 */

const JUMP_RADIUS = 8; // Radius busur line jump dalam px

/**
 * Hitung titik potong antara dua segmen garis (p1-p2) dan (p3-p4).
 * Mengembalikan koordinat titik potong, atau null jika tidak berpotongan.
 */
function segmentIntersection(p1, p2, p3, p4) {
  const d1 = { x: p2.x - p1.x, y: p2.y - p1.y };
  const d2 = { x: p4.x - p3.x, y: p4.y - p3.y };
  const cross = d1.x * d2.y - d1.y * d2.x;

  if (Math.abs(cross) < 1e-8) return null; // Paralel

  const t = ((p3.x - p1.x) * d2.y - (p3.y - p1.y) * d2.x) / cross;
  const u = ((p3.x - p1.x) * d1.y - (p3.y - p1.y) * d1.x) / cross;

  if (t >= 0.01 && t <= 0.99 && u >= 0.01 && u <= 0.99) {
    return {
      x: p1.x + t * d1.x,
      y: p1.y + t * d1.y,
      t,
    };
  }
  return null;
}

/**
 * Parsing SVG path string menjadi array segmen garis lurus.
 * Hanya mendukung M, L, C (approx via midpoint).
 */
function parsePath(d) {
  const segments = [];
  const parts = d.match(/[MLCQZmlcqz][^MLCQZmlcqz]*/g) || [];
  let currentX = 0, currentY = 0;

  parts.forEach(part => {
    const cmd = part[0];
    const nums = part.slice(1).trim().split(/[\s,]+/).map(Number);

    if (cmd === 'M') {
      currentX = nums[0]; currentY = nums[1];
    } else if (cmd === 'L') {
      const nextX = nums[0], nextY = nums[1];
      segments.push({ x1: currentX, y1: currentY, x2: nextX, y2: nextY });
      currentX = nextX; currentY = nextY;
    } else if (cmd === 'C') {
      // Cubic bezier: approx sebagai 3 segmen lurus
      const [cx1, cy1, cx2, cy2, ex, ey] = nums;
      const mx1 = (currentX + cx1) / 2, my1 = (currentY + cy1) / 2;
      const mx2 = (cx1 + cx2) / 2, my2 = (cy1 + cy2) / 2;
      segments.push({ x1: currentX, y1: currentY, x2: mx1, y2: my1 });
      segments.push({ x1: mx1, y1: my1, x2: mx2, y2: my2 });
      segments.push({ x1: mx2, y1: my2, x2: ex, y2: ey });
      currentX = ex; currentY = ey;
    }
  });

  return segments;
}

/**
 * Sisipkan arc jump ke dalam SVG path string di posisi titik persimpangan.
 */
function insertJumpsIntoPath(pathD, jumps) {
  if (jumps.length === 0) return pathD;

  // Karena modifikasi path raw sangat kompleks, kita buat path baru:
  // Untuk setiap jump point, kita gambar arc kecil yang "melompat" ke atas.
  // Approach: tambahkan elemen <circle> arc terpisah via SVG overlay.
  // Return original path + jump markers (handled di JSX).
  return { originalPath: pathD, jumpPoints: jumps };
}

export default function JumpEdge({
  id,
  sourceX, sourceY,
  targetX, targetY,
  sourcePosition, targetPosition,
  style = {},
  label,
  labelStyle,
  labelBgStyle,
  data = {},
  markerEnd,
}) {
  let edgePath, labelX, labelY;

  // Custom Bus Staggering: Jika dikirim data.busOffset, kita gambar path SVG manual
  // agar garis horizontalnya bisa bertingkat/paralel dan tidak menumpuk.
  if (data?.busOffset && sourcePosition === 'bottom' && targetPosition === 'top') {
    const r = 8;
    const midY = sourceY + data.busOffset;
    labelX = sourceX + (targetX - sourceX) / 2;
    labelY = midY;
    
    if (Math.abs(targetX - sourceX) < 1) {
      // Garis lurus vertikal ke bawah
      edgePath = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
    } else {
      const dirX = Math.sign(targetX - sourceX);
      // Batasi radius kurva agar tidak patah jika jaraknya terlalu dekat
      const maxR = Math.min(r, Math.abs(targetX - sourceX) / 2, Math.abs(midY - sourceY), Math.abs(targetY - midY));
      
      edgePath = `M ${sourceX} ${sourceY} L ${sourceX} ${midY - maxR} Q ${sourceX} ${midY} ${sourceX + maxR * dirX} ${midY} L ${targetX - maxR * dirX} ${midY} Q ${targetX} ${midY} ${targetX} ${midY + maxR} L ${targetX} ${targetY}`;
    }
  } else {
    // Fallback ke default smooth step path milik React Flow
    const res = getSmoothStepPath({
      sourceX, sourceY, sourcePosition,
      targetX, targetY, targetPosition,
      borderRadius: 8,
    });
    edgePath = res[0];
    labelX = res[1];
    labelY = res[2];
  }

  // Cari titik persilangan dengan edge lain
  const mySegments = parsePath(edgePath);
  const jumpPoints = [];

  if (data.allEdgePositions && Array.isArray(data.allEdgePositions)) {
    data.allEdgePositions.forEach(otherEdge => {
      if (otherEdge.id === id) return;
      // Hanya cek edge non-marriage yang bersilangan dengan marriage edge (atau sebaliknya)
      const otherSegments = parsePath(otherEdge.path || '');

      mySegments.forEach(seg1 => {
        otherSegments.forEach(seg2 => {
          const pt = segmentIntersection(
            { x: seg1.x1, y: seg1.y1 }, { x: seg1.x2, y: seg1.y2 },
            { x: seg2.x1, y: seg2.y1 }, { x: seg2.x2, y: seg2.y2 }
          );
          if (pt) {
            // Cek duplikat (dua edge yang sama bisa muncul 2x)
            const isDup = jumpPoints.some(j => Math.abs(j.x - pt.x) < 5 && Math.abs(j.y - pt.y) < 5);
            if (!isDup) {
              jumpPoints.push(pt);
            }
          }
        });
      });
    });
  }

  const isDashed = style.strokeDasharray && style.strokeDasharray !== 'none';

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={style}
        id={id}
      />

      {/* Line Jump Arcs — digambar sebagai busur SVG di atas edge */}
      {jumpPoints.map((pt, i) => (
        <g key={`jump-${id}-${i}`}>
          {/* Tutup garis di bawah busur dengan warna background */}
          <circle
            cx={pt.x}
            cy={pt.y}
            r={JUMP_RADIUS + 2}
            fill="#f4f4f5"
            stroke="none"
          />
          {/* Busur jump */}
          <path
            d={`M ${pt.x - JUMP_RADIUS} ${pt.y} A ${JUMP_RADIUS} ${JUMP_RADIUS} 0 0 1 ${pt.x + JUMP_RADIUS} ${pt.y}`}
            fill="none"
            stroke={style.stroke || '#18181b'}
            strokeWidth={style.strokeWidth || 2}
            strokeDasharray={isDashed ? '5 5' : 'none'}
          />
        </g>
      ))}

      {/* Edge Label */}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 10,
              fontFamily: 'monospace',
              fontWeight: 800,
              pointerEvents: 'all',
              backgroundColor: labelBgStyle?.fill || '#fff',
              border: `1px solid ${labelBgStyle?.stroke || '#e4e4e7'}`,
              borderRadius: 4,
              padding: '1px 5px',
              color: labelStyle?.fill || '#71717a',
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
