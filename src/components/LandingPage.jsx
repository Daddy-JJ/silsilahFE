import React from 'react';
import {
  GitBranch,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  Heart,
  Users,
  CheckCircle2,
  Lock,
  Download,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Zap,
} from 'lucide-react';
import logoApp from '../assets/logo-nexus.svg';

export default function LandingPage({ onOpenAuth, onOpenAboutFaq }) {
  return (
    <div className="w-full h-full min-h-screen overflow-y-auto overflow-x-hidden bg-[#fafafa] text-zinc-900 font-sans flex flex-col selection:bg-[#f7e043] selection:text-black">
      {/* Top Editorial Ticker */}
      <div className="h-7 bg-zinc-900 text-zinc-400 border-b border-zinc-800 px-6 flex items-center justify-between text-[10px] font-mono tracking-widest uppercase">
        <div className="flex items-center gap-2">
          <span className="text-[#f7e043] font-bold">🌳 RAWAT & ABADIKAN SILSILAH KELUARGA BESAR ANDA</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-zinc-400">
          <span>PRIVAT & AMAN</span>
          <span>•</span>
          <span>AKSES BERSAMA KELUARGA</span>
          <span>•</span>
          <span className="text-[#f7e043] font-semibold">MULAI GRATIS</span>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="h-16 bg-white border-b border-zinc-200 px-6 md:px-12 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <img
            src={logoApp}
            alt="Logo Silsilah Keluarga — Platform Pohon Silsilah Online Indonesia"
            className="w-10 h-10 object-contain"
          />
          <div>
            <span className="font-black text-zinc-900 text-base leading-none tracking-tight block">
              Silsilah<span className="font-black"> Keluarga Indonesia</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <a
            href="#harga"
            className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
            <span>Paket & Harga</span>
          </a>

          <button
            type="button"
            onClick={onOpenAboutFaq}
            className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden sm:inline">Tentang & FAQ</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenAuth(false)}
            className="text-xs font-mono font-bold uppercase text-zinc-800 hover:text-black px-3 py-1.5 transition-colors"
          >
            Masuk
          </button>

          <button
            type="button"
            onClick={() => onOpenAuth(true)}
            className="px-4 py-2 bg-zinc-900 hover:bg-black text-[#f7e043] font-mono text-xs font-bold uppercase tracking-wider rounded transition-all shadow-xs"
          >
            Mulai Gratis
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="px-6 py-16 md:py-24 max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-mono font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>PLATFORM SILSILAH KELUARGA MODERN & TERSTRUKTUR</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-zinc-900 tracking-tight leading-tight max-w-4xl mx-auto uppercase">
            Aplikasi Online Silsilah & Bagan Pohon Keluarga Indonesia
          </h1>

          <p className="text-zinc-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            Dokumentasikan, rawat, dan abadikan warisan silsilah keluarga besar Anda. Platform visual interaktif dengan tata letak simetris otomatis, kolaborasi aman dua lapis lintas generasi, dan privasi tertutup terenkripsi.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => onOpenAuth(true)}
              className="w-full sm:w-auto px-7 py-3.5 bg-zinc-900 hover:bg-black text-[#f7e043] font-mono text-xs sm:text-sm font-bold uppercase tracking-wider rounded-md transition-all shadow-md flex items-center justify-center gap-2 group"
            >
              <span>Mulai Buat Silsilah (Gratis)</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={onOpenAboutFaq}
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-800 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider rounded-md transition-all shadow-xs"
            >
              Pelajari Fitur & Hak Akses
            </button>
          </div>

          {/* Interactive Visual Preview Mockup */}
          <div className="pt-10 max-w-4xl mx-auto">
            <div className="p-4 sm:p-6 bg-white rounded-xl border border-zinc-200 shadow-xl overflow-hidden relative">
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between pb-4 border-b border-zinc-100">
                <span>SIMULASI VISUALISASI KANVAS SILSILAH</span>
                <span className="hidden sm:inline">ALGORITMA BOTTOM-UP SUBTREE</span>
              </div>

              {/* Mock Family Diagram: 3 Generasi (Kakek/Nenek -> Anak -> Cucu) */}
              <div className="pt-6 pb-2 flex flex-col items-center gap-4 sm:gap-5">
                {/* Generasi 1: Kakek & Nenek (Mbah Wiro) */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-3 bg-white border border-zinc-900 rounded-md shadow-xs text-left w-36 sm:w-40">
                    <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700">
                      LELUHUR • L
                    </span>
                    <div className="font-bold text-xs text-zinc-900 mt-1 truncate">Mbah Wiro Kakung</div>
                    <div className="text-[10px] font-mono text-zinc-400">1920 — Solo</div>
                  </div>

                  <div className="w-7 h-7 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center text-xs text-pink-500 shadow-2xs">
                    💍
                  </div>

                  <div className="p-3 bg-white border border-zinc-900 rounded-md shadow-xs text-left w-36 sm:w-40">
                    <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700">
                      LELUHUR • P
                    </span>
                    <div className="font-bold text-xs text-zinc-900 mt-1 truncate">Mbah Wiro Putri</div>
                    <div className="text-[10px] font-mono text-zinc-400">1923 — Solo</div>
                  </div>
                </div>

                {/* Knot Indicator Gen 1 -> Gen 2 */}
                <div className="flex flex-col items-center">
                  <div className="w-px h-3 bg-zinc-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 shadow-xs" />
                  <div className="w-px h-3 bg-zinc-300" />
                </div>

                {/* Generasi 2: Anak-anak (Ibunda Asmara, Bagas, Kenzo) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-2xl">
                  {/* Anak 1 (Ibunda Asmara) + Pasangan (Arya) */}
                  <div className="p-3 bg-white border-2 border-zinc-900 rounded-md shadow-xs text-left relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                        ANAK SULUNG
                      </span>
                      <span className="text-[11px]" title="Menikah">💍</span>
                    </div>
                    <div className="font-black text-xs text-zinc-900">Ibunda Asmara</div>
                    <div className="text-[11px] font-semibold text-zinc-600 truncate">+ Arya Pratama</div>
                    <div className="text-[9px] font-mono text-zinc-400 mt-0.5">1950 • Orang Tua Cucu Mbah Wiro</div>
                  </div>

                  {/* Anak 2: Bagas */}
                  <div className="p-3 bg-zinc-50 border border-zinc-300 rounded-md text-left">
                    <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                      ANAK KE-2
                    </span>
                    <div className="font-bold text-xs text-zinc-900 mt-1">Bagas</div>
                    <div className="text-[9px] font-mono text-zinc-400">1953 — Yogyakarta</div>
                  </div>

                  {/* Anak 3: Kenzo */}
                  <div className="p-3 bg-zinc-50 border border-zinc-300 rounded-md text-left">
                    <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-purple-100 text-purple-800">
                      ANAK BUNGSU
                    </span>
                    <div className="font-bold text-xs text-zinc-900 mt-1">Kenzo</div>
                    <div className="text-[9px] font-mono text-zinc-400">1957 — Jakarta</div>
                  </div>
                </div>

                {/* Knot Indicator Gen 2 -> Gen 3 (Cucu-Cucu Mbah Wiro) */}
                <div className="flex flex-col items-center pt-1">
                  <div className="w-px h-3 bg-zinc-300" />
                  <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-zinc-600 uppercase bg-zinc-100 px-3 py-0.5 rounded-full border border-zinc-200">
                    <span>⚡ GENERASI 3: CUCU-CUCU MBAH WIRO (DILAHIRKAN OLEH IBUNDA ASMARA & ARYA)</span>
                  </div>
                  <div className="w-px h-3 bg-zinc-300" />
                </div>

                {/* Generasi 3: Cucu-cucu Mbah Wiro (Mix 1 Suku Kata, 2 Suku Kata, dan 5 Suku Kata Nama) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
                  {/* Cucu 1: 1 Suku Kata ("El") */}
                  <div className="p-3 bg-white border border-blue-200 rounded-md text-left shadow-2xs hover:border-blue-400 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-blue-50 text-blue-700">
                        CUCU MBAH WIRO • 1 SUKU KATA
                      </span>
                      <span className="text-[9px] font-mono text-zinc-400">Gen-3</span>
                    </div>
                    <div className="font-black text-sm text-zinc-900 mt-1">El</div>
                    <div className="text-[9px] font-mono text-zinc-400">Kelahiran 1978 • Jakarta</div>
                  </div>

                  {/* Cucu 2: 2 Suku Kata / 2 Kata ("Nayla Kirana") */}
                  <div className="p-3 bg-white border border-emerald-200 rounded-md text-left shadow-2xs hover:border-emerald-400 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700">
                        CUCU MBAH WIRO • 2 SUKU KATA / 2 KATA
                      </span>
                      <span className="text-[9px] font-mono text-zinc-400">Gen-3</span>
                    </div>
                    <div className="font-bold text-xs text-zinc-900 mt-1">Nayla Kirana</div>
                    <div className="text-[9px] font-mono text-zinc-400">Kelahiran 1982 • Bandung</div>
                  </div>

                  {/* Cucu 3: 5 Suku Kata / 5 Kata Nama ("Muhammad Al Fatih Daniswara Putra") */}
                  <div className="p-3 bg-white border border-purple-200 rounded-md text-left shadow-2xs hover:border-purple-400 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-purple-50 text-purple-700">
                        CUCU MBAH WIRO • 5 KATA NAMA (PANJANG)
                      </span>
                      <span className="text-[9px] font-mono text-zinc-400">Gen-3</span>
                    </div>
                    <div className="font-bold text-xs text-zinc-900 mt-1 leading-snug break-words" title="Muhammad Al Fatih Daniswara Putra">
                      Muhammad Al Fatih Daniswara Putra
                    </div>
                    <div className="text-[9px] font-mono text-zinc-400 mt-0.5">Kelahiran 1986 • Surabaya</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Core Value Pillars */}
        <section className="px-6 py-16 bg-white border-y border-zinc-200">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                STANDAR ARSITEKTUR DIGITAL KELUARGA
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight uppercase">
                Mengapa Memilih Silsilah Keluarga?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-lg border border-zinc-200 bg-zinc-50/50 space-y-3">
                <div className="w-10 h-10 rounded bg-zinc-900 text-[#f7e043] flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-zinc-900 text-base uppercase font-mono">
                  1. Tampilan Bersih & Mudah Dipahami
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Setiap generasi dan cabang keluarga langsung menempati posisi yang ideal. Hubungan silsilah dari kakek-nenek hingga anak-cucu dapat dipahami dengan jelas hanya dalam sekali pandang.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-lg border border-zinc-200 bg-zinc-50/50 space-y-3">
                <div className="w-10 h-10 rounded bg-zinc-900 text-[#f7e043] flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-zinc-900 text-base uppercase font-mono">
                  2. Kolaborasi Aman Dua Lapis
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Kerabat dapat mendaftarkan keluarga kecilnya sendiri, namun perubahan data leluhur utama wajib melalui persetujuan Admin Utama (*Handover Proposal*). Data asli keluarga aman terlindungi.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-lg border border-zinc-200 bg-zinc-50/50 space-y-3">
                <div className="w-10 h-10 rounded bg-zinc-900 text-[#f7e043] flex items-center justify-center font-bold">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-zinc-900 text-base uppercase font-mono">
                  3. Privasi Tertutup & Ekspor Mandiri
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Silsilah Anda sepenuhnya privat dan hanya bisa dilihat oleh anggota terundang. Kapan pun siap, ekspor silsilah ke format gambar PNG kualitas tinggi (2x) atau dokumen HTML mandiri yang bisa dibuka tanpa internet.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Simple Steps Section (SEO-friendly structured content) */}
        <section className="px-6 py-16 bg-[#fafafa] border-b border-zinc-200">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                PANDUAN PRAKTIS
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight uppercase">
                3 Langkah Mudah Memulai Silsilah Keluarga
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg border border-zinc-200 bg-white space-y-2 shadow-2xs">
                <span className="text-2xl font-mono font-black text-[#f7e043] bg-zinc-900 w-9 h-9 rounded-full flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-zinc-900 text-sm uppercase pt-1">
                  Buat Pohon & Tentukan Leluhur
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Daftar gratis dalam hitungan detik. Masukkan nama kakek-nenek atau tetua sebagai simpul awal pohon keluarga Anda.
                </p>
              </div>

              <div className="p-6 rounded-lg border border-zinc-200 bg-white space-y-2 shadow-2xs">
                <span className="text-2xl font-mono font-black text-[#f7e043] bg-zinc-900 w-9 h-9 rounded-full flex items-center justify-center">
                  2
                </span>
                <h3 className="font-bold text-zinc-900 text-sm uppercase pt-1">
                  Tambahkan Anak & Pasangan
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Klik tombol tambah pasangan atau anak di setiap simpul keluarga. Algoritma cerdas otomatis menata posisi pohon secara simetris dan rapi.
                </p>
              </div>

              <div className="p-6 rounded-lg border border-zinc-200 bg-white space-y-2 shadow-2xs">
                <span className="text-2xl font-mono font-black text-[#f7e043] bg-zinc-900 w-9 h-9 rounded-full flex items-center justify-center">
                  3
                </span>
                <h3 className="font-bold text-zinc-900 text-sm uppercase pt-1">
                  Undang Kerabat & Kolaborasi
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Bagikan tautan undangan privat via WhatsApp. Kerabat dapat langsung melihat atau melengkapi data anak-cucu keluarga mereka sendiri.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SEO FAQ Section */}
        <section className="px-6 py-16 bg-white border-b border-zinc-200">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center max-w-xl mx-auto">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                TANYA JAWAB
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight uppercase">
                Pertanyaan yang Sering Diajukan (FAQ)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-lg border border-zinc-200 bg-zinc-50/60 space-y-2">
                <h3 className="font-bold text-xs sm:text-sm text-zinc-900">
                  Apakah aplikasi silsilah keluarga ini gratis digunakan?
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Ya, sepenuhnya gratis untuk sandbox hingga 30 anggota keluarga. Anda bisa langsung membuat akun, menyusun pohon keluarga, dan mengundang kerabat tanpa dipungut biaya.
                </p>
              </div>

              <div className="p-5 rounded-lg border border-zinc-200 bg-zinc-50/60 space-y-2">
                <h3 className="font-bold text-xs sm:text-sm text-zinc-900">
                  Apakah data silsilah keluarga saya aman & privat?
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Sangat aman. Pohon keluarga Anda bersifat tertutup (private by default) dan hanya dapat dilihat atau diedit oleh anggota keluarga yang Anda berikan tautan undangan resmi.
                </p>
              </div>

              <div className="p-5 rounded-lg border border-zinc-200 bg-zinc-50/60 space-y-2">
                <h3 className="font-bold text-xs sm:text-sm text-zinc-900">
                  Bagaimana cara mengajak saudara mengisi data keluarganya?
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Cukup kirimkan tautan kolaborator dari menu Pengaturan Pohon. Kerabat dapat mendaftar dan mengajukan penambahan anak/pasangan dengan persetujuan (*approval*) dari Anda.
                </p>
              </div>

              <div className="p-5 rounded-lg border border-zinc-200 bg-zinc-50/60 space-y-2">
                <h3 className="font-bold text-xs sm:text-sm text-zinc-900">
                  Apakah silsilah keluarga bisa diunduh atau dicetak?
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Bisa. Anda dapat mengekspor bagan pohon silsilah ke gambar beresolusi tinggi (PNG 2x) siap cetak, atau menyimpannya sebagai file dokumen mandiri yang bisa dibuka secara offline.
                </p>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={onOpenAboutFaq}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-700 hover:text-black underline uppercase"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Lihat Panduan Lengkap, Matriks Hak Akses & FAQ</span>
              </button>
            </div>
          </div>
        </section>

        {/* Seksi Paket Layanan & Harga (Pricing) */}
        <section id="harga" className="px-6 py-20 bg-white border-b border-zinc-200">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#f7e043] text-black border border-yellow-400 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>PILIHAN PAKET & INVESTASI WARISAN</span>
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-zinc-900 tracking-tight uppercase">
                Transparan, Fleksibel, & Terjangkau
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Pilih paket yang paling tepat untuk merawat silsilah keluarga besar Anda. Seluruh data keluarga dijamin aman, privat, dan terenkripsi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {/* 1. Paket Dasar (Gratis) */}
              <div className="flex flex-col justify-between p-6 sm:p-8 rounded-xl border border-zinc-200 bg-zinc-50/60 hover:bg-white hover:border-zinc-400 transition-all shadow-2xs">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-zinc-200 text-zinc-700">
                      PAKET DASAR
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 font-semibold">
                      GRATIS SELAMANYA
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-zinc-900 uppercase">
                    Dasar
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 mb-6 leading-relaxed">
                    Cocok untuk keluarga inti yang baru mulai mendokumentasikan pohon silsilah.
                  </p>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-zinc-900 font-mono">
                        Rp 0
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400 block mt-1">
                      Akses selamanya tanpa biaya bulanan
                    </span>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-zinc-200/80 text-xs">
                    <div className="flex items-start gap-2.5 text-zinc-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Maks. 30 anggota</strong> keluarga per pohon</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-zinc-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>1 semesta</strong> silsilah keluarga</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-zinc-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Kolaborasi dasar (1 kolaborator)</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-zinc-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Bagan silsilah visual interaktif & responsif</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-zinc-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Akses privat selamanya</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    type="button"
                    onClick={() => onOpenAuth(true)}
                    className="w-full py-3 px-4 rounded-lg bg-zinc-900 hover:bg-black text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
                  >
                    Mulai Gratis Sekarang
                  </button>
                </div>
              </div>

              {/* 2. Paket Keluarga Besar (Populer) */}
              <div className="relative flex flex-col justify-between p-6 sm:p-8 rounded-xl border-2 border-zinc-900 bg-white shadow-xl ring-2 ring-[#f7e043]">
                {/* Popular Badge */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#f7e043] text-black font-mono font-black text-[10px] tracking-wider uppercase px-3 py-1 rounded-full border border-yellow-500 shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>PALING POPULER</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4 mt-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-zinc-900 text-[#f7e043]">
                      KELUARGA BESAR
                    </span>
                    <span className="text-[10px] font-mono text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      HEMAT TAHUNAN
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-zinc-900 uppercase">
                    Keluarga Besar
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 mb-6 leading-relaxed">
                    Pilihan ideal untuk keluarga besar multi-generasi dengan kerabat yang banyak.
                  </p>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-zinc-900 font-mono">
                        Rp 67.000
                      </span>
                      <span className="text-xs font-mono text-zinc-500 font-bold">
                        / tahun
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500 block mt-1">
                      Setara hanya Rp 5.580 / bulan
                    </span>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-zinc-200 text-xs">
                    <div className="flex items-start gap-2.5 text-zinc-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Maks. 100 anggota</strong> tiap semesta</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-zinc-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Hingga <strong>2 semesta silsilah</strong> keluarga</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-zinc-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Kolaborator <strong>maks. 3 orang</strong></span>
                    </div>
                    <div className="flex items-start gap-2.5 text-zinc-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Ekspor bagan resolusi tinggi</strong> (PNG 2x & HTML)</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-zinc-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Alur usulan & persetujuan perubahan aman</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    type="button"
                    onClick={() => onOpenAuth(true)}
                    className="w-full py-3.5 px-4 rounded-lg bg-[#f7e043] hover:bg-yellow-400 text-black font-mono text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer"
                  >
                    Pilih Paket Keluarga Besar
                  </button>
                </div>
              </div>

              {/* 3. Paket Dinasti (Terlengkap) */}
              <div className="flex flex-col justify-between p-6 sm:p-8 rounded-xl border border-zinc-300 bg-zinc-900 text-white hover:border-zinc-500 transition-all shadow-md">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-zinc-800 text-yellow-400 border border-zinc-700">
                      PAKET DINASTI
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 font-semibold">
                      TERLENGKAP • VIP
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white uppercase">
                    Dinasti
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 mb-6 leading-relaxed">
                    Solusi komprehensif trah leluhur besar, marga, atau keturunan turun-temurun.
                  </p>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                        Rp 99.000
                      </span>
                      <span className="text-xs font-mono text-zinc-400 font-bold">
                        / tahun
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400 block mt-1">
                      Setara hanya Rp 8.250 / bulan
                    </span>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-zinc-800 text-xs">
                    <div className="flex items-start gap-2.5 text-zinc-200">
                      <CheckCircle2 className="w-4 h-4 text-[#f7e043] shrink-0 mt-0.5" />
                      <span><strong>Maks. 200 anggota</strong> tiap semesta</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-zinc-200">
                      <CheckCircle2 className="w-4 h-4 text-[#f7e043] shrink-0 mt-0.5" />
                      <span>Hingga <strong>4 semesta silsilah</strong> keluarga</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-zinc-200">
                      <CheckCircle2 className="w-4 h-4 text-[#f7e043] shrink-0 mt-0.5" />
                      <span>Kolaborator <strong>maks. 5 orang</strong></span>
                    </div>
                    <div className="flex items-start gap-2.5 text-zinc-200">
                      <CheckCircle2 className="w-4 h-4 text-[#f7e043] shrink-0 mt-0.5" />
                      <span><strong>Dukungan pelanggan prioritas</strong> (CS VIP)</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-zinc-200">
                      <CheckCircle2 className="w-4 h-4 text-[#f7e043] shrink-0 mt-0.5" />
                      <span>Ekspor cetak resolusi tinggi tanpa batas</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    type="button"
                    onClick={() => onOpenAuth(true)}
                    className="w-full py-3 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all border border-zinc-700 cursor-pointer"
                  >
                    Pilih Paket Dinasti
                  </button>
                </div>
              </div>
            </div>

            {/* Trust & Guarantee Banner */}
            <div className="p-4 sm:p-5 rounded-lg border border-zinc-200 bg-zinc-50/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-600">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-zinc-800 shrink-0" />
                <span>Pembayaran Resmi & Berizin Bank Indonesia via Duitku</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Keanggotaan langsung aktif otomatis setelah verifikasi</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-zinc-800 shrink-0" />
                <span>Garansi privasi 100% — Tanpa Iklan</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="px-6 py-16 bg-zinc-900 text-white text-center">
          <div className="max-w-3xl mx-auto space-y-5">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight uppercase">
              Mulai Susun Warisan Silsilah Keluarga Anda Hari Ini
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
              Gratis, tanpa instalasi aplikasi rumit, dan dapat diakses bersama seluruh kerabat langsung dari browser HP maupun laptop.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onOpenAuth(true)}
                className="px-8 py-3.5 bg-[#f7e043] hover:bg-yellow-400 text-black font-mono text-xs sm:text-sm font-black uppercase tracking-wider rounded-md transition-all shadow-md"
              >
                Daftar & Buat Silsilah Pertama
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 py-12 bg-zinc-50 border-t border-zinc-200 text-xs text-zinc-600 font-mono">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Main Footer Row: Brand, Links, & Official Support */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Col 1: Brand & Kepatuhan */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <img src={logoApp} alt="Logo Silsilah" className="w-7 h-7 object-contain" />
                <span className="font-black text-zinc-900 text-sm uppercase tracking-tight font-sans">
                  Silsilah Keluarga Indonesia
                </span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                Platform digital modern untuk merawat, memvisualisasikan, dan mendokumentasikan silsilah pohon keluarga besar secara privat dan aman lintas generasi.
              </p>
              <div className="p-3 rounded bg-amber-50/90 border border-amber-200 text-[11px] text-amber-900 leading-snug">
                <span className="font-bold">⚡ Informasi Produk:</span> Produk digital keanggotaan langsung aktif setelah pembayaran terverifikasi secara otomatis.
              </div>
            </div>

            {/* Col 2: Kontak Support Resmi */}
            <div className="space-y-3">
              <h4 className="font-bold text-zinc-900 uppercase text-xs tracking-wider">
                Layanan Pelanggan Resmi
              </h4>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase">Email Support:</div>
                    <a
                      href="mailto:support@silsilahkeluarga.id"
                      className="font-bold text-zinc-800 hover:text-black underline"
                    >
                      support@silsilahkeluarga.id
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Phone className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase">WhatsApp / Telepon CS:</div>
                    <a
                      href="https://wa.me/6281328219697"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-zinc-800 hover:text-black underline"
                    >
                      0813 2821 9697
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase">Alamat Usaha:</div>
                    <p className="text-zinc-700 leading-snug font-sans text-xs">
                      Apt. Sentra Timur Residence O19 12B, Jl. Sentra Primer Timur, Cakung, Jakarta Timur. 13950, Indonesia
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Col 3: Pembayaran & Navigasi */}
            <div className="space-y-3">
              <h4 className="font-bold text-zinc-900 uppercase text-xs tracking-wider">
                Metode Pembayaran Resmi
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                Didukung oleh <strong>Duitku Payment Gateway</strong> — Berlisensi resmi & diawasi oleh <strong>Bank Indonesia</strong>.
              </p>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-zinc-600 pt-1">
                <span className="px-2 py-1 bg-white border border-zinc-300 rounded font-bold">QRIS</span>
                <span className="px-2 py-1 bg-white border border-zinc-300 rounded font-bold">GoPay</span>
                <span className="px-2 py-1 bg-white border border-zinc-300 rounded font-bold">OVO</span>
                <span className="px-2 py-1 bg-white border border-zinc-300 rounded font-bold">DANA</span>
                <span className="px-2 py-1 bg-white border border-zinc-300 rounded font-bold">ShopeePay</span>
                <span className="px-2 py-1 bg-white border border-zinc-300 rounded font-bold">BCA VA</span>
                <span className="px-2 py-1 bg-white border border-zinc-300 rounded font-bold">Mandiri VA</span>
                <span className="px-2 py-1 bg-white border border-zinc-300 rounded font-bold">BNI VA</span>
                <span className="px-2 py-1 bg-white border border-zinc-300 rounded font-bold">BRI VA</span>
              </div>

              <div className="pt-2 flex flex-wrap gap-3 text-[11px]">
                <a href="#harga" className="hover:text-zinc-900 underline">
                  Paket & Harga
                </a>
                <button type="button" onClick={onOpenAboutFaq} className="hover:text-zinc-900 underline">
                  Matriks Hak Akses & FAQ
                </button>
                <button type="button" onClick={() => onOpenAuth(false)} className="hover:text-zinc-900 underline">
                  Masuk ke Akun
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-zinc-400 text-[11px]">
            <div>
              Hak Cipta © 2026 Silsilah Keluarga Indonesia. Hak cipta dilindungi undang-undang.
            </div>
            <div className="flex items-center gap-3">
              <span>Keamanan SSL 256-Bit</span>
              <span>•</span>
              <span>Duitku Sandbox Verified</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
