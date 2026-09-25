import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Shield,
  CreditCard,
  QrCode,
  Lock,
  ExternalLink,
  AlertCircle,
  Loader2,
  Users,
} from 'lucide-react';
import { api } from '../services/api';

// 3 Paket Resmi sesuai spesifikasi verifikasi Duitku
const OFFICIAL_PLANS = [
  {
    kode_paket: 'KELUARGA_BESAR',
    nama_paket: 'Paket Keluarga Besar',
    target_max_members: 100,
    target_max_trees: 2,
    target_max_collaborators: 3,
    harga_normal: 67000,
    promo_badge: 'Populer',
    deskripsi:
      'Maks. 100 anggota keluarga tiap semesta, hingga 2 semesta silsilah, kolaborator maks. 3 orang, ekspor bagan resolusi tinggi.',
    features: [
      'Kapasitas hingga 100 Anggota per pohon',
      'Kelola hingga 2 Semesta Silsilah',
      'Maksimal 3 Kolaborator tambahan',
      'Ekspor bagan resolusi tinggi (PNG 2x & HTML)',
      'Akses selamanya dengan perpanjangan tahunan fleksibel',
    ],
  },
  {
    kode_paket: 'DINASTI',
    nama_paket: 'Paket Dinasti',
    target_max_members: 200,
    target_max_trees: 4,
    target_max_collaborators: 5,
    harga_normal: 99000,
    promo_badge: 'Terlengkap',
    deskripsi:
      'Maks. 200 anggota keluarga tiap semesta, hingga 4 semesta silsilah, kolaborator maks. 5 orang, dukungan prioritas.',
    features: [
      'Kapasitas hingga 200 Anggota per pohon',
      'Kelola hingga 4 Semesta Silsilah',
      'Maksimal 5 Kolaborator tambahan',
      'Dukungan Layanan Pelanggan Prioritas (VIP CS)',
      'Ekspor resolusi tinggi & cetak mandiri tanpa batas',
      'Cocok untuk trah, marga, atau keluarga besar',
    ],
  },
];

