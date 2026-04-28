'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Target, Settings2, Plus, LayoutDashboard, Calendar, Settings, LogOut, Zap, Trash2, Loader2, Edit3, X, Save, ChevronDown } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/sidebar';

interface ActivityData {
  id: string;
  name: string;
  unit: string;
  weight: number;
}

interface ParentBar {
  id: string;
  name: string;
  target_value: number;
  color: string;
  user_activities?: ActivityData[]; // Tambahan: untuk menyimpan anak aktivitas
}

interface NewBarPayload {
  user_id: string;
  name: string;
  target_value: number;
  color: string;
}

interface NewActivityPayload {
  user_id: string;
  bar_id: string;
  name: string;
  unit: string;
  weight: number;
}

export default function SettingsPage() {
  const [parentBars, setParentBars] = useState<ParentBar[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // State Form Bar
  const [editingBarId, setEditingBarId] = useState<string | null>(null);
  const [newBarName, setNewBarName] = useState('');
  const [newBarTarget, setNewBarTarget] = useState<number | ''>(100);
  const [newBarColor, setNewBarColor] = useState('bg-[#4CB648]');
  const [isSubmittingBar, setIsSubmittingBar] = useState(false);

  // State Form Aktivitas
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [selectedBarId, setSelectedBarId] = useState('');
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityUnit, setNewActivityUnit] = useState('');
  const [newActivityWeight, setNewActivityWeight] = useState<number | ''>('');
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);

  // GET DATA: Ambil Bar beserta Aktivitasnya
  const fetchParentBars = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Perubahan: Tambahkan user_activities(*) untuk mengambil data aktivitas
      const { data, error } = await supabase
        .from('user_progress_bars')
        .select('*, user_activities(*)')
        .eq('user_id', user.id);

      if (error) throw error;
      setParentBars(data as ParentBar[]);
    } catch (error: unknown) {
      console.error(error instanceof Error ? error.message : 'Gagal memuat data.');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchParentBars();
  }, [fetchParentBars]);

  // --- HANDLER BAR INDUK ---
  const handleSubmitBar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBarName || newBarTarget === '') return alert('Nama dan Target bar harus diisi!');
    setIsSubmittingBar(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Anda belum login.');

      const payload: NewBarPayload = {
        user_id: user.id,
        name: newBarName.toUpperCase(),
        target_value: Number(newBarTarget),
        color: newBarColor
      };

      if (editingBarId) {
        // Mode Update
        const { error } = await supabase.from('user_progress_bars').update(payload).eq('id', editingBarId);
        if (error) throw error;
        alert(`Bar "${payload.name}" berhasil diperbarui!`);
      } else {
        // Mode Tambah Baru
        const { error } = await supabase.from('user_progress_bars').insert(payload);
        if (error) throw error;
        alert(`Bar "${payload.name}" berhasil dibuat!`);
      }

      cancelEditBar();
      fetchParentBars();
    } catch (error: unknown) {
      alert(`Gagal menyimpan bar: ${error instanceof Error ? error.message : 'Error'}`);
    } finally {
      setIsSubmittingBar(false);
    }
  };

  // Memasukkan data ke form untuk diedit
  const handleEditBarClick = (bar: ParentBar) => {
    setEditingBarId(bar.id);
    setNewBarName(bar.name);
    setNewBarTarget(bar.target_value);
    setNewBarColor(bar.color);
  };

  // Membatalkan edit bar
  const cancelEditBar = () => {
    setEditingBarId(null);
    setNewBarName('');
    setNewBarTarget(100);
    setNewBarColor('bg-[#4CB648]');
  };

  const handleDeleteBar = async (id: string, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus Bar "${name}"? Semua aktivitas dan log di dalamnya juga akan terhapus.`)) return;
    try {
      const { error } = await supabase.from('user_progress_bars').delete().eq('id', id);
      if (error) throw error;
      fetchParentBars();
      if (selectedBarId === id) setSelectedBarId('');
    } catch (error: unknown) {
      alert(`Gagal menghapus bar: ${error instanceof Error ? error.message : 'Error'}`);
    }
  };

  // --- HANDLER AKTIVITAS ---
  const handleSubmitActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBarId || !newActivityName || !newActivityUnit || newActivityWeight === '') {
      return alert('Semua field aktivitas harus diisi!');
    }
    setIsSubmittingActivity(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Anda belum login.');

      const payload: NewActivityPayload = {
        user_id: user.id,
        bar_id: selectedBarId,
        name: newActivityName.toUpperCase(),
        unit: newActivityUnit.toUpperCase(),
        weight: Number(newActivityWeight)
      };

      if (editingActivityId) {
        // Mode Update
        const { error } = await supabase.from('user_activities').update(payload).eq('id', editingActivityId);
        if (error) throw error;
        alert(`Aktivitas "${payload.name}" berhasil diperbarui!`);
      } else {
        // Mode Tambah Baru
        const { error } = await supabase.from('user_activities').insert(payload);
        if (error) throw error;
        alert(`Aktivitas "${payload.name}" berhasil didaftarkan!`);
      }

      cancelEditActivity();
      fetchParentBars(); // Refresh agar aktivitas baru muncul di daftar bawah
    } catch (error: unknown) {
      alert(`Gagal menyimpan aktivitas: ${error instanceof Error ? error.message : 'Error'}`);
    } finally {
      setIsSubmittingActivity(false);
    }
  };

  // Memasukkan aktivitas ke form untuk diedit
  const handleEditActivityClick = (act: ActivityData, barId: string) => {
    setEditingActivityId(act.id);
    setSelectedBarId(barId);
    setNewActivityName(act.name);
    setNewActivityUnit(act.unit);
    setNewActivityWeight(act.weight);
  };

  // Membatalkan edit aktivitas
  const cancelEditActivity = () => {
    setEditingActivityId(null);
    setSelectedBarId('');
    setNewActivityName('');
    setNewActivityUnit('');
    setNewActivityWeight('');
  };

  // Handler Hapus Aktivitas
  const handleDeleteActivity = async (id: string, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus Aktivitas "${name}"? Log harian terkait aktivitas ini juga akan terhapus.`)) return;
    try {
      const { error } = await supabase.from('user_activities').delete().eq('id', id);
      if (error) throw error;
      fetchParentBars(); // Refresh daftar setelah dihapus
    } catch (error: unknown) {
      alert(`Gagal menghapus aktivitas: ${error instanceof Error ? error.message : 'Error'}`);
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
      <Sidebar activePage="settings" />
      <main className="flex-1 p-6 md:p-12 max-w-6xl mx-auto w-full">
        <header className="mb-12 border-b border-zinc-200 pb-8">
          <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none mb-4">
            PENGATURAN <br /><span className="text-zinc-400">SISTEM</span>
          </h1>
          <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Atur Kategori Bar Induk & Aktivitas Petualanganmu</p>
        </header>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* ================= KOLOM KIRI: MANAJEMEN BAR ================= */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-[#4CB648]" />
              <div>
                <h2 className="text-xl font-black italic uppercase tracking-tight">Kustom Bar Induk</h2>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Kelola Kategori Utama</p>
              </div>
            </div>

            <form onSubmit={handleSubmitBar} className="bg-white p-8 border border-zinc-200 rounded-sm shadow-sm space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Nama Bar (Cth: Finansial)</label>
                <input type="text" value={newBarName} onChange={(e) => setNewBarName(e.target.value)} placeholder="NAMA BAR" className="w-full bg-zinc-50 border-2 border-zinc-100 p-4 font-bold outline-none focus:border-[#4CB648] transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Target Maksimal</label>
                <input type="number" value={newBarTarget} onChange={(e) => setNewBarTarget(e.target.value === '' ? '' : Number(e.target.value))} placeholder="100" className="w-full bg-zinc-50 border-2 border-zinc-100 p-4 font-bold outline-none focus:border-[#4CB648] transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Warna Tema</label>
                <div className="flex gap-3">
                  {['bg-[#4CB648]', 'bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-zinc-900'].map(color => (
                    <button key={color} type="button" onClick={() => setNewBarColor(color)} className={`w-10 h-10 rounded-full ${color} transition-all ${newBarColor === color ? 'ring-4 ring-zinc-300 ring-offset-2 scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'}`} />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button type="submit" disabled={isSubmittingBar} className="flex-1 bg-zinc-900 text-white p-4 font-black italic uppercase tracking-widest text-sm flex justify-center items-center gap-3 hover:bg-black transition-colors disabled:opacity-50">
                  {isSubmittingBar ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingBarId ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />)} 
                  {editingBarId ? 'SIMPAN PERUBAHAN' : 'BUAT BAR INDUK'}
                </button>
                {editingBarId && (
                  <button type="button" onClick={cancelEditBar} className="bg-zinc-200 text-zinc-600 px-6 font-black italic uppercase tracking-widest text-sm hover:bg-zinc-300 transition-colors flex justify-center items-center rounded-sm" title="Batal Edit">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </form>

            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-200 pb-2">Daftar Bar Induk Saya</h3>
              {parentBars.length === 0 ? (
                <p className="text-sm font-medium text-zinc-500 italic">Belum ada bar yang dibuat.</p>
              ) : (
                parentBars.map(bar => (
                  <div key={bar.id} className="flex items-center justify-between bg-white p-4 border border-zinc-200 rounded-sm shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className={`w-4 h-12 rounded-sm ${bar.color}`} />
                      <div>
                        <h4 className="font-black italic uppercase tracking-tight text-zinc-800">{bar.name}</h4>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Target: {bar.target_value}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEditBarClick(bar)} className="p-2 text-zinc-300 hover:text-blue-500 transition-colors" title="Edit Bar">
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDeleteBar(bar.id, bar.name)} className="p-2 text-zinc-300 hover:text-red-500 transition-colors" title="Hapus Bar">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* ================= KOLOM KANAN: MANAJEMEN AKTIVITAS ================= */}
          <section className={`space-y-8 transition-opacity ${parentBars.length === 0 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <div className="flex items-center gap-3">
              <Settings2 className="w-8 h-8 text-[#4CB648]" />
              <div>
                <h2 className="text-xl font-black italic uppercase tracking-tight">Daftarkan Aktivitas</h2>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Masukkan Aktivitas Ke Dalam Bar</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmitActivity} className="bg-white p-8 border border-zinc-200 rounded-sm shadow-sm space-y-6">
              {parentBars.length === 0 && (
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-sm text-xs font-bold text-orange-600 mb-4">
                  ⚠️ Buat minimal 1 Bar Induk di sebelah kiri terlebih dahulu.
                </div>
              )}
              
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Pilih Bar Induk</label>
                <select value={selectedBarId} onChange={(e) => setSelectedBarId(e.target.value)} className="w-full bg-zinc-50 border-2 border-zinc-100 p-4 font-bold outline-none focus:border-[#4CB648] transition-colors appearance-none">
                  <option value="" disabled>-- PILIH BAR INDUK --</option>
                  {parentBars.map(bar => <option key={bar.id} value={bar.id}>{bar.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Nama Aktivitas</label>
                <input type="text" value={newActivityName} onChange={(e) => setNewActivityName(e.target.value)} placeholder="CTH: LARI PAGI" className="w-full bg-zinc-50 border-2 border-zinc-100 p-4 font-bold outline-none focus:border-[#4CB648] transition-colors" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Satuan</label>
                  <div className="relative">
                    <select 
                      value={newActivityUnit} 
                      onChange={(e) => setNewActivityUnit(e.target.value)} 
                      className="w-full bg-zinc-50 border-2 border-zinc-100 p-4 font-bold outline-none focus:border-[#4CB648] transition-colors appearance-none"
                    >
                      <option value="" disabled>-- PILIH --</option>
                      <option value="KM">Kilometer (KM)</option>
                      <option value="METER">Meter (M)</option>
                      <option value="MENIT">Menit</option>
                      <option value="JAM">Jam</option>
                      <option value="HALAMAN">Halaman</option>
                      <option value="KALI">Kali / Repetisi</option>
                      <option value="KG">Kilogram (KG)</option>
                      <option value="SESI">Sesi / Modul</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Bobot (%/Satuan)</label>
                  <input type="number" step="0.1" value={newActivityWeight} onChange={(e) => setNewActivityWeight(e.target.value === '' ? '' : Number(e.target.value))} placeholder="1.0" className="w-full bg-zinc-50 border-2 border-zinc-100 p-4 font-bold outline-none focus:border-[#4CB648] transition-colors" />
                </div>
              </div>
              
              <div className="flex gap-3 mt-4">
                <button type="submit" disabled={isSubmittingActivity || parentBars.length === 0} className="flex-1 bg-zinc-900 text-white p-4 font-black italic uppercase tracking-widest text-sm flex justify-center items-center gap-3 hover:bg-black transition-colors disabled:opacity-50">
                  {isSubmittingActivity ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingActivityId ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />)} 
                  {editingActivityId ? 'SIMPAN PERUBAHAN' : 'DAFTARKAN AKTIVITAS'}
                </button>
                {editingActivityId && (
                  <button type="button" onClick={cancelEditActivity} className="bg-zinc-200 text-zinc-600 px-6 font-black italic uppercase tracking-widest text-sm hover:bg-zinc-300 transition-colors flex justify-center items-center rounded-sm" title="Batal Edit">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </form>

            {/* DAFTAR AKTIVITAS (READ & DELETE) */}
            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-200 pb-2">Aktivitas Terdaftar</h3>
              {parentBars.every(bar => !bar.user_activities || bar.user_activities.length === 0) ? (
                <div className="p-6 text-center border-2 border-dashed border-zinc-200 rounded-sm">
                  <p className="text-sm font-medium text-zinc-500 italic">Belum ada aktivitas yang didaftarkan.</p>
                </div>
              ) : (
                parentBars.map(bar => {
                  if (!bar.user_activities || bar.user_activities.length === 0) return null;
                  
                  return (
                    <div key={bar.id} className="mb-8">
                      <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${bar.color}`} /> {bar.name}
                      </h4>
                      <div className="space-y-2">
                        {bar.user_activities.map(act => (
                          <div key={act.id} className="flex items-center justify-between bg-white p-4 border border-zinc-200 rounded-sm shadow-sm group hover:border-[#4CB648] transition-colors">
                            <div>
                              <h5 className="font-black italic uppercase tracking-tight text-zinc-800">{act.name}</h5>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                                Konversi: <span className="text-[#4CB648]">1 {act.unit} = {act.weight}%</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => handleEditActivityClick(act, bar.id)}
                                className="p-2 text-zinc-300 hover:text-blue-500 transition-colors"
                                title="Edit Aktivitas"
                              >
                                <Edit3 className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteActivity(act.id, act.name)}
                                className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                                title="Hapus Aktivitas"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}