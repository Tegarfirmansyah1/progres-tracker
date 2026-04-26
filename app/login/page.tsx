/**
 * File: src/app/login/page.tsx
 * Route: /login
 * Deskripsi: Halaman Login & Register dengan tombol Google yang diprioritaskan.
 */
'use client';

import React, { useState } from 'react';
import { Mail, Lock, Loader2, UserPlus, LogIn, Target } from 'lucide-react';

// CATATAN: Baris di bawah ini dikomentari agar tidak menyebabkan error di preview.
// Aktifkan kembali saat Anda menyalin kode ini ke VS Code lokal Anda.
import { supabase } from '@/lib/supabase'; 

export default function LoginPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Fungsi Login Google
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
     
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
      
      // Simulasi untuk keperluan preview
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("Simulasi: Mengarahkan ke Google Login...");
      
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Gagal login Google';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Fungsi Login Email
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    
    try {
     
      const { error } = isLoginMode 
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
      
      if (error) throw error;
      window.location.href = '/dashboard';

      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`Simulasi: ${isLoginMode ? 'Sign In' : 'Sign Up'} berhasil!`);
      
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error Auth';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-zinc-100 font-sans">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-8">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
            <Target className="w-6 h-6 text-black" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Progres Tracker</h2>
          <p className="text-sm text-zinc-400 mt-1">Lacak kemajuan 1% setiap hari.</p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-xs text-center">
            {errorMessage}
          </div>
        )}

        {/* --- TOMBOL GOOGLE --- */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-white text-black py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-3 transition-transform active:scale-95 mb-6 disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
          </svg>
          Lanjutkan dengan Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
          <div className="relative flex justify-center text-sm uppercase"><span className="px-2 bg-zinc-950 text-zinc-500">Atau email</span></div>
        </div>

        {/* Form Email */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400 ml-1">Email</label>
            <input 
              type="email" 
              placeholder="nama@email.com" 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400 ml-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-black py-2.5 rounded-lg text-sm font-bold transition-colors mt-2">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (isLoginMode ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-500">
          {isLoginMode ? "Belum punya akun?" : "Sudah punya akun?"}{' '}
          <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-white hover:underline font-medium">
            {isLoginMode ? 'Daftar Sekarang' : 'Login di sini'}
          </button>
        </p>
      </div>
    </div>
  );
}