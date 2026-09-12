export function exportTreeAsHTML(nodes, edges, treeName) {
  if (nodes.length === 0) return;

  // 1. Calculate bounding box of the tree to set document size
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  nodes.forEach((n) => {
    if (n.position.x < minX) minX = n.position.x;
    if (n.position.y < minY) minY = n.position.y;
    // Approximate node dimensions
    if (n.position.x + 256 > maxX) maxX = n.position.x + 256; 
    if (n.position.y + 120 > maxY) maxY = n.position.y + 120;
  });

  const padding = 100;
  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;
  const offsetX = -minX + padding;
  const offsetY = -minY + padding;

  // 2. Generate Nodes HTML (Absolute positioned divs)
  const nodesHtml = nodes
    .filter((n) => n.type !== 'knotNode')
    .map((n) => {
      const isMale = n.data?.jenis_kelamin === 'L';
      const left = n.position.x + offsetX;
      const top = n.position.y + offsetY;
      const genderLabel = isMale ? 'L' : 'P';
      const color = isMale ? '#18181b' : '#27272a'; // charcoal
      
      const tl = n.data?.tanggal_lahir ? n.data.tanggal_lahir.split('T')[0] : 'Tidak diketahui';

      return `
      <div style="position: absolute; left: ${left}px; top: ${top}px; width: 256px; background: #ffffff; border: 2px solid ${color}; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); font-family: ui-sans-serif, system-ui, sans-serif; overflow: hidden; z-index: 10;">
        <div style="background: #f4f4f5; padding: 8px 12px; border-bottom: 1px solid #e4e4e7; display: flex; align-items: center; justify-content: space-between;">
           <div style="display: flex; align-items: center; gap: 8px;">
             <span style="background: #f7e043; color: black; font-weight: 900; width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; border-radius: 4px; font-size: 11px; font-family: monospace;">${genderLabel}</span>
             <span style="font-size: 10px; color: #71717a; font-weight: bold; text-transform: uppercase;">${isMale ? 'Laki-Laki' : 'Perempuan'}</span>
           </div>
           <span style="font-size: 10px; color: #a1a1aa; font-family: monospace;">v${n.data?.version || 1}</span>
        </div>
        <div style="padding: 14px;">
           <h4 style="margin: 0 0 6px 0; font-size: 14px; color: #18181b; font-weight: 800; text-transform: capitalize;">${n.data?.nama_lengkap}</h4>
           <div style="font-size: 11px; color: #71717a;">Lahir: ${tl}</div>
        </div>
      </div>
    `;
    })
    .join('');

  // 3. Generate Edges SVG (Bezier curves)
  const edgesHtml = edges
    .map((e) => {
      const sourceNode = nodes.find((n) => n.id === e.source);
      const targetNode = nodes.find((n) => n.id === e.target);
      if (!sourceNode || !targetNode) return '';

      // Garis Pasangan Kiri -> Knot
      if (e.id.startsWith('marriage-left-')) {
        const x1 = sourceNode.position.x + offsetX + 256;
        const y1 = sourceNode.position.y + offsetY + 60;
        const x2 = targetNode.position.x + offsetX + 12;
        const y2 = targetNode.position.y + offsetY;
        return `<path d="M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2}" fill="none" stroke="#f59e0b" stroke-width="2.5" />`;
      }

      // Garis Pasangan Kanan -> Knot
      if (e.id.startsWith('marriage-right-')) {
        const x1 = sourceNode.position.x + offsetX;
        const y1 = sourceNode.position.y + offsetY + 60;
        const x2 = targetNode.position.x + offsetX + 12;
        const y2 = targetNode.position.y + offsetY;
        return `
          <path d="M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2}" fill="none" stroke="#f59e0b" stroke-width="2.5" />
          <circle cx="${x2}" cy="${y2 + 12}" r="12" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
          <text x="${x2}" y="${y2 + 16}" font-size="11" text-anchor="middle">💍</text>
        `;
      }

      // Garis dari Knot -> Anak
      if (sourceNode.type === 'knotNode') {
        const x1 = sourceNode.position.x + offsetX + 12;
        const y1 = sourceNode.position.y + offsetY + 12;
        const x2 = targetNode.position.x + offsetX + 128;
        const y2 = targetNode.position.y + offsetY;
        const cy = y1 + (y2 - y1) / 2;
        return `<path d="M ${x1} ${y1} C ${x1} ${cy}, ${x2} ${cy}, ${x2} ${y2}" fill="none" stroke="#18181b" stroke-width="2" />`;
      }

      // Garis Pernikahan Langsung (Pasangan tanpa anak)
      if (e.id.startsWith('marriage-') || e.label === '💍') {
        const isSourceLeft = sourceNode.position.x <= targetNode.position.x;
        const leftNode = isSourceLeft ? sourceNode : targetNode;
        const rightNode = isSourceLeft ? targetNode : sourceNode;

        const x1 = leftNode.position.x + offsetX + 256;
        const y1 = leftNode.position.y + offsetY + 60;
        const x2 = rightNode.position.x + offsetX;
        const y2 = rightNode.position.y + offsetY + 60;
        const midX = (x1 + x2) / 2;

        return `
          <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#f59e0b" stroke-width="2.5" />
          <circle cx="${midX}" cy="${y1}" r="12" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
          <text x="${midX}" y="${y1 + 4}" font-size="11" text-anchor="middle">💍</text>
        `;
      }

      // Garis Single Parent ke Anak
      const x1 = sourceNode.position.x + offsetX + 128;
      const y1 = sourceNode.position.y + offsetY + 110;
      const x2 = targetNode.position.x + offsetX + 128;
      const y2 = targetNode.position.y + offsetY;

      const isAyah = sourceNode.data?.jenis_kelamin === 'L';
      const strokeColor = isAyah ? '#18181b' : '#a1a1aa';
      const strokeDash = isAyah ? 'none' : '6,6';
      const cy = y1 + (y2 - y1) / 2;

      return `<path d="M ${x1} ${y1} C ${x1} ${cy}, ${x2} ${cy}, ${x2} ${y2}" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-dasharray="${strokeDash}" />`;
    })
    .join('');

  // 4. Wrap in valid HTML5
  const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Silsilah: ${treeName}</title>
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
    <h1>${treeName}</h1>
    <p>Diekspor pada: ${new Date().toLocaleString('id-ID')}</p>
  </div>
  
  <button class="print-btn" onclick="window.print()">Cetak ke PDF / Printer</button>

  <div class="canvas-container">
    <svg class="svg-layer" width="100%" height="100%">
      ${edgesHtml}
    </svg>
    <div class="nodes-layer">
      ${nodesHtml}
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
