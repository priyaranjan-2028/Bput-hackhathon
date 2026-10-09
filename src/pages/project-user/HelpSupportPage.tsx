import { Link } from 'react-router-dom';
import { BookOpen, CalendarDays, Calculator, FileText, Headset, UploadCloud } from 'lucide-react';

const guides = [
  { icon: CalendarDays, title: 'Today-only data entry', body: 'Every new submission, draft and correction must use today’s system date. Confirm today’s date at the top of a Section C page before entering data. Reporting Period is stored separately.' },
  { icon: FileText, title: 'Enter ESG activity data', body: 'Choose an assigned indicator, review its read-only definition and enter a positive activity value in the configured unit. The Project User cannot edit a parameter or its unit.' },
  { icon: Calculator, title: 'How CO₂e is calculated', body: 'The application multiplies activity data by the configured emission factor, then converts kilograms to tonnes. CO₂e is calculated automatically and cannot be manually entered.' },
  { icon: UploadCloud, title: 'Upload evidence', body: 'Attach PDF, JPG, JPEG, PNG, XLSX or DOCX evidence up to 25 MB per file. The system keeps the original filename and creates a separate, traceable system filename and evidence ID.' },
  { icon: BookOpen, title: 'Respond to a correction', body: 'Open Corrections Required, review the supervisor comment and original record, select today’s date, update allowed activity data and resubmit. Existing evidence stays in the audit history.' },
];

export default function HelpSupportPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Project User workspace</p><h1 className="mt-1 text-2xl font-bold text-navy-900">Help &amp; Support</h1><p className="mt-1 text-sm text-slate-600">Guidance for reliable ESG data collection and auditable submissions.</p></header>
      <section className="rounded-xl border border-slate-200 bg-white">
        {guides.map(({ icon: Icon, title, body }) => <article key={title} className="flex gap-4 border-b border-slate-100 p-5 last:border-0"><span className="h-fit rounded-lg bg-blue-50 p-2 text-blue-700"><Icon size={18} /></span><div><h2 className="font-semibold text-navy-900">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-600">{body}</p></div></article>)}
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold text-navy-900">Submission status meanings</h2><dl className="mt-3 grid gap-3 sm:grid-cols-2"><div><dt className="font-medium text-navy-800">Draft</dt><dd className="text-sm text-slate-600">Saved in your workspace; not yet sent for review.</dd></div><div><dt className="font-medium text-navy-800">Submitted / Under Review</dt><dd className="text-sm text-slate-600">Received by the Project Supervisor or being checked.</dd></div><div><dt className="font-medium text-navy-800">Correction Required</dt><dd className="text-sm text-slate-600">Review the supervisor comment and correct the record.</dd></div><div><dt className="font-medium text-navy-800">Approved / Consolidated</dt><dd className="text-sm text-slate-600">Verified; data is read-only at this level.</dd></div></dl></section>
      <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="flex items-center gap-2 font-semibold text-navy-900"><Headset size={18} /> Need assistance?</h2><p className="mt-1 text-sm text-slate-600">For assignment or indicator questions, contact your Project Supervisor through your organization’s approved support channel.</p></div><Link to="/profile" className="font-semibold text-blue-700 hover:underline">View profile</Link></section>
    </div>
  );
}
