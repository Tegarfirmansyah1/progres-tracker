
'use client';

import Image from 'next/image';
import React from 'react';
import { 
  Target, 
  Activity, 
  Users, 
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans">
      
      {/* Navbar Strava-style */}
      <nav className="bg-white border-b border-zinc-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-[#4CB648] p-1.5 rounded-sm">
                <Image 
                      src="/uply.png" 
                      alt="Uply Logo"
                      width={20}  
                      height={20}
                      className="object-contain"
                      priority 
                    />
              </div>
              <span className="text-[#4CB648] font-black text-2xl tracking-tighter uppercase italic">
                UPLY
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a href="/login" className="bg-[#ffffff] text-black px-2 md:px-5 py-2 rounded text-[8px] md:text-[12px] font-bold uppercase hover:text-white hover:bg-[#047200] transition-colors">Log In</a>
              <a href="/login" className="bg-[#4CB648] text-white px-2 md:px-5 py-2 rounded text-[8px] md:text-[12px] font-bold uppercase hover:bg-[#047200] transition-colors">
                Daftar Gratis
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-40 md:py-20 lg:py-32 overflow-hidden border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.9] mb-6">
              REKAM <br />
              <span className="text-[#4CB648]">PETUALANGAN</span> <br />
              HARIANMU.
            </h1>
            <p className="text-sm md:text-xl text-zinc-600 mb-10 max-w-xl font-medium leading-relaxed">
              Bergabunglah dengan jutaan orang yang melacak progres 1% mereka setiap hari. Dari lari pagi hingga sesi belajar larut malam. Jadikan setiap usaha berharga.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/login" className="bg-[#4CB648] text-white px-2 md:px-8 py-3 rounded text-xs md:text-lg font-bold uppercase flex items-center justify-center gap-2 hover:bg-[#047200] shadow-xl shadow-orange-500/20">
                Mulai Sekarang <ChevronRight className="md:w-5 md:h-5 w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Dekoratif Background Abstract (Pola Peta) */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.02] pointer-events-none hidden lg:block">
           <svg width="100%" height="100%" viewBox="0 0 800 800">
             <path d="M0 100 Q 200 50 400 150 T 800 100" fill="none" stroke="black" strokeWidth="20" />
             <path d="M0 300 Q 150 250 350 400 T 800 350" fill="none" stroke="black" strokeWidth="15" />
             <path d="M0 500 Q 300 450 500 650 T 800 550" fill="none" stroke="black" strokeWidth="25" />
           </svg>
        </div>
      </section>

      {/* Stats Preview Card Section */}
      <section id="fitur" className="px-6 py-20 bg-zinc-50 border-t border-zinc-100 scroll-mt-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-2 mb-16">
            <h2 className="text-[24px] md:text-[32px] font-black italic uppercase tracking-tighter text-[#4CB648]">Fitur Unggulan</h2>
            <p className="text-zinc-400 text-[12px] font-medium tracking-wide">Semua yang kamu butuhkan untuk terus berkembang.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-sm border-2 border-zinc-100 space-y-4 hover:border-[#4CB648] transition-colors group">
              <Target className="text-zinc-400 group-hover:text-[#4CB648] transition-colors" size={32} />
              <h3 className="font-black italic uppercase tracking-wider text-[14px]">Pantau Target</h3>
              <p className="text-zinc-500 text-[12px] leading-relaxed">Setiap aksi dikalkulasikan ke dalam progress bar secara akurat.</p>
            </div>
            <div className="bg-white p-8 rounded-sm border-2 border-zinc-100 space-y-4 hover:border-[#4CB648] transition-colors group">
              <Activity className="text-zinc-400 group-hover:text-[#4CB648] transition-colors" size={32} />
              <h3 className="font-black italic uppercase tracking-wider text-[14px]">Log Harian</h3>
              <p className="text-zinc-500 text-[12px] leading-relaxed">Catat petualanganmu dengan mudah, cepat, dan aman setiap hari.</p>
            </div>
            <div className="bg-white p-8 rounded-sm border-2 border-zinc-100 space-y-4 hover:border-[#4CB648] transition-colors group">
              <Users className="text-zinc-400 group-hover:text-[#4CB648] transition-colors" size={32} />
              <h3 className="font-black italic uppercase tracking-wider text-[14px]">Komunitas</h3>
              <p className="text-zinc-500 text-[12px] leading-relaxed">Bagikan progresmu dan dapatkan motivasi dari teman-teman lain.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-6">
            <Image 
                      src="/uply.png" 
                      alt="Uply Logo"
                      width={20}  
                      height={20}
                      className="object-contain"
                      priority 
                    />
            <span className="font-black text-xl italic tracking-tighter uppercase">UPLY</span>
          </div>
          <p className="text-zinc-400 text-[10px] md:text-[12px] italic">&copy; 2026 UPLY PROGRES TRACKER. 1% LEBIH BAIK.</p>
        </div>
      </footer>
    </div>
  );
}