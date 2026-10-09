import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, getRolePath } from '../../context/AuthContext';
import { ArrowRight, Building2, CheckCircle2, FileCheck2, Leaf, Lock, Mail, ShieldCheck, Workflow } from 'lucide-react';
import { users } from '../../data/mockData';
import { UserRole, User } from '../../types';
import { readStoredValue } from '../../services/localStorageService';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@meil-demo.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState('admin@meil-demo.com');

  const demoAccounts = [
    { role: UserRole.MEIL_ADMIN, label: 'MEIL Admin', email: 'admin@meil-demo.com' },
    { role: UserRole.SUBSIDIARY_SUPERVISOR, label: 'Subsidiary Supervisor', email: 'subsupervisor@demo.com' },
    { role: UserRole.BU_SUPERVISOR, label: 'Business Unit Supervisor', email: 'busupervisor@demo.com' },
    ...[...users, ...readStoredValue<User[]>('meil_project_supervisors', [])].filter((account, index, all) => account.role === UserRole.PROJECT_SUPERVISOR && all.findIndex(other => other.id === account.id) === index).map(account => ({ role: account.role, label: `Project Supervisor · ${account.name}`, email: account.email })),
    ...users.filter(account => account.role === UserRole.PROJECT_USER).map(account => ({ role: account.role, label: `Project User · ${account.name}`, email: account.email })),
  ];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      const authenticatedUser = login(email.trim(), password);
      if (authenticatedUser) navigate(getRolePath(authenticatedUser.role));
      else setError('Invalid email or password. Check your details or choose a demo account.');
    } catch { setError('An error occurred during authentication. Please try again.'); }
    finally { setLoading(false); }
  };

  const setDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail); setSelectedDemo(demoEmail); setPassword('demo123'); setError('');
    const authenticatedUser = login(demoEmail, 'demo123');
    if (authenticatedUser) navigate(getRolePath(authenticatedUser.role));
    else setError('The selected demo account is unavailable. Please try another account.');
  };

  return <main className="h-dvh overflow-hidden bg-[#f4f7fb] px-3 py-3 sm:px-6 sm:py-5 lg:px-10">
    <div className="mx-auto flex h-full min-h-0 max-w-7xl flex-col">
      <header className="flex shrink-0 items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-3" aria-label="MEIL ESG Platform home">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy-900 text-esg-300 shadow-lg shadow-navy-900/15"><Leaf size={23}/></span>
          <span><b className="block text-base tracking-tight text-navy-950 sm:text-lg">MEIL ESG Platform</b><span className="block text-[11px] text-slate-500">Sustainability reporting portal</span></span>
        </Link>
        <Link to="/" className="hidden text-sm font-semibold text-slate-600 hover:text-navy-900 sm:inline">Back to website</Link>
      </header>

      <div className="my-3 grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,0.46fr)_minmax(0,0.54fr)] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_24px_80px_-32px_rgba(15,35,65,0.28)] sm:my-5 sm:rounded-[2rem] lg:grid-cols-[1.04fr_0.96fr] lg:grid-rows-1">
        <section className="relative isolate flex min-h-0 flex-col justify-between overflow-y-auto overscroll-contain bg-gradient-to-br from-[#071b31] via-[#0c2b43] to-[#075a58] p-5 text-white sm:p-7 lg:overflow-hidden lg:p-12">
          <div aria-hidden="true" className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full border border-white/10 bg-white/[0.03]"/><div aria-hidden="true" className="absolute -bottom-44 -left-28 -z-10 h-[28rem] w-[28rem] rounded-full border border-white/10 bg-white/[0.03]"/>
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-200"><ShieldCheck size={14}/> Secure reporting workspace</span>
            <h1 className="mt-3 max-w-xl text-2xl font-bold leading-tight tracking-tight sm:mt-7 sm:text-4xl xl:text-[2.75rem]">One clear view of your ESG reporting.</h1>
            <p className="mt-2 max-w-lg text-xs leading-5 text-slate-300 sm:mt-4 sm:text-base sm:leading-6">Bring project evidence, reviews, and company disclosures together in a structured workflow for MEIL sustainability reporting.</p>

            <div className="mt-4 space-y-3 sm:mt-9 sm:space-y-4">
              <Feature icon={<Building2 size={18}/>} title="Connected organization" desc="Follow submissions from projects through business units and subsidiaries."/>
              <Feature icon={<Workflow size={18}/>} title="Review at every level" desc="Track verification decisions and supporting files across the reporting chain."/>
              <Feature icon={<FileCheck2 size={18}/>} title="Consolidated reporting" desc="Prepare company disclosures from the verified information available to your role."/>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 divide-x divide-white/15 rounded-2xl border border-white/10 bg-white/[0.06] py-3 sm:mt-10 sm:py-4">
            <MiniStat label="Sections" value="A · B · C"/><MiniStat label="Principles" value="01—09"/><MiniStat label="Evidence" value="Traceable"/>
          </div>
          <p className="mt-2 text-[10px] text-slate-400 sm:mt-6 sm:text-[11px]">MEIL ESG &amp; BRSR · Role-based access</p>
        </section>

        <section className="min-h-0 overflow-y-auto overscroll-contain px-5 py-7 sm:px-10 sm:py-9 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Lock size={20}/></div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Welcome back</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-navy-950 sm:text-3xl">Sign in to your account</h2>
              <p className="mt-2 text-sm leading-5 text-slate-500">Use your registered work email to open your reporting workspace.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}
              <div><label htmlFor="login-email" className="mb-1.5 block text-sm font-semibold text-slate-700">Email address</label><div className="relative"><Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/><input id="login-email" type="email" required autoComplete="username" maxLength={120} value={email} onChange={event=>setEmail(event.target.value)} className="input-field h-12 w-full rounded-xl border-slate-300 pl-10 text-sm focus:border-emerald-600 focus:ring-emerald-600" placeholder="name@company.com"/></div></div>
              <div><div className="mb-1.5 flex items-center justify-between"><label htmlFor="login-password" className="text-sm font-semibold text-slate-700">Password</label><Link to="/forgot-password" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">Forgot password?</Link></div><div className="relative"><Lock size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/><input id="login-password" type="password" required autoComplete="current-password" value={password} onChange={event=>setPassword(event.target.value)} className="input-field h-12 w-full rounded-xl border-slate-300 pl-10 text-sm focus:border-emerald-600 focus:ring-emerald-600" placeholder="Enter your password"/></div></div>
              <button type="submit" disabled={loading} className="btn-primary flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-navy-900 text-sm font-bold shadow-lg shadow-navy-900/15 transition hover:bg-navy-800 disabled:opacity-70">{loading?'Signing in…':'Sign in'}{!loading&&<ArrowRight size={17}/>}</button>
            </form>

            <div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-slate-200"/><span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Demo access</span><div className="h-px flex-1 bg-slate-200"/></div>
            <label htmlFor="demo-role" className="mb-1.5 block text-sm font-semibold text-slate-700">Choose a role to explore</label>
            <select id="demo-role" aria-label="Choose demo role and account" value={selectedDemo} onChange={event=>setDemoAccount(event.target.value)} className="input-field h-12 w-full rounded-xl border-slate-300 text-sm focus:border-emerald-600 focus:ring-emerald-600">{demoAccounts.map(account=><option key={account.email} value={account.email}>{account.label}</option>)}</select>
            <p className="mt-2 text-xs text-slate-500">Demo accounts sign in automatically with password <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono font-semibold text-slate-700">demo123</span>.</p>

            <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-start gap-3"><ShieldCheck size={17} className="mt-0.5 shrink-0 text-emerald-700"/><p className="text-xs leading-5 text-slate-600"><b className="text-slate-800">Protected workspace</b><br/>Your access and reporting tools depend on your assigned role.</p></div></div>
            <p className="mt-6 text-center text-sm text-slate-500">Need an account? <Link to="/register" className="font-bold text-emerald-700 hover:text-emerald-800">Register here</Link></p>
          </div>
        </section>
      </div>
      <footer className="pb-2 text-center text-[11px] text-slate-400">© MEIL ESG &amp; BRSR Reporting Platform</footer>
    </div>
  </main>;
}

function Feature({icon,title,desc}:{icon:React.ReactNode;title:string;desc:string}) { return <div className="flex gap-3.5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.08] text-emerald-200">{icon}</span><div><h3 className="text-sm font-semibold text-white">{title}</h3><p className="mt-1 max-w-sm text-xs leading-5 text-slate-300">{desc}</p></div></div>; }
function MiniStat({label,value}:{label:string;value:string}) { return <div className="px-3 text-center"><p className="text-sm font-bold text-white">{value}</p><p className="mt-1 text-[10px] text-slate-300">{label}</p></div>; }
