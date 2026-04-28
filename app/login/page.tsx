'use client';

import React, { useState } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';

import { supabase } from '@/lib/supabase'; 
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      return alert("Email dan Password tidak boleh kosong!");
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      window.location.href = '/dashboard';

    } catch (error: unknown) {
      // Tangkap dan tampilkan pesan error dengan aman
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat login.';
      alert(`Gagal Login: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);

    try {
      // Proses autentikasi OAuth Google ke Supabase
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Supabase akan mengarahkan user kembali ke URL ini setelah login sukses
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined
        }
      });

      if (error) throw error;
      
      // Catatan: Tidak perlu redirect manual di sini karena signInWithOAuth 
      // akan otomatis melempar user ke halaman Google.

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat menghubungi Google.';
      alert(`Gagal Login dengan Google: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center items-center font-sans p-6">
      
      {/* Logo Header */}
      <div className="flex items-center gap-2 mb-10">
        <div className="bg-[#4CB648] p-2 rounded-sm shadow-lg shadow-orange-500/30">
          <Image 
                src="/uply.png" 
                alt="Uply Logo"
                width={24}  
                height={24}
                className="object-contain"
                priority 
              />
        </div>
        <span className="font-black italic text-4xl tracking-tighter uppercase text-zinc-900">
          UPLY
        </span>
      </div>

      {/* Kotak Form Login */}
      <div className="w-full max-w-md bg-white border border-zinc-200 p-8 md:p-10 rounded-sm shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black italic uppercase tracking-tight text-zinc-900">
            MASUK KE BASECAMP
          </h1>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">
            Lanjutkan petualangan 1% Anda hari ini.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Input Email */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">
              Alamat Email
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="atlet@uplay.app"
              className="w-full bg-zinc-50 border-2 border-zinc-100 p-4 font-bold outline-none focus:border-[#4CB648] transition-colors"
            />
          </div>

          {/* Input Password */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">
              Kata Sandi
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-50 border-2 border-zinc-100 p-4 font-bold outline-none focus:border-[#4CB648] transition-colors"
            />
          </div>

          {/* Tombol Submit */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-zinc-900 text-white p-4 font-black italic uppercase tracking-widest text-sm flex justify-center items-center gap-3 hover:bg-black transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )} 
            {isLoading ? 'MEMVERIFIKASI...' : 'MULAI PETUALANGAN'}
          </button>
        </form>

     {/* Pemisah (Divider) */}
        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-100"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Atau lanjutkan dengan
            </span>
          </div>
        </div>

        {/* Tombol Login Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="mt-6 w-full bg-white border-2 border-zinc-100 hover:bg-zinc-50 hover:border-zinc-200 text-zinc-900 p-4 font-black italic uppercase tracking-widest text-sm flex justify-center items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
            <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
            <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
            <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
            <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
          </svg>
          Google
        </button>

      </div>
      
      {/* Footer / Info Tambahan */}
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-8">
        Belum punya akun? <a href="/register" className="text-[#FC4C02] hover:underline">Daftar di sini</a>
      </p>

    </div>
  );
}