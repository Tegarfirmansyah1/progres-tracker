import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const calculateProgress = (
  activityType: 'cycling' | 'reading' | 'coding', 
  metricValue: number
): number => {
  switch (activityType) {
    case 'cycling':
      // Rumus: Setiap 5 km = 1% (0.01)
      return (metricValue / 5) * 0.01;
      
    case 'reading':
      // Rumus: Setiap 10 halaman = 1% (0.01)
      return (metricValue / 10) * 0.01;
      
    case 'coding':
      // Rumus: Setiap 60 menit (1 jam) = 1% (0.01)
      return (metricValue / 60) * 0.01;
      
    default:
      return 0.01; // Fallback jika tidak ada aturan spesifik
  }
};