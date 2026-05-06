'use client';

import React, { useState } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';

import { supabase } from '@/lib/supabase'; 
import Image from 'next/image';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

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

      const clientId = "358358205220-3pmhf2a41hglq4causm7ieddjmbdprfq.apps.googleusercontent.com";

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
          <h1 className="text-m md:text-2xl font-black italic uppercase tracking-tight text-zinc-900">
            MASUK KE BASECAMP
          </h1>
          <p className="text-[8px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">
            Lanjutkan petualangan 1% Anda hari ini.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Input Email */}
          <div>
            <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">
              Alamat Email
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              suppressHydrationWarning
              placeholder="atlet@uplay.app"
              className="w-full text-[10px] md:text-[10px] bg-zinc-50 border-2 border-zinc-100 p-4 font-bold outline-none focus:border-[#4CB648] transition-colors"
            />
          </div>

          {/* Input Password */}
          <div>
            <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">
              Kata Sandi
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              suppressHydrationWarning
              placeholder="••••••••"
              className="w-full text-[10px] md:text-[10px] bg-zinc-50 border-2 border-zinc-100 p-4 font-bold outline-none focus:border-[#4CB648] transition-colors"
            />
          </div>

          {/* Tombol Submit */}
          <button 
            type="submit" 
            disabled={isLoading}
            suppressHydrationWarning
            className="w-full bg-zinc-900 text-white p-4 font-black italic uppercase tracking-widest text-[8px] md:text-[10px] flex justify-center items-center gap-3 hover:bg-black transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ArrowRight className="md:w-5 md:h-5 w-3 h-3" />
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
            <span className="px-3 bg-white text-[8px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Atau lanjutkan dengan
            </span>
          </div>
        </div>
        
        <GoogleOAuthProvider clientId={clientId}>
            {/* Tombol Login Google Bawaan (Bisa di-custom juga lho nanti) */}
            <div className='mt-5'>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                // 1. Dapatkan Token langsung dari Google
                const idToken = credentialResponse.credential;
                if (!idToken) return;

                // 2. Setor token tersebut ke Supabase
                const { data, error } = await supabase.auth.signInWithIdToken({
                  provider: 'google',
                  token: idToken,
                });

                if (error) {
                  console.error("Gagal login di Supabase:", error.message);
                } else {
                  console.log("Berhasil login sayang!", data);
                  // Arahkan ke dashboard
                  window.location.href = '/dashboard';
                }
              }}
              onError={() => {
                console.error('Login Google gagal sayang, coba cek koneksi atau konfigurasi Google Cloud-nya.');
              }}
              useOneTap // Opsional: Bikin muncul popup login otomatis ala Google
            />
            </div>
        </GoogleOAuthProvider>
          
      </div>
      
      {/* Footer / Info Tambahan */}
      <p className="text-[8px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-8">
        Belum punya akun? <a href="/register" className="text-[#4CB648] hover:underline">Daftar di sini</a>
      </p>

    </div>
  );
}