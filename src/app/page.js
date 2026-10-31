import Link from 'next/link';

const features = [
  ['Clear ownership', 'Keep projects, members, and tasks in one simple workspace.'],
  ['Safe by default', 'Supabase RLS protects every project from cross-account access.'],
  ['Useful progress', 'Move tasks from to-do to in progress to done.'],
];

export default function Home() {
  return (
    <div className="page-shell mx-auto max-w-6xl px-6 py-16 sm:py-24">
      <section className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">TeamTasker</p>
          <h1 className="max-w-3xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
            Your team&apos;s work, without the noise.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            A calm, focused task board for small teams. Create a project, give people the right access,
            and make progress visible.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-600/25 hover:-translate-y-0.5 hover:bg-indigo-700">
              Create a free account
            </Link>
            <Link href="/login" className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50">
              I already have an account
            </Link>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 text-white shadow-2xl shadow-indigo-900/20">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-2xl" />
          <div className="mb-6 flex items-center justify-between">
            <span className="font-semibold">Product launch</span>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-300">On track</span>
          </div>
          <div className="space-y-3">
            {['Prepare launch checklist', 'Review homepage copy', 'Invite the design team'].map((task, index) => (
              <div key={task} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-4 hover:bg-white/15">
                <span className={`h-3 w-3 rounded-full ${index === 0 ? 'bg-emerald-400' : 'bg-amber-300'}`} />
                <span className="text-sm">{task}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-slate-400">Simple enough to start. Structured enough to scale.</p>
        </div>
      </section>
      <section className="mt-20 grid gap-5 md:grid-cols-3">
        {features.map(([title, text]) => (
          <article key={title} className="soft-card rounded-2xl p-6 hover:-translate-y-1">
            <h2 className="font-bold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
