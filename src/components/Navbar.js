'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('teamtasker-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    // Restore the saved preference once the browser is available.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const toggleTheme = () => {
    const nextThemeIsDark = !darkMode;
    setDarkMode(nextThemeIsDark);
    document.documentElement.classList.toggle('dark', nextThemeIsDark);
    window.localStorage.setItem('teamtasker-theme', nextThemeIsDark ? 'dark' : 'light');
  };

  return (
    <nav className="glass-nav sticky top-0 z-50 flex items-center justify-between border-b border-white/10 px-5 py-4 text-white shadow-lg sm:px-8">
      <Link href="/" className="group flex items-center gap-2 text-xl font-black tracking-tight">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-500 text-sm shadow-lg shadow-indigo-500/30 group-hover:rotate-6">T</span>
        <span>Team<span className="text-indigo-300">Tasker</span></span>
      </Link>
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
          title={darkMode ? 'Light theme' : 'Dark theme'}
          className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-lg hover:bg-white/20"
        >
          {darkMode ? '☀' : '☾'}
        </button>
        {user ? (
          <>
            <Link href="/projects" className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white">
              My Projects
            </Link>
            <span className="hidden max-w-48 truncate rounded-lg bg-white/10 px-3 py-2 text-xs text-slate-300 sm:block">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-rose-500/90 px-3 py-2 text-xs font-semibold hover:bg-rose-500"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white">
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:bg-indigo-400"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}