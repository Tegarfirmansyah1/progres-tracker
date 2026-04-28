
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
  activePage?: 'dashboard' | 'add_log' | 'history' | 'settings' | 'share';
}

export default function Sidebar({ activePage = 'dashboard' }: SidebarProps) {
  
  // Daftar menu navigasi
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'DASHBOARD', link: '/dashboard' },
    { id: 'add_log', icon: Plus, label: 'CATAT LOG', link: '/logs/add' },
    { id: 'history', icon: Calendar, label: 'RIWAYAT', link: '/history' },
    { id: 'settings', icon: Settings, label: 'PENGATURAN', link: '/settings/activities' },
    { id: 'share', icon: Share2, label: 'Share', link: '/share' },
  ];

  // Handler untuk logout
  const handleLogout = async () => {
    // KODE ASLI LOKAL:
    await supabase.auth.signOut();
    window.location.href = '/login';
    
    // Simulasi untuk preview:
    alert("Proses Logout...");
    window.location.href = '/login';
  };

  return (
    <aside className="w-20 lg:w-64 bg-white border-r border-zinc-200 flex flex-col items-center lg:items-stretch py-8 sticky top-0 h-screen overflow-y-auto">
      {/* Brand Logo */}
      <div className="px-6 mb-12 flex items-center gap-1">
        <div className="relative w-8 h-8 flex items-center justify-center">
    <Image 
      src="/uply.png" 
      alt="Uply Logo"
      width={32}  
      height={32}
      className="object-contain"
      priority 
    />
  </div>
        <span className="hidden lg:block font-black italic text-xl tracking-tighter uppercase">UPLY</span>
      </div>

      {/* Navigasi Utama */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          
          return (
            <a
              key={item.id}
              href={item.link}
              className={`flex items-center gap-4 p-3 rounded transition-all ${
                isActive 
                ? 'bg-zinc-100 text-[#4CB648]' 
                : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
              title={item.label} // Tooltip bawaan browser untuk layar kecil
            >
              <item.icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : ''}`} />
              <span className={`hidden lg:block text-xs font-black tracking-widest uppercase`}>
                {item.label}
              </span>
            </a>
          );
        })}
      </nav>

      {/* Tombol Logout */}
      <div className="px-3 mt-8">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-3 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          title="KELUAR"
        >
          <LogOut className="w-6 h-6" />
          <span className="hidden lg:block text-xs font-black tracking-widest uppercase">KELUAR</span>
        </button>
      </div>
    </aside>
  );
}