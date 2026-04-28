'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, TrendingUp, Zap, Loader2, Activity, LayoutDashboard, Plus, Calendar, Settings, LogOut } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/sidebar';
import Image from 'next/image';

interface DailyLog {
  progress_value: number;
  created_at?: string;
}

interface UserActivity {
  name: string;
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

export default function Dashboard() {
  const [bars, setBars] = useState<ProgressBarData[]>([]);
  const [isLoadingData, setLoading] = useState(true);
  const [totalStreak, setTotalStreak] = useState(0);
  const [weeklyIntensity, setWeeklyIntensity] = useState<{day: string, height: number}[]>([]);

  // Utility untuk memformat tanggal ke YYYY-MM-DD
  const formatDateStr = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        window.location.href = '/login'; 
        return;
      }

      // 1. Fetch Progress Bars
      const barsResponse = await supabase
        .from('user_progress_bars')
        .select(`
          id, name, target_value, color,
          user_activities (
            name,
            daily_logs ( progress_value )
          )
        `)
        .eq('user_id', user.id);
        
      const barsData = barsResponse.data;

      const calculatedBars = ((barsData as unknown as UserProgressBar[]) || []).map((bar) => {
        let totalProgress = 0;
        const activityNames: string[] = [];
        
        if (bar.user_activities) {
          bar.user_activities.forEach((act) => {
            if (act.name) activityNames.push(act.name);
            if (act.daily_logs) {
              act.daily_logs.forEach((log) => {
                totalProgress += (log.progress_value || 0);
              });
            }
          });
        }

        const uniqueActivities = Array.from(new Set(activityNames));
        const activitiesSummary = uniqueActivities.length > 0 
          ? uniqueActivities.join(', ') 
          : 'Belum ada aktivitas didaftarkan';

        return {
          id: bar.id,
          name: bar.name,
          target_value: bar.target_value,
          color: bar.color,
          current_progress: totalProgress,
          activities_summary: activitiesSummary
        };
      });

      setBars(calculatedBars);

