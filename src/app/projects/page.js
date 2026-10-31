'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getDatabaseErrorMessage } from '@/lib/error-messages';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [joinId, setJoinId] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadProjects = async (memberUserId = userId) => {
    setLoading(true);
    setError('');
    const { data: memberships, error: membershipError } = await supabase
      .from('memberships')
      .select('project_id, role, created_at')
      .eq('user_id', memberUserId)
      .order('created_at', { ascending: false });
    if (membershipError) {
      setError(getDatabaseErrorMessage(membershipError));
      setProjects([]);
      setLoading(false);
      return false;
    }

    const projectIds = (memberships ?? []).map((item) => item.project_id);
    if (projectIds.length === 0) {
      setProjects([]);
      setLoading(false);
      return true;
    }

    const { data: projectRows, error: projectError } = await supabase
      .from('projects')
      .select('id, name, description, owner_id, created_at')
      .in('id', projectIds);

    if (projectError) setError(getDatabaseErrorMessage(projectError));
    else {
      const projectsById = new Map((projectRows ?? []).map((project) => [project.id, project]));
      setProjects((memberships ?? []).map((membership) => ({
        ...projectsById.get(membership.project_id),
        role: membership.role,
      })).filter((project) => project.id));
    }
    setLoading(false);
    return !projectError;
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? '');
      if (user) loadProjects(user.id);
      else {
        setError('You must be signed in to view projects.');
        setLoading(false);
      }
    });
    // Load once for the authenticated user when the page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createProject = async (event) => {
    event.preventDefault();
    setSaving(true); setError(''); setMessage('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Your session has expired. Please sign in again.');
      setSaving(false);
      return;
    }
    const { error: createError } = await supabase.rpc('create_project', {
      project_name: name,
      project_description: description,
    });
    if (createError) setError(getDatabaseErrorMessage(createError));
    else {
      setName('');
      setDescription('');
      const loaded = await loadProjects(user.id);
      if (loaded) setMessage('Project created.');
    }
    setSaving(false);
  };

  const joinProject = async (event) => {
    event.preventDefault();
    setSaving(true); setError(''); setMessage('');
    const { error: joinError } = await supabase.from('memberships').insert({
      project_id: joinId.trim(), user_id: userId, role: 'member',
    });
    if (joinError) setError(joinError.code === '23505' ? 'You are already a member of this project.' : getDatabaseErrorMessage(joinError));
    else { setJoinId(''); setMessage('You joined the project.'); await loadProjects(userId); }
    setSaving(false);
  };

  return (
    <div className="page-shell mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <p className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-sm font-bold uppercase tracking-wider text-indigo-700">Workspace</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Your projects</h1>
        <p className="mt-2 text-slate-600">Create a workspace or join one with its project ID.</p>
      </div>
      {message && <p className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">✓ {message}</p>}
      {error && <p className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <div className="space-y-6">
          <form onSubmit={createProject} className="soft-card rounded-2xl p-6">
            <div className="mb-5 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-100 text-xl text-indigo-600">✦</span><div><h2 className="font-bold">Create a project</h2><p className="text-xs text-slate-500">Start something great.</p></div></div>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this project about?" rows="3" className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
            <button disabled={saving} className="mt-3 w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : '+ Create project'}</button>
          </form>
          <form onSubmit={joinProject} className="soft-card rounded-2xl p-6">
            <h2 className="font-bold">Join a project</h2>
            <p className="mt-1 text-sm text-slate-500">Ask the owner for the project ID.</p>
            <input required value={joinId} onChange={(e) => setJoinId(e.target.value)} placeholder="Project UUID" className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
            <button disabled={saving} className="mt-3 w-full rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50">Join project →</button>
          </form>
        </div>
        <section>
          {loading ? <p className="text-slate-500">Loading projects...</p> : projects.length === 0 ? (
            <div className="soft-card rounded-2xl border-dashed p-10 text-center">
              <h2 className="font-bold">No projects yet</h2><p className="mt-2 text-sm text-slate-500">Create your first project to get started.</p>
            </div>
          ) : <div className="grid gap-4 sm:grid-cols-2">{projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} className="soft-card group rounded-2xl p-5 hover:-translate-y-1 hover:border-indigo-300">
              <div className="flex items-start justify-between gap-3"><h2 className="font-bold group-hover:text-indigo-700">{project.name}</h2><span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium capitalize text-indigo-700">{project.role}</span></div>
              <p className="mt-3 line-clamp-2 text-sm text-slate-600">{project.description || 'No description yet.'}</p>
              <p className="mt-5 text-xs text-slate-400">ID: {project.id}</p>
            </Link>
          ))}</div>}
        </section>
      </div>
    </div>
  );
}
