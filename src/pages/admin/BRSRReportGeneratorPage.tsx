import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminConsolidationRecords } from '../../services/adminDemoDataService';
import { buildFullBRSRReport, downloadBRSRPdf, FullBRSRReport } from '../../services/brsrPdfService';
import { readStoredValue } from '../../services/localStorageService';
import { ArrowLeft, CheckCircle2, Download, FileBarChart, FileCheck, LoaderCircle, ShieldCheck, Sparkles } from 'lucide-react';

export default function BRSRReportGeneratorPage() {
  const [reportingYear, setReportingYear] = useState('FY 2025-26');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<FullBRSRReport | null>(null);
  const [error, setError] = useState('');
  const records = getAdminConsolidationRecords();
  const master = useMemo(() => records.find(record => record.level === 'MEIL' && record.status === 'SEALED' && record.reportingPeriod === reportingYear), [records, reportingYear]);
  const subsidiaries = useMemo(() => records.filter(record => record.level === 'SUBSIDIARY' && record.status === 'VERIFIED_LEVEL_3' && record.reportingPeriod === reportingYear), [records, reportingYear]);
  const priorReport = readStoredValue<Array<{id:string; reportingYear:string; totalCO2e:number}>>('meil_brsr_reports', []).filter(report => report.reportingYear === reportingYear).slice(-1)[0];

  const generate = () => {
    if (!master) return;
    setError(''); setGenerating(true); setGenerated(null);
    window.setTimeout(async () => {
      try {
        const report = buildFullBRSRReport(reportingYear);
        await downloadBRSRPdf(report);
        setGenerated(report);
      } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not generate the BRSR report.'); }
      finally { setGenerating(false); }
    }, 650);
  };

  const downloadAgain = () => { if (generated) downloadBRSRPdf(generated); };

  return <main className="mx-auto max-w-5xl space-y-6">
    <Link to="/admin/consolidation" className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-600 hover:text-navy-900"><ArrowLeft size={14}/> Back to consolidation</Link>
    <header><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-esg-50 px-3 py-1 text-xs font-bold text-esg-800"><FileBarChart size={14}/> Full BRSR report</div><h1 className="text-2xl font-bold text-navy-900">Generate company BRSR PDF</h1><p className="mt-1 max-w-3xl text-sm text-slate-500">The supplied 21-page MEIL draft is preserved, followed by a populated appendix with Sections A, B, and C, all nine principle headings, and Essential and Leadership indicators. The appendix uses verified data from the sealed consolidation. Missing values are marked “Not provided”; the original template placeholders remain unchanged.</p><a href={`${import.meta.env.BASE_URL}documents/MEIL_BRSR_FY2025-26_Comprehensive_Draft.pdf`} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs font-semibold text-esg-700 underline underline-offset-2">Open supplied source template</a></header>

    <section className="grid gap-5 lg:grid-cols-3"><div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2"><h2 className="flex items-center gap-2 font-bold text-navy-900"><FileCheck size={18} className="text-esg-600"/> Report configuration</h2>
      <label className="block max-w-sm text-xs font-semibold text-navy-700">Reporting financial year<select value={reportingYear} onChange={event=>{setReportingYear(event.target.value);setGenerated(null);setError('');}} className="input-field mt-2 w-full text-sm"><option>FY 2025-26</option><option>FY 2024-25</option></select></label>
      <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Scope 1</div><div className="mt-1 font-bold text-navy-900">{master?.scope1Total.toFixed(4) || '0.0000'} tCO2e</div></div><div className="rounded-xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Scope 2</div><div className="mt-1 font-bold text-navy-900">{master?.scope2Total.toFixed(4) || '0.0000'} tCO2e</div></div><div className="rounded-xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Scope 3</div><div className="mt-1 font-bold text-navy-900">{master?.scope3Total.toFixed(4) || '0.0000'} tCO2e</div></div></div>
      {!master&&<div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Seal the group consolidation for {reportingYear} before generating its report.</div>}
      {error&&<div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><Link to="/admin/report-preview" className="btn-secondary inline-flex items-center gap-2 px-4 py-2.5 text-xs"><FileBarChart size={14}/> Open report preview</Link><button onClick={generate} disabled={!master||generating} className="btn-primary inline-flex items-center gap-2 px-5 py-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50">{generating?<><LoaderCircle size={15} className="animate-spin"/> Building PDF…</>:<><Sparkles size={15}/> Generate &amp; Download BRSR PDF</>}</button></div>
    </div>

    <aside className="space-y-5"><div className="space-y-4 rounded-2xl bg-gradient-to-br from-navy-900 to-navy-800 p-6 text-white shadow"><h2 className="flex items-center gap-2 font-bold text-esg-300"><ShieldCheck size={18}/> Consolidation status</h2><div className="flex justify-between text-xs"><span>Verified subsidiary batches</span><b>{subsidiaries.length}</b></div><div className="flex justify-between text-xs"><span>Group seal</span><b className={master?'text-emerald-300':'text-amber-300'}>{master?'Complete':'Required'}</b></div><div className="flex justify-between gap-3 border-t border-white/10 pt-3 text-xs"><span>Batch reference</span><b className="break-all text-right">{master?.id||'—'}</b></div>{priorReport&&<p className="border-t border-white/10 pt-3 text-xs text-navy-200">Previous report generated: {priorReport.id} ({priorReport.totalCO2e.toFixed(4)} tCO2e)</p>}</div>
      {generated&&<div className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><div className="flex items-center gap-2 text-sm font-bold text-emerald-800"><CheckCircle2 size={18}/> Template report generated</div><p className="text-xs text-emerald-800">{generated.id} · {generated.reportingYear}<br/>The supplied 21-page MEIL template is preserved, followed by a populated appendix for Sections A, B, and C across all nine principles.</p><button onClick={downloadAgain} className="btn-primary flex w-full items-center justify-center gap-2 bg-emerald-700 py-2.5 text-xs"><Download size={14}/> Download PDF again</button></div>}
    </aside></section>
  </main>;
}
