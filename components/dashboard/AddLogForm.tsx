/**
 * File: src/components/dashboard/AddLogForm.tsx
 * Route: Component (Biasa dipanggil di dalam src/app/dashboard/page.tsx)
 * Deskripsi: Form interaktif untuk mencatat aktivitas harian beserta kalkulator progres otomatis.
 */
'use client';

import React, { useState} from 'react';
import { 
  Activity, 
  BookOpen, 
  Code, 
  Dumbbell, 
  Save, 
  TrendingUp,
  X,
  Loader2
} from 'lucide-react';

// PENTING: Uncomment baris di bawah ini saat kamu menyalin kode ke proyek VS Code lokalmu
import { supabase } from '@/lib/supabase';

// --- Tipe Data & Konfigurasi ---

type ActivityType = 'cycling' | 'reading' | 'coding' | 'workout' | 'other';

const ACTIVITY_OPTIONS = [
  { value: 'cycling', label: 'Bersepeda', icon: Activity, unit: 'km' },
  { value: 'workout', label: 'Olahraga (Gym/Lari)', icon: Dumbbell, unit: 'menit' },
  { value: 'coding', label: 'Coding / Belajar IT', icon: Code, unit: 'menit' },
  { value: 'reading', label: 'Membaca Buku', icon: BookOpen, unit: 'halaman' },
  { value: 'other', label: 'Lainnya', icon: TrendingUp, unit: 'unit' },
];

const CATEGORY_OPTIONS = ['Health', 'Technical', 'Productivity', 'Other'];

// --- Logika Kalkulator (Dipindah ke luar komponen agar aman dari ESLint) ---
const calculateProgress = (type: ActivityType, value: number): number => {
  if (!value || value <= 0) return 0;
  
  switch (type) {
    case 'cycling': return (value / 5) * 1; // 5 km = 1%
    case 'workout': return (value / 30) * 1; // 30 menit = 1%
    case 'coding': return (value / 60) * 1; // 60 menit = 1%
    case 'reading': return (value / 10) * 1; // 10 halaman = 1%
    default: return 1; // Default 1%
  }
};

// --- Komponen Utama ---

export default function App() {
  // State Management
  const [isOpen, setIsOpen] = useState(true); // Untuk demo, kita buat default terbuka
  const [activityType, setActivityType] = useState<ActivityType>('cycling');
  const [activityName, setActivityName] = useState('');
  const [metricValue, setMetricValue] = useState<number | ''>('');
  const [category, setCategory] = useState('Health');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Perbaikan Berdasarkan Best Practice (Derived State) ---
  // Kita menghitung previewProgress secara langsung saat render.
  // Tidak perlu useState dan useEffect! Ini menyelesaikan peringatan ESLint dan jauh lebih cepat.
  const val = typeof metricValue === 'number' ? metricValue : 0;
  const previewProgress = calculateProgress(activityType, val);

  // Handler Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metricValue || !activityName) {
      alert('Mohon isi nama aktivitas dan nilainya.');
      return;
    }
    
    setIsSubmitting(true);

    try {
     
      // 1. Ambil ID User yang sedang login
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) throw new Error("User belum login!");

      // 2. Insert ke tabel daily_logs
      const { error: insertError } = await supabase
        .from('daily_logs')
        .insert([
          { 
            activity_name: activityName,
            metric_value: metricValue,
            metric_unit: activeOption?.unit,
            progress_value: previewProgress / 100,
            category: category,
            notes: notes,
            user_id: authData.user.id
          }
        ]);

      if (insertError) throw insertError;

      // Simulasi delay untuk tampilan preview (Hapus bagian ini saat di lokal)
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Data tersimpan (Simulasi):", { activityName, progress: previewProgress / 100 });

      alert('Log berhasil disimpan ke Database!');
      
      // Reset form setelah submit sukses
      setActivityName('');
      setMetricValue('');
      setNotes('');
    } catch (error: unknown) {
      console.error("Error saving to database:", error);
      // Pengecekan tipe (Type Guard) agar aman dari ESLint
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui';
      alert('Gagal menyimpan data: ' + errorMessage);
    } finally {
      setIsSubmitting(false); // Matikan loading state
    }
  };

  const activeOption = ACTIVITY_OPTIONS.find(opt => opt.value === activityType);

  if (!isOpen) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-white text-black px-4 py-2 rounded-lg font-medium"
        >
          Buka Form Log
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6 flex items-center justify-center font-sans text-zinc-100">
      <div className="w-full max-w-md bg-black border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden relative">
        
        {/* Header Form */}
        <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/20">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Catat Progres Baru</h2>
            <p className="text-sm text-zinc-500 mt-1">Setiap langkah kecil berarti.</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Pilih Jenis Aktivitas (Visual Select) */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300">Pilih Jenis Aktivitas</label>
            <div className="grid grid-cols-2 gap-2">
              {ACTIVITY_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = activityType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setActivityType(opt.value as ActivityType);
                      // Auto-set kategori jika memungkinkan
                      if (opt.value === 'cycling' || opt.value === 'workout') setCategory('Health');
                      if (opt.value === 'coding') setCategory('Technical');
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                      isSelected 
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' 
                        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:text-zinc-300'
                    }`}
                  >
                    <Icon className="w-6 h-6 mb-2" />
                    <span className="text-xs font-medium">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Nama & Nilai */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Nama Aktivitas</label>
              <input 
                type="text" 
                placeholder="Contoh: Gowes Pagi di Sudirman"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-white placeholder-zinc-600"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Target/Nilai Dicapai</label>
                <div className="relative">
                  <input 
                    type="number" 
                    min="0"
                    step="0.1"
                    placeholder="0"
                    value={metricValue}
                    onChange={(e) => setMetricValue(e.target.value ? parseFloat(e.target.value) : '')}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-4 pr-16 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-white"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-zinc-500 text-xs font-medium">
                    {activeOption?.unit}
                  </div>
                </div>
              </div>

              <div className="w-1/3">
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Kategori</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-white appearance-none"
                >
                  {CATEGORY_OPTIONS.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Notes (Opsional) */}
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Catatan <span className="text-zinc-600 font-normal">(Opsional)</span></label>
            <textarea 
              rows={2}
              placeholder="Ada pelajaran atau kendala hari ini?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-white placeholder-zinc-600 resize-none"
            />
          </div>

          {/* Preview Hasil & Tombol Submit */}
          <div className="pt-4 border-t border-zinc-900 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Estimasi Pertumbuhan:</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-emerald-400">+{previewProgress.toFixed(2)}%</span>
              </div>
            </div>
            
            <button 
              type="submit"
              disabled={isSubmitting}
              className="bg-white hover:bg-zinc-200 text-black px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Simpan
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}