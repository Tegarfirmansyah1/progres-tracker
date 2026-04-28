'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Save, ChevronDown, LayoutDashboard, Plus, Calendar, Settings, LogOut, Zap, Target, Activity, Loader2 } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/sidebar';

interface ParentBar {
  id: string;
  name: string;
  color: string;
}

interface UserActivity {
  id: string;
  name: string;
  unit: string;
  weight: number;
  user_progress_bars: ParentBar; 
}

// Interface untuk payload insert agar tidak menggunakan 'any'
interface LogPayload {
  user_id: string;
  activity_id: string;
  progress_value: number;
  notes: string;
}

export default function AddLogPage() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Form State
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [inputValue, setInputValue] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchActivities = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; 

      const { data, error } = await supabase
        .from('user_activities')
        .select('id, name, unit, weight, user_progress_bars(id, name, color)')
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Aman karena kita sudah mendefinisikan interface yang sesuai dengan struktur data Supabase
      setActivities(data as unknown as UserActivity[]);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat aktivitas.';
      console.error('Gagal mengambil aktivitas:', errorMessage);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Derived State
  const activeActivity = activities.find(a => a.id === selectedActivityId);
  const parentBar = activeActivity?.user_progress_bars;

  const calculatedProgress = activeActivity && typeof inputValue === 'number' 
    ? (inputValue * activeActivity.weight).toFixed(1) 
    : '0.0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivityId || inputValue === '' || !activeActivity) {
      return alert('Pilih aktivitas dan masukkan nilai pencapaian!');
    }

    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Anda belum login.');

      const progressValueNum = Number(inputValue) * activeActivity.weight;

      const payload: LogPayload = {
        user_id: user.id,
        activity_id: activeActivity.id,
        progress_value: progressValueNum,
        notes: notes
      };

      const { error } = await supabase.from('daily_logs').insert(payload);

      if (error) throw error;

      alert(`Log berhasil disimpan! Kamu mendapatkan progres +${calculatedProgress}% untuk ${parentBar?.name}.`);
      
      setSelectedActivityId('');
      setInputValue('');
      setNotes('');
      
    } catch (error: unknown) {
      // Menghindari 'any' dengan Type Guard
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan pada sistem.';
      alert(`Gagal menyimpan log: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
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
      <Sidebar activePage="add_log" />
      <main className="flex-1 p-6 pb-24 md:p-12 md:pb-12 max-w-5xl mx-auto w-full">
        <header className="mb-12">
          <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">CATAT <br /><span className="text-[#4CB648]">PETUALANGAN</span></h1>
          <p className="text-zinc-500 text-xs font-black tracking-widest uppercase mt-4">Rekam usahamu. Biarkan sistem menghitung progresnya.</p>
        </header>

        <form className="bg-white p-8 md:p-12 border border-zinc-200 rounded-sm shadow-sm space-y-10 relative overflow-hidden" onSubmit={handleSubmit}>
          
          {parentBar && (
            <div className={`absolute top-0 left-0 w-full h-2 ${parentBar.color} transition-colors duration-500`} />
          )}

          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Pilih Aktivitas yang Telah Didaftarkan</label>
            <div className="relative">
              <select 
                value={selectedActivityId}
                onChange={(e) => {
                  setSelectedActivityId(e.target.value);
                  setInputValue('');
                }}
                className="w-full appearance-none bg-zinc-50 border-2 border-zinc-100 p-5 rounded-sm font-bold text-zinc-800 focus:border-[#4CB648] outline-none transition-colors"
              >
                <option value="" disabled>-- PILIH AKTIVITAS --</option>
                {activities.map(act => {
                  return (
                    <option key={act.id} value={act.id}>
                      [{act.user_progress_bars?.name || 'TANPA KATEGORI'}] - {act.name}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
            </div>
            
            {activities.length === 0 && (
              <p className="text-sm text-red-500 font-bold mt-2">
                ⚠️ Kamu belum memiliki daftar aktivitas. Silakan atur terlebih dahulu di halaman Pengaturan.
              </p>
            )}
          </div>

          {activeActivity && parentBar && (
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-zinc-50 border border-zinc-100 rounded-sm">
              <div className="flex items-center gap-2 flex-1">
                <Target className="w-4 h-4 text-zinc-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Target Bar: <span className="text-zinc-900">{parentBar.name}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <Activity className="w-4 h-4 text-zinc-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Konversi: <span className="text-[#4CB648]">1 {activeActivity.unit} = {activeActivity.weight}%</span>
                </span>
              </div>
            </div>
          )}

          <div className="space-y-4 opacity-100 transition-opacity" style={{ opacity: selectedActivityId ? 1 : 0.5, pointerEvents: selectedActivityId ? 'auto' : 'none' }}>
            <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Pencapaian (Nilai)</label>
            <div className="flex gap-4">
              <input 
                type="number" 
                step="0.1"
                min="0"
                placeholder={selectedActivityId ? "0.0" : "Pilih aktivitas dulu"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value === '' ? '' : Number(e.target.value))}
                className="flex-1 bg-zinc-50 border-2 border-zinc-100 p-5 rounded-sm font-black text-3xl focus:border-[#4CB648] outline-none transition-colors" 
              />
              <div className="w-32 bg-zinc-100 flex items-center justify-center font-black uppercase text-zinc-400 italic">
                {activeActivity ? activeActivity.unit : '-'}
              </div>
            </div>
          </div>

          {selectedActivityId && (
            <div className="flex items-center justify-between py-6 border-t border-zinc-100">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Estimasi Progres Didapat:</span>
              <span className="text-5xl font-black italic text-[#4CB648]">+{calculatedProgress}%</span>
            </div>
          )}

          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Catatan Petualangan (Opsional)</label>
            <textarea 
              rows={3}
              placeholder="Bagaimana perasaanmu menyelesaikan ini?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-zinc-50 border-2 border-zinc-100 p-5 rounded-sm font-medium text-sm focus:border-[#4CB648] outline-none transition-colors resize-none"
            />
          </div>

          <button 
            disabled={!selectedActivityId || isSubmitting}
            className="w-full bg-[#4CB648] text-white p-5 rounded-sm font-black italic uppercase tracking-[0.2em] shadow-xl shadow-orange-500/20 flex justify-center items-center gap-3 hover:bg-[#047200] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />} 
            {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN LOG HARIAN'}
          </button>
        </form>
      </main>
    </div>
  );
}