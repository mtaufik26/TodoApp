'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, User, Info } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter, usePathname } from 'next/navigation';

/** Interface untuk payload JWT */
interface JwtPayload {
  role: string;
  fullName?: string;
  [key: string]: any;
}

/** Fungsi untuk decode token JWT */
function parseJwt(token: string): JwtPayload | null {
  try {
    const base64Payload = token.split('.')[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload); 
  } catch (err) {
    console.error('Failed to parse JWT', err);
    return null; 
  }
}

/** Komponen Navbar */
export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State dropdown

  const { token, logout } = useAuthStore(); // Ambil token & fungsi logout global

  const [fullName, setFullName] = useState<string | null>(null); // Nama user

  const router = useRouter();
  const pathname = usePathname();

  const profileUrl = '/default-profile.png'; // Foto default user

  const userInitial = fullName ? fullName[0] : 'U'; // Inisial user

  /** Fungsi untuk menampilkan nama halaman berdasarkan path */
  const getPageName = () => {
    if (pathname.startsWith('/auth/admin')) return 'Admin Page';
    if (pathname.startsWith('/todo')) return 'Tasks Page';
    if (pathname === '/') return 'Home';
    return 'Unknown Page';
  };

  /** Update fullName saat token berubah */
  useEffect(() => {
    if (token) {
      const decoded = parseJwt(token);
      setFullName(decoded?.fullName || null);
    } else {
      setFullName(null);
    }
  }, [token]);

  /** Fungsi logout user */
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full px-6 py-2.5 flex items-center justify-between bg-white/20 backdrop-blur-md border-b border-white/20 shadow-sm">
      
      {/* Nama halaman saat ini */}
      <div className="flex items-center gap-2 text-slate-700 font-medium">
        <Info className="w-5 h-5 text-sky-500" />
        <span>{getPageName()}</span>
      </div>

      {/* Bagian profil & dropdown */}
      <div className="flex items-center gap-4">
        <div className="relative flex items-center gap-3">

          {/* Avatar user */}
          <div className="relative">
            <Avatar className="h-11 w-11 border-2 border-white shadow-md">
              <AvatarImage src={profileUrl} alt="User profile" />
              <AvatarFallback className="bg-gradient-to-br from-sky-400 to-blue-500 text-white font-semibold">
                {userInitial}
              </AvatarFallback>
            </Avatar>

            {/* Status online */}
            <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></span>
          </div>

          {/* Nama user */}
          {fullName && (
            <span className="font-medium text-slate-700">{fullName}</span>
          )}

          {/* Dropdown menu */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className={`p-1 hover:bg-sky-100 rounded-full transition-transform ${isDropdownOpen ? 'rotate-180 bg-sky-100' : ''}`}
            >
              <ChevronDown className="w-4 h-4 text-slate-600 transition-transform duration-200" />
            </button>

            {isDropdownOpen && (
              <>
                {/* Background klik untuk menutup dropdown */}
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                
                {/* Konten dropdown */}
                <div className="absolute right-0 top-full mt-3 w-56 bg-white/95 backdrop-blur-sm border border-sky-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="py-2">
                    <span
                      onClick={handleLogout}
                      className="w-full block px-4 py-2.5 cursor-pointer text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
