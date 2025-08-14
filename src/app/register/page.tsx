'use client';

import { useState } from 'react';
import { useMutation } from 'react-query';
import { register } from '../../services/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Eye, 
  EyeOff, 
  User, 
  Phone, 
  Globe, 
  Mail, 
  Lock, 
  FileText,
  UserPlus,
  ArrowLeft
} from 'lucide-react';

// Tipe data untuk form register
type FormData = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  country: string;
  email: string;
  password: string;
  confirmPassword: string;
  bio: string;
};

/* Komponen Input Floating
   Digunakan untuk input teks dengan label melayang dan ikon */
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
  suffix,
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
  suffix?: string;
}) => {
  const [isFocused, setIsFocused] = useState(false); // Status fokus input

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

      {/* Icon di dalam input */}
      {Icon && (
        <Icon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${
          isFocused || value ? 'text-sky-500' : 'text-gray-400'
        }`} />
      )}

      {/* Input utama */}
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        className={`h-12 border border-gray-200 rounded-lg pl-10 pt-2 bg-white/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:bg-white hover:bg-white/80 ${
          suffix ? 'pr-32' : 'pr-3'
        }`}
        required={required}
      />

      {/* Suffix jika ada */}
      {suffix && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400 pointer-events-none font-medium">
          {suffix}
        </div>
      )}
    </div>
  );
};

/* Komponen Select Floating
   Digunakan untuk dropdown dengan label melayang dan ikon */
const FloatingSelect = ({
  id,
  label,
  value,
  onChange,
  options,
  required = false,
  icon: Icon,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  icon?: any;
}) => {
  const [isOpen, setIsOpen] = useState(false); // Status dropdown terbuka

  return (
    <div className="relative">
      {/* Label floating */}
      <Label
        htmlFor={id}
        className={`absolute left-10 transition-all duration-300 ease-out pointer-events-none ${
          isOpen || value
            ? '-top-2.5 text-xs px-2 bg-white text-sky-600 z-10 font-medium'
            : 'top-3.5 text-sm text-gray-400'
        }`}
      >
        {label}
      </Label>

      {/* Icon di dalam select */}
      {Icon && (
        <Icon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${
          isOpen || value ? 'text-sky-500' : 'text-gray-400'
        } z-10`} />
      )}

      {/* Select dropdown */}
      <Select value={value} onValueChange={onChange} onOpenChange={setIsOpen} required={required}>
        <SelectTrigger
          id={id}
          className="h-12 border border-gray-200 rounded-lg pl-10 pt-2 bg-white/70 transition-all duration-200 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:bg-white hover:bg-white/80"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

/* Komponen Textarea Floating
   Digunakan untuk textarea dengan label melayang dan ikon */
const FloatingTextarea = ({
  id,
  label,
  value,
  onChange,
  required = false,
  icon: Icon,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  icon?: any;
}) => {
  const [isFocused, setIsFocused] = useState(false); // Status fokus textarea

  return (
    <div className="relative">
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

      {/* Icon di dalam textarea */}
      {Icon && (
        <Icon className={`absolute left-3 top-4 h-4 w-4 transition-colors duration-200 ${
          isFocused || value ? 'text-sky-500' : 'text-gray-400'
        }`} />
      )}

      {/* Textarea utama */}
      <Textarea
        id={id}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="min-h-[100px] border border-gray-200 rounded-lg pl-10 pt-6 bg-white/70 transition-all duration-200 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:bg-white hover:bg-white/80 resize-none"
        required={required}
      />
    </div>
  );
};

/* Halaman RegisterPage
   Form untuk registrasi pengguna baru */
export default function RegisterPage() {
  const router = useRouter();

  // State untuk menyimpan data form
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    country: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
  });

  // State untuk menampilkan/menyembunyikan password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Mutation untuk register user
  const mutation = useMutation(
    () =>
      register(
        `${formData.email}@nodewave.id`,
        `${formData.firstName} ${formData.lastName}`,
        formData.password
      ),
    {
      onSuccess: () => {
        toast.success('Registration successful! Please login.');
        router.push('/login');
      },
      onError: () => {
        toast.error('Registration failed. Please try again.');
      },
    }
  );

  // Fungsi untuk update state form
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Fungsi submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Password and confirmation do not match');
      return;
    }
    mutation.mutate();
  };

  // Pilihan negara untuk select
  const countryOptions = [
    { value: 'indonesia', label: 'Indonesia' },
    { value: 'malaysia', label: 'Malaysia' },
    { value: 'singapore', label: 'Singapore' },
    { value: 'thailand', label: 'Thailand' },
    { value: 'philippines', label: 'Philippines' },
    { value: 'vietnam', label: 'Vietnam' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">      
      <div className="w-full max-w-xl relative z-10">
          {/* Header Card */}
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-5xl font-bold text-center text-gray-800">
              Register
            </CardTitle>
            <p className="text-lg text-gray-500 text-center">
              Let’s Sign up first for enter into Square Website. Uh She Up!
            </p>
          </CardHeader>

        {/* Card utama */}
        <Card className="shadow-xl border-0 bg-white/90 py-6 backdrop-blur-lg">          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingInput
                  id="firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                  icon={User}
                />
                <FloatingInput
                  id="lastName"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                  icon={User}
                />
              </div>

              {/* Phone and Country */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-2">
                  <div className="w-16 h-12 bg-gradient-to-r from-sky-100 to-blue-100 border border-sky-200 rounded-lg flex items-center justify-center text-sm font-semibold text-sky-700">
                    +62
                  </div>
                  <FloatingInput
                    id="phoneNumber"
                    label="Phone Number"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    type="tel"
                    required
                    className="flex-1"
                    icon={Phone}
                  />
                </div>
                <FloatingSelect
                  id="country"
                  label="Country"
                  value={formData.country}
                  onChange={(value) => handleInputChange('country', value)}
                  options={countryOptions}
                  required
                  icon={Globe}
                />
              </div>

              {/* Email */}
              <FloatingInput
                id="email"
                label="Email"
                value={formData.email}
                onChange={(e) =>
                  handleInputChange('email', e.target.value.replace(/@nodewave\.id.*$/, ''))
                }
                type="text"
                required
                icon={Mail}
                suffix="@nodewave.id"
              />

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password */}
                <div className="relative">
                  <FloatingInput
                    id="password"
                    label="Password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    type={showPassword ? 'text' : 'password'}
                    required
                    icon={Lock}
                  />
                  {/* Tombol show/hide password */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-sky-50 rounded-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <FloatingInput
                    id="confirmPassword"
                    label="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    icon={Lock}
                  />
                  {/* Tombol show/hide confirm password */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-sky-50 rounded-full"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Bio */}
              <div>
                <p className="text-lg text-gray-500 mt-1 ml-1">
                  Tell us about yourself
                </p>
              </div>
              <div>
                <FloatingTextarea
                  id="bio"
                  label="Tell us about yourself"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  icon={FileText}
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                <Button
                  variant="outline"
                  className="h-12 border-sky-200 text-sky-700 hover:bg-sky-50 hover:border-sky-300"
                  onClick={() => router.push('/login')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
                <Button
                  type="submit"
                  className="h-12 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                  disabled={mutation.isLoading}
                >
                  {mutation.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Account
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
