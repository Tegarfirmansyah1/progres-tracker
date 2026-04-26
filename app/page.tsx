/**
 * File: src/app/page.tsx
 * Route: /
 * Deskripsi: Landing page utama untuk memperkenalkan aplikasi "Progres Tracker" kepada pengguna baru.
 */
import React from 'react';
import { ArrowRight, Activity, TrendingUp, Zap, Target } from 'lucide-react';
// import Link from 'next/link'; // Uncomment saat di Next.js

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-emerald-500/30">
      
      {/* Navbar Minimalis */}
      <nav className="border-b border-zinc-900 bg-black/50 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Target className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold text-lg tracking-tight">Progres Tracker</span>
          </div>
          <div className="flex gap-4 items-center">
            {/* Ganti <a> dengan <Link> di Next.js */}
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </a>
            <a 
              href="/login" 
              className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-zinc-200 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center mt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-sm text-zinc-400 mb-8">
            <Zap className="w-4 h-4 text-emerald-500" />
            <span>Mulai perjalanan compounding effect-mu hari ini.</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 bg-gradient-to-br from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
            Tumbuh 1% Setiap Hari. <br className="hidden md:block" />
            Ubah Hidupmu.
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Berhenti mengejar perubahan drastis dalam semalam. Catat aktivitas harianmu, bangun kebiasaan yang solid, dan biarkan matematika membuktikan bahwa sedikit lebih baik setiap hari akan membawa hasil yang masif.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="/login" 
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-black px-8 py-3.5 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
            >
              Mulai Sekarang <ArrowRight className="w-4 h-4" />
            </a>
            <a 
              href="#features" 
              className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white px-8 py-3.5 rounded-xl text-base font-medium flex items-center justify-center transition-colors border border-zinc-800"
            >
              Pelajari Lebih Lanjut
            </a>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="max-w-5xl mx-auto mt-32 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-2xl">
            <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mb-6">
              <Activity className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Dynamic Tracking</h3>
            <p className="text-zinc-500 leading-relaxed text-sm">
              Sistem pintar kami mengonversi aktivitas fisik atau belajarmu (km, menit, halaman) menjadi persentase pertumbuhan harian secara otomatis.
            </p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-2xl relative overflow-hidden">
            {/* Dekorasi Glow */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
            
            <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mb-6 relative z-10">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 relative z-10">Visual Analytics</h3>
            <p className="text-zinc-500 leading-relaxed text-sm relative z-10">
              Pantau akumulasi progresmu melalui grafik dan metrik yang memanjakan mata. Buktikan sendiri bahwa usahamu tidak sia-sia.
            </p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-2xl">
            <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-yellow-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Streak Motivation</h3>
            <p className="text-zinc-500 leading-relaxed text-sm">
              Pertahankan rentetan harimu (streak). Secara psikologis, melihat streak yang panjang akan membuatmu enggan untuk menyerah.
            </p>
          </div>
        </div>
      </main>

      {/* Footer Minimalis */}
      <footer className="border-t border-zinc-900 py-8 text-center text-sm text-zinc-600 mt-20">
        <p>&copy; {new Date().getFullYear()} Progres Tracker. Build with Next.js & Supabase.</p>
      </footer>
    </div>
  );
}