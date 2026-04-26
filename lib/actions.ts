// src/lib/actions.ts
import { supabase } from './supabase';
import { calculateProgress } from './utils';

export const addDynamicLog = async (
  activityType: 'cycling' | 'reading' | 'coding',
  activityName: string, // Contoh: "Gowes Pagi di Sudirman"
  metricValue: number,  // Contoh: 10
  metricUnit: string,   // Contoh: "km"
  category: string,
  notes: string
) => {
  // Hitung otomatis progresnya (Contoh: 10 km sepeda = 0.02 atau 2%)
  const calculatedProgress = calculateProgress(activityType, metricValue);

  const { data, error } = await supabase
    .from('daily_logs')
    .insert([
      { 
        activity_name: activityName,
        metric_value: metricValue,
        metric_unit: metricUnit,
        progress_value: calculatedProgress,
        category: category,
        notes: notes,
        user_id: (await supabase.auth.getUser()).data.user?.id 
      }
    ]);

  if (error) throw error;
  return data;
};