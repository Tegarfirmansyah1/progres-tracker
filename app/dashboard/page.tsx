/**
 * File: src/app/dashboard/page.tsx
 * Route: /dashboard
 * Deskripsi: Dashboard utama yang terhubung penuh ke Supabase dengan Chart dinamis (Real Data).
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, Flame, Target, Plus, LogOut, LayoutDashboard,
  Calendar, CheckCircle2, Loader2, Activity, X, BookOpen, Code, Dumbbell, Save
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis } from 'recharts';

import { supabase } from '@/lib/supabase'; 

// --- Tipe Data ---
interface DailyLog {
  id: string;
  activity_name: string;
  metric_value: number;
  metric_unit: string;
  progress_value: number;
  created_at: string;
}

interface User {
  id: string;
  email?: string;
}

// === SUB-KOMPONEN: AddLogForm ===
interface AddLogFormProps {
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

const AddLogForm = ({ onClose, onSuccess, userId }: AddLogFormProps) => {
  type ActivityOption = 'cycling' | 'reading' | 'coding' | 'workout';
  
  const [activityType, setActivityType] = useState<ActivityOption>('cycling');
  const [activityName, setActivityName] = useState('');
  const [metricValue, setMetricValue] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activityList: { id: ActivityOption; label: string; icon: React.ElementType }[] = [
    { id: 'cycling', label: 'Sepeda', icon: Activity },
    { id: 'coding', label: 'Coding', icon: Code },
    { id: 'workout', label: 'Gym', icon: Dumbbell },
    { id: 'reading', label: 'Baca', icon: BookOpen },
  ];
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metricValue || !activityName) {
      alert("Mohon lengkapi nama aktivitas dan nilainya.");
      return;
    }

    setIsSubmitting(true);
    try {
      let unit = 'menit';
      if (activityType === 'cycling') unit = 'km';
      if (activityType === 'reading') unit = 'halaman';

      const { error } = await supabase
        .from('daily_logs')
        .insert([
          { 
            user_id: userId,
            activity_name: activityName,
            metric_value: val,
            metric_unit: unit,
            progress_value: previewProgress / 100,
            category: activityType === 'coding' ? 'Technical' : 'Health',
          }
        ]);

      if (error) throw error;

      alert('Log berhasil disimpan!');
      onSuccess(); 
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Gagal menyimpan data';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden w-full max-w-md animate-in fade-in zoom-in duration-300">
      <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/20">
        <h2 className="text-xl font-bold text-white">Catat Progres</h2>
        <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form className="p-6 space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-2">
          {activityList.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setActivityType(opt.id)}
              className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                activityType === opt.id ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-zinc-800 text-zinc-500'
              }`}
            >
              <opt.icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold uppercase">{opt.label}</span>
            </button>
          ))}
        </div>

        <input 
          placeholder="Nama Aktivitas (cth: Gowes Pagi)"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none"
          value={activityName}
          onChange={(e) => setActivityName(e.target.value)}
        />

        <div className="flex gap-4">
          <input 
            type="number"
            min="0"
            step="0.1"
            placeholder="Nilai"
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none"
            value={metricValue}
            onChange={(e) => setMetricValue(e.target.value ? parseFloat(e.target.value) : '')}
          />
          <div className="w-1/3 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-xs text-zinc-500 font-bold uppercase">
             {activityType === 'cycling' ? 'km' : (activityType === 'reading' ? 'halaman' : 'menit')}
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-900 flex items-center justify-between">
          <div className="text-emerald-400 font-bold">+{previewProgress.toFixed(1)}%</div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-white text-black px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Simpan</>}
          </button>
        </div>
      </form>
    </div>
  );
};

// --- KOMPONEN UTAMA DASHBOARD ---
export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [chartData, setChartData] = useState<{ date: string; growth: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [totalGrowth, setTotalGrowth] = useState(0);

  const fetchDashboardData = useCallback(async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        window.location.href = '/login'; 
        return;
      }
      setUser({ id: user.id, email: user.email });

      const { data: logsData, error: logsError } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30); // Ambil 30 data terakhir untuk keperluan grafik yang lebih akurat

      if (logsError) throw logsError;

      if (logsData) {
        setLogs(logsData.slice(0, 5)); // Tampilkan 5 terbaru saja di sidebar "Baru Saja"
        
        const total = logsData.reduce((sum, log) => sum + (log.progress_value || 0), 0);
        setTotalGrowth(total * 100); 

        // --- LOGIKA PEMBUATAN DATA CHART DINAMIS (7 HARI TERAKHIR) ---
        // 1. Buat kerangka untuk 7 hari ke belakang (misal: Sen, Sel, Rab...)
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i)); // Mengurutkan dari H-6 sampai Hari Ini
          return {
            fullDate: d.toISOString().split('T')[0], // Format YYYY-MM-DD untuk pencocokan
            date: d.toLocaleDateString('id-ID', { weekday: 'short' }), // Format nama hari (Sen, Sel)
            growth: 0
          };
        });

        // 2. Isi nilai dari database ke dalam kerangka tanggal
        logsData.forEach(log => {
          const logDate = new Date(log.created_at).toISOString().split('T')[0];
          const dayIndex = last7Days.findIndex(day => day.fullDate === logDate);
          
          if (dayIndex !== -1) {
            // Jika tanggal log cocok dengan 7 hari terakhir, tambahkan persentasenya
            last7Days[dayIndex].growth += (log.progress_value * 100);
          }
        });

        // 3. Format agar angka desimal tidak berlebihan (misal: 1.500000002 -> 1.5)
        const formattedChartData = last7Days.map(day => ({
          date: day.date,
          growth: parseFloat(day.growth.toFixed(1))
        }));

        setChartData(formattedChartData);
      }
      
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const handleLogSuccess = () => {
    setShowAddForm(false); 
    fetchDashboardData();  
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-900 flex flex-col p-6 hidden lg:flex">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-black" />
          </div>
          <span className="font-bold text-lg tracking-tight">Progres Tracker</span>
        </div>
        <nav className="space-y-2 flex-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-900 text-white text-sm font-medium">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>
          <a href="/history" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors text-sm">
            <Calendar className="w-4 h-4" /> Riwayat
          </a>
        </nav>
        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-red-400 transition-colors text-sm">
          <LogOut className="w-4 h-4" /> Keluar
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Dashboard</h1>
            <p className="text-zinc-500 text-sm mt-1">{user?.email}</p>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-zinc-200 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Tambah Log</span>
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl">
            <div className="w-10 h-10 mb-4 rounded-lg bg-zinc-900 flex items-center justify-center text-orange-500">
              <Flame className="w-5 h-5" />
            </div>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Total Log</p>
            <h3 className="text-2xl font-bold text-white mt-1">{logs.length} Aktivitas</h3>
          </div>
          
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl">
            <div className="w-10 h-10 mb-4 rounded-lg bg-zinc-900 flex items-center justify-center text-emerald-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Total Growth</p>
            <h3 className="text-2xl font-bold text-white mt-1">+{totalGrowth.toFixed(1)}%</h3>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl">
            <div className="w-10 h-10 mb-4 rounded-lg bg-zinc-900 flex items-center justify-center text-blue-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Status</p>
            <h3 className="text-2xl font-bold text-white mt-1">Konsisten</h3>
          </div>
        </div>

        {/* Charts & Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-2xl p-6 min-w-0">
            <h3 className="font-bold text-lg mb-8">Pertumbuhan 7 Hari Terakhir</h3>
            <div className="w-full h-[300px] min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#71717a', fontSize: 12 }} 
                    dy={10}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }} 
                    formatter={(value: number) => [`+${value}%`, 'Growth']}
                  />
                  <Area type="monotone" dataKey="growth" stroke="#10b981" strokeWidth={3} fill="url(#colorGrowth)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Logs Section */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 flex flex-col h-full">
            <h3 className="font-bold mb-6">Baru Saja</h3>
            <div className="space-y-4 flex-1 overflow-y-auto pr-2">
              {logs.length > 0 ? logs.map((log) => (
                <div key={log.id} className="flex items-center gap-4 p-2 rounded-xl hover:bg-zinc-900/50 transition-colors">
                  <div className="w-10 h-10 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-500">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{log.activity_name}</p>
                    <p className="text-[10px] text-zinc-500 uppercase">{log.metric_value} {log.metric_unit}</p>
                  </div>
                  <div className="text-emerald-500 font-bold text-sm">
                    +{(log.progress_value * 100).toFixed(1)}%
                  </div>
                </div>
              )) : (
                <div className="h-full flex items-center justify-center text-center text-zinc-500 text-sm">
                  Belum ada aktivitas yang dicatat.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL: Integrasi AddLogForm */}
      {showAddForm && user && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <AddLogForm 
            onClose={() => setShowAddForm(false)} 
            onSuccess={handleLogSuccess} 
            userId={user.id} 
          />
        </div>
      )}
    </div>
  );
}