      // 2. Fetch Daily Logs untuk STREAK & INTENSITAS
      const { data: allLogs } = await supabase
        .from('daily_logs')
        .select('progress_value, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (allLogs && allLogs.length > 0) {
        // --- LOGIKA STREAK HARI BERTURUT-TURUT ---
        // Buat daftar tanggal unik (YYYY-MM-DD)
        const uniqueDates = Array.from(new Set(allLogs.map(log => 
          formatDateStr(new Date(log.created_at))
        )));

        let currentStreak = 0;
        let dateToCheck = new Date();
        const todayStr = formatDateStr(dateToCheck);
        
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterdayStr = formatDateStr(yesterdayDate);

        if (uniqueDates.includes(todayStr)) {
          // Jika ada log hari ini
          currentStreak = 1;
          dateToCheck.setDate(dateToCheck.getDate() - 1); // Cek kemarin
          while (uniqueDates.includes(formatDateStr(dateToCheck))) {
            currentStreak++;
            dateToCheck.setDate(dateToCheck.getDate() - 1);
          }
        } else if (uniqueDates.includes(yesterdayStr)) {
          // Belum ada log hari ini, tapi kemarin ada (Streak masih aktif/bertahan)
          currentStreak = 1; 
          dateToCheck.setDate(dateToCheck.getDate() - 2); // Cek lusa kemarin
          while (uniqueDates.includes(formatDateStr(dateToCheck))) {
            currentStreak++;
            dateToCheck.setDate(dateToCheck.getDate() - 1);
          }
        } else {
          // Tidak ada log hari ini maupun kemarin = Streak Putus
          currentStreak = 0;
        }

        setTotalStreak(currentStreak);

        // --- LOGIKA INTENSITAS 7 HARI TERAKHIR ---
        const daysStr = ['M', 'S', 'S', 'R', 'K', 'J', 'S'];
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return {
            dateStr: formatDateStr(d),
            dayName: daysStr[d.getDay()],
            totalProgress: 0
          };
        });

        allLogs.forEach((log) => {
          const logDateStr = formatDateStr(new Date(log.created_at));
          const targetDay = last7Days.find(d => d.dateStr === logDateStr);
          if (targetDay) {
            targetDay.totalProgress += Number(log.progress_value);
          }
        });

        // Batas absolut 100 agar grafik proporsional
        const maxProgress = Math.max(...last7Days.map(d => d.totalProgress), 100);

        const intensityChartData = last7Days.map(d => ({
          day: d.dayName,
          height: (d.totalProgress / maxProgress) * 100
        }));

        setWeeklyIntensity(intensityChartData);
      } else {
        // Jika tidak ada data log sama sekali
        setTotalStreak(0);
        setWeeklyIntensity([]);
      }
      
    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchDashboardData(); 
  }, [fetchDashboardData]);

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#4CB648] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex font-sans text-zinc-900">
      <Sidebar activePage="dashboard" />
      
      <main className="flex-1 p-6 pb-24 md:p-12 md:pb-12 max-w-5xl mx-auto w-full">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
              RINGKASAN <br /><span className="text-[#4CB648]">PERFORMA</span>
            </h1>
            <p className="text-zinc-500 text-[10px] italic font-black uppercase tracking-[0.2em] mt-4">
              1% LEBIH BAIK
            </p>
          </div>
          <div className="bg-white border border-zinc-200 px-8 py-4 rounded-sm text-center shadow-sm">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">STREAK</p>
            <p className="text-3xl font-black italic">{totalStreak} <span className="text-xs">HARI</span></p>
          </div>
        </header>

        {/* Progress Bars Section */}
        <div className="space-y-10">
          <div className="flex justify-between items-center">
            <h3 className="font-black italic uppercase tracking-tight text-xl">Target Petualangan</h3>
            <a href="/settings/activities" className="text-[10px] font-black text-[#4CB648] uppercase tracking-widest hover:underline">
              Kelola Bar
            </a>
          </div>

          {bars.length === 0 ? (
            <div className="bg-white border border-zinc-200 p-12 rounded-sm text-center shadow-sm">
              <Activity className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
              <h4 className="text-lg font-black italic uppercase tracking-tight text-zinc-800">Belum Ada Bar Induk</h4>
              <p className="text-sm text-zinc-500 mt-2 mb-6">Mulai buat kategori progres Anda di halaman Pengaturan.</p>
              <a href="/settings/activities" className="inline-flex bg-zinc-900 text-white px-6 py-3 font-black italic uppercase tracking-widest text-xs hover:bg-black transition-colors rounded-sm">
                BUAT BAR PERTAMA
              </a>
            </div>
          ) : (
            bars.map((bar) => {
              const percentage = Math.min((bar.current_progress / bar.target_value) * 100, 100);
              
              return (
                <div key={bar.id} className="group">
                  <div className="flex justify-between items-end mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${bar.color}`} />
                      <div>
                        {/* Judul Utama */}
                        <h4 className="font-black italic text-lg uppercase tracking-tight text-zinc-800 leading-none">
                          {bar.name}
                        </h4>
                        {/* Subjudul (Daftar Aktivitas) */}
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1.5">
                          Aktivitas: <span className="text-zinc-500">{bar.activities_summary}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-black italic leading-none">{bar.current_progress.toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  {/* Visual Progress Bar */}
                  <div className="relative h-6 bg-zinc-200 rounded-sm overflow-hidden border border-zinc-300 mt-3">
                    <div 
                      className={`h-full ${bar.color} transition-all duration-1000 ease-out`}
                      style={{ width: `${percentage}%` }}
                    >
                      {/* Efek Garis Miring Khas Strava */}
                      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px]" />
                    </div>
                  </div>
                  
                  <div className="mt-2 flex justify-between items-center px-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Target: {bar.target_value}% | Sisa: {Math.max(bar.target_value - bar.current_progress, 0).toFixed(1)}%
                    </p>
                    <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-[#4CB648] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Tren Mingguan */}
        {weeklyIntensity.length > 0 && (
          <div className="mt-20 bg-white border border-zinc-200 p-8 rounded-sm shadow-sm">
            <h3 className="font-black italic uppercase tracking-tight text-xl mb-8 flex items-center gap-3">
              <TrendingUp className="text-[#4CB648]" /> Intensitas 7 Hari Terakhir
            </h3>
            <div className="flex items-end justify-between h-32 gap-3 border-b border-zinc-100 pb-2 relative">
              {weeklyIntensity.map((data, index) => {
                const isToday = index === 6; 
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2 group relative">
                    <div className="absolute -top-8 bg-zinc-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                       {data.height.toFixed(0)}%
                    </div>

                    <div 
                      style={{ height: `${data.height}%`, minHeight: data.height > 0 ? '4px' : '0px' }} 
                      className={`w-full max-w-[24px] rounded-t-sm transition-all duration-1000 ease-out group-hover:opacity-80 
                        ${isToday ? 'bg-[#4CB648]' : 'bg-zinc-200'}
                      `} 
                    />
                    <span className={`text-[9px] font-black uppercase mt-1 
                      ${isToday ? 'text-[#4CB648]' : 'text-zinc-400'}
                    `}>
                      {data.day}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] font-bold text-zinc-400 text-center mt-4 uppercase tracking-widest">
              Batas atas visualisasi adalah 100% per hari
            </p>
          </div>
        )}
      </main>
    </div>
  );
}