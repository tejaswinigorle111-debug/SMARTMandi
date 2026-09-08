import React, { useState } from 'react';
import { LogIn, UserPlus, X } from 'lucide-react';
import { register, login, UserRole, AuthUser } from '../services/auth';
import { Language } from '../types';
import { getTranslation } from '../utils/translations';

interface AuthModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (user: AuthUser) => void;
  context?: 'generic' | 'farmer' | 'buyer';
  onNavigateBuyerRegister?: () => void;
}

const roleLabels: Record<Extract<UserRole, 'FARMER' | 'FPO' | 'BUYER'>, string> = {
  FARMER: 'Farmer',
  FPO: 'FPO',
  BUYER: 'Buyer / Retailer',
};

export const AuthModal: React.FC<AuthModalProps> = ({ language, isOpen, onClose, onAuthenticated, context = 'generic', onNavigateBuyerRegister }) => {
  const t = getTranslation(language);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('FARMER');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      if (context === 'farmer') setRole('FARMER');
      else if (context === 'buyer') setRole('BUYER');
      setMode('login');
      setError(null);
    }
  }, [isOpen, context]);

  if (!isOpen) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const session = mode === 'login'
        ? await login(identifier, password)
        : await register({
            full_name: fullName,
            email: email || undefined,
            phone: phone || undefined,
            password,
            role,
          });
      onAuthenticated(session.user);
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to authenticate');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl border border-[#E8ECE8] bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-[#165B33]">
              {mode === 'login' ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
              <h2 className="text-2xl font-black text-stone-950">
                {mode === 'login' 
                  ? (context === 'farmer' ? t.auth.farmerLogin : context === 'buyer' ? t.auth.buyerLogin : t.auth.signIn)
                  : 'Create account'}
              </h2>
            </div>
            <p className="text-sm font-medium text-stone-500">
              Your role controls access to platform operations.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-stone-500 hover:bg-stone-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <>
              <label className="block text-sm font-black text-stone-700">
                Full name
                <input required value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2.5 font-medium outline-none focus:border-[#2D6A4F]" />
              </label>
              <label className="block text-sm font-black text-stone-700">
                Account role
                <select value={role} onChange={(event) => setRole(event.target.value as UserRole)} className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 font-medium outline-none focus:border-[#2D6A4F]">
                  {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block text-sm font-black text-stone-700">
                  Email
                  <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2.5 font-medium outline-none focus:border-[#2D6A4F]" />
                </label>
                <label className="block text-sm font-black text-stone-700">
                  Phone
                  <input value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2.5 font-medium outline-none focus:border-[#2D6A4F]" />
                </label>
              </div>
            </>
          )}

          {mode === 'login' && (
            <label className="block text-sm font-black text-stone-700">
              {context === 'farmer' ? t.auth.mobileNumber : t.auth.emailOrPhone}
              <input required value={identifier} onChange={(event) => setIdentifier(event.target.value)} type={context === 'farmer' ? 'tel' : 'text'} className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2.5 font-medium outline-none focus:border-[#2D6A4F]" />
            </label>
          )}

          <label className="block text-sm font-black text-stone-700">
            Password
            <input required minLength={10} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2.5 font-medium outline-none focus:border-[#2D6A4F]" />
          </label>

          {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-800">{error}</p>}

          <button disabled={isSubmitting} type="submit" className="w-full rounded-xl bg-[#165B33] px-5 py-3 font-black text-white transition-colors hover:bg-[#114828] disabled:cursor-wait disabled:opacity-60">
            {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>

        <button 
          type="button" 
          onClick={() => { 
            if (mode === 'login' && context === 'buyer' && onNavigateBuyerRegister) {
              onClose();
              onNavigateBuyerRegister();
            } else {
              setMode(mode === 'login' ? 'register' : 'login'); 
              setError(null); 
            }
          }} 
          className="mt-5 w-full text-center text-sm font-black text-[#165B33] hover:underline"
        >
          {mode === 'login' ? t.auth.dontHaveAccount : t.auth.alreadyRegistered}
        </button>
      </div>
    </div>
  );
};
