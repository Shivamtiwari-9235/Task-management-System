'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getAuthErrorMessage } from '@/lib/auth-errors';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      console.error('Supabase signup failed:', error);
      setErrorMsg(getAuthErrorMessage(error));
      setLoading(false);
    } else {
      if (data.session) {
        router.push('/projects');
      } else {
        setSuccessMsg('Your account has been created. Verify your email address, then log in.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="page-shell flex min-h-[calc(100vh-73px)] items-center justify-center p-4">
      <div className="soft-card w-full max-w-md rounded-3xl p-8 sm:p-10">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-cyan-100 text-xl font-black text-cyan-600">+</div>
        <h1 className="mb-2 text-center text-3xl font-black text-slate-900">Create account</h1>
        <p className="mb-7 text-center text-sm leading-6 text-slate-500">
          Build a simple shared workspace where your team can plan projects, organize tasks, and see progress clearly.
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

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              placeholder="Ramesh Kumar"
            />
          </div>
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
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-7 rounded-2xl bg-cyan-50 p-4 text-sm text-cyan-950">
          <p className="font-semibold">Your first steps after joining</p>
          <p className="mt-1 leading-6 text-cyan-900/80">
            Create your first project, add a short description, then invite teammates with the right role.
          </p>
        </div>

        <p className="text-sm text-center mt-6 text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}