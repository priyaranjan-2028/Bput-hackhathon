import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { consolidationRecords, evidenceRecords, parameterSubmissions, esgParameters, users, formatDateTime } from '../../data/mockData';
import { ConsolidationRecord, Notification, SubmissionStatus, User } from '../../types';
import { ProjectUserEvidence, ProjectUserSubmission } from '../../types/projectUser';
import { MEIL_STORAGE_KEYS, readStoredValue, writeStoredValue } from '../../services/localStorageService';
import { getBusinessUnitProjects, getBusinessUnitSupervisors, getCurrentBusinessUnit } from '../../services/businessUnitService';
import { useAuth } from '../../context/AuthContext';
import EvidenceFileLink from '../../components/evidence/EvidenceFileLink';
import { AlertTriangle, Check, CheckCircle2, Eye, X } from 'lucide-react';

type Rejection = { batch: ConsolidationRecord; submissionId: string; parameterName: string };

export default function BUProjectReviewPage() {
  const { user } = useAuth();
  const bu = getCurrentBusinessUnit(user);
  const projects = getBusinessUnitProjects(bu.id);
  const projectIds = new Set(projects.map(project => project.id));
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProjectId = searchParams.get('project') || 'ALL';
  const [records, setRecords] = useState<ConsolidationRecord[]>(() => {
    const stored = readStoredValue<ConsolidationRecord[]>('meil_bu_incoming_batches', []);
    const seeded = consolidationRecords.filter(record => record.level === 'PROJECT' && projectIds.has(record.entityId) && ['FORWARDED','CONSOLIDATED','SEALED'].includes(String(record.status))).map(record => ({ ...record, status: 'FORWARDED' }));
    return [...stored, ...seeded].map(record => ({ ...record, period: record.period || record.reportingPeriod || 'FY 2025-26' })).filter((record,index,all)=>all.findIndex(other=>other.id===record.id)===index);
  });
  const [detail, setDetail] = useState<ConsolidationRecord|null>(null);
  const [rejection, setRejection] = useState<Rejection|null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [notice, setNotice] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const visible = useMemo(()=>records.filter(record=>projectIds.has(record.entityId)
    && (selectedProjectId==='ALL'||record.entityId===selectedProjectId)
    && ['FORWARDED','VERIFIED_LEVEL_2','REVISION_REQUESTED'].includes(String(record.status))),[records,selectedProjectId,bu.id]);
  const pendingCount=visible.filter(record=>record.status==='FORWARDED').length;

  const decideParameter=(batch:ConsolidationRecord,submissionId:string,parameterName:string,approved:boolean,reason='')=>{
    const now=new Date().toISOString();
    const status=approved?SubmissionStatus.VERIFIED_LEVEL_2:SubmissionStatus.CORRECTION_REQUESTED;
    const storedSubs=readStoredValue<ProjectUserSubmission[]>(MEIL_STORAGE_KEYS.submissions,[]);
    const updatedSubs=storedSubs.map(item=>item.submissionId===submissionId?{
      ...item,status,updatedAt:now,...(reason?{supervisorNotes:reason}:{}),
      verificationHistory:[...(item.verificationHistory||[]),{verificationId:`BUVER-${Date.now()}`,submissionId,verifiedBy:user?.id||'',role:'BU Supervisor',action:approved?'Verified parameter at Level 2':'Returned parameter at Level 2',status,comment:approved?'Parameter and evidence checked by the BU Supervisor.':reason,timestamp:now}]
    }:item);
    writeStoredValue(MEIL_STORAGE_KEYS.submissions,updatedSubs);
    const legacy=readStoredValue<typeof parameterSubmissions>('meil_supervisor_submissions',parameterSubmissions);
    const updatedLegacy=legacy.map(item=>(item.id||item.submissionId||'')===submissionId?{...item,status,verifiedBy:user?.id,verifiedAt:now,...(reason?{supervisorNotes:reason}:{})}:item);
    writeStoredValue('meil_supervisor_submissions',updatedLegacy);
    const selected=updatedSubs.find(item=>item.submissionId===submissionId);
    const evidenceIds=selected?.evidenceIds||legacy.find(item=>(item.id||item.submissionId||'')===submissionId)?.evidenceIds||[];
    const storedFiles=readStoredValue<ProjectUserEvidence[]>(MEIL_STORAGE_KEYS.evidence,[]);
    writeStoredValue(MEIL_STORAGE_KEYS.evidence,storedFiles.map(file=>evidenceIds.includes(file.evidenceId)?{
      ...file,verificationStatus:status,verificationHistory:[...(file.verificationHistory||[]),{verificationId:`BUFILE-${Date.now()}`,submissionId,verifiedBy:user?.id||'',role:'BU Supervisor',action:approved?'Verified':'Returned',status,comment:approved?'Evidence verified at Level 2.':reason,timestamp:now}]
    }:file));

    const childIds=batch.childRecordIds||[];
    const statuses=new Map<string,string>();
    updatedSubs.forEach(item=>statuses.set(item.submissionId,item.status));
    updatedLegacy.forEach(item=>statuses.set(item.id||item.submissionId||'',item.status));
    const allVerified=childIds.length>0&&childIds.every(id=>statuses.get(id)===SubmissionStatus.VERIFIED_LEVEL_2);
    const batchStatus=approved?(allVerified?'VERIFIED_LEVEL_2':'FORWARDED'):'REVISION_REQUESTED';
    const next=records.map(item=>item.id===batch.id?{...item,status:batchStatus,lastReviewedAt:now,...(reason?{revisionRemarks:reason}:{})}:item);
    setRecords(next);writeStoredValue('meil_bu_incoming_batches',next);writeStoredValue('meil_project_consolidations',next);

    const project=projects.find(item=>item.id===batch.entityId);
    const supervisorId=project?.supervisorId||getBusinessUnitSupervisors(bu.id).find(person=>person.assignedProjectIds?.includes(batch.entityId))?.id;
    const notification:Notification={id:`NOT-BU-${Date.now()}`,userId:supervisorId||'',title:approved?'Parameter verified by BU Supervisor':'Parameter returned by BU Supervisor',message:approved?`${parameterName} in ${batch.entityName} was verified at Level 2${allVerified?'. All parameters in the project batch are approved.':'.'}`:`${parameterName} in ${batch.entityName} needs revision. ${reason}`,type:approved?'success':'warning',read:false,createdAt:now,link:'/project-supervisor/consolidation',entityType:'PROJECT_PARAMETER',entityId:submissionId};
    if(supervisorId)writeStoredValue('meil_notifications',[notification,...readStoredValue<Notification[]>('meil_notifications',[])]);
    const history=readStoredValue<Array<Record<string,string>>>('meil_bu_verification_history',[]);
    writeStoredValue('meil_bu_verification_history',[{id:notification.id,batchId:batch.id,projectId:batch.entityId,projectName:batch.entityName,parameterName,submissionId,action:approved?'APPROVED':'RETURNED',reviewer:user?.name||'BU Supervisor',timestamp:now,...(reason?{remarks:reason}:{})},...history]);
    setNotice(approved?`${parameterName} verified.${allVerified?' Every parameter is now verified; this batch is ready for BU consolidation.':' Review the remaining parameter records.'}`:`${parameterName} returned with revision remarks; the Project Supervisor was notified.`);
    setRefreshKey(value=>value+1);
  };

  return <div className="mx-auto max-w-7xl space-y-6">
    <header><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Level-2 review</p><h1 className="mt-1 text-2xl font-bold text-navy-900">Project Parameter Verification</h1><p className="mt-1 text-sm text-slate-600">Select a project to review its combined Project User submissions. Verify or return each parameter and its supporting evidence individually.</p></header>
    {notice&&<div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 size={18}/>{notice}</div>}
    <section className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end"><label className="w-full text-xs font-semibold text-navy-700 sm:max-w-md">Select project / Project Supervisor<select value={selectedProjectId} onChange={event=>{const value=event.target.value;setSearchParams(value==='ALL'?{}:{project:value});}} className="input-field mt-1 w-full"><option value="ALL">All projects in {bu.name}</option>{projects.map(project=>{const supervisor=users.find(item=>item.id===project.supervisorId)||getBusinessUnitSupervisors(bu.id).find(item=>item.id===project.supervisorId);return <option key={project.id} value={project.id}>{project.name}{supervisor?` — ${supervisor.name}`:''}</option>;})}</select></label><p className="text-xs text-slate-600">Projects awaiting parameter review: <strong className="text-amber-700">{pendingCount}</strong></p></section>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-navy-900">Forwarded, consolidated project batches</h2><p className="mt-1 text-xs text-slate-500">Open a project to see all combined parameter submissions and review each one.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr><th className="px-4 py-3">Project / batch</th><th className="px-4 py-3">Period</th><th className="px-4 py-3">Scope 1</th><th className="px-4 py-3">Scope 2</th><th className="px-4 py-3">Scope 3</th><th className="px-4 py-3">Combined total</th><th className="px-4 py-3">Batch status</th><th className="px-4 py-3 text-right">Review</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map(record=><tr key={record.id}><td className="px-4 py-3"><p className="font-semibold text-navy-900">{record.entityName}</p><p className="mt-1 font-mono text-[10px] text-slate-500">{record.id}</p></td><td className="px-4 py-3">{record.period}</td><td className="px-4 py-3">{record.scope1Total.toFixed(2)}</td><td className="px-4 py-3">{record.scope2Total.toFixed(2)}</td><td className="px-4 py-3">{record.scope3Total.toFixed(2)}</td><td className="px-4 py-3 font-bold">{record.totalCO2e.toFixed(2)} tCO₂e</td><td className="px-4 py-3">{record.status}</td><td className="px-4 py-3 text-right"><button onClick={()=>setDetail(record)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-semibold text-blue-700"><Eye size={13}/> Review parameters</button></td></tr>)}</tbody></table>{!visible.length&&<p className="p-10 text-center text-sm text-slate-500">No forwarded project batches are waiting for this BU.</p>}</div></section>
    {detail&&<ProjectBatchDetail record={detail} onClose={()=>setDetail(null)} onApprove={(id,name)=>decideParameter(detail,id,name,true)} onReject={(id,name)=>{setRejection({batch:detail,submissionId:id,parameterName:name});setRejectReason('');}} refreshKey={refreshKey}/ >}
    {rejection&&<div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-950/50 p-4"><form onSubmit={event=>{event.preventDefault();decideParameter(rejection.batch,rejection.submissionId,rejection.parameterName,false,rejectReason);setRejection(null);}} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl"><div className="flex items-center gap-2 text-rose-700"><AlertTriangle size={20}/><h2 className="font-bold">Return {rejection.parameterName}</h2></div><label className="block text-xs font-semibold text-navy-700">Revision remarks<textarea required rows={4} value={rejectReason} onChange={event=>setRejectReason(event.target.value)} className="input-field mt-1 w-full" placeholder="Describe what needs correction"/></label><div className="flex justify-end gap-2"><button type="button" onClick={()=>setRejection(null)} className="btn-secondary px-4 py-2 text-xs">Cancel</button><button className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white">Return parameter</button></div></form></div>}
  </div>;
}

function ProjectBatchDetail({record,onClose,onApprove,onReject,refreshKey}:{record:ConsolidationRecord;onClose:()=>void;onApprove:(id:string,name:string)=>void;onReject:(id:string,name:string)=>void;refreshKey:number}) {
  void refreshKey;
  const childIds=new Set(record.childRecordIds||[]);
  const entries=readStoredValue<ProjectUserSubmission[]>(MEIL_STORAGE_KEYS.submissions,[]).filter(item=>item.projectId===record.entityId&&(!childIds.size||childIds.has(item.submissionId)));
  const legacy=readStoredValue<typeof parameterSubmissions>('meil_supervisor_submissions',parameterSubmissions).filter(item=>item.projectId===record.entityId&&(!childIds.size||childIds.has(item.id||item.submissionId||'')));
  const files=[...evidenceRecords,...readStoredValue<ProjectUserEvidence[]>(MEIL_STORAGE_KEYS.evidence,[])].filter((file,index,all)=>file.projectId===record.entityId&&(!childIds.size||childIds.has(file.submissionId||'')||entries.some(item=>item.evidenceIds.includes(file.evidenceId)))&&all.findIndex(other=>other.evidenceId===file.evidenceId)===index);
  const officers:User[]=[...users,...readStoredValue<User[]>('meil_project_users',[])];
  const isVerified=(id:string)=>entries.find(item=>item.submissionId===id)?.status===SubmissionStatus.VERIFIED_LEVEL_2||legacy.find(item=>(item.id||item.submissionId||'')===id)?.status===SubmissionStatus.VERIFIED_LEVEL_2;
  const totalEntries=entries.length+legacy.length;const approvedCount=[...entries.filter(item=>item.status===SubmissionStatus.VERIFIED_LEVEL_2),...legacy.filter(item=>item.status===SubmissionStatus.VERIFIED_LEVEL_2)].length;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-3 sm:p-5"><section className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white shadow-2xl"><header className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white p-5"><div><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Combined project batch · {approvedCount}/{totalEntries} parameters verified</p><h2 className="mt-1 text-lg font-bold text-navy-900">{record.entityName}</h2><p className="mt-1 text-xs text-slate-500">{record.id} · {record.period} · All linked project user entries and evidence</p></div><button onClick={onClose} className="rounded-lg px-3 py-2 text-sm hover:bg-slate-100">Close</button></header><div className="space-y-4 p-5"><div className="grid gap-3 sm:grid-cols-4">{[['Scope 1',record.scope1Total],['Scope 2',record.scope2Total],['Scope 3',record.scope3Total],['Combined total',record.totalCO2e]].map(([label,value])=><div key={label} className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-bold">{Number(value).toFixed(3)} tCO₂e</p></div>)}</div>
    {entries.map(entry=>{const person=officers.find(item=>item.id===entry.userId);const parameter=esgParameters.find(item=>item.parameterId===entry.parameterId||item.id===entry.parameterId);const calculation=entry.calculation;const linked=files.filter(file=>entry.evidenceIds.includes(file.evidenceId)||file.submissionId===entry.submissionId);return <article key={entry.submissionId} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold text-navy-900">{parameter?.name||entry.parameterId}</h3><p className="mt-1 text-xs text-slate-500">{person?.name||entry.userId} · {person?.email||''} · {entry.submissionId}</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px]">{entry.status}</span>{entry.status!==SubmissionStatus.VERIFIED_LEVEL_2&&<><button onClick={()=>onApprove(entry.submissionId,parameter?.name||entry.parameterId)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white"><Check size={13}/> Verify parameter</button><button onClick={()=>onReject(entry.submissionId,parameter?.name||entry.parameterId)} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-[11px] font-semibold text-rose-700"><X size={13}/> Reject</button></>}</div></div><div className="mt-3 grid gap-2 sm:grid-cols-4"><Detail label="Scope" value={String(entry.scope)}/><Detail label="Activity data" value={`${entry.activityValue.toLocaleString()} ${entry.activityUnit}`}/><Detail label="Emission factor" value={calculation?`${calculation.emissionFactorValue} ${calculation.emissionFactorUnit} · ${calculation.emissionFactorSource||'source not set'}`:entry.emissionFactorId||'—'}/><Detail label="Calculated emissions" value={`${calculation?.convertedTonnesCO2e.toFixed(5)||'0'} tCO₂e`}/><Detail label="Data entry date" value={entry.dataEntryDate}/><Detail label="Reporting period" value={entry.reportingPeriod}/><Detail label="Submitted" value={entry.submittedAt?formatDateTime(entry.submittedAt):'—'}/><Detail label="Last updated" value={formatDateTime(entry.updatedAt)}/></div><p className="mt-3 whitespace-pre-wrap text-xs text-slate-700"><b>Remarks:</b> {entry.remarks||'None'}{entry.supervisorNotes&&<><br/><b>Supervisor notes:</b> {entry.supervisorNotes}</>}</p><EvidenceList files={linked}/></article>;})}
    {legacy.map(entry=>{const id=entry.id||entry.submissionId||'';const parameter=esgParameters.find(item=>item.parameterId===entry.parameterId||item.id===entry.parameterId);const person=officers.find(item=>item.id===(entry.userId||entry.submittedBy));const linked=files.filter(file=>file.submissionId===id);return <article key={id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold text-navy-900">{parameter?.name||entry.parameterId}</h3><p className="mt-1 text-xs text-slate-500">{person?.name||entry.userId||entry.submittedBy} · {id}</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px]">{entry.status}</span>{entry.status!==SubmissionStatus.VERIFIED_LEVEL_2&&<><button onClick={()=>onApprove(id,parameter?.name||entry.parameterId)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white"><Check size={13}/> Verify parameter</button><button onClick={()=>onReject(id,parameter?.name||entry.parameterId)} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-[11px] font-semibold text-rose-700"><X size={13}/> Reject</button></>}</div></div><div className="mt-3 grid gap-2 sm:grid-cols-4"><Detail label="Scope" value={String(entry.scope||'—')}/><Detail label="Activity data" value={`${entry.activityData??entry.value??'—'} ${entry.unit||''}`}/><Detail label="Emission factor" value={`${entry.emissionFactorValue??'—'} ${entry.emissionFactorId||''}`}/><Detail label="Calculated emissions" value={`${entry.calculatedCO2e?.toFixed(5)||'0'} tCO₂e`}/><Detail label="Period" value={entry.reportingPeriod||entry.period||'—'}/><Detail label="Submitted" value={entry.submittedAt?formatDateTime(entry.submittedAt):'—'}/><Detail label="Source" value={entry.source||'—'}/></div><p className="mt-3 whitespace-pre-wrap text-xs text-slate-700"><b>Remarks:</b> {entry.notes||'None'}{entry.supervisorNotes&&<><br/><b>Supervisor notes:</b> {entry.supervisorNotes}</>}</p><EvidenceList files={linked}/></article>;})}
    {!totalEntries&&<p className="rounded-xl bg-amber-50 p-5 text-sm text-amber-800">This forwarded batch has no linked parameter records. The Project Supervisor must consolidate and forward records with their submission IDs.</p>}
    {totalEntries>0&&approvedCount===totalEntries&&<p className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">Every parameter is verified. This project batch is ready for BU consolidation.</p>}</div></section></div>;
}

function EvidenceList({files}:{files:Array<(typeof evidenceRecords)[number]|ProjectUserEvidence>}) {return <div className="mt-3"><h4 className="mb-2 text-xs font-semibold text-navy-800">Evidence files ({files.length})</h4>{files.length?<div className="space-y-2">{files.map(file=><EvidenceFileLink key={file.evidenceId} file={file}/>)}</div>:<p className="text-xs text-slate-500">No evidence attached.</p>}</div>;}
function Detail({label,value}:{label:string;value:string}) {return <div className="rounded-lg bg-slate-50 p-2.5"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 break-words text-xs font-medium text-navy-900">{value}</p></div>;}
