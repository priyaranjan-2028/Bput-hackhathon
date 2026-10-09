import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { consolidationRecords as initialRecords, formatDateTime } from '../../data/mockData';
import { ConsolidationRecord } from '../../types';
import { readStoredValue, writeStoredValue } from '../../services/localStorageService';
import { getBusinessUnitProjects, getCurrentBusinessUnit } from '../../services/businessUnitService';
import { ArrowRight, Building2, CheckCircle2, Layers, Lock, Sparkles } from 'lucide-react';

const projectBatches = () => {
  const stored = readStoredValue<ConsolidationRecord[]>('meil_bu_incoming_batches', []);
  const seed = initialRecords.filter(item => item.level === 'PROJECT' && item.status === 'FORWARDED');
  return [...stored, ...seed].map(item => ({ ...item, period: item.period || item.reportingPeriod || 'FY 2025-26' })).filter((item, index, all) => all.findIndex(other => other.id === item.id) === index);
};

export default function BUConsolidationPage() {
  const { user } = useAuth(); const bu = getCurrentBusinessUnit(user); const projects = getBusinessUnitProjects(bu.id); const projectIds = new Set(projects.map(project => project.id));
  const [selectedPeriod, setSelectedPeriod] = useState('FY 2025-26'); const [progress, setProgress] = useState(0); const [merging, setMerging] = useState(false); const [notice, setNotice] = useState('');
  const [records, setRecords] = useState<ConsolidationRecord[]>(() => readStoredValue('meil_bu_consolidations', []));
  const currentProjectBatches = useMemo(() => {
    const latestByProject = new Map<string, ConsolidationRecord>();
    projectBatches().filter(record => projectIds.has(record.entityId) && record.period === selectedPeriod).forEach(record => {
      const existing = latestByProject.get(record.entityId);
      const time = new Date(record.consolidatedAt).getTime();
      const existingTime = existing ? new Date(existing.consolidatedAt).getTime() : -1;
      if (!existing || time >= existingTime) latestByProject.set(record.entityId, record);
    });
    return [...latestByProject.values()];
  }, [selectedPeriod, bu.id]);
  const readyBatches = currentProjectBatches.filter(record => record.status === 'VERIFIED_LEVEL_2');
  const pending = currentProjectBatches.filter(record => record.status !== 'VERIFIED_LEVEL_2');
  const latest = records.find(record => record.entityId === bu.id && record.period === selectedPeriod);
  const hasUnmergedApproved = readyBatches.some(batch => !latest?.childRecordIds?.includes(batch.id));
  const scope1 = readyBatches.reduce((sum, record) => sum + record.scope1Total, 0); const scope2 = readyBatches.reduce((sum, record) => sum + record.scope2Total, 0); const scope3 = readyBatches.reduce((sum, record) => sum + record.scope3Total, 0); const total = scope1 + scope2 + scope3;
  useEffect(() => {
    if (!merging) return;
    const timer = window.setInterval(() => {
      setProgress(value => {
        if (value >= 100) {
          window.clearInterval(timer);
          setMerging(false);
          const merged: ConsolidationRecord = {
            id: `CON-BU-${bu.id}-${Date.now()}`, level: 'BUSINESS_UNIT', entityId: bu.id, entityName: bu.name,
            parentEntityId: bu.subsidiaryId, childRecordIds: readyBatches.map(item => item.id), period: selectedPeriod,
            scope1Total: scope1, scope2Total: scope2, scope3Total: scope3, totalCO2e: total, status: 'SEALED',
            consolidatedBy: user?.id || bu.supervisorId || '', consolidatedAt: new Date().toISOString(), submissionCount: readyBatches.length
          };
          setRecords(previous => {
            const next = [merged, ...previous.filter(record => !(record.entityId === bu.id && record.period === selectedPeriod && record.status !== 'FORWARDED'))];
            writeStoredValue('meil_bu_consolidations', next);
            return next;
          });
          setNotice('Merge complete. Review the totals, then forward this batch to the subsidiary.');
          return 100;
        }
        return Math.min(100, value + 4);
      });
    }, 100);
    return () => window.clearInterval(timer);
  }, [merging]);
  const startMerge = () => { setProgress(0); setNotice(''); setMerging(true); };
  const forward = () => { if (!latest || latest.status === 'FORWARDED') return; const forwarded = { ...latest, status: 'FORWARDED', forwardedAt: new Date().toISOString() }; const incoming = readStoredValue<ConsolidationRecord[]>('meil_subsidiary_incoming_batches', []); writeStoredValue('meil_subsidiary_incoming_batches', [forwarded, ...incoming.filter(record => record.id !== latest.id)]); const next = records.map(record => record.id === latest.id ? forwarded : record); setRecords(next); writeStoredValue('meil_bu_consolidations', next); setNotice(`${bu.name} data forwarded to subsidiary ${bu.subsidiaryId}.`); };

  return <div className="mx-auto max-w-5xl space-y-6"><div><h1 className="text-2xl font-bold text-navy-900">Business Unit Consolidation</h1><p className="mt-1 text-sm text-navy-500">Merge Level-2 approved project batches and forward the consolidated report to {bu.subsidiaryId}.</p></div>
    {notice && <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 size={18} className="mt-0.5 shrink-0"/><div>{notice}{latest && <p className="mt-1 text-xs">Batch {latest.id} · {latest.status}</p>}</div></div>}
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center"><div><h2 className="font-bold text-navy-900">{bu.name} · Consolidation batch</h2><p className="mt-1 text-xs text-navy-500">{readyBatches.length} approved project batches · {selectedPeriod}</p></div><select value={selectedPeriod} onChange={e=>{setSelectedPeriod(e.target.value);setProgress(0);setNotice('');}} className="input-field text-xs"><option>FY 2025-26</option><option>FY 2024-25</option><option>202509</option></select></div>
      <div className="grid gap-3 sm:grid-cols-4">{[['Scope 1',scope1],['Scope 2',scope2],['Scope 3',scope3],['Total CO₂e',total]].map(([label,value])=><div key={label} className="rounded-xl bg-slate-50 p-4"><span className="text-xs text-slate-500">{label}</span><p className="mt-1 text-lg font-bold text-navy-900">{Number(value).toFixed(2)} t</p></div>)}</div>
      <div className="space-y-2"><div className="flex justify-between text-xs"><span className="font-semibold text-navy-700">Merge progress</span><span className="font-mono text-navy-500">{progress}%</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-esg-500 to-emerald-400 transition-all duration-200" style={{width:`${progress}%`}}/></div>{merging&&<p className="animate-pulse text-xs text-esg-700">Combining verified project data and calculating the BU roll-up…</p>}</div>
      {pending.length>0&&<p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">{pending.length} project batch(es) still need Level-2 approval. Open Submission Review and approve them before merging.</p>}
      {!readyBatches.length&&pending.length===0&&<p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">No forwarded project batches found for this BU and reporting period yet.</p>}
      <div className="flex flex-col justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center"><p className="flex items-center gap-2 text-xs text-slate-500"><Lock size={14}/> Merging creates a reviewable BU batch. Forwarding sends it to the subsidiary inbox.</p>{latest?.status==='FORWARDED'&&!hasUnmergedApproved?<span className="inline-flex items-center gap-2 rounded-lg bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-800"><CheckCircle2 size={16}/> Forwarded to subsidiary</span>:latest&&latest.status!=='FORWARDED'?<button onClick={forward} className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-3 text-sm"><Building2 size={16}/> Forward to Subsidiary <ArrowRight size={16}/></button>:<button onClick={startMerge} disabled={!readyBatches.length||pending.length>0||merging||!hasUnmergedApproved&&latest?.status==='FORWARDED'} className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"><Layers size={16}/><Sparkles size={15}/> Merge Project Data</button>}</div>
    </section>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-6 py-4"><h2 className="font-bold text-navy-900">Business Unit consolidation history</h2></div><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-navy-500"><tr><th className="px-4 py-3">Batch</th><th className="px-4 py-3">Period</th><th className="px-4 py-3">Projects</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Created</th></tr></thead><tbody className="divide-y divide-slate-100">{records.filter(record=>record.entityId===bu.id).map(record=><tr key={record.id}><td className="px-4 py-3 font-mono font-semibold">{record.id}</td><td className="px-4 py-3">{record.period}</td><td className="px-4 py-3">{record.submissionCount||0}</td><td className="px-4 py-3 font-bold">{record.totalCO2e.toFixed(2)} t</td><td className="px-4 py-3">{record.status}</td><td className="px-4 py-3">{formatDateTime(record.consolidatedAt).split(' ')[0]}</td></tr>)}</tbody></table></div></section>
  </div>;
}
