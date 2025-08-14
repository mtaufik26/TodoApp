'use client';

import { useState } from 'react';
import { useMutation } from 'react-query';
import { login } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

/** Komponen input dengan label floating dan icon */
const FloatingInput = ({
  id,
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  className = '',
  onBlur,
  icon: Icon,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  className?: string;
  icon?: any;
}) => {
  const [isFocused, setIsFocused] = useState(false); // State untuk fokus input

  return (
    <div className={`relative ${className}`}>
      {/* Label floating */}
      <Label
        htmlFor={id}
        className={`absolute left-10 transition-all duration-300 ease-out pointer-events-none ${
          isFocused || value
            ? '-top-2.5 text-xs px-2 bg-white text-sky-600 z-10 font-medium'
            : 'top-3.5 text-sm text-gray-400'
        }`}
      >
        {label}
      </Label>

      {/* Icon input */}
      {Icon && (
        <Icon
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${
            isFocused || value ? 'text-sky-500' : 'text-gray-400'
          }`}
        />
      )}

      {/* Input field */}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        className="h-12 w-full border border-gray-200 rounded-lg pl-10 pr-3 pt-2 bg-white/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:bg-white hover:bg-white/80"
        required={required}
      />
    </div>
  );
};

/** Halaman Login */
const LoginPage = () => {
  const setToken = useAuthStore((state) => state.setToken); // Simpan token ke global store
  const router = useRouter();

  // State untuk input, toggle, dan loading
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [rememberMeError, setRememberMeError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /** Mutation untuk login */
  const mutation = useMutation(() => login(email, password), {
    onSuccess: (data) => {
      if (data?.content?.token) {
        setToken(data.content.token); // Simpan token
        console.log('Login Token:', data.content.token);
        toast.success('Login berhasil!');
        router.push('/todos'); // Redirect ke halaman todos
      } else {
        toast.error('Token tidak ditemukan, silakan coba lagi.');
      }
    },
    onError: (error) => {
      console.error('Login error:', error);
      toast.error('Email atau password salah');
    },
  });

  /** Handle submit form login */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi remember me
    if (!rememberMe) {
      setRememberMeError(true);
      toast.error('Anda harus mencentang Remember Me untuk melanjutkan.');
      return;
    }

    setRememberMeError(false);
    setIsLoading(true);
    mutation.mutate(undefined, {
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md relative z-10">
        {/* Card utama */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-lg">

          {/* Header */}
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center text-gray-800">
              Sign In
            </CardTitle>
            <p className="text-sm text-gray-500 text-center">
              Enter your credentials to access your account
            </p>
          </CardHeader>

          {/* Konten Form */}
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Input Email */}
              <FloatingInput
                id="email"
                label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                icon={Mail}
              />

              {/* Input Password dengan toggle show/hide */}
              <div className="relative">
                <FloatingInput
                  id="password"
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  required
                  icon={Lock}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-sky-50 rounded-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </Button>
              </div>

              {/* Checkbox Remember Me */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(!!checked)}
                    className={`data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500 ${rememberMeError ? 'border-red-500' : ''}`}
                  />
                  <Label
                    htmlFor="remember-me"
                    className={`text-sm cursor-pointer ${rememberMeError ? 'text-red-500' : 'text-gray-600'}`}
                  >
                    Remember me
                  </Label>
                </div>
                <Button
                  variant="link"
                  className="text-sm h-auto p-0 text-sky-600 hover:text-sky-700 font-medium"
                >
                  Forgot password?
                </Button>
              </div>

              {/* Tombol Sign In */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>

          {/* Footer Card */}
          <CardFooter className="flex flex-col space-y-4 pt-6">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500 font-medium">
                  New to our platform?
                </span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Button
                  variant="link"
                  className="text-sm h-auto p-0 text-sky-600 hover:text-sky-700 font-semibold"
                  onClick={() => router.push('/register')}
                >
                  Create account
                </Button>
              </p>
            </div>
          </CardFooter>

        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
