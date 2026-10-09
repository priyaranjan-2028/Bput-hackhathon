import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Building2, CheckCircle2, Mail, Plus, Search, UserRoundPlus, X } from 'lucide-react';
import { BusinessUnit, Subsidiary, User } from '../../types';
import { createSubsidiary, createSubsidiarySupervisor, getAllSubsidiarySupervisors, getBusinessUnits, getStoredSubsidiaries } from '../../services/subsidiaryService';

const field = 'input-field mt-1.5 w-full rounded-xl';

export default function SubsidiariesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState('');
  const [formType, setFormType] = useState<'subsidiary'|'supervisor'|null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [subsidiaryForm, setSubsidiaryForm] = useState({name:'',code:'',sector:'',turnover:''});
  const [supervisorForm, setSupervisorForm] = useState({name:'',email:'',subsidiaryId:'',password:'demo123'});
  const subsidiaries = useMemo(() => getStoredSubsidiaries(), [revision]);
  const units = useMemo(() => getBusinessUnits(), [revision]);
  const supervisors = useMemo(() => getAllSubsidiarySupervisors(), [revision]);
  const unassignedSubsidiaries = subsidiaries.filter(item=>!supervisors.some(person=>person.subsidiaryId===item.id||person.assignedSubsidiaryIds?.includes(item.id)));
  const filtered = subsidiaries.filter(item => `${item.name} ${item.code} ${item.sector||''}`.toLowerCase().includes(search.trim().toLowerCase()));

  useEffect(() => {
    const action=searchParams.get('action');
    if(action==='add-subsidiary'||action==='add-supervisor') {
      setFormType(action==='add-subsidiary'?'subsidiary':'supervisor');
      setSearchParams({}, {replace:true});
    }
  }, [searchParams, setSearchParams]);

  const closeForm = () => { setFormType(null); setError(''); };
  const submitSubsidiary = (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setSuccess('');
    try {
      createSubsidiary({name:subsidiaryForm.name,code:subsidiaryForm.code,sector:subsidiaryForm.sector,turnover:subsidiaryForm.turnover===''?undefined:Number(subsidiaryForm.turnover)});
      setRevision(value=>value+1); setSuccess('Subsidiary added to the MEIL organization.'); setSubsidiaryForm({name:'',code:'',sector:'',turnover:''}); closeForm();
    } catch(cause) { setError(cause instanceof Error?cause.message:'Could not add subsidiary.'); }
  };
  const submitSupervisor = (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setSuccess('');
    try {
      createSubsidiarySupervisor(supervisorForm);
      setRevision(value=>value+1); setSuccess('Supervisor account created and assigned to the subsidiary.'); setSupervisorForm({name:'',email:'',subsidiaryId:'',password:'demo123'}); closeForm();
    } catch(cause) { setError(cause instanceof Error?cause.message:'Could not create subsidiary supervisor.'); }
  };

  return <div className="space-y-6">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-wider text-esg-700">MEIL organization setup</p><h1 className="mt-1 text-2xl font-bold text-navy-900">Subsidiaries &amp; Supervisors</h1><p className="mt-1 text-sm text-slate-500">Create subsidiary entities and assign the supervisor responsible for their reporting.</p></div><div className="flex flex-wrap gap-2"><button onClick={()=>{setError('');setFormType('subsidiary');}} className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm"><Plus size={16}/> Add subsidiary</button><button onClick={()=>{setError('');setFormType('supervisor');}} disabled={!unassignedSubsidiaries.length} className="btn-secondary inline-flex items-center gap-2 px-4 py-2.5 text-sm disabled:opacity-50"><UserRoundPlus size={16}/> Add subsidiary supervisor</button></div></header>
    {success&&<div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 size={17}/>{success}</div>}
    <div className="search-panel"><div className="relative w-full sm:max-w-lg"><Search size={17} className="absolute left-3.5 top-3.5 text-slate-400"/><input type="search" aria-label="Search subsidiaries" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search by name, code, or sector" className="search-field pl-10"/></div><span className="text-xs text-slate-500">Showing <b className="text-navy-800">{filtered.length}</b> of {subsidiaries.length} subsidiaries</span></div>

    {filtered.length?<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map((subsidiary:Subsidiary)=>{
      const subsidiaryUnits=units.filter((unit:BusinessUnit)=>unit.subsidiaryId===subsidiary.id);
      const supervisor=supervisors.find((person:User)=>person.id===subsidiary.supervisorId||person.subsidiaryId===subsidiary.id);
      return <article key={subsidiary.id} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-esg-300"><div className="flex items-start justify-between gap-3"><div><span className="font-mono text-[11px] font-bold text-slate-400">{subsidiary.code}</span><h2 className="mt-1 text-lg font-bold text-navy-900">{subsidiary.name}</h2></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800">Active</span></div><div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs"><div><span className="text-slate-500">Sector</span><p className="mt-1 font-semibold text-navy-800">{subsidiary.sector||'Not specified'}</p></div><div><span className="text-slate-500">Annual turnover</span><p className="mt-1 font-semibold text-navy-800">{subsidiary.turnover===undefined?'Not provided':`₹${subsidiary.turnover.toLocaleString()} Cr`}</p></div><div><span className="text-slate-500">Business units</span><p className="mt-1 font-semibold text-navy-800">{subsidiaryUnits.length}</p></div><div><span className="text-slate-500">Supervisor</span><p className="mt-1 font-semibold text-navy-800">{supervisor?.name||'Not assigned'}</p></div></div><div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs"><span className="flex min-w-0 items-center gap-1 text-slate-500">{supervisor?<><Mail size={13}/><span className="truncate">{supervisor.email}</span></>:'Supervisor account needed'}</span>{!supervisor&&<button onClick={()=>{setSupervisorForm(current=>({...current,subsidiaryId:subsidiary.id}));setError('');setFormType('supervisor');}} className="font-semibold text-esg-700 hover:text-esg-800">Assign</button>}<Link to="/admin/hierarchy" className="font-semibold text-esg-700 hover:text-esg-800">Hierarchy</Link></div></article>;
    })}</div>:<div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">No subsidiaries match the search.</div>}

    {formType&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 p-4" onMouseDown={event=>{if(event.target===event.currentTarget)closeForm();}}><form onSubmit={formType==='subsidiary'?submitSubsidiary:submitSupervisor} className="max-h-[90vh] w-full max-w-xl space-y-5 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-wider text-esg-700">MEIL admin form</p><h2 className="mt-1 text-xl font-bold text-navy-900">{formType==='subsidiary'?'Add subsidiary':'Add subsidiary supervisor'}</h2><p className="mt-1 text-xs text-slate-500">{formType==='subsidiary'?'Enter the legal entity details used to identify this reporting boundary.':'Create an account and assign it to one subsidiary.'}</p></div><button type="button" onClick={closeForm} aria-label="Close form" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18}/></button></div>
      {error&&<p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {formType==='subsidiary'?<><label className="block text-xs font-semibold text-navy-700">Legal subsidiary name<input required minLength={2} maxLength={120} value={subsidiaryForm.name} onChange={event=>setSubsidiaryForm({...subsidiaryForm,name:event.target.value})} className={field} placeholder="e.g. MEIL Renewable Energy Limited"/></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-xs font-semibold text-navy-700">Entity code<input required minLength={2} maxLength={24} value={subsidiaryForm.code} onChange={event=>setSubsidiaryForm({...subsidiaryForm,code:event.target.value.toUpperCase().replace(/[^A-Z0-9-]/g,'')})} className={field} placeholder="e.g. SUB004"/></label><label className="block text-xs font-semibold text-navy-700">Business sector<input required minLength={2} maxLength={100} value={subsidiaryForm.sector} onChange={event=>setSubsidiaryForm({...subsidiaryForm,sector:event.target.value})} className={field} placeholder="Infrastructure, energy, water…"/></label></div><label className="block text-xs font-semibold text-navy-700">Annual turnover (₹ crore, optional)<input type="number" min="0" step="0.01" value={subsidiaryForm.turnover} onChange={event=>setSubsidiaryForm({...subsidiaryForm,turnover:event.target.value})} className={field} placeholder="Leave blank if not available"/></label></>:<><label className="block text-xs font-semibold text-navy-700">Full name<input required minLength={2} maxLength={80} value={supervisorForm.name} onChange={event=>setSupervisorForm({...supervisorForm,name:event.target.value})} className={field} placeholder="Supervisor name"/></label><label className="block text-xs font-semibold text-navy-700">Work email<input required type="email" maxLength={120} value={supervisorForm.email} onChange={event=>setSupervisorForm({...supervisorForm,email:event.target.value})} className={field} placeholder="name@company.com"/></label><label className="block text-xs font-semibold text-navy-700">Assigned subsidiary<select required value={supervisorForm.subsidiaryId} onChange={event=>setSupervisorForm({...supervisorForm,subsidiaryId:event.target.value})} className={field}><option value="">Choose a subsidiary</option>{subsidiaries.map(item=>{const assigned=supervisors.some(person=>person.subsidiaryId===item.id||person.assignedSubsidiaryIds?.includes(item.id));return <option key={item.id} value={item.id} disabled={assigned}>{item.name} · {item.code}{assigned?' (supervisor assigned)':''}</option>})}</select></label><label className="block text-xs font-semibold text-navy-700">Temporary password<input required minLength={6} maxLength={80} type="text" autoComplete="new-password" value={supervisorForm.password} onChange={event=>setSupervisorForm({...supervisorForm,password:event.target.value})} className={field}/><span className="mt-1 block text-[11px] font-normal text-slate-500">Set this directly with the supervisor. They can use it to sign in.</span></label></>}
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={closeForm} className="btn-secondary rounded-lg px-4 py-2 text-xs">Cancel</button><button type="submit" className="btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold">{formType==='subsidiary'?<><Building2 size={14}/> Create subsidiary</>:<><UserRoundPlus size={14}/> Create and assign</>}</button></div>
    </form></div>}
  </div>;
}
