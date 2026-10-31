'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getAuthErrorMessage } from '@/lib/auth-errors';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(getAuthErrorMessage(error));
      setLoading(false);
    } else {
      router.push('/projects');
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    setErrorMsg('');
    setSuccessMsg('');

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      setErrorMsg(getAuthErrorMessage(error));
    } else {
      setSuccessMsg('A new verification email has been sent. Please check your inbox.');
    }

    setResending(false);
  };

  return (
    <div className="page-shell flex min-h-[calc(100vh-73px)] items-center justify-center p-4">
      <div className="soft-card w-full max-w-md rounded-3xl p-8 sm:p-10">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-indigo-100 text-xl font-black text-indigo-600">↗</div>
        <h1 className="mb-2 text-center text-3xl font-black text-slate-900">Welcome back</h1>
        <p className="mb-7 text-center text-sm leading-6 text-slate-500">
          Sign in to manage your team projects, assign tasks, and track progress from one focused workspace.
        </p>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {successMsg}
          </div>
        )}
        {errorMsg.includes('has not been verified') && (
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resending || !email}
            className="mb-4 w-full rounded-xl border border-indigo-200 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resending ? 'Sending verification email...' : 'Resend verification email'}
          </button>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="mt-7 rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-900">
          <p className="font-semibold">What can you do here?</p>
          <p className="mt-1 leading-6 text-indigo-800/80">
            Create a project, invite teammates, and move work from To do to In progress and Done.
          </p>
        </div>

        <p className="text-sm text-center mt-6 text-slate-600">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-indigo-600 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}