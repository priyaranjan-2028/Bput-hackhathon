import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { subsidiaries as seedSubsidiaries, businessUnits as seedBusinessUnits, projects as seedProjects, formatDateTime, getParameterById } from '../../data/mockData';
import { ConsolidationRecord, SubmissionStatus, Subsidiary } from '../../types';
import { ProjectUserEvidence, ProjectUserSubmission } from '../../types/projectUser';
import KPICard from '../../components/dashboard/KPICard';
import EvidenceFileLink from '../../components/evidence/EvidenceFileLink';
import { createAdminDemoData, getAdminConsolidationRecords, getAdminEvidence, getDemoParameterInspection } from '../../services/adminDemoDataService';
import { readStoredValue } from '../../services/localStorageService';
import { Building2, FolderTree, FileBarChart, ShieldCheck, Layers, ArrowRight, Sparkles, FileSearch, CheckCircle2, Download, LoaderCircle, Plus, UserRoundPlus } from 'lucide-react';

function downloadData(filename: string, content: string, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url);
}

export default function MEILDashboard() {
  const [refresh, setRefresh] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [selectedSub, setSelectedSub] = useState('SUB-JUDGE-01');
  const storedSubs = readStoredValue<Subsidiary[]>('meil_subsidiaries', []);
  const subsidiaries = useMemo(() => [...seedSubsidiaries, ...storedSubs].filter((item, index, all) => all.findIndex(other => other.id === item.id) === index), [refresh]);
  const storedUnits = readStoredValue<typeof seedBusinessUnits>('meil_business_units', []);
  const businessUnits = [...seedBusinessUnits, ...storedUnits].filter((item, index, all) => all.findIndex(other => other.id === item.id) === index);
  const storedProjects = readStoredValue<Record<string, typeof seedProjects[number]>>('meil_projects', {});
  const projects = [...seedProjects.map(project => storedProjects[project.id] || project), ...Object.values(storedProjects)].filter((item, index, all) => all.findIndex(other => other.id === item.id) === index);
  const records = useMemo(() => getAdminConsolidationRecords(), [refresh]);
  const evidence = useMemo(() => getAdminEvidence(), [refresh]);
  const verifiedSubs = records.filter(record => record.level === 'SUBSIDIARY' && record.status === SubmissionStatus.VERIFIED_LEVEL_3);
  const totalSubs = subsidiaries.length, totalBUs = businessUnits.length, totalProjects = projects.length;
  const corporateTotal = verifiedSubs.reduce((sum, record) => sum + record.totalCO2e, 0);
  const inspection = useMemo(() => getDemoParameterInspection(selectedSub), [selectedSub, refresh]);
  const selectedRecord = verifiedSubs.find(record => record.entityId === selectedSub);
  const selectedEvidence = evidence.filter(file => file.subsidiaryId === selectedSub);

  const handleGenerate = () => {
    setGenerating(true); setResultMessage('');
    window.setTimeout(() => {
      try {
        const result = createAdminDemoData();
        setResultMessage(`Sample data is ready: ${result.businessUnits} business units, ${result.projects} projects, ${result.parameters} verified parameter entries, and ${result.files} downloadable evidence files.`);
        setSelectedSub('SUB-JUDGE-01'); setRefresh(value => value + 1);
      } catch (error) { setResultMessage(error instanceof Error ? error.message : 'Sample data could not be saved.'); }
      finally { setGenerating(false); }
    }, 250);
  };

  const downloadSubsidiary = () => {
    const rows = [['Parameter', 'Scope', 'Project', 'User', 'Activity', 'Unit', 'Emissions tCO2e', 'Status', 'Evidence files']];
    inspection.forEach(parameter => parameter.entries.forEach(entry => rows.push([
      parameter.name, parameter.scope, projects.find(project => project.id === entry.projectId)?.name || entry.projectId,
      entry.userId, String(entry.activityValue), parameter.unit, String(entry.calculation?.convertedTonnesCO2e || 0), entry.status,
      parameter.files.filter(file => file.submissionId === entry.submissionId).map(file => file.originalFilename).join('; '),
    ])));
    downloadData(`${selectedSub}_verified_esg_data.csv`, rows.map(row => row.map(value => `"${value.replaceAll('"', '""')}"`).join(',')).join('\n'));
  };

  return <div className="space-y-6">
    <div className="relative overflow-hidden rounded-3xl border border-navy-800 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-900 p-6 text-white shadow-xl sm:p-8">
      <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-esg-500/30 bg-esg-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-esg-300"><ShieldCheck size={14}/> MEIL Central ESG Command &amp; BRSR Master Bureau</div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">Megha Engineering &amp; Infrastructures Ltd.</h1>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-navy-300 sm:text-sm">Group reporting across {totalSubs} subsidiaries, {totalBUs} business units, and {totalProjects} projects.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleGenerate} disabled={generating} className="btn-primary flex items-center gap-2 bg-esg-500 px-5 py-3 text-xs font-bold text-white shadow-lg hover:bg-esg-600 disabled:opacity-70">{generating ? <LoaderCircle size={16} className="animate-spin"/> : <Sparkles size={16}/>} {generating ? 'Preparing sample data…' : 'Generate Sample Data'}</button>
          <Link to="/admin/brsr-report" className="btn-secondary flex items-center gap-2 border-white/20 bg-white/10 px-5 py-3 text-xs font-semibold text-white hover:bg-white/20"><FileBarChart size={16}/> Generate BRSR Report</Link>
          <Link to="/admin/evidence-explorer" className="btn-secondary flex items-center gap-2 border-white/20 bg-white/10 px-5 py-3 text-xs font-semibold text-white hover:bg-white/20"><FileSearch size={16}/> Evidence Explorer</Link>
          <Link to="/admin/subsidiaries?action=add-subsidiary" className="btn-secondary flex items-center gap-2 border-white/20 bg-white/10 px-4 py-3 text-xs font-semibold text-white hover:bg-white/20"><Plus size={15}/> Add subsidiary</Link>
          <Link to="/admin/subsidiaries?action=add-supervisor" className="btn-secondary flex items-center gap-2 border-white/20 bg-white/10 px-4 py-3 text-xs font-semibold text-white hover:bg-white/20"><UserRoundPlus size={15}/> Add subsidiary supervisor</Link>
        </div>
      </div>
      {resultMessage && <div className="relative z-10 mt-5 flex items-start gap-2 rounded-xl border border-emerald-300/30 bg-emerald-400/10 p-3 text-xs text-emerald-100"><CheckCircle2 size={16} className="mt-0.5 shrink-0"/>{resultMessage}</div>}
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KPICard title="Verified Subsidiary Emissions" value={`${corporateTotal.toLocaleString(undefined,{maximumFractionDigits:2})} t`} subtitle="Roll-up of verified subsidiary batches" icon={<Layers size={20}/>} badgeText={`${verifiedSubs.length} verified`} badgeColor="info"/>
      <KPICard title="Verified Subsidiaries" value={`${verifiedSubs.length} / ${totalSubs}`} subtitle="Ready for group consolidation" icon={<CheckCircle2 size={20}/>} badgeText="Level 3" badgeColor="success"/>
      <KPICard title="Evidence Files" value={`${evidence.length}`} subtitle="Source files available to inspect" icon={<FileSearch size={20}/>} badgeText="Traceable" badgeColor="info"/>
      <KPICard title="Operating Projects" value={`${totalProjects} Active`} subtitle={`Across ${totalBUs} business units`} icon={<Building2 size={20}/>} badgeText="MEIL Group" badgeColor="info"/>
    </div>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center"><div><h2 className="text-base font-bold text-navy-900">Inspect Subsidiary Submissions</h2><p className="text-xs text-navy-400">Select a company to review its parameter level submissions and supporting files.</p></div><div className="flex gap-2"><select value={selectedSub} onChange={event=>setSelectedSub(event.target.value)} className="input-field min-w-60 text-sm">{subsidiaries.map(sub=><option key={sub.id} value={sub.id}>{sub.name}</option>)}</select><button onClick={downloadSubsidiary} disabled={!inspection.length} className="btn-secondary inline-flex items-center gap-2 px-3 text-xs"><Download size={14}/> Export</button></div></div>
      <div className="grid gap-4 p-5 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-4"><span className="text-xs text-slate-500">Verified consolidated total</span><div className="mt-1 text-xl font-bold text-navy-900">{selectedRecord ? `${selectedRecord.totalCO2e.toFixed(4)} tCO₂e` : 'No verified sample batch'}</div></div><div className="rounded-xl bg-slate-50 p-4"><span className="text-xs text-slate-500">Verified parameter submissions</span><div className="mt-1 text-xl font-bold text-navy-900">{inspection.reduce((sum,item)=>sum+item.entries.length,0)}</div></div><div className="rounded-xl bg-slate-50 p-4"><span className="text-xs text-slate-500">Supporting files</span><div className="mt-1 text-xl font-bold text-navy-900">{selectedEvidence.length}</div></div></div>
      {!inspection.length ? <div className="mx-5 mb-5 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Generate sample data to add verified parameter submissions and files for this subsidiary.</div> : <div className="space-y-4 px-5 pb-5">{inspection.map(parameter=><details key={parameter.parameterId} className="overflow-hidden rounded-xl border border-slate-200" open={parameter.scope===inspection[0].scope}><summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 bg-slate-50 px-4 py-3"><span className="font-semibold text-navy-900">{parameter.name}</span><span className="flex items-center gap-2 text-xs"><span className="rounded-full bg-blue-100 px-2 py-1 font-semibold text-blue-800">{parameter.scope.replace('_',' ')}</span><span className="text-slate-500">{parameter.entries.length} entries · {parameter.files.length} files</span></span></summary><div className="space-y-3 p-4">{parameter.entries.map(entry=><div key={entry.submissionId} className="rounded-lg border border-slate-100 p-3"><div className="mb-3 flex flex-wrap justify-between gap-2 text-xs"><span className="font-semibold text-navy-800">{projects.find(project=>project.id===entry.projectId)?.name || entry.projectId} · {entry.activityValue} {parameter.unit}</span><span className="text-emerald-700">{entry.status} · {entry.calculation?.convertedTonnesCO2e.toFixed(4) || '0.0000'} tCO₂e</span></div><div className="space-y-2">{parameter.files.filter(file=>file.submissionId===entry.submissionId).map(file=><EvidenceFileLink key={file.evidenceId} file={file}/>)}</div></div>)}</div></details>)}</div>}
    </section>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-6 py-4"><div><h2 className="text-base font-bold text-navy-900">Subsidiary Reporting Status</h2><p className="text-xs text-navy-400">Verified group entities and consolidated emissions</p></div><Link to="/admin/subsidiaries" className="inline-flex items-center gap-1 text-xs font-semibold text-esg-600">Manage Subsidiaries <ArrowRight size={14}/></Link></div><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase text-navy-500"><tr><th className="px-4 py-3">Subsidiary</th><th className="px-4 py-3">Sector</th><th className="px-4 py-3">Business Units</th><th className="px-4 py-3">Emissions</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{subsidiaries.map(sub=>{const record=verifiedSubs.find(item=>item.entityId===sub.id);return <tr key={sub.id}><td className="px-4 py-3"><b>{sub.name}</b><div className="font-mono text-[10px] text-slate-400">{sub.code}</div></td><td className="px-4 py-3">{sub.sector || '—'}</td><td className="px-4 py-3">{businessUnits.filter(unit=>unit.subsidiaryId===sub.id).length}</td><td className="px-4 py-3 font-semibold">{record ? `${record.totalCO2e.toFixed(4)} t` : 'Awaiting verified data'}</td><td className="px-4 py-3"><span className={`rounded px-2 py-1 text-[10px] font-bold ${record?'bg-emerald-100 text-emerald-800':'bg-slate-100 text-slate-600'}`}>{record ? 'Level 3 Verified' : 'Not consolidated'}</span></td><td className="px-4 py-3 text-right"><button onClick={()=>setSelectedSub(sub.id)} className="btn-secondary btn-sm px-2 py-1">Inspect</button></td></tr>})}</tbody></table></div></section>

    <div className="grid grid-cols-1 gap-6 md:grid-cols-3"><Link to="/admin/hierarchy" className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-esg-400"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-800"><FolderTree size={20}/></div><h3 className="text-base font-bold text-navy-900">Organization Hierarchy</h3><p className="mt-1 text-xs text-slate-500">Explore the company, subsidiaries, business units, and projects.</p></Link><Link to="/admin/evidence-explorer" className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-esg-400"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-esg-50 text-esg-700"><FileSearch size={20}/></div><h3 className="text-base font-bold text-navy-900">Evidence Explorer Vault</h3><p className="mt-1 text-xs text-slate-500">Inspect and download supporting evidence by subsidiary or parameter.</p></Link><Link to="/admin/consolidation" className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-esg-400"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Layers size={20}/></div><h3 className="text-base font-bold text-navy-900">Group Consolidation</h3><p className="mt-1 text-xs text-slate-500">Roll up verified subsidiary batches and track consolidation progress.</p></Link></div>
  </div>;
}
