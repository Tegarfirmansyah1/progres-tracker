'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ChevronDown, Target, Activity, Save, Loader2 } from 'lucide-react';
import Sidebar from '@/components/sidebar'; 
import { supabase } from '@/lib/supabase'; 
// ==========================================
// TIPE DATA TYPESCRIPT
// ==========================================
interface ProgressBar {
  id: string;
  name: string;
  color: string;
  current_progress: number;
}

interface UserActivity {
  id: string;
  name: string;
  unit: string;
  weight: number;
  user_progress_bars?: ProgressBar;
}

// Fungsi Helper: Mendapatkan tanggal lokal hari ini (Format: YYYY-MM-DD)
const getTodayLocal = (): string => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

export default function AddLogPage() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // State Form
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [logDate, setLogDate] = useState<string>(getTodayLocal());
  const [inputValue, setInputValue] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==========================================
  // MENGAMBIL DATA DARI SUPABASE
  // ==========================================
  const fetchActivities = useCallback(async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Sesi User Tidak Valid');
        return; 
      }

      const { data, error } = await supabase
        .from('user_activities')
        .select(`
          id, 
          name, 
          unit, 
          weight, 
          user_progress_bars (
            id, 
            name, 
            color,
            current_progress
          )
        `);

      if (error) throw error;
      setActivities(data as unknown as UserActivity[]);
    } catch (error: unknown) {
      console.error('Gagal mengambil aktivitas:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // ==========================================
  // LOGIKA PERHITUNGAN MAKSIMAL INPUT & ESTIMASI
  // ==========================================
  const activeActivity = activities.find(act => act.id === selectedActivityId);
  const parentBar = activeActivity?.user_progress_bars;

  const currentBarProgress = parentBar?.current_progress || 0; 
  const maxBarPercentage = 100;
  // Menghitung sisa persentase (Mencegah nilai minus)
  const remainingPercentage = Math.max(0, maxBarPercentage - currentBarProgress); 

  const weight = (activeActivity?.weight && activeActivity.weight > 0) 
  ? activeActivity.weight 
  : 1;

  // Batas Maksimal Input Unit berdasarkan konversi (Sisa Persentase / Berat Konversi)
  const maxAllowedInput = remainingPercentage > 0 && weight > 0 
    ? Number((remainingPercentage * weight).toFixed(1)) 
    : 0;

  // Estimasi persentase yang akan didapat dari nilai yang diketik
  const calculatedProgress = inputValue && weight > 0
    ? Number((Number(inputValue) / weight).toFixed(1)) 
    : 0;

  // ==========================================
  // HANDLER INPUT NILAI (VALIDASI WAKTU NYATA)
  // ==========================================
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setInputValue('');
      return;
    }
    
    const numValue = Number(val);

    // Kunci nilai agar tidak melebihi batas maksimal sisa ruang
    if (numValue > maxAllowedInput) {
      setInputValue(maxAllowedInput);
    } else if (numValue < 0) {
      setInputValue(0);
    } else {
      setInputValue(numValue);
    }
  };

  // ==========================================
  // FUNGSI SIMPAN KE DATABASE (SUBMIT)
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivityId || inputValue === '') return;
    
    setIsSubmitting(true);
    try {
      // 1. Dapatkan informasi sesi user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Harap login terlebih dahulu.");

      // 2. Dapatkan data bar induk saat ini
      if (!activeActivity || !activeActivity.user_progress_bars) {
        throw new Error("Aktivitas atau Target Bar tidak valid.");
      }

      const weight = activeActivity.weight > 0 ? activeActivity.weight : 1;

        // 1. Ini nilai untuk BUKU TABUNGAN (Log Harian)
        const calculatedProgress = Number((Number(inputValue) / weight).toFixed(1));

        // 2. Ini nilai untuk ISI CELENGAN (Total Progres)
        const currentProgress = activeActivity.user_progress_bars?.current_progress || 0;
        const newTotalProgress = Number((currentProgress + calculatedProgress).toFixed(1));

        // ... di dalam try block ...

        // 3. KOREKSI UTAMA: Insert ke daily_logs
        const { error: insertError } = await supabase
          .from('daily_logs')
          .insert({
            user_id: user.id,
            activity_id: selectedActivityId,
            // PERBAIKAN: Gunakan calculatedProgress, BUKAN newTotalProgress
            progress_value: calculatedProgress, 
            notes: notes || '',
          });

        if (insertError) throw insertError;

        // 4. Update total progres ke user_progress_bars
        const parentBarId = activeActivity.user_progress_bars?.id;
        if (parentBarId) {
          const { error: updateError } = await supabase
            .from('user_progress_bars')
            .update({ current_progress: newTotalProgress })
            .eq('id', parentBarId);
            
          if (updateError) throw updateError;
        }

      alert('Berhasil menyimpan progres! 🎉');
      
      // Reset Form agar siap digunakan lagi
      setInputValue('');
      setNotes('');
      
      // Refresh daftar aktivitas agar form menyadari perubahan sisa ruang
      await fetchActivities(); 

    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : 'Terjadi kesalahan sistem';
      console.error('Gagal menyimpan:', errMessage);
      alert(`Gagal menyimpan: ${errMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex bg-zinc-50 min-h-screen font-sans text-zinc-900">
      <Sidebar activePage="add_log" />

      <main className="flex-1 p-6 pb-28 md:p-12 md:pb-12 max-w-4xl mx-auto w-full">
        
        <header className="mb-10">
          <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none mb-3">
            CATAT <br /><span className="text-[#4CB648]">PROGRES</span>
          </h1>
          <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">
            Rekam aktivitasmu hari ini.
          </p>
        </header>

        {isLoadingData ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-[#4CB648]" />
          </div>
        ) : (
          <form className="bg-white p-8 md:p-12 border border-zinc-200 rounded-sm shadow-sm space-y-10 relative overflow-hidden" onSubmit={handleSubmit}>
            
            {parentBar && (
              <div className={`absolute top-0 left-0 w-full h-2 ${parentBar.color} transition-colors duration-500`} />
            )}

            {/* 1. PILIH AKTIVITAS */}
            <div className="space-y-4">
              <label className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Pilih Aktivitas yang Telah Didaftarkan
              </label>
              <div className="relative">
                <select 
                  value={selectedActivityId}
                  onChange={(e) => {
                    setSelectedActivityId(e.target.value);
                    setInputValue('');
                  }}
                  className="w-full appearance-none bg-zinc-50 border-2 border-zinc-100 p-5 rounded-sm text-[8px] md:text-[10px] font-bold text-zinc-800 focus:border-[#4CB648] outline-none transition-colors"
                >
                  <option value="" disabled>-- PILIH AKTIVITAS --</option>
                  {activities.map(act => (
                    <option key={act.id} value={act.id}>
                      [{act.user_progress_bars?.name || 'TANPA KATEGORI'}] - {act.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-3 h-3 md:w-5 md:h-5 text-zinc-400 pointer-events-none" />
              </div>
              
              {activities.length === 0 && (
                <p className="text-sm text-red-500 font-bold mt-2">
                  ⚠️ Kamu belum memiliki daftar aktivitas. Silakan atur terlebih dahulu di halaman Pengaturan.
                </p>
              )}
            </div>

            {/* 2. TANGGAL AKTIVITAS */}
            <div className="space-y-4 opacity-100 transition-opacity" style={{ opacity: selectedActivityId ? 1 : 0.5, pointerEvents: selectedActivityId ? 'auto' : 'none' }}>
              <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Tanggal Aktivitas</label>
              <input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                max={getTodayLocal()}
                className="w-full bg-zinc-50 border-2 border-zinc-100 p-4 rounded-sm text-[8px] md:text-[10px] font-bold text-zinc-800 focus:border-[#4CB648] outline-none transition-colors"
                required
              />
            </div>

            {/* INFO TARGET & KONVERSI */}
            {activeActivity && parentBar && (
              <div className="flex flex-col md:flex-row gap-4 p-4 bg-zinc-50 border border-zinc-100 rounded-sm">
                <div className="flex items-center gap-2 flex-1">
                  <Target className="w-4 h-4 text-zinc-400" />
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Target Bar: <span className="text-zinc-900">{parentBar.name}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <Activity className="w-4 h-4 text-zinc-400" />
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Konversi: <span className="text-[#4CB648]">{activeActivity.weight} {activeActivity.unit} = 1%</span>
                  </span>
                </div>
              </div>
            )}

            {/* 3. INPUT PENCAPAIAN DENGAN MAKSIMAL VALIDASI */}
            <div className="space-y-4 opacity-100 transition-opacity" style={{ opacity: selectedActivityId ? 1 : 0.5, pointerEvents: selectedActivityId ? 'auto' : 'none' }}>
              <label className="flex justify-between items-center text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                <span>Pencapaian (Nilai)</span>
                {selectedActivityId && (
                  <span className="text-[#4CB648]">Maks: {maxAllowedInput} {activeActivity?.unit}</span>
                )}
              </label>
              <div className="flex gap-4">
                <input 
                  type="number" 
                  step="0.1"
                  min="0"
                  max={maxAllowedInput} 
                  placeholder={selectedActivityId ? `Maks: ${maxAllowedInput}` : "Pilih aktivitas dulu"}
                  value={inputValue}
                  onChange={handleValueChange}
                  disabled={!selectedActivityId || remainingPercentage === 0}
                  className="flex-1 bg-zinc-50 border-2 border-zinc-100 p-2 rounded-sm text-[8px] md:text-[10px] font-black focus:border-[#4CB648] outline-none transition-colors disabled:bg-zinc-100 disabled:text-zinc-400 disabled:cursor-not-allowed" 
                />
                <div className="w-16 md:w-32 bg-zinc-100 flex items-center justify-center text-[8px] md:text-[10px] font-black uppercase text-zinc-400 italic">
                  {activeActivity ? activeActivity.unit : '-'}
                </div>
              </div>
            </div>

            {/* ESTIMASI PROGRES */}
            {selectedActivityId && (
              <div className="flex items-center justify-between py-6 border-t border-zinc-100">
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Estimasi Progres Didapat:</span>
                <span className="text-[16px] md:text-[24px] font-black italic text-[#4CB648]">+{calculatedProgress}%</span>
              </div>
            )}

            {/* CATATAN */}
            <div className="space-y-4">
              <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Catatan Petualangan (Opsional)</label>
              <textarea 
                rows={3}
                placeholder="Bagaimana perasaanmu menyelesaikan ini?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-zinc-50 border-2 border-zinc-100 p-5 rounded-sm font-medium text-[10px] md:text-[12px] focus:border-[#4CB648] outline-none transition-colors resize-none"
              />
            </div>

            {/* TOMBOL SUBMIT */}
            <button 
              disabled={!selectedActivityId || isSubmitting || inputValue === '' || remainingPercentage === 0}
              className="w-full bg-[#4CB648] text-white p-5 rounded-sm text-[8px] md:text-[10px] font-black italic uppercase tracking-[0.2em] shadow-xl shadow-orange-500/20 flex justify-center items-center gap-3 hover:bg-[#047200] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-4 h-4 md:w-6 md:h-6" />} 
              {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN LOG HARIAN'}
            </button>
            
          </form>
        )}
      </main>
    </div>
  );
}