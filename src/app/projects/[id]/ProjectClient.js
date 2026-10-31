'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getDatabaseErrorMessage } from '@/lib/error-messages';

const columns = [
  ['todo', 'To do'],
  ['in_progress', 'In progress'],
  ['done', 'Done'],
];

export default function ProjectClient({ id }) {
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [role, setRole] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    const [projectResult, taskResult, membershipResult] = await Promise.all([
      supabase.from('projects').select('*').eq('id', id).single(),
      supabase.from('tasks').select('*').eq('project_id', id).order('created_at', { ascending: false }),
      supabase.from('memberships').select('role').eq('project_id', id).maybeSingle(),
    ]);
    if (projectResult.error) setError(getDatabaseErrorMessage(projectResult.error));
    else setProject(projectResult.data);
    if (taskResult.error) setError(getDatabaseErrorMessage(taskResult.error));
    else setTasks(taskResult.data ?? []);
    setRole(membershipResult.data?.role ?? '');
    setLoading(false);
  };

  // Loading remote data on route changes is the purpose of this effect.
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { if (id) load(); }, [id]);

  const addTask = async (event) => {
    event.preventDefault(); setSaving(true); setError('');
    const { data: userData } = await supabase.auth.getUser();
    const { error: saveError } = await supabase.from('tasks').insert({
      project_id: id, title, description, priority, created_by: userData.user?.id,
    });
    if (saveError) setError(getDatabaseErrorMessage(saveError));
    else { setTitle(''); setDescription(''); setPriority('medium'); await load(); }
    setSaving(false);
  };

  const updateTask = async (taskId, changes) => {
    const { error: updateError } = await supabase.from('tasks').update(changes).eq('id', taskId);
    if (updateError) setError(getDatabaseErrorMessage(updateError)); else setTasks((current) => current.map((task) => task.id === taskId ? { ...task, ...changes } : task));
  };

  const deleteTask = async (taskId) => {
    const { error: deleteError } = await supabase.from('tasks').delete().eq('id', taskId);
    if (deleteError) setError(getDatabaseErrorMessage(deleteError)); else setTasks((current) => current.filter((task) => task.id !== taskId));
  };

  if (loading) return <div className="mx-auto max-w-6xl px-6 py-12 text-slate-500">Loading project...</div>;
  if (error && !project) return <div className="mx-auto max-w-3xl px-6 py-12"><p className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</p><Link href="/projects" className="mt-4 inline-block text-indigo-600">Back to projects</Link></div>;

  return (
    <div className="page-shell mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><Link href="/projects" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">← All projects</Link><h1 className="mt-3 text-4xl font-black tracking-tight">{project?.name}</h1><p className="mt-2 text-slate-600">{project?.description || 'No description yet.'}</p></div>
        <div className="flex items-center gap-3"><span className="rounded-full bg-indigo-100 px-3 py-1 text-sm capitalize text-indigo-700">{role}</span><Link href={`/projects/${id}/settings`} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:border-indigo-300 hover:bg-indigo-50">Team settings ⚙</Link></div>
      </div>
      {error && <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {role !== 'viewer' && <form onSubmit={addTask} className="soft-card mt-8 rounded-2xl p-5">
        <h2 className="font-bold">Add a task</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_150px]"><input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" className="rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100" /><select value={priority} onChange={(e) => setPriority(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><option value="low">Low priority</option><option value="medium">Medium priority</option><option value="high">High priority</option></select></div>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional details" rows="2" className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
        <button disabled={saving} className="mt-3 rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Adding...' : '+ Add task'}</button>
      </form>}
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {columns.map(([status, label]) => <section key={status} className="min-h-56 rounded-2xl border border-slate-200/80 bg-slate-100/80 p-4"><div className="mb-4 flex items-center justify-between"><h2 className="font-bold">{label}</h2><span className="grid h-7 min-w-7 place-items-center rounded-full bg-white px-2 text-sm font-bold text-slate-500 shadow-sm">{tasks.filter((task) => task.status === status).length}</span></div><div className="space-y-3">{tasks.filter((task) => task.status === status).map((task) => <article key={task.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-2"><h3 className="font-semibold">{task.title}</h3><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${task.priority === 'high' ? 'bg-red-50 text-red-600' : task.priority === 'low' ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-600'}`}>{task.priority}</span></div>{task.description && <p className="mt-2 text-sm text-slate-600">{task.description}</p>}{role !== 'viewer' && <div className="mt-4 flex items-center gap-2"><select value={task.status} onChange={(e) => updateTask(task.id, { status: e.target.value })} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs"><option value="todo">To do</option><option value="in_progress">In progress</option><option value="done">Done</option></select><button onClick={() => deleteTask(task.id)} className="rounded-lg border border-red-200 px-2 py-2 text-xs text-red-600 hover:bg-red-50">Delete</button></div>}</article>)}</div></section>)}
      </div>
      {tasks.length === 0 && <p className="mt-6 text-center text-sm text-slate-500">No tasks yet. Add the first task above.</p>}
    </div>
  );
}
