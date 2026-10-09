import React, { useState } from 'react';
import { projects } from '../../data/mockData';
import { Scope } from '../../types';
import { Database, Search, Plus, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createProjectParameter, getSupervisorParameters } from '../../services/projectSupervisorService';
import { getBusinessUnitProjects } from '../../services/businessUnitService';

const emptyForm = { name: '', code: '', scope: Scope.SCOPE_1, category: '', unit: '', description: '', requiresEvidence: true, factorValue: '', factorUnit: '', factorSource: '' };

export default function ParametersPage() {
  const { user } = useAuth();
  const projectList = getBusinessUnitProjects(user?.businessUnitId || 'BU001');
  const projectId = user?.assignedProjectIds?.[0] ?? user?.projectId ?? projectList[0]?.id;
  const project = projectList.find(item => item.id === projectId) ?? projects.find(item => item.id === projectId);
  const [filterScope, setFilterScope] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [refresh, setRefresh] = useState(0);
  const parameters = projectId ? getSupervisorParameters(projectId) : [];
  void refresh;
  const filtered = parameters.filter(parameter => {
    const matchesScope = filterScope === 'ALL' || parameter.scope === filterScope;
    const matchesSearch = parameter.name.toLowerCase().includes(searchTerm.toLowerCase()) || parameter.code.toLowerCase().includes(searchTerm.toLowerCase()) || parameter.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesScope && matchesSearch;
  });
  const hasFactor = form.scope === Scope.SCOPE_1 || form.scope === Scope.SCOPE_2 || form.scope === Scope.SCOPE_3;

  const saveParameter = (event: React.FormEvent) => {
    event.preventDefault();
    if (!projectId) return setError('No project is assigned to your supervisor account.');
    try {
      createProjectParameter({ ...form, factorValue: form.factorValue === '' ? undefined : Number(form.factorValue) }, projectId);
      setRefresh(value => value + 1);
      setMessage(`${form.name.trim()} has been added and assigned to ${project?.name ?? 'the project'}.`);
      setForm(emptyForm); setError(''); setShowForm(false);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not add this parameter.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">ESG Parameters & Emission Factors Catalogue</h1>
          <p className="mt-1 text-sm text-navy-500">Parameters assigned to {project?.name ?? 'your project'} and available to its project users.</p>
        </div>
        <button type="button" onClick={() => { setError(''); setMessage(''); setShowForm(true); }} className="btn-primary inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm"><Plus size={16} /> Add Parameter</button>
      </div>

      {message && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}

      <div className="search-panel">
        <div className="relative w-full sm:max-w-md"><Search size={17} className="absolute left-3.5 top-3.5 text-slate-400" /><input type="search" aria-label="Search ESG parameters" placeholder="Search parameter, code, or principle" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} className="search-field pl-10" /></div>
        <div className="flex w-full items-center gap-2 overflow-x-auto sm:w-auto">
          {['ALL', Scope.SCOPE_1, Scope.SCOPE_2, Scope.SCOPE_3, Scope.SECTION_C].map(scope => <button type="button" key={scope} onClick={() => setFilterScope(scope)} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${filterScope === scope ? 'bg-navy-800 text-white' : 'bg-slate-100 text-navy-600 hover:bg-slate-200'}`}>{scope === 'ALL' ? 'All Scopes' : scope.replace('_', ' ')}</button>)}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto"><table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-navy-500"><tr><th className="px-4 py-3.5">Param Code</th><th className="px-4 py-3.5">Metric / Parameter</th><th className="px-4 py-3.5">Scope</th><th className="px-4 py-3.5">BRSR Principle</th><th className="px-4 py-3.5">Unit</th><th className="px-4 py-3.5">Emission Factor</th><th className="px-4 py-3.5">Factor Source</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{filtered.map(parameter => {
            const factor = parameter.emissionFactorId ? JSON.parse(window.localStorage.getItem('meil_project_emission_factors') ?? '{}')[projectId!]?.find((item: { parameterId: string }) => item.parameterId === (parameter.parameterId ?? parameter.code)) : undefined;
            return <tr key={parameter.parameterId ?? parameter.code} className="transition-colors hover:bg-slate-50/70"><td className="px-4 py-3.5 font-mono font-bold text-navy-800">{parameter.code}</td><td className="px-4 py-3.5"><div className="font-bold text-navy-900">{parameter.name}</div><div className="text-[11px] text-navy-400">{parameter.category}</div></td><td className="px-4 py-3.5"><span className="rounded bg-navy-100 px-2 py-0.5 text-[10px] font-bold text-navy-700">{parameter.scope.replace('_', ' ')}</span></td><td className="px-4 py-3.5 font-semibold text-esg-700">{parameter.brsrPrinciple ?? parameter.category}</td><td className="px-4 py-3.5 font-medium text-navy-700">{parameter.unit}</td><td className="px-4 py-3.5 font-mono font-semibold text-navy-900">{factor ? `${factor.factorValue ?? factor.factor} ${factor.unit}` : 'N/A (Non-GHG)'}</td><td className="px-4 py-3.5 text-navy-500">{factor ? `${factor.source} (${factor.reportingYear ?? ''})` : 'SEBI BRSR Guidance'}</td></tr>;
          })}</tbody>
        </table></div>
        {filtered.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No parameters match your search.</p>}
      </div>

      {showForm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={event => { if (event.target === event.currentTarget) setShowForm(false); }}><form onSubmit={saveParameter} className="max-h-[92vh] w-full max-w-2xl space-y-5 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Project configuration</p><h2 className="mt-1 text-xl font-bold text-navy-900">Add ESG Parameter</h2><p className="mt-1 text-sm text-slate-500">The new parameter will be assigned to {project?.name ?? 'your project'}.</p></div><button type="button" aria-label="Close" onClick={() => setShowForm(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button></div>
        {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-navy-800">Parameter name<input required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} className="input-field mt-1 w-full" placeholder="e.g. Purchased Cooling" /></label>
          <label className="text-sm font-medium text-navy-800">Parameter code<input required value={form.code} onChange={event => setForm({ ...form, code: event.target.value })} className="input-field mt-1 w-full" placeholder="e.g. S2-COOLING" /></label>
          <label className="text-sm font-medium text-navy-800">Scope<select value={form.scope} onChange={event => setForm({ ...form, scope: event.target.value as Scope })} className="input-field mt-1 w-full">{[Scope.SCOPE_1, Scope.SCOPE_2, Scope.SCOPE_3, Scope.SECTION_C].map(scope => <option key={scope} value={scope}>{scope.replace('_', ' ')}</option>)}</select></label>
          <label className="text-sm font-medium text-navy-800">Category / BRSR principle<input required value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} className="input-field mt-1 w-full" placeholder="e.g. Purchased Energy" /></label>
          <label className="text-sm font-medium text-navy-800">Activity unit<input required value={form.unit} onChange={event => setForm({ ...form, unit: event.target.value })} className="input-field mt-1 w-full" placeholder="e.g. kWh" /></label>
          {hasFactor && <><label className="text-sm font-medium text-navy-800">Emission factor<input required type="number" min="0" step="any" value={form.factorValue} onChange={event => setForm({ ...form, factorValue: event.target.value })} className="input-field mt-1 w-full" placeholder="e.g. 0.82" /></label><label className="text-sm font-medium text-navy-800">Factor unit<input value={form.factorUnit} onChange={event => setForm({ ...form, factorUnit: event.target.value })} className="input-field mt-1 w-full" placeholder={`kgCO2e/${form.unit || 'unit'}`} /></label><label className="text-sm font-medium text-navy-800 sm:col-span-2">Factor source<input value={form.factorSource} onChange={event => setForm({ ...form, factorSource: event.target.value })} className="input-field mt-1 w-full" placeholder="e.g. CEA baseline database" /></label></>}
          <label className="text-sm font-medium text-navy-800 sm:col-span-2">Definition<textarea value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} rows={3} className="input-field mt-1 w-full" placeholder="Describe the activity or indicator being reported." /></label>
          <label className="flex items-center gap-2 text-sm text-navy-800 sm:col-span-2"><input type="checkbox" checked={form.requiresEvidence} onChange={event => setForm({ ...form, requiresEvidence: event.target.checked })} className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600" /> Supporting evidence is required</label>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4"><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary inline-flex items-center gap-2"><Database size={16} /> Add and Assign</button></div>
      </form></div>}
    </div>
  );
}
