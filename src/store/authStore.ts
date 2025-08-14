import { create } from 'zustand';

/** Interface untuk state autentikasi */
interface AuthState {
  token: string | null;                 // JWT token
  setToken: (token: string | null) => void;  // Simpan atau hapus token
  logout: () => void;                   // Logout user
  getToken: () => string | null;        // Ambil token dari state/localStorage
}

/** Store untuk autentikasi menggunakan Zustand */
export const useAuthStore = create<AuthState>((set) => ({
  // Ambil token dari localStorage saat inisialisasi (jika di browser)
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,

  /** Set token baru, simpan ke localStorage */
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
    set({ token });
  },

  /** Hapus token dan logout user */
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    set({ token: null });
  },

  /** Ambil token dari localStorage */
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },
}));

/** Fungsi helper untuk ambil token dari store tanpa hook */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return useAuthStore.getState().getToken();
};
