'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Home, ArrowLeft, Cloud, Compass } from 'lucide-react';

/**
 * Halaman 404 Not Found dengan tampilan menarik
 * - Menampilkan pesan kesalahan
 * - Tombol navigasi ke login atau kembali
 * - Dekorasi awan dan ikon kompas
 */
export default function NotFoundPage() {
  const router = useRouter();

  /** Navigasi ke halaman login */
  const handleLoginRedirect = () => {
    router.push('/login');
  };

  /** Navigasi ke halaman utama */
  const handleHomeRedirect = () => {
    router.push('/');
  };

  /** Kembali ke halaman sebelumnya */
  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 p-4">
      {/* Floating clouds decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 text-sky-200/30">
          <Cloud size={60} />
        </div>
        <div className="absolute top-40 right-32 text-sky-200/20">
          <Cloud size={80} />
        </div>
        <div className="absolute bottom-40 left-32 text-sky-200/25">
          <Cloud size={70} />
        </div>
        <div className="absolute bottom-20 right-20 text-sky-200/20">
          <Cloud size={50} />
        </div>
      </div>

      {/* Card utama */}
      <Card className="relative shadow-2xl max-w-lg w-full border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
        {/* Gradient header background */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500"></div>
        
        <CardHeader className="text-center relative z-10 pt-8 pb-6">
          {/* 404 dengan animasi bounce */}
          <div className="relative mb-4">
            <CardTitle className="text-8xl font-black text-white drop-shadow-lg mb-2 tracking-wider">
              4<span className="inline-block animate-bounce mx-2">0</span>4
            </CardTitle>
            <div className="absolute -inset-2 bg-white/20 blur-xl rounded-full"></div>
          </div>
          
          <CardDescription className="text-white/90 text-lg font-medium">
            Oops! Halaman Tidak Ditemukan
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6 px-8 pb-8 relative z-10">
          {/* Ikon kompas */}
          <div className="p-4 bg-sky-50 rounded-full border-2 border-sky-200">
            <Compass className="w-12 h-12 text-sky-600" />
          </div>

          {/* Pesan kesalahan */}
          <div className="text-center space-y-3">
            <p className="text-sky-700 font-semibold text-lg">
              Sepertinya Anda tersesat!
            </p>
            <p className="text-sky-600 text-sm leading-relaxed max-w-xs">
              Halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau URL yang dimasukkan salah.
            </p>
          </div>

          {/* Tombol aksi */}
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
            {/* Tombol ke halaman login */}
            <Button 
              variant="default" 
              className="flex-1 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-semibold py-3 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
              onClick={handleLoginRedirect}
            >
              <Home className="w-4 h-4 mr-2" />
              Ke Halaman Login
            </Button>
            
            {/* Tombol kembali */}
            <Button 
              variant="outline" 
              className="flex-1 border-sky-300 text-sky-700 hover:bg-sky-50 hover:border-sky-400 font-semibold py-3 transition-all duration-300"
              onClick={handleGoBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </div>

          {/* Teks bantuan tambahan */}
          <div className="text-center mt-4 pt-4 border-t border-sky-100">
            <p className="text-sky-500 text-xs">
              Butuh bantuan? Hubungi tim support kami
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
