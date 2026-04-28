'use client';

import React, { useState } from 'react';
import { Zap, Loader2, Mail, Lock } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      window.location.href = '/dashboard';
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white border border-zinc-200 p-8 rounded-sm shadow-xl">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-[#4CB648] p-2 rounded-sm mb-4">
             <Image 
                  src="/uply.png" 
                  alt="Uply Logo"
                  width={32}  
                  height={32}
                  className="object-contain w-8 h-8 text-white fill-current"
                  priority 
                />
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900">UPLY</h2>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-1">Progres Tracker</p>
        </div>

        <button className="w-full bg-white border-2 border-zinc-200 py-3 rounded-sm font-bold text-sm flex items-center justify-center gap-3 hover:bg-zinc-50 transition-colors mb-6">
          <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/></svg>
          LANJUTKAN DENGAN GOOGLE
        </button>

        <div className="relative mb-8 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-100"></div></div>
          <span className="relative px-4 bg-white text-[10px] font-black text-zinc-400 uppercase tracking-widest">Atau Email</span>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input type="email" placeholder="EMAIL" className="w-full bg-zinc-50 border-2 border-zinc-100 p-4 pl-12 rounded-sm font-bold text-sm focus:border-[#4CB648] outline-none transition-colors" />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input type="password" placeholder="PASSWORD" className="w-full bg-zinc-50 border-2 border-zinc-100 p-4 pl-12 rounded-sm font-bold text-sm focus:border-[#4CB648] outline-none transition-colors" />
          </div>
          <button disabled={loading} className="w-full bg-[#4CB648] text-white p-4 rounded-sm font-black italic uppercase tracking-widest shadow-lg shadow-orange-500/20 flex justify-center items-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'LOG IN' : 'DAFTAR')}
          </button>
        </form>

        <p className="mt-8 text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
          {isLogin ? "Belum punya akun?" : "Sudah punya akun?"} <button onClick={() => setIsLogin(!isLogin)} className="text-[#4CB648] hover:underline underline-offset-4 ml-1">KLIK DI SINI</button>
        </p>
      </div>
    </div>
  );
}