/**
 * Mencegah XSS: Semua data yang berasal dari pengguna (nama, tanggal, judul)
 * WAJIB melalui fungsi ini sebelum dimasukkan ke dalam konten HTML statis.
 * @param {any} str - Nilai yang akan di-escape
 * @returns {string} String aman bebas HTML entity injection
 */
function escapeHtml(str) {
  const s = str == null ? '' : String(str);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function exportTreeAsHTML(nodes, edges, treeName) {
  if (nodes.length === 0) return;

  // 1. Hitung Bounding Box kanvas berdasarkan node & simpul
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  nodes.forEach((n) => {
    if (n.position.x < minX) minX = n.position.x;
    if (n.position.y < minY) minY = n.position.y;
    // Dimensi: 256x160 untuk familyNode, 24x24 untuk knotNode
    const w = n.type === 'knotNode' ? 24 : 256;
    const h = n.type === 'knotNode' ? 24 : 160;
    if (n.position.x + w > maxX) maxX = n.position.x + w;
    if (n.position.y + h > maxY) maxY = n.position.y + h;
  });

  const padding = 100;
  const width = Math.max(1200, maxX - minX + padding * 2);
  const height = maxY - minY + padding * 2;
  const offsetX = -minX + padding;
  const offsetY = -minY + padding;

  // 2. Generate Regular Nodes HTML (Kartu Anggota Keluarga)
  const regularNodesHtml = nodes
    .filter((n) => n.type !== 'knotNode')
    .map((n) => {
      const isMale = n.data?.jenis_kelamin === 'L';
      const left = n.position.x + offsetX;
      const top = n.position.y + offsetY;
      const genderLabel = isMale ? 'L' : 'P';
      const color = isMale ? '#18181b' : '#27272a';
      const tl = n.data?.tanggal_lahir ? n.data.tanggal_lahir.split('T')[0] : 'Tidak diketahui';
      // Escape semua data user sebelum dimasukkan ke HTML (anti XSS)
      const safeName = escapeHtml(n.data?.nama_lengkap || '-');
      const safeTl = escapeHtml(tl);
      const safeVersion = escapeHtml(n.data?.version || 1);

      return `
      <div style="position: absolute; left: ${left}px; top: ${top}px; width: 256px; height: 160px; background: #ffffff; border: 2px solid ${color}; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); font-family: ui-sans-serif, system-ui, sans-serif; overflow: hidden; z-index: 10; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
        <div style="background: #f4f4f5; padding: 6px 12px; border-bottom: 1px solid #e4e4e7; display: flex; align-items: center; justify-content: space-between;">
           <div style="display: flex; align-items: center; gap: 8px;">
             <span style="background: #f7e043; color: black; font-weight: 900; width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; border-radius: 4px; font-size: 11px; font-family: monospace;">${genderLabel}</span>
             <span style="font-size: 10px; color: #71717a; font-weight: bold; text-transform: uppercase;">${isMale ? 'Laki-Laki' : 'Perempuan'}</span>
           </div>
           <span style="font-size: 10px; color: #a1a1aa; font-family: monospace;">v${safeVersion}</span>
        </div>
        <div style="padding: 12px 14px; flex: 1; display: flex; flex-direction: column; justify-content: center;">
           <h4 style="margin: 0 0 4px 0; font-size: 14px; color: #18181b; font-weight: 800; text-transform: capitalize; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${safeName}</h4>
           <div style="font-size: 11px; color: #71717a; font-family: monospace;">Lahir: ${safeTl}</div>
        </div>
      </div>
    `;
    })
    .join('');

  // 2.1 Generate Knot Nodes HTML (Titik Simpul Pernikahan Persis seperti di Web)
  const knotsHtml = nodes
    .filter((n) => n.type === 'knotNode')
    .map((n) => {
      const left = n.position.x + offsetX;
      const top = n.position.y + offsetY;
      return `
      <div style="position: absolute; left: ${left}px; top: ${top}px; width: 24px; height: 24px; border-radius: 50%; background: #fef3c7; border: 2px solid #f59e0b; box-shadow: 0 2px 5px rgba(245, 158, 11, 0.3); display: flex; align-items: center; justify-content: center; font-size: 11px; z-index: 15; user-select: none; box-sizing: border-box;" title="Simpul Silsilah">
        💍
      </div>
    `;
    })
    .join('');

  // 3. Generate Edges SVG (Orthogonal Busbar / Smoothstep Siku Sempurna)
  const edgesHtml = edges
    .map((e) => {
      const sourceNode = nodes.find((n) => n.id === e.source);
      const targetNode = nodes.find((n) => n.id === e.target);
      if (!sourceNode || !targetNode) return '';

      const strokeColor = e.style?.stroke || '#18181b';
      const strokeWidth = e.style?.strokeWidth || 2;
      const strokeDash = e.style?.strokeDasharray || 'none';

      // A. Busbar Suami (Anchor) -> Knot (Multi-Marriage: Siku Tegak Lurus)
      if (e.id.startsWith('marriage-anchor-')) {
        const x1 = sourceNode.position.x + offsetX + 256;
        const y1 = sourceNode.position.y + offsetY + 80;
        const x2 = targetNode.position.x + offsetX + 12;
        const y2 = targetNode.position.y + offsetY;
        return `<path d="M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;
      }

      // B. Knot -> Istri (Partner) (Multi-Marriage: Garis Horizontal Lurus)
      if (e.id.startsWith('marriage-partner-')) {
        const x1 = sourceNode.position.x + offsetX + 24;
        const y1 = sourceNode.position.y + offsetY + 12;
        const x2 = targetNode.position.x + offsetX;
        const y2 = targetNode.position.y + offsetY + 80;
        // Garis horizontal lurus pada ketinggian simpul, lalu siku ke handle istri jika beda Y
        if (Math.abs(y1 - y2) < 3) {
          return `<path d="M ${x1} ${y1} L ${x2} ${y2}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;
        }
        return `<path d="M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;
      }

      // C. Monogamy Pasangan Kiri -> Knot (Siku Lurus)
      if (e.id.startsWith('marriage-left-')) {
        const x1 = sourceNode.position.x + offsetX + 256;
        const y1 = sourceNode.position.y + offsetY + 80;
        const x2 = targetNode.position.x + offsetX + 12;
        const y2 = targetNode.position.y + offsetY;
        return `<path d="M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;
      }

      // D. Monogamy Pasangan Kanan -> Knot (Siku Lurus)
      if (e.id.startsWith('marriage-right-')) {
        const x1 = sourceNode.position.x + offsetX;
        const y1 = sourceNode.position.y + offsetY + 80;
        const x2 = targetNode.position.x + offsetX + 12;
        const y2 = targetNode.position.y + offsetY;
        return `<path d="M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;
      }

      // E. Garis dari Knot -> Anak (Orthogonal Step Busbar Siku dengan busOffset)
      if (sourceNode.type === 'knotNode') {
        const x1 = sourceNode.position.x + offsetX + 12;
        const y1 = sourceNode.position.y + offsetY + 24;
        const x2 = targetNode.position.x + offsetX + 128;
        const y2 = targetNode.position.y + offsetY;

        const busOffset = e.data?.busOffset || 24;
        const midY = y1 + busOffset;

        if (Math.abs(x1 - x2) < 2) {
          return `<path d="M ${x1} ${y1} L ${x2} ${y2}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}" />`;
        }
        return `<path d="M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}" />`;
      }

      // F. Garis Pernikahan Langsung (Pasangan tanpa anak)
      if (e.id.startsWith('marriage-') || e.label === '💍') {
        const isSourceLeft = sourceNode.position.x <= targetNode.position.x;
        const leftNode = isSourceLeft ? sourceNode : targetNode;
        const rightNode = isSourceLeft ? targetNode : sourceNode;

        const x1 = leftNode.position.x + offsetX + 256;
        const y1 = leftNode.position.y + offsetY + 80;
        const x2 = rightNode.position.x + offsetX;
        const y2 = rightNode.position.y + offsetY + 80;
        const midX = (x1 + x2) / 2;

        return `
          <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#f59e0b" stroke-width="2.5" />
          <circle cx="${midX}" cy="${y1}" r="12" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
          <text x="${midX}" y="${y1 + 4}" font-size="11" text-anchor="middle">💍</text>
        `;
      }

      // G. Garis Single Parent ke Anak (Orthogonal Step)
      const x1 = sourceNode.position.x + offsetX + 128;
      const y1 = sourceNode.position.y + offsetY + 160;
      const x2 = targetNode.position.x + offsetX + 128;
      const y2 = targetNode.position.y + offsetY;
      const midY = y1 + (y2 - y1) / 2;

      if (Math.abs(x1 - x2) < 2) {
        return `<path d="M ${x1} ${y1} L ${x2} ${y2}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}" />`;
      }
      return `<path d="M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}" />`;
    })
    .join('');

  // 4. Wrap in valid HTML5
  const safeTreeName = escapeHtml(treeName);
  const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Silsilah: ${safeTreeName}</title>
  <style>
    body { 
      background: #fafafa; 
      margin: 0; 
      padding: 40px; 
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0 0 8px 0;
      color: #09090b;
      font-weight: 900;
      font-size: 28px;
      text-transform: uppercase;
      letter-spacing: -0.025em;
    }
    .header p {
      color: #71717a;
      font-size: 13px;
      margin: 0;
      font-family: monospace;
    }
    .canvas-container { 
      position: relative; 
      width: ${width}px; 
      height: ${height}px; 
      background: #ffffff; 
      border: 1px solid #e4e4e7; 
      border-radius: 12px;
      margin: 0 auto; 
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01); 
      overflow: hidden;
    }
    .svg-layer {
      position: absolute; 
      top: 0; 
      left: 0; 
      z-index: 1;
    }
    .nodes-layer {
      position: absolute; 
      top: 0; 
      left: 0; 
      width: 100%; 
      height: 100%; 
      z-index: 2;
    }
    .print-btn {
      display: block;
      margin: 0 auto 30px auto;
      background: #18181b;
      color: #f7e043;
      border: none;
      padding: 10px 24px;
      border-radius: 6px;
      font-weight: bold;
      font-family: monospace;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .print-btn:hover { background: #000; }
    
    @media print {
      body { padding: 0; background: white; }
      .print-btn { display: none; }
      .canvas-container { border: none; box-shadow: none; border-radius: 0; margin: 0; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${safeTreeName}</h1>
    <p>Diekspor pada: ${new Date().toLocaleString('id-ID')}</p>
  </div>
  
  <button class="print-btn" onclick="window.print()">Cetak ke PDF / Printer</button>

  <div class="canvas-container">
    <svg class="svg-layer" width="100%" height="100%">
      ${edgesHtml}
    </svg>
    <div class="nodes-layer">
      ${regularNodesHtml}
      ${knotsHtml}
    </div>
  </div>
</body>
</html>`;

  // 5. Trigger File Download
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Silsilah_${treeName.replace(/\s+/g, '_')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
