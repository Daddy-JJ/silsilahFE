import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, RefreshCw, Lock, FileText, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';

export default function ComplianceModal({
  isOpen,
  onClose,
  initialTab = 'refund', // 'refund' | 'privacy'
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200 select-none cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-zinc-200 cursor-default"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-zinc-900 text-white border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 text-[#f7e043] flex items-center justify-center font-mono font-black text-base shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight uppercase font-mono">
                Pusat Kepatuhan & Informasi Resmi
              </h2>
              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                Silsilah Keluarga Indonesia • Duitku Verified
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-zinc-200 bg-zinc-100/80 px-4 gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('refund')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-mono font-bold uppercase transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'refund'
                ? 'border-zinc-900 text-zinc-900 bg-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
            <span>Kebijakan Pengembalian Dana (Refund)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-mono font-bold uppercase transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-zinc-900 text-zinc-900 bg-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kebijakan Privasi</span>
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-zinc-700 leading-relaxed font-sans">
          {activeTab === 'refund' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-lg bg-amber-50/80 border border-amber-200/80 text-amber-900 flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs font-mono uppercase">
                    Ketentuan Produk Digital Keanggotaan:
                  </div>
                  <div className="text-[11px] mt-0.5 leading-snug">
                    Layanan Silsilah Keluarga Indonesia merupakan produk digital perangkat lunak (SaaS). Kuota dan fitur langganan aktif secara otomatis dan instan seketika setelah pembayaran terverifikasi.
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-zinc-900 uppercase font-mono text-xs mb-2">
                  1. Syarat & Jangka Waktu Pengajuan Refund
                </h3>
                <p>
                  Pengguna berhak mengajukan permohonan pengembalian dana (refund) dalam jangka waktu maksimal <strong>7 (tujuh) hari kalender</strong> terhitung sejak tanggal transaksi berhasil, apabila:
                </p>
                <ul className="list-disc pl-5 mt-1.5 space-y-1 text-zinc-600">
                  <li>Terjadi kendala teknis sistem permanen yang menyebabkan kuota anggota silsilah gagal bertambah dan tidak dapat diselesaikan oleh tim teknis kami dalam 2x24 jam.</li>
                  <li>Terjadi pendebetan ganda (*double charge*) untuk pesanan yang sama akibat gangguan koneksi gateway pembayaran.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-zinc-900 uppercase font-mono text-xs mb-2">
                  2. Pengecualian Pengembalian Dana
                </h3>
                <p>Pengembalian dana tidak dapat diberikan dalam kondisi berikut:</p>
                <ul className="list-disc pl-5 mt-1.5 space-y-1 text-zinc-600">
                  <li>Pengajuan dilakukan melebihi batas waktu 7 hari kalender sejak transaksi.</li>
                  <li>Pengguna berubah pikiran setelah fitur atau kuota silsilah telah digunakan secara aktif untuk menambahkan puluhan data anggota.</li>
                  <li>Akun pengguna dinonaktifkan karena pelanggaran hukum atau penyalahgunaan platform.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-zinc-900 uppercase font-mono text-xs mb-2">
                  3. Prosedur Klaim & Proses Pengembalian
                </h3>
                <p>
                  Untuk mengajukan refund, silakan hubungi saluran layanan pelanggan resmi kami:
                </p>
                <div className="mt-2 p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1.5 font-mono text-[11px]">
                  <div>📧 <strong>Email Support:</strong> support@silsilahkeluarga.id</div>
                  <div>💬 <strong>WhatsApp CS:</strong> 0813 2821 9697</div>
                  <div>🏢 <strong>Alamat Usaha:</strong> Apt. Sentra Timur Residence O19 12B, Jl. Sentra Primer Timur, Cakung, Jakarta Timur 13950</div>
                </div>
                <p className="mt-2 text-zinc-500 text-[11px]">
                  Sertakan <strong>Nomor Pesanan (Merchant Order ID / Referensi Duitku)</strong> dan bukti pendukung. Pengembalian dana yang disetujui akan ditransfer kembali ke rekening atau metode pembayaran asal dalam waktu <strong>3 hingga 7 hari kerja</strong> sesuai ketentuan perbankan.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-lg bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs font-mono uppercase">
                    Komitmen Perlindungan Privasi Silsilah:
                  </div>
                  <div className="text-[11px] mt-0.5 leading-snug">
                    Pohon silsilah keluarga Anda bersifat pribadi (*private by default*). Data keluarga besar Anda adalah warisan berharga yang kami lindungi dengan standar enkripsi modern.
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-zinc-900 uppercase font-mono text-xs mb-2">
                  1. Informasi yang Kami Kelola
                </h3>
                <p>
                  Kami hanya mengumpulkan data yang Anda masukkan secara sukarela untuk keperluan penyusunan bagan pohon silsilah, meliputi:
                </p>
                <ul className="list-disc pl-5 mt-1.5 space-y-1 text-zinc-600">
                  <li>Data Akun: Nama lengkap dan alamat email untuk autentikasi dan pemulihan akun.</li>
                  <li>Data Silsilah: Nama anggota keluarga, jenis kelamin, hubungan kekerabatan (ayah, ibu, pasangan, anak), serta catatan tanggal lahir/wafat.</li>
                  <li>Data Transaksi: Nomor referensi Duitku dan status pembayaran (kami <em>tidak pernah</em> menyimpan nomor kartu kredit atau PIN perbankan Anda).</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-zinc-900 uppercase font-mono text-xs mb-2">
                  2. Jaminan Tanpa Penjualan Data
                </h3>
                <p>
                  <strong>Silsilah Keluarga Indonesia tidak pernah dan tidak akan pernah menjual, menyewakan, atau membagikan data silsilah keluarga Anda kepada pihak ketiga</strong> untuk tujuan periklanan komersial atau monetisasi data.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-zinc-900 uppercase font-mono text-xs mb-2">
                  3. Hak Kendali & Ekspor Mandiri
                </h3>
                <p>
                  Sebagai pemilik silsilah (Admin Utama), Anda memiliki kendali penuh:
                </p>
                <ul className="list-disc pl-5 mt-1.5 space-y-1 text-zinc-600">
                  <li>Mengekspor bagan keluarga kapan saja ke format gambar resolusi tinggi (PNG 2x) atau dokumen HTML offline mandiri.</li>
                  <li>Mengatur siapa saja kerabat yang berhak melihat atau mengusulkan perubahan data.</li>
                  <li>Mengubah atau menghapus data anggota keluarga kapan pun Anda kehendaki.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-mono text-zinc-400">
            Terakhir Diperbarui: September 2026
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-zinc-900 hover:bg-black text-white font-mono text-xs font-bold uppercase transition-all shadow-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
