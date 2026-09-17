'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { confirmEmail, saveAuth } from '@/lib/auth';

export default function ConfirmPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Verifying your email link...');
  const [status, setStatus] = useState<'loading' | 'success' | 'info' | 'error'>('loading');

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token_hash');
    const emailParam = new URLSearchParams(window.location.search).get('email');

    if (!token) {
      setStatus('info');
      setMessage(
        emailParam
          ? `We sent a confirmation email to ${emailParam}. Please click the verification link in your inbox.`
          : 'Open the confirmation link from your email inbox to verify your account.',
      );
      return;
    }

    confirmEmail(token).then((response) => {
      if (!response.success) {
        setStatus('error');
        return setMessage(response.error.message);
      }
      saveAuth(response.data);
      setStatus('success');
      setMessage('Your email has been verified successfully! Redirecting to Studio...');
      setTimeout(() => router.push('/dashboard'), 1200);
    });
  }, [router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-neutral-950 px-4 py-12 text-neutral-100 selection:bg-amber-400 selection:text-neutral-950 overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-amber-500/15 to-yellow-300/10 blur-[130px]" />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900/80 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl text-center">
        <div className="flex justify-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 font-bold text-neutral-950 shadow-lg shadow-amber-500/20">
            {status === 'success' ? (
              <CheckCircle2 className="h-6 w-6 text-neutral-950" />
            ) : status === 'error' ? (
              <AlertCircle className="h-6 w-6 text-neutral-950" />
            ) : (
              <Mail className="h-6 w-6 text-neutral-950" />
            )}
          </div>
        </div>

        <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
          Email Verification
        </h1>

        <p className="mt-3 text-xs text-neutral-300 leading-relaxed max-w-sm mx-auto">
          {message}
        </p>

        <div className="mt-8 pt-6 border-t border-neutral-800 flex justify-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-semibold text-neutral-950 hover:brightness-105 transition-all"
          >
            <span>Go to Sign In</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
