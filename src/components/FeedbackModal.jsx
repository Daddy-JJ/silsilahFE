import React, { useState } from 'react';
import {
  X,
  Send,
  MessageSquarePlus,
  Lightbulb,
  Bug,
  MessageCircle,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import { api } from '../services/api';

const CATEGORIES = [
  {
    id: 'GENERAL_INQUIRY',
    label: 'Pertanyaan & Saran Umum',
    description: 'Pertanyaan umum, masukan pelayanan, atau aspirasi',
    icon: MessageCircle,
    color: 'text-sky-500',
  },
  {
    id: 'BUG_REPORT',
    label: 'Laporan Kendala / Eror',
    description: 'Gangguan teknis, eror sistem, atau masalah data',
    icon: Bug,
    color: 'text-rose-500',
  },
  {
    id: 'FEATURE_REQUEST',
    label: 'Usulan Fitur Baru',
    description: 'Ide fitur atau penyempurnaan alur kerja silsilah',
    icon: Lightbulb,
    color: 'text-amber-500',
  },
  {
    id: 'UI_UX_FEEDBACK',
    label: 'Tampilan & Antarmuka',
    description: 'Kritik atau saran visual antarmuka & kenyamanan',
    icon: Sparkles,
    color: 'text-purple-500',
  },
  {
    id: 'BILLING_ISSUE',
    label: 'Langganan & Pembayaran',
    description: 'Kendala seputar paket, pembayaran, atau kuota',
    icon: CreditCard,
    color: 'text-emerald-500',
  },
];

export default function FeedbackModal({
  isOpen,
  onClose,
  user,
  showNotification,
}) {
  const [category, setCategory] = useState('GENERAL_INQUIRY');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 3) {
      setErrorMessage('Mohon tuliskan pesan atau saran Anda minimal 3 karakter.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        category,
        message: message.trim(),
      };

      const res = await api.feedback.send(payload);
      if (res && res.success === false) {
        throw new Error(res.message || 'Gagal mengirim masukan.');
      }

      if (showNotification) {
        showNotification(
          'Terima kasih! Masukan Anda telah berhasil dikirim ke tim pengembang.'
        );
      }

      setMessage('');
      setCategory('GENERAL_INQUIRY');
      onClose();
    } catch (err) {
      console.error('[Feedback Submit Error]', err);
      setErrorMessage(err.message || 'Gagal mengirim masukan. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200 select-none cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-zinc-200 cursor-default flex flex-col"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-zinc-900 text-white border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 text-[#f7e043] flex items-center justify-center shadow-xs">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight uppercase font-mono">
                Beri Masukan & Saran
              </h2>
              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                Suara Anda Sangat Berharga Bagi Pengembang
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-mono">
              {errorMessage}
            </div>
          )}

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-zinc-700 mb-2">
              Kategori Masukan:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CATEGORIES.map((cat, idx) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                const isLast = idx === CATEGORIES.length - 1;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-start gap-2.5 p-2.5 sm:p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      isLast ? 'sm:col-span-2' : ''
                    } ${
                      isSelected
                        ? 'border-zinc-900 bg-zinc-900 text-white shadow-xs'
                        : 'border-zinc-200 bg-zinc-50/70 hover:bg-zinc-100/70 text-zinc-700'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        isSelected ? 'text-[#f7e043]' : cat.color
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs font-sans leading-tight">
                        {cat.label}
                      </div>
                      <div
                        className={`text-[10px] line-clamp-1 mt-0.5 ${
                          isSelected ? 'text-zinc-300' : 'text-zinc-400'
                        }`}
                      >
                        {cat.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description Textarea */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-zinc-700 mb-2">
              Pesan / Penjelasan Detail:
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ceritakan pertanyaan, kendala yang Anda alami, atau jelaskan ide fitur yang ingin Anda usulkan untuk aplikasi silsilah ini..."
              maxLength={2000}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 text-xs sm:text-sm text-zinc-800 placeholder:text-zinc-400 font-sans transition-all resize-none outline-none"
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 mt-1">
              <span>Minimal 3 karakter</span>
              <span>{message.length}/2000 karakter</span>
            </div>
          </div>

          {/* User Contact Footnote */}
          {user?.email && (
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span>Pengirim: <strong>{user.email}</strong></span>
              <span className="text-zinc-400 text-[10px]">Tanggapan via email</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-mono text-xs font-bold uppercase transition-colors cursor-pointer"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-zinc-900 hover:bg-black disabled:bg-zinc-400 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-xs active:scale-98 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-[#f7e043]" />
              <span>{isSubmitting ? 'Mengirim...' : 'Kirim Masukan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
