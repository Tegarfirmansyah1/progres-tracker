/**
 * File: src/app/history/page.tsx
 * Route: /history
 * Deskripsi: Halaman riwayat untuk melihat semua aktivitas dan melakukan operasi CRUD (Edit & Hapus).
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Target, LogOut, LayoutDashboard, Calendar, 
  Trash2, Edit3, Loader2, X, Save
} from 'lucide-react';

// ------------------------------------------------------------------------
// PENTING UNTUK LOKAL: Buka komentar baris di bawah ini saat di VS Code!
import { supabase } from '@/lib/supabase'; 
// ------------------------------------------------------------------------


// --- Tipe Data ---
interface DailyLog {
  id: string;
  activity_name: string;
  metric_value: number;
  metric_unit: string;
  progress_value: number;
  category: string;
  created_at: string;
}

interface User {
  id: string;
  email?: string;
}

// === SUB-KOMPONEN: EditLogModal ===
interface EditLogModalProps {
  log: DailyLog;
  onClose: () => void;
  onSuccess: () => void;
}

const EditLogModal = ({ log, onClose, onSuccess }: EditLogModalProps) => {
  type ActivityOption = 'cycling' | 'reading' | 'coding' | 'workout';
  
  // Deteksi tipe aktivitas dari data lama berdasarkan unit/category
  let initialType: ActivityOption = 'workout';
  if (log.metric_unit === 'km') initialType = 'cycling';
  else if (log.metric_unit === 'halaman') initialType = 'reading';
  else if (log.category === 'Technical') initialType = 'coding';

  const [activityType, setActivityType] = useState<ActivityOption>(initialType);
  const [activityName, setActivityName] = useState(log.activity_name);
  const [metricValue, setMetricValue] = useState<number | ''>(log.metric_value);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateProgress = (type: string, value: number): number => {
    if (!value || value <= 0) return 0;
    switch (type) {
      case 'cycling': return (value / 5) * 1;
      case 'workout': return (value / 30) * 1;
      case 'coding': return (value / 60) * 1;
      case 'reading': return (value / 10) * 1;
      default: return 1;
    }
  };

  const val = typeof metricValue === 'number' ? metricValue : 0;
  const previewProgress = calculateProgress(activityType, val);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metricValue || !activityName) {
      alert("Mohon lengkapi data.");
      return;
    }

    setIsSubmitting(true);
    try {
      let unit = 'menit';
      if (activityType === 'cycling') unit = 'km';
      if (activityType === 'reading') unit = 'halaman';

      const { error } = await supabase
        .from('daily_logs')
        .update({
          activity_name: activityName,
          metric_value: val,
          metric_unit: unit,
          progress_value: previewProgress / 100,
          category: activityType === 'coding' ? 'Technical' : 'Health',
        })
        .eq('id', log.id); // UPDATE berdasarkan ID log

      if (error) throw error;

      alert('Log berhasil diperbarui!');
      onSuccess();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Gagal mengupdate data';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden w-full max-w-md animate-in fade-in zoom-in duration-300">
      <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/20">
        <h2 className="text-xl font-bold text-white">Edit Progres</h2>
        <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form className="p-6 space-y-6" onSubmit={handleUpdate}>
        <input 
          placeholder="Nama Aktivitas"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none"
          value={activityName}
          onChange={(e) => setActivityName(e.target.value)}
        />
        <div className="flex gap-4">
          <input 
            type="number"
            min="0"
            step="0.1"
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none"
            value={metricValue}
            onChange={(e) => setMetricValue(e.target.value ? parseFloat(e.target.value) : '')}
          />
        </div>
        <div className="pt-4 border-t border-zinc-900 flex items-center justify-between">
          <div className="text-emerald-400 font-bold">+{previewProgress.toFixed(1)}%</div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-emerald-500 hover:bg-emerald-600 text-black px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Update</>}
          </button>
        </div>
      </form>
    </div>
  );
};

// --- KOMPONEN UTAMA RIWAYAT ---
export default function HistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null);

  const fetchHistoryData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        window.location.href = '/login'; 
        return;
      }
      setUser({ id: user.id, email: user.email });

      // Ambil SEMUA data riwayat tanpa limit (atau dengan limit besar)
      const { data: logsData, error: logsError } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (logsError) throw logsError;
      if (logsData) setLogs(logsData);
      
    } catch (error) {
      console.error("Gagal mengambil riwayat:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistoryData();
  }, [fetchHistoryData]);

  // FUNGSI DELETE LOG
  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus aktivitas ini? Data tidak dapat dikembalikan.')) {
      return;
    }

    try {
      // Simulasi delay untuk Canvas, aslinya langsung jalan
      await new Promise(resolve => setTimeout(resolve, 500)); 

      const { error } = await supabase
        .from('daily_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update UI dengan menghapus log yang di-delete tanpa perlu fetch ulang
      setLogs((prev) => prev.filter(log => log.id !== id));
      alert('Aktivitas berhasil dihapus.');

    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Gagal menghapus data';
      alert(msg);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (loading && logs.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans flex">
      {/* Sidebar - Identik dengan Dashboard */}
      <aside className="w-64 border-r border-zinc-900 flex flex-col p-6 hidden lg:flex">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-black" />
          </div>
          <span className="font-bold text-lg tracking-tight">Progres Tracker</span>
        </div>
        <nav className="space-y-2 flex-1">
          <a href="/dashboard" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors text-sm">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </a>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-900 text-white text-sm font-medium">
            <Calendar className="w-4 h-4" /> Riwayat
          </button>
        </nav>
        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-red-400 transition-colors text-sm">
          <LogOut className="w-4 h-4" /> Keluar
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
        <header className="mb-10 border-b border-zinc-900 pb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Riwayat Aktivitas</h1>
          <p className="text-zinc-500 text-sm mt-1">Kelola dan pantau semua progres yang pernah kamu catat.</p>
        </header>

        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden">
          {/* Header Tabel */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-zinc-900 bg-zinc-900/30 text-xs font-bold text-zinc-500 uppercase tracking-wider">
            <div className="col-span-3 lg:col-span-2">Tanggal</div>
            <div className="col-span-5 lg:col-span-4">Aktivitas</div>
            <div className="col-span-2 hidden lg:block">Nilai</div>
            <div className="col-span-2 hidden lg:block">Progres</div>
            <div className="col-span-4 lg:col-span-2 text-right">Aksi</div>
          </div>

          {/* Isi Tabel */}
          <div className="divide-y divide-zinc-900/50">
            {logs.length > 0 ? logs.map((log) => {
              const logDate = new Date(log.created_at);
              const formattedDate = logDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
              
              return (
                <div key={log.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-zinc-900/20 transition-colors">
                  <div className="col-span-3 lg:col-span-2 text-sm text-zinc-400">
                    {formattedDate}
                  </div>
                  
                  <div className="col-span-5 lg:col-span-4">
                    <p className="text-sm font-bold text-white truncate">{log.activity_name}</p>
                    <p className="text-[10px] text-zinc-500 lg:hidden uppercase mt-0.5">
                      {log.metric_value} {log.metric_unit} • +{(log.progress_value * 100).toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="col-span-2 hidden lg:block text-sm text-zinc-300">
                    {log.metric_value} <span className="text-xs text-zinc-500 uppercase">{log.metric_unit}</span>
                  </div>
                  
                  <div className="col-span-2 hidden lg:block text-sm font-bold text-emerald-500">
                    +{(log.progress_value * 100).toFixed(1)}%
                  </div>
                  
                  <div className="col-span-4 lg:col-span-2 flex justify-end gap-2">
                    <button 
                      onClick={() => setEditingLog(log)}
                      className="p-2 text-zinc-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                      title="Edit Log"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(log.id)}
                      className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Hapus Log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            }) : (
              <div className="p-10 text-center text-zinc-500 text-sm">
                Belum ada data riwayat yang tercatat.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL: Edit Log */}
      {editingLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <EditLogModal 
            log={editingLog}
            onClose={() => setEditingLog(null)} 
            onSuccess={() => {
              setEditingLog(null);
              fetchHistoryData();
            }} 
          />
        </div>
      )}
    </div>
  );
}