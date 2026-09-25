import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropUtils';
import { X, Check, Loader2 } from 'lucide-react';

export default function ImageCropperModal({ isOpen, imageSrc, onClose, onCropComplete }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // PENTING: useCallback harus SELALU dipanggil sebelum early return
  // agar urutan pemanggilan hooks konsisten di setiap render (Rules of Hooks)
  const handleCropComplete = useCallback((croppedArea, cap) => {
    setCroppedAreaPixels(cap);
  }, []);

  if (!isOpen || !imageSrc) return null;

  const showCroppedImage = async () => {
    try {
      setIsProcessing(true);
      const croppedImageBlobUrl = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        0
      );
      
      // Kirim URL blob hasil crop ke parent
      onCropComplete(croppedImageBlobUrl);
    } catch (e) {
      console.error(e);
      alert('Gagal memotong gambar.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden flex flex-col h-[500px]">
        {/* Header */}
        <div className="px-4 py-3 border-b flex items-center justify-between bg-zinc-50">
          <h3 className="font-bold text-sm uppercase tracking-wide">Posisikan Wajah</h3>
          <button onClick={onClose} disabled={isProcessing} className="p-1 text-zinc-400 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper Area */}
        <div className="relative flex-1 bg-zinc-900 w-full h-full">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1} // 1:1 aspect ratio for avatars
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={handleCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        {/* Controls */}
        <div className="p-4 bg-white flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-zinc-500">ZOOM</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(e.target.value)}
              className="w-full accent-zinc-900"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-bold uppercase border border-zinc-300 rounded hover:bg-zinc-100 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={showCroppedImage}
              disabled={isProcessing}
              className="px-4 py-2 flex items-center gap-2 text-xs font-bold uppercase bg-zinc-900 text-[#f7e043] rounded hover:bg-black transition-colors"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>Terapkan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
