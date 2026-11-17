import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropUtils';
import { X, Check, Loader2, AlertCircle } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export default function ImageCropperModal({ isOpen, imageSrc, onClose, onCropComplete }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useBodyScrollLock(isOpen);

  // Isolasi tombol Escape agar tidak mematikan modal induk (EditMemberModal)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        if (!isProcessing && onClose) {
          onClose();
        }
      }
    };
    // Menggunakan capture phase (true) agar dieksekusi sebelum listener global pada App.jsx
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose, isProcessing]);

  // PENTING: useCallback harus SELALU dipanggil sebelum early return
  // agar urutan pemanggilan hooks konsisten di setiap render (Rules of Hooks)
  const handleCropComplete = useCallback((croppedArea, cap) => {
    setCroppedAreaPixels(cap);
  }, []);

  if (!isOpen || !imageSrc) return null;

  const showCroppedImage = async () => {
    setErrorMsg('');
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
      setErrorMsg(e?.message || 'Gagal memproses dan memotong gambar. Silakan coba kembali.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cropper-modal-title"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none"
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden flex flex-col h-[500px]">
        {/* Header */}
        <div className="px-4 py-3 border-b flex items-center justify-between bg-zinc-50">
          <h3 id="cropper-modal-title" className="font-bold text-sm uppercase tracking-wide">
            Posisikan Wajah
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Tutup pemotong foto"
            className="p-1 text-zinc-400 hover:text-black transition-colors"
          >
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
        <div className="p-4 bg-white flex flex-col gap-3">
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
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
