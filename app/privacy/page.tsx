import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-8 md:p-16 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/" className="inline-flex items-center text-[#ff6b00] hover:text-[#e66000] transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Beranda
        </Link>
        
        <h1 className="text-3xl font-bold mb-8">Kebijakan Privasi (Privacy Policy)</h1>
        
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</p>
          
          <h2 className="text-xl font-semibold text-white mt-6">1. Pengumpulan Data</h2>
          <p>Uply (Kami) mengumpulkan informasi dasar saat Anda mendaftar menggunakan Google, termasuk nama dan alamat email Anda. Kami hanya menggunakan data ini untuk keperluan otentikasi dan fungsionalitas pelacakan progres aplikasi.</p>
          
          <h2 className="text-xl font-semibold text-white mt-6">2. Penggunaan Data</h2>
          <p>Informasi yang kami kumpulkan digunakan semata-mata untuk menyimpan dan menampilkan riwayat progres pribadi Anda (seperti data gowes, lari, dll) di dalam aplikasi. Kami tidak menjual atau membagikan data Anda kepada pihak ketiga.</p>
          
          <h2 className="text-xl font-semibold text-white mt-6">3. Keamanan</h2>
          <p>Kami menggunakan layanan otentikasi yang aman dan standar industri (OAuth 2.0) dan tidak pernah menyimpan kata sandi akun Google Anda secara langsung.</p>
          
          <h2 className="text-xl font-semibold text-white mt-6">4. Kontak</h2>
          <p>Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami di email Anda (misal: tegar@example.com).</p>
        </div>
      </div>
    </div>
  );
}