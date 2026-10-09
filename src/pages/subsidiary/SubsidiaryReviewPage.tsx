import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, Check, CheckCircle2, Clock, FileText, X } from 'lucide-react';
import { consolidationRecords, evidenceRecords, esgParameters, formatDateTime, parameterSubmissions, users } from '../../data/mockData';
import { ConsolidationRecord, Notification, ParameterSubmission, SubmissionStatus, User } from '../../types';
import { ProjectUserEvidence, ProjectUserSubmission } from '../../types/projectUser';
import EvidenceFileLink from '../../components/evidence/EvidenceFileLink';
import { MEIL_STORAGE_KEYS, readStoredValue, writeStoredValue } from '../../services/localStorageService';
import { getCurrentSubsidiary, getSubsidiaryBusinessUnits, getSubsidiaryProjects, getSubsidiarySupervisors } from '../../services/subsidiaryService';
import { useAuth } from '../../context/AuthContext';

type ReviewItem = { id: string; parameterId: string; projectId: string; userId: string; value: number; unit: string; period: string; emissions: number; notes: string; status: SubmissionStatus; evidenceIds: string[]; kind: 'user' | 'legacy' };
type ReturnItem = { id: string; parameterName: string };

const UNIT_SELECT = 'input-field mt-1 w-full';

