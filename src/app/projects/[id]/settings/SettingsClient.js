'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getDatabaseErrorMessage } from '@/lib/error-messages';

export default function SettingsClient({ id }) {
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [role, setRole] = useState('');
  const [memberId, setMemberId] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    const [projectResult, memberResult, mineResult] = await Promise.all([
      supabase.from('projects').select('*').eq('id', id).single(),
      supabase.from('memberships').select('project_id, user_id, role, profiles(full_name, email)').eq('project_id', id).order('created_at'),
      supabase.from('memberships').select('role').eq('project_id', id).maybeSingle(),
    ]);
    if (projectResult.error) setError(getDatabaseErrorMessage(projectResult.error)); else setProject(projectResult.data);
    if (memberResult.error) setError(getDatabaseErrorMessage(memberResult.error)); else setMembers(memberResult.data ?? []);
    setRole(mineResult.data?.role ?? '');
  };

  // Loading remote data on route changes is the purpose of this effect.
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { if (id) load(); }, [id]);

  const addMember = async (event) => {
    event.preventDefault(); setError(''); setMessage('');
    const userId = memberId.trim();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      setError('Please enter a valid Supabase user UUID.');
      return;
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      setError('Your session has expired or cannot reach Supabase. Please sign in again and check your internet connection.');
      return;
    }

    const { error: addError } = await supabase.from('memberships').insert({ project_id: id, user_id: userId, role: memberRole });
    if (addError) setError(getDatabaseErrorMessage(addError)); else { setMemberId(''); setMessage('Member added.'); await load(); }
  };

  const changeRole = async (userId, nextRole) => {
    const { error: updateError } = await supabase.from('memberships').update({ role: nextRole }).eq('project_id', id).eq('user_id', userId);
    if (updateError) setError(getDatabaseErrorMessage(updateError)); else await load();
  };

  const removeMember = async (userId) => {
    const { error: removeError } = await supabase.from('memberships').delete().eq('project_id', id).eq('user_id', userId);
    if (removeError) setError(getDatabaseErrorMessage(removeError)); else await load();
  };

  return <div className="page-shell mx-auto max-w-4xl px-6 py-10">
    <Link href={`/projects/${id}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">← Back to project</Link>
    <h1 className="mt-4 text-4xl font-black tracking-tight">Team settings</h1>
    <p className="mt-2 text-slate-600">{project?.name || 'Loading project...'}</p>
    {message && <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">✓ {message}</p>}
    {error && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {role === 'owner' && <form onSubmit={addMember} className="soft-card mt-8 rounded-2xl p-6"><h2 className="font-bold">Add a teammate</h2><p className="mt-1 text-sm text-slate-500">Use the teammate&apos;s Supabase user ID. Never ask for their password.</p><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_150px_auto]"><input required value={memberId} onChange={(e) => setMemberId(e.target.value)} placeholder="User UUID" className="rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100" /><select value={memberRole} onChange={(e) => setMemberRole(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><option value="member">Member</option><option value="viewer">Viewer</option></select><button className="rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 hover:bg-indigo-700">+ Add</button></div></form>}
    <section className="soft-card mt-8 rounded-2xl p-6"><h2 className="font-bold">Members ({members.length})</h2><div className="mt-4 divide-y divide-slate-100">{members.map((member) => <div key={member.user_id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-indigo-100 font-bold text-indigo-700">{(member.profiles?.full_name || 'T').charAt(0).toUpperCase()}</span><div><p className="font-medium">{member.profiles?.full_name || 'Team member'}</p><p className="text-xs text-slate-500">{member.profiles?.email || 'Email hidden'}</p></div></div>{role === 'owner' && member.role !== 'owner' ? <div className="flex gap-2"><select value={member.role} onChange={(e) => changeRole(member.user_id, e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm"><option value="member">Member</option><option value="viewer">Viewer</option></select><button onClick={() => removeMember(member.user_id)} className="rounded-lg border border-red-200 px-3 text-sm text-red-600 hover:bg-red-50">Remove</button></div> : <span className="rounded-full bg-slate-100 px-3 py-1 text-xs capitalize text-slate-600">{member.role}</span>}</div>)}</div></section>
  </div>;
}
