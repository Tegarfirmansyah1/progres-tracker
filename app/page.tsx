import type { Metadata } from 'next';
// ... import font, css, dll

export const metadata: Metadata = {
  title: 'Uply',
  description: 'Track your daily progress',
  // 👇 Tambahkan blok verification ini sayang
  verification: {
    google: 'google06a854067e314766.html', // Ganti dengan kode dari Google
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Next.js akan otomatis menyuntikkan meta tag ke dalam <head> */}
      <body className="bg-[#0f0f0f] text-white">
        {children}
      </body>
    </html>
  );
} 