import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { CakeSlice, Lock, User, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('Dinorashirinliklari');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Iltimos, admin loginini kiriting!');
      return;
    }
    if (!password.trim()) {
      setError('Iltimos, admin parolini kiriting!');
      return;
    }

    setIsLoading(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || "Login yoki parol noto'g'ri! Qayta urinib ko'ring.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dinora-bg flex items-center justify-center p-4 selection:bg-dinora-gold selection:text-dinora-chocolate">
      {/* Background Decorative Glow Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-dinora-gold/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-dinora-pink/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Card Header & Brand Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-dinora-chocolate text-dinora-gold shadow-xl mb-4 border border-dinora-gold/30">
            <CakeSlice className="w-9 h-9" />
          </div>
          <h1 className="text-3xl font-bold text-dinora-chocolate font-serif tracking-tight">
            DINORA
          </h1>
          <p className="text-xs font-semibold uppercase tracking-widest text-dinora-gold mt-1">
            Shirinliklar Do'koni • Admin Panel
          </p>
        </div>

        {/* Login Form Surface */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-dinora-border relative">
          <div className="mb-6 border-b border-dinora-border/60 pb-4">
            <h2 className="text-lg font-bold text-dinora-chocolate font-serif flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-dinora-gold" />
              <span>Tizimga Kirish</span>
            </h2>
            <p className="text-xs text-dinora-gray mt-1">
              Admin panelga kirish uchun login va parolingizni kiriting
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-dinora-pink-light border border-dinora-pink/30 rounded-2xl text-xs text-dinora-pink font-semibold flex items-center gap-2 animate-in fade-in duration-200">
              <span className="text-base">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <Input
              label="Admin Logini"
              placeholder="Dinorashirinliklari"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(null);
              }}
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            {/* Password Input with Show/Hide Toggle */}
            <div className="w-full">
              <label className="block text-xs font-semibold text-dinora-chocolate uppercase tracking-wider mb-1.5">
                Admin Paroli
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-dinora-gray">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  className="block w-full rounded-xl border border-dinora-border bg-white pl-10 pr-10 py-2.5 text-sm text-dinora-chocolate placeholder-dinora-gray/60 transition-all focus:border-dinora-gold focus:outline-none focus:ring-2 focus:ring-dinora-gold/30 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-dinora-gray hover:text-dinora-chocolate"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login Submit Button */}
            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full mt-4 font-bold shadow-md"
              isLoading={isLoading}
              icon={<Sparkles className="w-5 h-5 text-dinora-chocolate" />}
            >
              Tizimga Kirish
            </Button>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-dinora-gray mt-6">
          DINORA Shirinliklar Do'koni © 2026 • Xavfsiz Admin Paneli
        </p>
      </div>
    </div>
  );
};