export default function UpgradePlanModal({
  isOpen,
  onClose,
  currentTree,
  onUpgradeSuccess,
  showNotification,
}) {
  const [plans, setPlans] = useState(OFFICIAL_PLANS);
  const [selectedPlanCode, setSelectedPlanCode] = useState('KELUARGA_BESAR');
  const [paymentMethod, setPaymentMethod] = useState('SP'); // SP = ShopeePay / QRIS via Duitku
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Muat data paket aktif dari backend (jika tersedia)
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setIsLoading(false);

      api.payments
        .getPlans()
        .then((res) => {
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            // Gabungkan data backend dengan features visual
            const merged = res.data
              .filter((p) => Number(p.harga_normal) > 0)
              .map((p) => {
                const matched = OFFICIAL_PLANS.find(
                  (op) =>
                    op.kode_paket === p.kode_paket ||
                    op.target_max_members === p.target_max_members
                );
                return {
                  ...p,
                  features: matched?.features || [
                    `Kapasitas hingga ${p.target_max_members} Anggota`,
                    `Hingga ${p.target_max_trees || 1} Semesta Silsilah`,
                    `Maksimal ${p.target_max_collaborators || 3} Kolaborator`,
                  ],
                };
              });
            if (merged.length > 0) {
              setPlans(merged);
              setSelectedPlanCode(merged[0].kode_paket);
            }
          }
        })
        .catch((err) => {
          console.warn('[UpgradePlanModal] Menggunakan fallback paket lokal:', err.message);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentMaxMembers = currentTree?.max_members || 30;
  const activePlan = plans.find((p) => p.kode_paket === selectedPlanCode) || plans[0];

  const handleProcessPayment = async () => {
    if (!currentTree?.id) {
      setErrorMessage('Pohon silsilah tidak valid.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // 1. Panggil Inquiry Backend
      const payload = {
        treeId: currentTree.id,
        planId: activePlan.id || activePlan.kode_paket, // Fallback jika ID database belum sinkron
        paymentMethod: paymentMethod || 'SP',
        returnUrl: typeof window !== 'undefined' ? window.location.origin : 'https://silsilahkeluarga.id',
      };

      const res = await api.payments.inquiry(payload);

      if (!res.success || !res.data) {
        throw new Error(res.message || 'Gagal memulai inquiry pembayaran.');
      }

      const { reference, paymentUrl, merchantOrderId } = res.data;

      // 2. Jalankan Duitku Pop SDK (prioritaskan window.duitku.run atau window.checkout.process)
      const checkoutHandlers = {
        successEvent: function (result) {
          setIsLoading(false);
          const oneYearLater = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
          if (currentTree?.id) {
            try {
              localStorage.setItem(`silsilah_sub_${currentTree.id}`, oneYearLater);
              localStorage.setItem(`silsilah_plan_${currentTree.id}`, activePlan.nama_paket);
            } catch (e) {
              console.warn('Gagal menyimpan masa aktif ke localStorage:', e);
            }
          }
          if (showNotification) {
            showNotification(
              'Pembayaran berhasil diverifikasi! Kuota silsilah Anda telah resmi ditingkatkan.'
            );
          }
          if (onUpgradeSuccess) {
            onUpgradeSuccess({
              ...result,
              targetMaxMembers: activePlan.target_max_members,
              planCode: activePlan.kode_paket,
              planName: activePlan.nama_paket,
              subscriptionExpiresAt: oneYearLater,
              merchantOrderId,
            });
          }
          onClose();
        },
        pendingEvent: function (result) {
          setIsLoading(false);
          if (showNotification) {
            showNotification(
              'Transaksi pembayaran telah dibuat. Silakan selesaikan pembayaran Anda.',
              'info'
            );
          }
        },
        errorEvent: function (result) {
          console.error('[Duitku Checkout Error]', result);
          setIsLoading(false);
          setErrorMessage(
            result?.statusMessage || 'Pembayaran gagal diproses. Silakan coba kembali.'
          );
          if (showNotification) {
            showNotification('Gagal memproses pembayaran Duitku.', 'error');
          }
        },
        closeEvent: function () {
          setIsLoading(false);
        },
      };

      if (typeof window !== 'undefined' && window.duitku && typeof window.duitku.run === 'function' && reference) {
        setIsLoading(false);
        try {
          window.duitku.run(reference, checkoutHandlers);
        } catch {
          window.duitku.run(reference);
        }
      } else if (typeof window !== 'undefined' && window.checkout && reference) {
        window.checkout.process(reference, checkoutHandlers);
      } else if (paymentUrl) {
        // Fallback: Jika pop JS gagal dimuat / diblokir ekstensi browser, buka paymentUrl di tab baru
        setIsLoading(false);
        window.open(paymentUrl, '_blank');
        if (showNotification) {
          showNotification(
            'Halaman pembayaran telah dibuka di tab baru. Silakan selesaikan pembayaran Anda.',
            'info'
          );
        }
      } else {
        throw new Error(
          'Tidak dapat memuat modul pembayaran Duitku Pop. Pastikan koneksi internet stabil.'
        );
      }
    } catch (err) {
      console.error('[Upgrade Payment Error]', err);
      setIsLoading(false);
      setErrorMessage(
        err.message || 'Terjadi kesalahan saat memproses pesanan ke Payment Gateway.'
      );
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200 select-none cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-zinc-200 cursor-default flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="relative p-5 sm:p-6 bg-zinc-900 text-white border-b border-zinc-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#f7e043] text-black shadow-xs">
              <Sparkles className="w-3 h-3" />
              <span>DUITKU SANDBOX CHECKOUT</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              Semesta: <strong className="text-zinc-200">{currentTree?.nama_silsilah || 'Pohon'}</strong>
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black tracking-tight uppercase font-mono">
            Upgrade Kuota & Paket Silsilah
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Status saat ini: <strong className="text-[#f7e043]">Kuota {currentMaxMembers} Anggota</strong>. Pilih paket untuk menambah kapasitas keluarga besar Anda.
          </p>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Kendala Pembayaran:</span> {errorMessage}
              </div>
            </div>
          )}

          {/* Pilihan Paket Upgrade */}
          <div className="space-y-3">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 block">
              1. Pilih Paket Keanggotaan:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plans.map((p) => {
                const isSelected = selectedPlanCode === p.kode_paket;
                const formattedPrice = Number(p.harga_promo || p.harga_normal).toLocaleString(
                  'id-ID'
                );

                return (
                  <div
                    key={p.kode_paket}
                    onClick={() => setSelectedPlanCode(p.kode_paket)}
                    className={`relative p-4 sm:p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-zinc-900 bg-amber-50/20 ring-2 ring-[#f7e043] shadow-md'
                        : 'border-zinc-200 bg-zinc-50/50 hover:border-zinc-400'
                    }`}
                  >
                    {p.promo_badge && (
                      <div className="absolute -top-2.5 right-3 bg-[#f7e043] text-black font-mono font-bold text-[9px] uppercase px-2 py-0.5 rounded-full border border-yellow-500 shadow-2xs">
                        {p.promo_badge}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs font-bold text-zinc-600 uppercase">
                          {p.nama_paket}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-zinc-900 fill-[#f7e043]" />
                        )}
                      </div>

                      <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-xl sm:text-2xl font-black font-mono text-zinc-900">
                          Rp {formattedPrice}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">/ tahun</span>
                      </div>

                      <ul className="space-y-1.5 text-[11px] text-zinc-700 font-sans border-t border-zinc-200/80 pt-3">
                        {p.features?.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metode Pembayaran Duitku */}
          <div className="space-y-3 pt-2 border-t border-zinc-100">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 block">
              2. Metode Pembayaran (Duitku Sandbox):
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setPaymentMethod('SP')}
                className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'SP'
                    ? 'border-zinc-900 bg-zinc-50 font-bold ring-1 ring-zinc-900'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  checked={paymentMethod === 'SP'}
                  onChange={() => setPaymentMethod('SP')}
                  className="accent-zinc-900"
                />
                <QrCode className="w-5 h-5 text-zinc-800" />
                <div className="text-xs">
                  <div className="text-zinc-900 font-bold">QRIS & E-Wallet</div>
                  <div className="text-[10px] font-mono text-zinc-500">
                    GoPay, OVO, DANA, ShopeePay
                  </div>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod('VA')}
                className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'VA'
                    ? 'border-zinc-900 bg-zinc-50 font-bold ring-1 ring-zinc-900'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  checked={paymentMethod === 'VA'}
                  onChange={() => setPaymentMethod('VA')}
                  className="accent-zinc-900"
                />
                <CreditCard className="w-5 h-5 text-zinc-800" />
                <div className="text-xs">
                  <div className="text-zinc-900 font-bold">Virtual Account (VA)</div>
                  <div className="text-[10px] font-mono text-zinc-500">
                    BCA, Mandiri, BNI, BRI, Permata
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Duitku Notice & Security */}
          <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 flex items-start gap-2.5 text-xs text-zinc-600 font-sans">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-zinc-800 font-mono text-[11px] uppercase block">
                Verifikasi Transaksi Otomatis:
              </span>
              Produk digital keanggotaan langsung aktif seketika setelah pembayaran terverifikasi di Duitku Sandbox Pop-Up.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-zinc-50 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-center sm:text-left">
            <div className="text-[10px] font-mono uppercase text-zinc-400">Total Pembayaran:</div>
            <div className="text-lg font-black font-mono text-zinc-900">
              Rp {Number(activePlan.harga_promo || activePlan.harga_normal).toLocaleString('id-ID')}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg border border-zinc-300 hover:bg-zinc-100 text-zinc-700 font-mono text-xs font-bold uppercase transition-colors"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleProcessPayment}
              disabled={isLoading}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg bg-[#f7e043] hover:bg-yellow-400 text-black font-mono text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Bayar via Duitku Pop</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
