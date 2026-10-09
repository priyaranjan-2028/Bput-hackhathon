import React from 'react';
import { Download, ExternalLink, FileText } from 'lucide-react';
import { Evidence } from '../../types';
import { ProjectUserEvidence } from '../../types/projectUser';

type StoredEvidence = Evidence | ProjectUserEvidence;

export default function EvidenceFileLink({ file }: { file: StoredEvidence }) {
  const dataUrl = 'dataUrl' in file ? file.dataUrl : undefined;
  return <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 text-xs">
    <div className="flex min-w-0 items-start gap-2"><FileText size={16} className="mt-0.5 shrink-0 text-blue-700"/><div className="min-w-0"><p className="break-all font-semibold text-navy-900">{file.originalFilename}</p><p className="mt-1 break-all font-mono text-[10px] text-slate-500">{file.systemFilename}</p><p className="mt-1 text-slate-500">{file.evidenceId} · {(file.fileSize / 1024).toFixed(1)} KB · {file.fileType || file.fileExtension || 'File'}</p></div></div>
    {dataUrl ? <div className="flex shrink-0 gap-2"><a href={dataUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1.5 font-semibold text-blue-700 hover:bg-blue-50"><ExternalLink size={13}/> Open</a><a href={dataUrl} download={file.originalFilename} className="inline-flex items-center gap-1 rounded-md bg-blue-700 px-2 py-1.5 font-semibold text-white hover:bg-blue-800"><Download size={13}/> Download</a></div> : <span className="rounded bg-amber-50 px-2 py-1 text-[10px] text-amber-700">Metadata only</span>}
  </div>;
}