export default function SubsidiaryReviewPage() {
  const { user } = useAuth(); const subsidiary = getCurrentSubsidiary(user); const units = getSubsidiaryBusinessUnits(subsidiary.id); const subProjects = getSubsidiaryProjects(subsidiary.id);
  const [searchParams, setSearchParams] = useSearchParams(); const selectedBUId = searchParams.get('businessUnitId') || units[0]?.id || '';
  const [tab, setTab] = useState<'PENDING' | 'VERIFIED' | 'CORRECTIONS'>('PENDING'); const [refresh, setRefresh] = useState(0);
  const [returnItem, setReturnItem] = useState<ReturnItem | null>(null); const [returnNote, setReturnNote] = useState(''); const [notice, setNotice] = useState('');
  const [batchRecords, setBatchRecords] = useState<ConsolidationRecord[]>(() => {
    const incoming = readStoredValue<ConsolidationRecord[]>('meil_subsidiary_incoming_batches', []);
    const buRecords = readStoredValue<ConsolidationRecord[]>('meil_bu_consolidations', []);
    const seed = consolidationRecords.filter(record => record.level === 'BUSINESS_UNIT' && record.parentEntityId === subsidiary.id);
    return [...seed, ...buRecords, ...incoming].filter((record,index,all)=>all.findIndex(other=>other.id===record.id)===index);
  });
  const selectedBatch = batchRecords.filter(record => record.level === 'BUSINESS_UNIT' && record.entityId === selectedBUId && record.parentEntityId === subsidiary.id && record.status !== 'REVISION_REQUESTED')
    .sort((a,b)=>new Date(b.consolidatedAt).getTime()-new Date(a.consolidatedAt).getTime())[0];
  const allEntries = useMemo(() => {
    const legacy = readStoredValue<ParameterSubmission[]>('meil_supervisor_submissions', parameterSubmissions);
    const userEntries = readStoredValue<ProjectUserSubmission[]>(MEIL_STORAGE_KEYS.submissions, []);
    const children = new Set(selectedBatch?.childRecordIds ?? []);
    const matchesBatch = (projectId:string,id:string) => Boolean(selectedBatch && subProjects.some(project=>project.id===projectId) && children.has(id));
    const normalized: ReviewItem[] = [
      ...userEntries.filter(item=>item.businessUnitId===selectedBUId && item.subsidiaryId===subsidiary.id && matchesBatch(item.projectId,item.submissionId) && item.status!==SubmissionStatus.DRAFT)
        .map(item=>({id:item.submissionId,parameterId:item.parameterId,projectId:item.projectId,userId:item.userId,value:item.activityValue,unit:item.activityUnit,period:item.reportingPeriod,emissions:item.calculation?.convertedTonnesCO2e??0,notes:item.remarks||item.supervisorNotes||'',status:item.status,evidenceIds:item.evidenceIds,kind:'user' as const})),
      ...legacy.filter(item=>item.businessUnitId===selectedBUId && item.subsidiaryId===subsidiary.id && matchesBatch(item.projectId,item.id||item.submissionId||'') && item.status!==SubmissionStatus.DRAFT)
        .map(item=>({id:item.id||item.submissionId||'',parameterId:item.parameterId,projectId:item.projectId,userId:item.userId||item.submittedBy||'',value:item.value??item.activityData??0,unit:item.unit||'',period:item.reportingPeriod||item.period||'',emissions:item.calculatedCO2e??0,notes:item.notes||item.supervisorNotes||'',status:item.status,evidenceIds:item.evidenceIds||[],kind:'legacy' as const})),
    ].filter((item,index,all)=>all.findIndex(other=>other.id===item.id)===index);
    return normalized;
  },[selectedBUId, subsidiary.id, selectedBatch?.id, refresh, subProjects]);
  const files = useMemo(() => {
    const stored = readStoredValue<ProjectUserEvidence[]>(MEIL_STORAGE_KEYS.evidence, []);
    const seeded: ProjectUserEvidence[] = evidenceRecords.map(file=>({evidenceId:file.evidenceId,originalFilename:file.originalFilename,systemFilename:file.systemFilename,fileExtension:file.fileExtension||'',fileType:file.fileType||'application/octet-stream',fileSize:file.fileSize,meilId:file.meilId||'MEIL',subsidiaryId:file.subsidiaryId,businessUnitId:file.businessUnitId,projectId:file.projectId,userId:file.userId||'',parameterId:file.parameterId,submissionId:file.submissionId,uploadedBy:file.uploadedBy,uploadedAt:file.uploadedAt,verificationStatus:file.verificationStatus||SubmissionStatus.SUBMITTED}));
    const entryIds=new Set(allEntries.map(entry=>entry.id));
    return [...seeded,...stored].filter((file,index,all)=>file.businessUnitId===selectedBUId&&file.subsidiaryId===subsidiary.id&&entryIds.has(file.submissionId||'')&&all.findIndex(other=>other.evidenceId===file.evidenceId)===index);
  },[selectedBUId,subsidiary.id,refresh,allEntries]);
  const displayed = allEntries.filter(item=>tab==='PENDING'?[SubmissionStatus.SUBMITTED,SubmissionStatus.UNDER_REVIEW,SubmissionStatus.VERIFIED_LEVEL_1,SubmissionStatus.VERIFIED_LEVEL_2,SubmissionStatus.CONSOLIDATED_PROJECT,SubmissionStatus.APPROVED].includes(item.status):tab==='VERIFIED'?[SubmissionStatus.VERIFIED_LEVEL_3].includes(item.status):[SubmissionStatus.CORRECTION_REQUESTED,SubmissionStatus.CORRECTION_REQUIRED].includes(item.status));
  const updateBatch = (nextStatus:string, reason?:string) => {
    if (!selectedBatch) return;
    const now=new Date().toISOString();
    const next=batchRecords.map(record=>record.id===selectedBatch.id?{...record,status:nextStatus,...(reason?{revisionRemarks:reason}:{}),lastReviewedAt:now}:record);
    setBatchRecords(next);writeStoredValue('meil_subsidiary_incoming_batches',next);writeStoredValue('meil_bu_consolidations',next);
  };
  const decide = (item:ReviewItem, approved:boolean, reason='') => {
    const now=new Date().toISOString();const status=approved?SubmissionStatus.VERIFIED_LEVEL_3:SubmissionStatus.CORRECTION_REQUESTED;
    if(item.kind==='user'){
      const all=readStoredValue<ProjectUserSubmission[]>(MEIL_STORAGE_KEYS.submissions,[]);const target=all.find(entry=>entry.submissionId===item.id);
      const updated=all.map(entry=>entry.submissionId===item.id?{...entry,status,updatedAt:now,supervisorNotes:approved?entry.supervisorNotes:reason,verifiedBy:user?.id,verificationHistory:[...(entry.verificationHistory||[]),{verificationId:`SUBVER-${Date.now()}`,verifiedBy:user?.id||'',role:'Subsidiary Supervisor',action:approved?'Verified at Level 3':'Returned at Level 3',status,comment:approved?'Merged parameter and supporting evidence verified by subsidiary supervisor.':reason,timestamp:now}]}:entry);
      writeStoredValue(MEIL_STORAGE_KEYS.submissions,updated);
      const evidenceIds=target?.evidenceIds||item.evidenceIds;const allFiles=readStoredValue<ProjectUserEvidence[]>(MEIL_STORAGE_KEYS.evidence,[]);
      writeStoredValue(MEIL_STORAGE_KEYS.evidence,allFiles.map(file=>evidenceIds.includes(file.evidenceId)?{...file,verificationStatus:status,verificationHistory:[...(file.verificationHistory||[]),{verificationId:`SUBFILE-${Date.now()}`,submissionId:item.id,verifiedBy:user?.id||'',role:'Subsidiary Supervisor',action:approved?'Verified':'Returned',status,comment:approved?'Evidence checked during Level 3 parameter review.':reason,timestamp:now}]}:file));
    } else {
      const all=readStoredValue<ParameterSubmission[]>('meil_supervisor_submissions',parameterSubmissions);
      writeStoredValue('meil_supervisor_submissions',all.map(entry=>(entry.id||entry.submissionId)===item.id?{...entry,status,verifiedBy:user?.id,verifiedAt:now,supervisorNotes:approved?entry.supervisorNotes:reason}:entry));
    }
    const newHistory=readStoredValue<Array<Record<string,string>>>('meil_subsidiary_verification_history',[]);writeStoredValue('meil_subsidiary_verification_history',[{id:`SUBH-${Date.now()}`,businessUnitId:selectedBUId,batchId:selectedBatch?.id||'',submissionId:item.id,parameterId:item.parameterId,action:approved?'VERIFIED':'RETURNED',reviewer:user?.name||'Subsidiary Supervisor',timestamp:now,...(reason?{remarks:reason}:{})},...newHistory]);
    const current=readStoredValue<ProjectUserSubmission[]>(MEIL_STORAGE_KEYS.submissions,[]);const legacy=readStoredValue<ParameterSubmission[]>('meil_supervisor_submissions',parameterSubmissions);
    const statusFor=(id:string)=>current.find(entry=>entry.submissionId===id)?.status??legacy.find(entry=>(entry.id||entry.submissionId)===id)?.status;
    const childIds=selectedBatch?.childRecordIds??[];
    const completed=childIds.length>0&&childIds.every(id=>statusFor(id)===SubmissionStatus.VERIFIED_LEVEL_3);
    if(!approved)updateBatch('REVISION_REQUESTED',reason);else if(completed)updateBatch('VERIFIED_LEVEL_3');
    const buUnit=units.find(unit=>unit.id===selectedBUId);const buSupervisorId=buUnit?.supervisorId||getSubsidiarySupervisors(subsidiary.id).find(person=>person.assignedBUIds?.includes(selectedBUId))?.id;const note:Notification={id:`NOT-SUB-${Date.now()}`,userId:buSupervisorId||'',title:approved?'Parameter verified by subsidiary':'Parameter returned by subsidiary',message:approved?`${item.parameterId} for ${selectedBatch?.entityName} passed Level 3 review.`:`${item.parameterId} for ${selectedBatch?.entityName} needs revision. ${reason}`,type:approved?'success':'warning',read:false,createdAt:now,link:'/business-unit/consolidation',entityType:'BUSINESS_UNIT_PARAMETER',entityId:item.id};
    if(note.userId)writeStoredValue('meil_notifications',[note,...readStoredValue<Notification[]>('meil_notifications',[])]);
    setRefresh(value=>value+1);setNotice(approved?`${item.parameterId} verified at Level 3.${completed?' The complete BU batch is now verified.':''}`:`${item.parameterId} returned with revision remarks.`);
  };
  const submitReturn=(event:React.FormEvent)=>{event.preventDefault();if(returnItem){const target=allEntries.find(item=>item.id===returnItem.id);if(target)decide(target,false,returnNote);}setReturnItem(null);setReturnNote('');};
  return <div className="mx-auto max-w-7xl space-y-6">
    <header><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Level‑3 review</p><h1 className="mt-1 text-2xl font-bold text-navy-900">Merged Business Unit Parameter Review</h1><p className="mt-1 text-sm text-slate-600">Choose a business unit to review its merged parameter records and the evidence attached to each record.</p></header>
    {notice&&<div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 size={18}/>{notice}</div>}
    <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:items-end">
      <label className="block text-xs font-semibold text-navy-700">Select business unit<span className="mt-1 block"><select value={selectedBUId} onChange={event=>{setSearchParams(event.target.value?{businessUnitId:event.target.value}:{});setTab('PENDING');}} className={UNIT_SELECT} disabled={!units.length}><option value="">Choose a business unit</option>{units.map(unit=><option key={unit.id} value={unit.id}>{unit.name} · {unit.code}</option>)}</select></span></label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><Summary label="Merged parameters" value={String(allEntries.length)}/><Summary label="Supporting files" value={String(files.length)}/><Summary label="Batch status" value={selectedBatch?.status||'No batch'}/><Summary label="Reporting period" value={selectedBatch?.period||selectedBatch?.reportingPeriod||'—'}/></div>
    </section>
    {selectedBatch&&<div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-xs text-blue-900"><strong>{selectedBatch.entityName}</strong> · {selectedBatch.id} · Merged by BU supervisor on {formatDateTime(selectedBatch.consolidatedAt)}. Each line below remains individually reviewable.</div>}
    {!selectedBatch&&selectedBUId&&<div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">No merged batch has been forwarded for this business unit yet. Reviewable merged data appears here after the BU Supervisor forwards it.</div>}
    <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">{([['PENDING','Awaiting review'],['VERIFIED','Verified'],['CORRECTIONS','Returned']] as const).map(([key,label])=><button key={key} onClick={()=>setTab(key)} className={`rounded-xl px-4 py-2 text-xs font-bold transition ${tab===key?'bg-navy-900 text-white shadow-sm':'border border-slate-200 bg-white text-navy-700 hover:bg-slate-50'}`}>{label} ({allEntries.filter(item=>key==='PENDING'?[SubmissionStatus.SUBMITTED,SubmissionStatus.UNDER_REVIEW,SubmissionStatus.VERIFIED_LEVEL_1,SubmissionStatus.VERIFIED_LEVEL_2,SubmissionStatus.CONSOLIDATED_PROJECT,SubmissionStatus.APPROVED].includes(item.status):key==='VERIFIED'?item.status===SubmissionStatus.VERIFIED_LEVEL_3:[SubmissionStatus.CORRECTION_REQUESTED,SubmissionStatus.CORRECTION_REQUIRED].includes(item.status)).length})</button>)}</div>
    <section className="space-y-4">{displayed.map(item=>{const parameter=esgParameters.find(param=>param.parameterId===item.parameterId||param.id===item.parameterId);const project=subProjects.find(entry=>entry.id===item.projectId);const person:User|undefined=users.find(entry=>entry.id===item.userId);const linked=files.filter(file=>item.evidenceIds.includes(file.evidenceId)||file.submissionId===item.id);const pending=[SubmissionStatus.SUBMITTED,SubmissionStatus.UNDER_REVIEW,SubmissionStatus.VERIFIED_LEVEL_1,SubmissionStatus.VERIFIED_LEVEL_2,SubmissionStatus.CONSOLIDATED_PROJECT,SubmissionStatus.APPROVED].includes(item.status);return <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-start"><div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{String(parameter?.scope||'ESG')} · {parameter?.category||'Parameter'}</p><h2 className="mt-1 text-lg font-bold text-navy-900">{parameter?.name||item.parameterId}</h2><p className="mt-1 text-xs text-slate-500">{project?.name||item.projectId} · {person?.name||item.userId} · {item.period||'Reporting period unavailable'} · <span className="font-mono">{item.id}</span></p></div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-navy-700">{item.status.replaceAll('_',' ')}</span>{pending&&<><button onClick={()=>decide(item,true)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"><Check size={14}/> Verify parameter</button><button onClick={()=>{setReturnItem({id:item.id,parameterName:parameter?.name||item.parameterId});setReturnNote('');}} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"><X size={14}/> Return</button></>}</div></div><div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4"><Summary label="Merged activity data" value={`${item.value.toLocaleString()} ${item.unit||parameter?.unit||''}`}/><Summary label="Calculated emissions" value={`${item.emissions.toFixed(4)} tCO₂e`}/><Summary label="Source project" value={project?.name||item.projectId}/><Summary label="Submitter" value={person?.name||item.userId}/></div>{item.notes&&<p className="mx-5 mb-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-700"><strong>Submission / review notes:</strong> {item.notes}</p>}<div className="border-t border-slate-100 bg-slate-50/70 p-5"><h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-navy-900"><FileText size={16}/> Supporting files for {parameter?.name||item.parameterId} ({linked.length})</h3>{linked.length?<div className="space-y-2">{linked.map(file=><EvidenceFileLink key={file.evidenceId} file={file}/>)}</div>:<p className="text-xs text-slate-500">No evidence files are linked to this parameter record.</p>}</div></article>})}
      {!displayed.length&&<div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><Clock size={28} className="mx-auto text-slate-400"/><p className="mt-3 text-sm font-semibold text-navy-800">No parameter records in this view</p><p className="mt-1 text-xs text-slate-500">Choose another review status or wait for the BU Supervisor to forward merged data.</p></div>}</section>
    {returnItem&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 p-4"><form onSubmit={submitReturn} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center gap-2 text-rose-700"><AlertTriangle size={20}/><h2 className="font-bold">Return {returnItem.parameterName}</h2></div><p className="text-xs text-slate-600">Add clear correction instructions for this merged parameter. The BU Supervisor can follow up with the project review chain.</p><label className="block text-xs font-semibold text-navy-700">Revision remarks<textarea required minLength={4} rows={4} value={returnNote} onChange={event=>setReturnNote(event.target.value)} className="input-field mt-1 w-full rounded-xl" placeholder="Describe what needs correction"/></label><div className="flex justify-end gap-2"><button type="button" onClick={()=>setReturnItem(null)} className="btn-secondary rounded-lg px-4 py-2 text-xs">Cancel</button><button className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700">Return parameter</button></div></form></div>}
  </div>;
}

function Summary({label,value}:{label:string;value:string}) { return <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 break-words text-sm font-bold text-navy-900">{value}</p></div>; }
