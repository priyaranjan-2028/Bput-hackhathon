import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../../data/mockData';
import { ConsolidationRecord, SubmissionStatus } from '../../types';
import { getAdminConsolidationRecords, getVerifiedSubsidiaryBatches } from '../../services/adminDemoDataService';
import { readStoredValue, writeStoredValue } from '../../services/localStorageService';
import { Layers, Lock, CheckCircle2, Sparkles, FileBarChart, LoaderCircle } from 'lucide-react';

export default function ConsolidationCenterPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('FY 2025-26');
  const [records, setRecords] = useState<ConsolidationRecord[]>(getAdminConsolidationRecords);
  const [progress, setProgress] = useState(0);
  const [sealing, setSealing] = useState(false);
  const [notice, setNotice] = useState('');
  const [master, setMaster] = useState<ConsolidationRecord | undefined>(() => readStoredValue<ConsolidationRecord[]>('meil_consolidations', []).find(record => record.level === 'MEIL' && record.reportingPeriod === 'FY 2025-26'));
  const subsidiaries = getVerifiedSubsidiaryBatches(selectedPeriod);
  const scopeTotals = useMemo(() => subsidiaries.reduce((total, record) => ({ scope1: total.scope1 + record.scope1Total, scope2: total.scope2 + record.scope2Total, scope3: total.scope3 + record.scope3Total }), { scope1: 0, scope2: 0, scope3: 0 }), [subsidiaries]);
  const total = scopeTotals.scope1 + scopeTotals.scope2 + scopeTotals.scope3;
  const rows = [...records].sort((a,b) => b.consolidatedAt.localeCompare(a.consolidatedAt));

  useEffect(() => { if (!sealing || progress >= 100) return; const timer = window.setTimeout(() => setProgress(value => Math.min(100, value + 10)), 140); return () => window.clearTimeout(timer); }, [sealing, progress]);
  useEffect(() => {
    if (!sealing || progress < 100) return;
    const timestamp = new Date().toISOString();
    const record: ConsolidationRecord = { id: `CON-MEIL-${selectedPeriod.replace(/[^0-9]/g,'')}`, level: 'MEIL', entityId: 'MEIL-GROUP', entityName: 'Megha Engineering & Infrastructures Ltd. (Group Master)', childRecordIds: subsidiaries.map(item => item.id), period: selectedPeriod, reportingPeriod: selectedPeriod, scope1Total: scopeTotals.scope1, scope2Total: scopeTotals.scope2, scope3Total: scopeTotals.scope3, sectionCData: Object.assign({}, ...subsidiaries.map(item => item.sectionCData || {})), totalCO2e: total, status: SubmissionStatus.SEALED, consolidatedBy: 'USR-ADMIN', consolidatedAt: timestamp, submissionCount: subsidiaries.reduce((sum,item)=>sum+(item.submissionCount||0),0) };
    const current = readStoredValue<ConsolidationRecord[]>('meil_consolidations', []);
    const updated = [...current.filter(item => item.id !== record.id), record];
    writeStoredValue('meil_consolidations', updated);
    setRecords(getAdminConsolidationRecords()); setMaster(record); setNotice('MEIL group consolidation is sealed. The BRSR report can now use these verified totals.'); setSealing(false);
  }, [progress, sealing, selectedPeriod, subsidiaries, scopeTotals, total]);

  const handleSeal = () => {
    if (!subsidiaries.length) { setNotice('Generate sample data first. The group can consolidate after verified subsidiary batches are available.'); return; }
    setNotice(''); setMaster(undefined); setProgress(0); setSealing(true);
  };

  return <div className="mx-auto max-w-6xl space-y-6">
    <div><h1 className="text-2xl font-bold text-navy-900">MEIL Master Consolidation Center</h1><p className="mt-1 text-sm text-navy-500">Review verified subsidiary batches, then consolidate their totals for the selected reporting period.</p></div>
    {notice && <div className={`rounded-xl border p-4 text-sm ${master ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-blue-200 bg-blue-50 text-blue-800'}`}>{notice}{master && <Link to="/admin/brsr-report" className="ml-3 inline-flex items-center gap-1 font-bold underline"><FileBarChart size={14}/> Open report generator</Link>}</div>}

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center"><div><h2 className="font-bold text-navy-900">Verified Subsidiary Batches</h2><p className="text-xs text-slate-500">{subsidiaries.length} Level 3 verified subsidiaries for {selectedPeriod}</p></div><select value={selectedPeriod} onChange={event=>setSelectedPeriod(event.target.value)} className="input-field text-sm"><option>FY 2025-26</option><option>FY 2024-25</option><option>202509</option><option>202508</option></select></div><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th className="px-4 py-3">Subsidiary</th><th className="px-4 py-3">Scope 1</th><th className="px-4 py-3">Scope 2</th><th className="px-4 py-3">Scope 3</th><th className="px-4 py-3">Total tCO₂e</th><th className="px-4 py-3">Parameters</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{subsidiaries.map(item=><tr key={item.id}><td className="px-4 py-3 font-semibold text-navy-900">{item.entityName}</td><td className="px-4 py-3">{item.scope1Total.toFixed(4)}</td><td className="px-4 py-3">{item.scope2Total.toFixed(4)}</td><td className="px-4 py-3">{item.scope3Total.toFixed(4)}</td><td className="px-4 py-3 font-bold">{item.totalCO2e.toFixed(4)}</td><td className="px-4 py-3">{item.submissionCount || 0}</td><td className="px-4 py-3 text-emerald-700">{item.status}</td></tr>)}{!subsidiaries.length && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No verified subsidiary batch for this period. Generate sample data on the admin dashboard first.</td></tr>}</tbody></table></div></section>

    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between gap-4"><div><h2 className="font-bold text-navy-900">Group Master Aggregation</h2><p className="text-xs text-slate-500">Totals are calculated from the verified subsidiary rows above.</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">{subsidiaries.length} verified</span></div>
      <div className="grid gap-4 rounded-2xl bg-navy-900 p-6 text-white sm:grid-cols-4"><div><span className="text-xs text-navy-300">Scope 1</span><div className="mt-1 text-xl font-bold">{scopeTotals.scope1.toFixed(4)} t</div></div><div><span className="text-xs text-navy-300">Scope 2</span><div className="mt-1 text-xl font-bold">{scopeTotals.scope2.toFixed(4)} t</div></div><div><span className="text-xs text-navy-300">Scope 3</span><div className="mt-1 text-xl font-bold">{scopeTotals.scope3.toFixed(4)} t</div></div><div className="border-white/10 sm:border-l sm:pl-4"><span className="text-xs text-esg-300">Group total</span><div className="mt-1 text-2xl font-extrabold text-esg-300">{total.toFixed(4)} tCO₂e</div></div></div>
      {sealing && <div aria-live="polite" className="space-y-2"><div className="flex justify-between text-xs font-semibold text-navy-700"><span>Consolidating verified subsidiary data…</span><span>{progress}%</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-esg-500 transition-all duration-200" style={{width:`${progress}%`}}/></div></div>}
      {master && <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 sm:flex-row sm:items-center"><div className="flex items-start gap-3"><CheckCircle2 size={20}/><div><b>Group master sealed</b><div className="mt-1 text-xs">Batch {master.id} · {formatDateTime(master.consolidatedAt)}</div></div></div><Link to="/admin/brsr-report" className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold"><FileBarChart size={15}/> Generate BRSR Report PDF</Link></div>}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><p className="flex items-center gap-2 text-xs text-slate-500"><Lock size={14}/> Final consolidation locks this verified roll-up for BRSR reporting.</p><button onClick={handleSeal} disabled={sealing || !subsidiaries.length} className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50">{sealing ? <LoaderCircle size={14} className="animate-spin"/> : <Sparkles size={14}/>} {sealing ? 'Consolidating…' : master ? 'Re-consolidate Group Data' : 'Consolidate & Seal Group Data'}</button></div>
    </section>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-6 py-4"><h2 className="font-bold text-navy-900">Consolidation Batches Ledger</h2><p className="text-xs text-slate-500">Project, business unit, subsidiary, and group batches</p></div><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th className="px-4 py-3">Batch</th><th className="px-4 py-3">Level</th><th className="px-4 py-3">Entity</th><th className="px-4 py-3">Scope 1</th><th className="px-4 py-3">Scope 2</th><th className="px-4 py-3">Scope 3</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map(record=><tr key={record.id}><td className="px-4 py-3 font-mono">{record.id}</td><td className="px-4 py-3">{record.level}</td><td className="px-4 py-3 font-semibold">{record.entityName}</td><td className="px-4 py-3">{record.scope1Total.toFixed(3)}</td><td className="px-4 py-3">{record.scope2Total.toFixed(3)}</td><td className="px-4 py-3">{record.scope3Total.toFixed(3)}</td><td className="px-4 py-3 font-bold">{record.totalCO2e.toFixed(3)}</td><td className="px-4 py-3">{record.status}</td><td className="px-4 py-3">{formatDateTime(record.consolidatedAt).split(' ')[0]}</td></tr>)}</tbody></table></div></section>
  </div>;
}
