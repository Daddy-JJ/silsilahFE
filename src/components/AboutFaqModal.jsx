import React, { useState } from 'react';
import { X, Shield, HelpCircle, ChevronDown, ChevronUp, Check, AlertTriangle, BookOpen, Layers } from 'lucide-react';

export default function AboutFaqModal({ isOpen, onClose }) {
  const [activeFaq, setActiveFaq] = useState(null);

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'Apakah data keluarga saya dapat dilihat oleh sembarang orang di internet?',
      a: 'Tidak. Silsilah Keluarga menerapkan prinsip Multi-Tenant Isolation (privasi tertutup). Diagram silsilah Anda hanya bisa diakses oleh orang-orang yang secara eksplisit diundang oleh Admin Utama. Bahkan pengguna lain yang terdaftar di platform tidak dapat melihat atau menebak ID silsilah keluarga Anda.',
    },
    {
      q: 'Berapa banyak anggota keluarga yang bisa saya masukkan?',
      a: 'Pada fase 1 saat ini, setiap semesta pohon keluarga memiliki kuota hingga 30 anggota keluarga untuk menjaga performa render graf tetap mulus dan bebas lag. Batas kuota yang lebih besar akan tersedia pada fase upgrade berikutnya.',
    },
    {
      q: 'Bagaimana jika kerabat salah mengedit nama atau data leluhur utama?',
      a: 'Sistem menerapkan kontrol otorisasi dua lapis. Kerabat yang berstatus Kontributor TIDAK DAPAT langsung mengubah data di kanvas. Setiap tombol "Ubah" yang diklik Kontributor otomatis menjadi Pengajuan Usulan (Proposal). Perubahan baru hanya akan diterapkan ke silsilah setelah disetujui secara resmi oleh Admin Utama.',
    },
    {
      q: 'Apakah aplikasi ini mendukung relasi pernikahan tanpa anak dan poligami?',
      a: 'Ya, 100%! Berbeda dengan aplikasi silsilah sederhana lainnya, relasi pernikahan di platform ini tersimpan permanen di database server sebagai entitas mandiri. Anda dapat mendaftarkan pasangan yang belum memiliki anak, serta suami dengan lebih dari satu istri sah (poligami) yang masing-masing memiliki garis percabangan anak terpisah secara rapi.',
    },
    {
      q: 'Apakah saya bisa mencetak bagan silsilah atau mengirimkannya ke grup WhatsApp keluarga?',
      a: 'Tentu saja. Platform menyediakan dua tombol ekspor mandiri: (1) Ekspor Gambar PNG Resolusi Tinggi (faktor skala 2x) yang siap cetak atau dibagikan ke WhatsApp, dan (2) Ekspor File HTML Mandiri yang dapat dibuka langsung di browser HP maupun laptop tanpa perlu koneksi internet atau server.',
    },
    {
      q: 'Bagaimana cara menggeser dan memperbesar diagram silsilah di laptop?',
      a: 'Gunakan gestur dua jari pada trackpad (geser 2 jari untuk menggeser kanvas ke segala arah, dan cubit untuk memperbesar/memperkecil). Anda juga bisa mengklik tombol sentral "Rapikan Layout" kapan saja untuk menata posisi simpul keluarga secara matematis simetris ideal.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl overflow-hidden border border-zinc-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-xs bg-zinc-900 text-[#f7e043] font-mono font-black text-xs flex items-center justify-center">
              ?
            </div>
            <div>
              <h3 className="font-extrabold text-zinc-900 text-sm tracking-tight uppercase font-mono">
                Tentang Platform & Matriks Hak Akses
              </h3>
              <div className="text-[10px] text-zinc-400 font-mono">
                PANDUAN LENGKAP FITUR, OTORITAS & FAQ CALON PENGGUNA
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-8 text-xs text-zinc-700 leading-relaxed">
          {/* Section 1: Visi & Fungsi */}
          <section className="space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-zinc-900 text-sm font-mono uppercase">
              <BookOpen className="w-4 h-4 text-zinc-700" />
              <span>Fungsi & Visi Silsilah Keluarga</span>
            </div>
            <p>
              <strong>Silsilah Keluarga</strong> adalah platform web kolaboratif yang didedikasikan untuk mendokumentasikan, merawat, dan memvisualisasikan garis keturunan keluarga besar lintas generasi. Menggabungkan ketelitian algoritma graf simetris (*Bottom-Up Subtree*) dengan estetika modern bergaya arsitektur editorial neo-monokrom, platform ini memastikan nasab keluarga besar tercatat rapi, aman dari kekeliruan data, dan mudah diwariskan ke anak-cucu.
            </p>
          </section>

          {/* Section 2: Matriks Perbandingan Hak Akses */}
          <section className="space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-zinc-900 text-sm font-mono uppercase">
              <Shield className="w-4 h-4 text-zinc-700" />
              <span>Matriks Perbandingan Hak Akses Pengguna</span>
            </div>
            <p className="text-zinc-500">
              Platform membedakan tiga tingkatan peran pengguna secara ketat untuk menjamin keamanan dan keabsahan data silsilah:
            </p>

            <div className="border border-zinc-300 rounded-lg overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-900 text-white font-mono text-[11px] uppercase tracking-wider">
                    <th className="p-3 border-b border-zinc-800">Fitur / Aksi</th>
                    <th className="p-3 border-b border-zinc-800 text-center text-[#f7e043]">👑 ADMIN_UTAMA</th>
                    <th className="p-3 border-b border-zinc-800 text-center text-blue-300">✍️ KONTRIBUTOR</th>
                    <th className="p-3 border-b border-zinc-800 text-center text-zinc-300">👀 VIEWER</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-[11px]">
                  <tr className="hover:bg-zinc-50/80">
                    <td className="p-3 font-medium text-zinc-900">Melihat Pohon & Kanvas Interaktif</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✅</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✅</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✅</td>
                  </tr>
                  <tr className="hover:bg-zinc-50/80">
                    <td className="p-3 font-medium text-zinc-900">Navigasi Gestur 2 Jari, MiniMap & Cari Nama</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✅</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✅</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✅</td>
                  </tr>
                  <tr className="hover:bg-zinc-50/80">
                    <td className="p-3 font-medium text-zinc-900">Ekspor Gambar PNG HD (2x) & File HTML Mandiri</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✅</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✅</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✅</td>
                  </tr>
                  <tr className="hover:bg-zinc-50/80">
                    <td className="p-3 font-medium text-zinc-900">Menambah Anggota Baru (`+ Anak` / `Pasangan`)</td>
                    <td className="p-3 text-center font-semibold text-emerald-700">✅ Langsung</td>
                    <td className="p-3 text-center font-semibold text-emerald-700">✅ Langsung</td>
                    <td className="p-3 text-center text-zinc-400">❌ Tidak Ada</td>
                  </tr>
                  <tr className="hover:bg-zinc-50/80">
                    <td className="p-3 font-medium text-zinc-900">Mengubah Data Anggota (Nama, Tgl Lahir, Gender)</td>
                    <td className="p-3 text-center font-semibold text-emerald-700">✅ Langsung Simpan</td>
                    <td className="p-3 text-center font-semibold text-amber-700">⚠️ Usulan (Proposal)</td>
                    <td className="p-3 text-center text-zinc-400">❌ Tidak Ada</td>
                  </tr>
                  <tr className="hover:bg-zinc-50/80">
                    <td className="p-3 font-medium text-zinc-900">Menghapus Anggota atau Hubungan Pasangan</td>
                    <td className="p-3 text-center font-semibold text-emerald-700">✅ Otoritas Penuh</td>
                    <td className="p-3 text-center text-rose-600">❌ Dilarang</td>
                    <td className="p-3 text-center text-zinc-400">❌ Tidak Ada</td>
                  </tr>
                  <tr className="hover:bg-zinc-50/80">
                    <td className="p-3 font-medium text-zinc-900">Meninjau & Memutuskan Usulan (Setujui / Tolak)</td>
                    <td className="p-3 text-center font-semibold text-emerald-700">✅ Otoritas Penuh</td>
                    <td className="p-3 text-center text-zinc-400">❌ Hanya Pantau</td>
                    <td className="p-3 text-center text-zinc-400">❌ Tidak Ada</td>
                  </tr>
                  <tr className="hover:bg-zinc-50/80">
                    <td className="p-3 font-medium text-zinc-900">Mengatur Urutan Lahir Anak (Sulung/Bungsu `▲/▼`)</td>
                    <td className="p-3 text-center font-semibold text-emerald-700">✅</td>
                    <td className="p-3 text-center font-semibold text-emerald-700">✅</td>
                    <td className="p-3 text-center text-zinc-400">❌ Tidak Ada</td>
                  </tr>
                  <tr className="hover:bg-zinc-50/80">
                    <td className="p-3 font-medium text-zinc-900">Mengundang & Mengelola Kolaborator Pohon</td>
                    <td className="p-3 text-center font-semibold text-emerald-700">✅ Otoritas Penuh</td>
                    <td className="p-3 text-center text-zinc-400">❌</td>
                    <td className="p-3 text-center text-zinc-400">❌</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: FAQ */}
          <section className="space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-zinc-900 text-sm font-mono uppercase">
              <HelpCircle className="w-4 h-4 text-zinc-700" />
              <span>Pertanyaan yang Sering Diajukan (FAQ)</span>
            </div>

            <div className="space-y-2">
              {faqs.map((faq, idx) => {
                const isOpenFaq = activeFaq === idx;
                return (
                  <div key={idx} className="border border-zinc-200 rounded-md overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpenFaq ? null : idx)}
                      className="w-full p-3.5 text-left font-bold text-zinc-900 text-xs flex items-center justify-between hover:bg-zinc-50 transition-colors gap-3"
                    >
                      <span>{faq.q}</span>
                      {isOpenFaq ? (
                        <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                      )}
                    </button>
                    {isOpenFaq && (
                      <div className="px-3.5 pb-3.5 pt-1 text-xs text-zinc-600 border-t border-zinc-100 bg-zinc-50/50 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-zinc-900 hover:bg-black text-[#f7e043] rounded transition-colors shadow-xs"
          >
            Saya Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
