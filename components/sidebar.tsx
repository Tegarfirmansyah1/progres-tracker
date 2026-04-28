
'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Plus, 
  Calendar, 
  Settings, 
  LogOut, 
  Zap,
  Share2
} from 'lucide-react';

import Link from 'next/link';
import { Share } from 'next/font/google';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface SidebarProps {
  activePage?: 'dashboard' | 'settings' |'add_log' | 'history' | 'share';
}

export default function Sidebar({ activePage = 'dashboard' }: SidebarProps) {
  
  // Daftar menu navigasi
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'DASHBOARD', link: '/dashboard' },
    { id: 'settings', icon: Settings, label: 'PENGATURAN', link: '/settings/activities' },
    { id: 'add_log', icon: Plus, label: 'CATAT LOG', link: '/logs/add' },
    { id: 'history', icon: Calendar, label: 'RIWAYAT', link: '/history' },
    { id: 'share', icon: Share2, label: 'Share', link: '/share' },
  ];

  // Handler untuk logout
  const handleLogout = async () => {
    try {
      // 1. Beritahu Supabase untuk menghancurkan sesi saat ini
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // 2. Arahkan kembali ke halaman login
      window.location.href = '/login';
    } catch (error) {
      console.error('Gagal keluar:', error);
      alert('Gagal logout. Silakan coba lagi.');
    }
  };

  return (
    <>
      {/* ========================================================
          1. DESKTOP SIDEBAR (Sembunyi di Mobile, Muncul di Layar md+)
          ======================================================== */}
      <aside className="hidden md:flex w-20 lg:w-64 bg-white border-r border-zinc-200 flex-col items-center lg:items-stretch py-8 sticky top-0 h-screen z-40 overflow-y-auto">
        <div className="px-6 mb-12 flex items-center gap-2">
          <div className="bg-[#4CB648] p-1 rounded-sm">
            <Image 
                                  src="/uply.png" 
                                  alt="Uply Logo"
                                  width={20}  
                                  height={20}
                                  className="object-contain"
                                  priority 
                                />
          </div>
          <span className="hidden lg:block font-black italic text-xl tracking-tighter uppercase">STRIDE</span>
        </div>
        
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <a 
              key={item.id} 
              href={item.link} 
              className={`flex items-center gap-4 p-3 rounded transition-all ${
                activePage === item.id ? 'bg-zinc-100 text-[#4CB648]' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              <item.icon className={`w-6 h-6 ${activePage === item.id ? 'stroke-[2.5px]' : ''}`} />
              <span className="hidden lg:block text-xs font-black tracking-widest uppercase">{item.label}</span>
            </a>
          ))}
        </nav>
        
        <div className="px-3 mt-8">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-4 p-3 text-zinc-400 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-6 h-6" />
            <span className="hidden lg:block text-xs font-black tracking-widest uppercase">KELUAR</span>
          </button>
        </div>
      </aside>

      {/* ========================================================
          2. MOBILE BOTTOM NAVIGATION (Muncul di Mobile, Sembunyi di md+)
          ======================================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 flex justify-around items-center px-2 h-16 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          
          // Desain Khusus Tombol Tengah (CATAT LOG / PLUS)
          if (item.id === 'add_log') {
            return (
              <a key={item.id} href={item.link} className="relative -top-2 px-2">
                <div className={`p-4 rounded-full shadow-xl flex items-center justify-center transition-transform active:scale-95 ${
                  isActive ? 'bg-[#4CB648] shadow-orange-500/40' : 'bg-[#4CB648] shadow-orange-500/30'
                } text-white`}>
                  <item.icon className={`w-7 h-7 ${isActive ? 'stroke-[3px]' : ''}`} />
                </div>
              </a>
            );
          }

          // Desain Navigasi Biasa (HANYA IKON UNTUK MOBILE)
          return (
            <a 
              key={item.id} 
              href={item.link} 
              className={`flex items-center justify-center p-2 w-14 h-14 transition-colors ${
                isActive ? 'text-[#4CB648]' : 'text-zinc-400 hover:text-zinc-900'
              }`}
            >
              {/* Ukuran ikon sedikit diperbesar (w-7 h-7) karena teks dihilangkan */}
              <item.icon className={`w-7 h-7 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            </a>
          );
        })}
      </nav>
    </>
  );
}