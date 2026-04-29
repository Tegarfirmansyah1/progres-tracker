'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Trash2, LayoutDashboard, Plus, Calendar, Settings, LogOut, Zap, Activity, Loader2 } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/sidebar';

interface ParentBar {
  name: string;
  color: string;
}

interface UserActivity {
  name: string;
  unit: string;
  weight: number;
  user_progress_bars: ParentBar; 
}

interface DailyLog {
  id: string;
  progress_value: number;
  notes: string | null;
  created_at: string;
  user_activities: UserActivity;
}

export default function HistoryPage() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fungsi memformat tanggal (contoh: "12 Okt, 08:30")
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date).replace('.', ':');
  };

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Query Super Nested: Log -> Aktivitas -> Bar Induk
      const { data, error } = await supabase
        .from('daily_logs')
        .select(`
          id, 
          progress_value, 
          notes, 
          created_at,
          user_activities (
            name,
            unit,
            weight,
            user_progress_bars (
              name,
              color
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setLogs(data as unknown as DailyLog[]);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Gagal memuat riwayat.';
      console.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Handler Hapus Log
  const handleDeleteLog = async (logId: string) => {
    if (!window.confirm('Yakin ingin menghapus catatan petualangan ini? Progres di dashboard juga akan berkurang.')) return;

    try {
      const { error } = await supabase.from('daily_logs').delete().eq('id', logId);
      if (error) throw error;

      // Optimistic UI Update: Hapus log dari tampilan tanpa reload
      setLogs(prev => prev.filter(log => log.id !== logId));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Terjadi kesalahan sistem.';
      alert(`Gagal menghapus log: ${msg}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#4CB648] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex font-sans text-zinc-900">
      <Sidebar activePage="history" />
      
      <main className="flex-1 p-6 pb-24 md:p-12 md:pb-12 max-w-5xl mx-auto w-full">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 border-b border-zinc-200 pb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
              RIWAYAT <br />
              <span className="text-[#4CB648]">PETUALANGAN</span>
            </h1>
          </div>
          <div className="text-zinc-400 font-bold text-xs uppercase tracking-widest bg-white border border-zinc-200 px-4 py-2 rounded-sm">
            Total: {logs.length} Catatan
          </div>
        </header>

        <div className="space-y-5">
          {logs.length === 0 ? (
            <div className="bg-white border border-zinc-200 p-12 rounded-sm text-center shadow-sm">
              <Activity className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
              <h4 className="text-lg font-black italic uppercase tracking-tight text-zinc-800">Belum Ada Riwayat</h4>
              <p className="text-sm text-zinc-500 mt-2 mb-6">Kamu belum mencatat petualangan apa pun. Mulai langkah pertamamu!</p>
              <a href="/logs/add" className="inline-flex bg-[#4CB648] text-white px-6 py-3 font-black italic uppercase tracking-widest text-xs hover:bg-[#e34402] transition-colors rounded-sm shadow-lg shadow-orange-500/20">
                CATAT SEKARANG
              </a>
            </div>
          ) : (
            logs.map((log) => {
              // Kalkulasi balik untuk mendapatkan nilai asli sebelum dikali bobot
              // (Misal: progress_value di DB adalah 15%, weight adalah 1.5. Maka rawValue = 10 KM)
              const act = log.user_activities;
              const bar = act?.user_progress_bars;
              const rawValue = act?.weight ? (log.progress_value / act.weight).toFixed(1) : 0;
              const barColor = bar?.color || 'bg-zinc-200';

              return (
                <div key={log.id} className="bg-white border border-zinc-200 p-4 md:p-8 rounded-sm shadow-sm hover:border-[#4CB648] transition-all group relative overflow-hidden">
                  
                  {/* Accent Garis Kiri */}
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${barColor}`} />

                  <div className="flex justify-between items-start mb-2 md:mb-6 pl-2">
                    <span className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      <Clock className="w-4 h-4" /> {formatDateTime(log.created_at)}
                    </span>
                    <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleDeleteLog(log.id)}
                        className="p-2 text-red-500 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                        title="Hapus Log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="pl-2">
                    <h3 className="text-xl font-black italic uppercase tracking-tight text-zinc-800 mb-1">
                      {act?.name || 'Aktivitas Dihapus'}
                    </h3>
                    <p className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5 md:mb-6">
                      Kategori: <span style={{ color: barColor.replace('bg-', '') }} className="font-black">{bar?.name || '-'}</span>
                    </p>
                    
                    {log.notes && (
                      <p className="text-sm text-zinc-600 bg-zinc-50 border border-zinc-100 p-4 rounded-sm italic mb-6">
                        &quot;{log.notes}&quot;
                      </p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 border-t border-zinc-50 pt-6">
                      <div>
                        <p className="text-[8px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest">Pencapaian Asli</p>
                        <p className="text-sm md:text-2xl font-black italic">
                          {rawValue} <span className="text-sm text-zinc-500 font-bold">{act?.unit}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#4CB648]">Growth Diterima</p>
                        <p className="text-sm md:text-2xl font-black italic text-[#4CB648]">+{log.progress_value.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}