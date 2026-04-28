'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, Plus, Calendar, Settings, LogOut, Zap, Share2, Loader2, Camera, Download, Activity } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/sidebar';
import Image from 'next/image';

interface DailyLog {
  progress_value: number;
}

interface UserActivity {
  name: string;
  unit: string;
  weight: number;
  daily_logs: DailyLog[];
}

interface UserProgressBar {
  id: string;
  name: string;
  target_value: number;
  color: string;
  user_activities: UserActivity[];
}

interface ProgressBarData {
  id: string;
  name: string;
  target_value: number;
  color: string;
  current_progress: number;
  activities_summary: string;
}

export default function SharePage() {
  const [bars, setBars] = useState<ProgressBarData[]>([]);
  const [isLoadingData, setLoading] = useState(true);
  const [userName, setUserName] = useState('Petualang');
  const [isDownloading, setIsDownloading] = useState(false);

  // Mengambil Data Progres
  const fetchShareData = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return;
      if (user.user_metadata?.name) setUserName(user.user_metadata.name);

      const { data: barsData, error } = await supabase
        .from('user_progress_bars')
        .select(`
          id, name, target_value, color,
          user_activities (
            name,
            unit,
            weight,
            daily_logs ( progress_value )
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const calculatedBars = ((barsData as unknown as UserProgressBar[]) || []).map((bar) => {
        let totalProgress = 0;
        const activityDetails: string[] = [];
        
        if (bar.user_activities) {
          bar.user_activities.forEach((act) => {
            let actRawTotal = 0;
            let hasLogs = false;

            if (act.daily_logs && act.daily_logs.length > 0) {
              hasLogs = true;
              act.daily_logs.forEach((log) => {
                totalProgress += (log.progress_value || 0);
                if (act.weight && act.weight > 0) {
                  actRawTotal += (log.progress_value || 0) / act.weight;
                }
              });
            }

            if (act.name) {
              if (hasLogs) {
                activityDetails.push(`${act.name} (${actRawTotal.toFixed(1)} ${act.unit || ''})`);
              } else {
                activityDetails.push(act.name);
              }
            }
          });
        }

        return {
          id: bar.id,
          name: bar.name,
          target_value: bar.target_value,
          color: bar.color,
          current_progress: totalProgress,
          activities_summary: activityDetails.join(', ') || 'Belum ada aktivitas'
        };
      });

      setBars(calculatedBars);
    } catch (error) {
      console.error("Gagal mengambil data untuk share:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchShareData(); 
  }, [fetchShareData]);

  // LOGIKA DOWNLOAD (Berpindah ke html-to-image agar mendukung warna Tailwind modern/oklch/lab)
  const handleDownloadImage = async () => {
    const element = document.getElementById('share-card');
    if (!element) return;

    setIsDownloading(true);

    try {
      // Menginjeksi library html-to-image secara dinamis via CDN
      if (!(window as Window & { htmlToImage?: { toPng: (element: HTMLElement, options: { backgroundColor: string; pixelRatio: number }) => Promise<string> } }).htmlToImage) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const htmlToImage = (window as unknown as Window & { htmlToImage: { toPng: (element: HTMLElement, options: { backgroundColor: string; pixelRatio: number }) => Promise<string> } }).htmlToImage;

      // Mengubah elemen HTML Card menjadi Kanvas Gambar
      const dataUrl = await htmlToImage.toPng(element, {
        backgroundColor: '#09090b',
        pixelRatio: 2, // Sama dengan scale: 2 di html2canvas (gambar resolusi tinggi)
      });

      // Memicu unduhan
      const link = document.createElement('a');
      link.download = `UPLY-Progress-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
      
    } catch (error) {
      console.error('Gagal membuat gambar:', error);
      alert('Gagal mendownload gambar. Coba muat ulang halaman.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#4CB648] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex font-sans text-zinc-900">
      <Sidebar activePage="share" />
      
      <main className="flex-1 p-6 md:p-12 max-w-5xl mx-auto w-full flex flex-col lg:flex-row gap-12">
        
        {/* Kolom Kiri: Informasi & Kontrol */}
        <div className="flex-1">
          <header className="mb-10">
            <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none mb-3">
              BAGIKAN <br /><span className="text-[#4CB648]">KEMENANGAN</span>
            </h1>
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">
              Biarkan dunia tahu progres 1% Anda hari ini.
            </p>
          </header>

          <div className="bg-white p-8 border border-zinc-200 rounded-sm shadow-sm space-y-6">
            <div className="flex items-center gap-4 border-b border-zinc-100 pb-6">
              <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black italic uppercase text-lg tracking-tight">Siap Untuk Media Sosial</h3>
                <p className="text-xs text-zinc-500 font-medium">Rasio gambar sudah disesuaikan untuk Instagram Story (4:5).</p>
              </div>
            </div>

            <button 
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="w-full bg-[#4CB648] hover:bg-[#047200] text-white p-4 font-black italic uppercase tracking-widest text-sm flex justify-center items-center gap-3 rounded-sm transition-colors shadow-xl shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> MEMPROSES GAMBAR...</>
              ) : (
                <><Download className="w-5 h-5" /> UNDUH GAMBAR (PNG)</>
              )}
            </button>
            
            <p className="text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-4">
              JANGAN LUPA TAG <span className="text-[#4CB648]">@UPLY.APP</span>!
            </p>
          </div>
        </div>

        {/* Kolom Kanan: PREVIEW CARD (Bisa didownload sebagai gambar) */}
        <div className="flex-1 flex justify-center lg:justify-end items-center">
          
          <div 
            id="share-card" 
            className="w-full max-w-sm aspect-[4/5] bg-zinc-950 border border-zinc-800 rounded-xl p-8 relative overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Dekorasi Background Glow */}
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#85EB4E] opacity-32 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#85EB4E] opacity-32 blur-[100px] rounded-full pointer-events-none" />

            {/* Header Card */}
            <div className="flex justify-between items-start relative z-10 mb-8">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="bg-[#4ED99C] p-1 rounded-sm">
                    <Image 
                          src="/uply.png" 
                          alt="Uply Logo"
                          width={18}  
                          height={18}
                          className="object-contain"
                          priority 
                        />
                  </div>
                  <h2 className="font-black italic text-2xl uppercase tracking-tighter text-white">UPLY</h2>
                </div>
                <p className="text-[10px] text-[#FFFF] font-bold uppercase tracking-widest">{userName}&apos;s Progress</p>
              </div>
              <div className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
                <Activity className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Content: Progress Bars */}
            <div className="relative z-10 flex-1 flex flex-col justify-center space-y-6">
              {bars.length === 0 ? (
                <p className="text-zinc-500 text-center font-bold text-xs uppercase tracking-widest">Belum ada data progres.</p>
              ) : (
                bars.map((bar) => {
                  const percentage = Math.min((bar.current_progress / bar.target_value) * 100, 100);
                  return (
                    <div key={bar.id}>
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <h4 className="font-black italic text-xl uppercase tracking-tight text-white leading-none">
                            {bar.name}
                          </h4>
                          <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest mt-1">
                            {bar.activities_summary.length > 45 ? bar.activities_summary.substring(0, 45) + '...' : bar.activities_summary}
                          </p>
                        </div>
                        <span className="text-2xl font-black italic text-white leading-none">
                          {bar.current_progress.toFixed(1)}<span className="text-sm text-zinc-300">%</span>
                        </span>
                      </div>
                      
                      {/* Bar Visual */}
                      <div className="relative h-4 bg-zinc-600 rounded-sm overflow-hidden border border-[#8b8b8b]">
                        <div 
                          className={`h-full ${bar.color} transition-all duration-1000 ease-out`}
                          style={{ width: `${percentage}%` }}
                        >
                          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:10px_10px]" />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Card */}
            <div className="relative z-10 pt-6 border-t border-zinc-800 flex justify-between items-end mt-8">
              <div>
                <p className="text-[12px] font-black italic uppercase tracking-widest text-[#4CB648] leading-none mb-1">
                  1% LEBIH BAIK.
                </p>
                <p className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest">
                  {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <p className="text-[10px] font-black text-white uppercase tracking-widest opacity-50">UPLY.app</p>
            </div>
            
          </div>
        </div>

      </main>
    </div>
  );
}