import { toPng, toJpeg } from 'html-to-image';

export async function downloadImage(getNodesBounds, getViewportForBounds, nodes, format = 'png', title = 'Silsilah_Keluarga') {
  if (nodes.length === 0) return;

  // Temukan node viewport untuk merender
  const flowElement = document.querySelector('.react-flow__viewport');
  if (!flowElement) {
    throw new Error('Kanvas silsilah tidak ditemukan');
  }

  // Hitung area total yang mencakup semua node
  const nodesBounds = getNodesBounds(nodes);
  
  // Berikan margin ekstra agar tidak mepet ujung
  const padding = 50;
  const imageWidth = nodesBounds.width + padding * 2;
  const imageHeight = nodesBounds.height + padding * 2;
  
  // Hitung transform yang diperlukan untuk menempatkan semua node tepat di tengah kanvas berukuran imageWidth x imageHeight
  const viewport = getViewportForBounds(
    nodesBounds,
    imageWidth,
    imageHeight,
    0.5,
    2,
    0 // no padding in viewport calculation because we added it to imageWidth/Height manually or vice versa
  );

  const options = {
    backgroundColor: '#f4f4f5',
    width: imageWidth,
    height: imageHeight,
    style: {
      width: `${imageWidth}px`,
      height: `${imageHeight}px`,
      transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
    },
    pixelRatio: 2, // High resolution
  };

  try {
    let dataUrl;
    if (format === 'jpeg') {
      dataUrl = await toJpeg(flowElement, options);
    } else {
      dataUrl = await toPng(flowElement, options);
    }

    const link = document.createElement('a');
    link.download = `${title}.${format}`;
    link.href = dataUrl;
    link.click();
    return true;
  } catch (error) {
    console.error('Failed to export image:', error);
    throw new Error('Gagal merender gambar. Coba perkecil (zoom out) kanvas lalu coba lagi.');
  }
}
