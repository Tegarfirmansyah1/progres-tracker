/**
 * File: src/app/dashboard/page.tsx
 * Route: /dashboard
 * Deskripsi: Dashboard utama dengan integrasi AddLogForm dalam modal.
 */
'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Flame, 
  Target, 
  Plus, 
  LogOut, 
  LayoutDashboard,
  Calendar,
  CheckCircle2,
  Loader2,
  Activity,
  X,
  BookOpen,
  Code,
  Dumbbell,
  Save
} from 'lucide-react';
import { 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis
} from 'recharts';

// === SUB-KOMPONEN: AddLogForm ===
// Di lokal: Import dari @/components/dashboard/AddLogForm
const AddLogForm = ({ onClose }: { onClose: () => void }) => {
  const [activityType, setActivityType] = useState<'cycling' | 'reading' | 'coding' | 'workout' | 'other'>('cycling');
  const [activityName, setActivityName] = useState('');
  const [metricValue, setMetricValue] = useState<number | ''>('');
  
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

  return (
    <div className="bg-black border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden w-full max-w-md animate-in fade-in zoom-in duration-300">
      <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/20">
        <h2 className="text-xl font-bold text-white">Catat Progres</h2>
        <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form className="p-6 space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Simulasi: Data tersimpan!'); onClose(); }}>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'cycling', label: 'Sepeda', icon: Activity },
            { id: 'coding', label: 'Coding', icon: Code },
            { id: 'workout', label: 'Gym', icon: Dumbbell },
            { id: 'reading', label: 'Baca', icon: BookOpen },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setActivityType(opt.id as 'cycling' | 'reading' | 'coding' | 'workout' | 'other')}
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
          placeholder="Nama Aktivitas"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none"
          value={activityName}
          onChange={(e) => setActivityName(e.target.value)}
        />

        <div className="flex gap-4">
          <input 
            type="number"
            placeholder="Nilai"
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none"
            value={metricValue}
            onChange={(e) => setMetricValue(e.target.value ? parseFloat(e.target.value) : '')}
          />
          <div className="w-1/3 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-xs text-zinc-500 font-bold">
             {activityType === 'cycling' ? 'KM' : 'MENIT'}
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-900 flex items-center justify-between">
          <div className="text-emerald-400 font-bold">+{previewProgress.toFixed(1)}%</div>
          <button className="bg-white text-black px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
            <Save className="w-4 h-4" /> Simpan
          </button>
        </div>
      </form>
    </div>
  );
};

// --- DATA MOCK ---
const MOCK_CHART_DATA = [
  { date: 'Mon', growth: 1.2 }, { date: 'Tue', growth: 1.5 }, { date: 'Wed', growth: 2.1 },
  { date: 'Thu', growth: 1.8 }, { date: 'Fri', growth: 2.8 }, { date: 'Sat', growth: 3.5 }, { date: 'Sun', growth: 4.2 },
];

// --- KOMPONEN UTAMA DASHBOARD ---
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

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
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors text-sm">
            <Calendar className="w-4 h-4" /> Riwayat
          </button>
        </nav>
        <button className="mt-auto flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-red-400 transition-colors text-sm">
          <LogOut className="w-4 h-4" /> Keluar
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Dashboard</h1>
            <p className="text-zinc-500 text-sm mt-1">Lacak progres 1% harianmu.</p>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-zinc-200 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" /> Tambah Log
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Streak', value: '12 Hari', icon: Flame, color: 'text-orange-500' },
            { label: 'Total Growth', value: '14.2%', icon: TrendingUp, color: 'text-emerald-500' },
            { label: 'Target', value: '8 / 10', icon: CheckCircle2, color: 'text-blue-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl">
              <div className={`w-10 h-10 mb-4 rounded-lg bg-zinc-900 flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Charts & Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-8">Statistik Mingguan</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_CHART_DATA}>
                  <defs>
                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                  <Area type="monotone" dataKey="growth" stroke="#10b981" strokeWidth={3} fill="url(#colorGrowth)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6">
            <h3 className="font-bold mb-6">Baru Saja</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-2">
                  <div className="w-10 h-10 rounded bg-zinc-900 flex items-center justify-center text-emerald-500">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">Lari Pagi</p>
                    <p className="text-[10px] text-zinc-500 uppercase">5.0 KM</p>
                  </div>
                  <div className="text-emerald-500 font-bold text-sm">+1.0%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL: Integrasi AddLogForm */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <AddLogForm onClose={() => setShowAddForm(false)} />
        </div>
      )}
    </div>
  );
}