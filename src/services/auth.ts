import api from '../lib/api';

/** Interface response dari endpoint login */
interface LoginResponse {
  content: {
    token: string;          // JWT token
    user: {
      id: string;
      fullName: string;
      email: string;
      role: string;
    };
  };
  message: string;          // Pesan dari server
}

/** Fungsi login user */
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const res = await api.post('/login', { email, password }); // POST ke /login
  return res.data; // Mengembalikan data response
};

/** Interface response dari endpoint register */
interface RegisterResponse {
  content: any;             // Konten data user yang dibuat
  message: string;          // Pesan dari server
  errors?: string[];        // Optional: error validasi
}

/** Fungsi registrasi user baru */
export const register = async (
  email: string,
  fullName: string,
  password: string
): Promise<RegisterResponse> => {
  const completeEmail = email.includes('@') ? email : `${email}@nodewave.id`; // Tambah domain default jika tidak ada
  const res = await api.post('/register', { email: completeEmail, fullName, password }); // POST ke /register
  return res.data; // Mengembalikan data response
};

/** Interface response dari endpoint verify token */
interface VerifyTokenResponse {
  valid: boolean;           // Apakah token valid
  user?: {                  // Optional: informasi user jika valid
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

/** Fungsi untuk verifikasi JWT token */
export const verifyToken = async (token: string): Promise<VerifyTokenResponse> => {
  const res = await api.post('/verify-token', { token }); // POST ke /verify-token
  return res.data; // Mengembalikan data response
};
