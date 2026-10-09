import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { getBusinessUnitProjects, getCurrentBusinessUnit } from '../../services/businessUnitService';
import { readStoredValue } from '../../services/localStorageService';
import { CheckCircle2, History, RotateCcw } from 'lucide-react';

interface BUDecision { id: string; batchId: string; projectId: string; projectName: string; action: 'APPROVED' | 'RETURNED'; reviewer: string; timestamp: string; remarks?: string; }

export default function BUVerificationHistoryPage() {
  const { user } = useAuth(); const bu = getCurrentBusinessUnit(user); const projectIds = new Set(getBusinessUnitProjects(bu.id).map(project => project.id));
  const history = readStoredValue<BUDecision[]>('meil_bu_verification_history', []).filter(item => projectIds.has(item.projectId)).sort((a,b)=>b.timestamp.localeCompare(a.timestamp));
  return <div className="mx-auto max-w-5xl space-y-6"><header><h1 className="text-2xl font-bold text-navy-900">Verification History</h1><p className="mt-1 text-sm text-slate-500">Level-2 approval and return decisions for projects in {bu.name}.</p></header><section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-navy-900">Project batch decisions</h2></div>{history.length?<div className="divide-y divide-slate-100">{history.map(item=><article key={item.id} className="flex gap-3 p-5"><div className={`mt-0.5 rounded-full p-2 ${item.action==='APPROVED'?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-700'}`}>{item.action==='APPROVED'?<CheckCircle2 size={17}/>:<RotateCcw size={17}/>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold text-navy-900">{item.projectName} · {item.action==='APPROVED'?'Approved':'Returned for revision'}</h3><time className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</time></div><p className="mt-1 text-xs text-slate-500">Batch {item.batchId} · Reviewed by {item.reviewer}</p>{item.remarks&&<p className="mt-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-700">{item.remarks}</p>}</div></article>)}</div>:<div className="p-12 text-center"><History size={36} className="mx-auto mb-3 text-slate-300"/><h3 className="font-semibold text-navy-800">No verification decisions yet</h3><p className="mt-1 text-xs text-slate-500">Approve or return a project batch from Submission Approval to see its history here.</p></div>}</section></div>;
}
