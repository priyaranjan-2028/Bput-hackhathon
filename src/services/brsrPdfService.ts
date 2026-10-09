import { ConsolidationRecord, Scope, SubmissionStatus, BRSRReport, ESGParameter } from '../types';
import { MEIL_ORG, esgParameters, subsidiaries as seedSubsidiaries } from '../data/mockData';
import { ProjectUserSubmission } from '../types/projectUser';
import { getAdminConsolidationRecords } from './adminDemoDataService';
import { MEIL_STORAGE_KEYS, readStoredValue, writeStoredValue } from './localStorageService';

export interface BRSRIndicatorRow { principle: string; indicator: string; value: string; unit: string; status: string; evidence: string; }
export interface FullBRSRReport extends BRSRReport {
  company: Record<string, string>;
  sectionB: Array<{ disclosure: string; response: string }>;
  essentialIndicators: BRSRIndicatorRow[];
  leadershipIndicators: BRSRIndicatorRow[];
  subsidiaries: ConsolidationRecord[];
  consolidationId: string;
}

const periodOf = (submission: ProjectUserSubmission) => submission.reportingPeriod;
const isVerified = (submission: ProjectUserSubmission) => submission.status === SubmissionStatus.VERIFIED_LEVEL_3;
const formatted = (value: number) => value.toLocaleString('en-IN', { maximumFractionDigits: 4 });

export function buildFullBRSRReport(reportingYear: string): FullBRSRReport {
  const records = getAdminConsolidationRecords();
  const master = records.find(record => record.level === 'MEIL' && record.status === SubmissionStatus.SEALED && record.reportingPeriod === reportingYear);
  if (!master) throw new Error(`Seal the MEIL group consolidation for ${reportingYear} before generating the BRSR report.`);
  const subsidiaries = records.filter(record => record.level === 'SUBSIDIARY' && record.status === SubmissionStatus.VERIFIED_LEVEL_3 && record.reportingPeriod === reportingYear);
  const storedSubsidiaries = readStoredValue<typeof seedSubsidiaries>('meil_subsidiaries', []);
  const allSubsidiaries = [...seedSubsidiaries, ...storedSubsidiaries].filter((item, index, all) => all.findIndex(other => other.id === item.id) === index);
  const submissions = readStoredValue<ProjectUserSubmission[]>(MEIL_STORAGE_KEYS.submissions, []).filter(item => periodOf(item) === reportingYear && isVerified(item));
  const parameters = readStoredValue<ESGParameter[]>('meil_parameters', esgParameters);
  const byId = new Map(parameters.map(parameter => [parameter.parameterId || parameter.id || parameter.code, parameter]));
  const evidence = readStoredValue<Array<{ evidenceId: string; originalFilename: string; submissionId?: string }>>(MEIL_STORAGE_KEYS.evidence, []);
  const rowsFor = (scope: Scope) => submissions.filter(item => item.scope === scope);
  const emissionTotal = (scope: Scope) => rowsFor(scope).reduce((sum, item) => sum + (item.calculation?.convertedTonnesCO2e || 0), 0);
  const buildRows = (scopes: Scope[]): BRSRIndicatorRow[] => {
    const rows: BRSRIndicatorRow[] = [];
    for (const scope of scopes) {
      const scoped = rowsFor(scope);
      for (const parameter of parameters.filter(item => item.scope === scope)) {
        const parameterId = parameter.parameterId || parameter.id || parameter.code;
        const entries = scoped.filter(item => item.parameterId === parameterId);
        const sum = entries.reduce((total, item) => total + item.activityValue, 0);
        const fileNames = entries.flatMap(entry => evidence.filter(file => file.submissionId === entry.submissionId).map(file => file.originalFilename));
        rows.push({ principle: parameter.category.match(/Principle\s*\d+/i)?.[0] || 'Principle 6', indicator: parameter.name, value: entries.length ? formatted(sum) : 'Not provided', unit: parameter.unit, status: entries.length ? 'Verified consolidated data' : 'Not provided', evidence: fileNames.length ? fileNames.join('; ') : entries.length ? 'Evidence not linked' : '—' });
      }
    }
    return rows;
  };
  const scope1Rows = buildRows([Scope.SCOPE_1]);
  const scope2Rows = buildRows([Scope.SCOPE_2]);
  const scope3Rows = buildRows([Scope.SCOPE_3]);
  const additionalRows = buildRows([Scope.SECTION_C, Scope.OTHER_ENVIRONMENTAL]);
  const essentialIndicators = [
    { principle: 'Principle 6', indicator: 'Total Scope 1 GHG emissions', value: formatted(master.scope1Total), unit: 'tCO2e', status: 'Level 3 verified; group sealed', evidence: `Consolidation ${master.id}` },
    { principle: 'Principle 6', indicator: 'Total Scope 2 GHG emissions', value: formatted(master.scope2Total), unit: 'tCO2e', status: 'Level 3 verified; group sealed', evidence: `Consolidation ${master.id}` },
    ...scope1Rows, ...scope2Rows,
  ];
  const leadershipIndicators = [
    { principle: 'Principle 6', indicator: 'Total Scope 3 GHG emissions', value: formatted(master.scope3Total), unit: 'tCO2e', status: 'Level 3 verified; group sealed', evidence: `Consolidation ${master.id}` },
    ...scope3Rows, ...additionalRows,
  ];
  const company = {
    'Entity name': MEIL_ORG.name,
    'Corporate identification number (CIN)': readStoredValue<string>('meil_company_cin', 'Not provided'),
    'Registered office': readStoredValue<string>('meil_registered_office', 'Not provided'),
    'Reporting year': reportingYear,
    'Reporting boundary': `MEIL parent and ${allSubsidiaries.length} subsidiaries; ${subsidiaries.length} subsidiaries with verified data included in this consolidation`,
    'Reporting currency': readStoredValue<string>('meil_reporting_currency', 'INR (company confirmation required)'),
    'Contact details for BRSR': readStoredValue<string>('meil_brsr_contact', 'Not provided'),
    'Principal business activities': readStoredValue<string>('meil_principal_activities', 'Not provided'),
  };
  const sectionB = [
    'Policy coverage for the nine NGRBC principles', 'Board / committee oversight of sustainability matters',
    'Processes for stakeholder engagement and materiality', 'Mechanisms for grievance redressal and remediation',
    'Review frequency, accountability and evaluation of policies', 'Risk identification, assessment and mitigation',
    'External assessment / assurance details',
  ].map(disclosure => ({ disclosure, response: 'Not provided in the reporting workspace' }));
  const saved = readStoredValue<BRSRReport[]>('meil_brsr_reports', []);
  const report: FullBRSRReport = {
    id: `BRSR-${reportingYear.replace(/[^0-9]/g, '')}-${Date.now()}`, reportingYear, asOfDate: new Date().toISOString().slice(0, 10),
    generatedBy: 'USR-ADMIN', generatedAt: new Date().toISOString(), status: 'GENERATED', scope1Total: master.scope1Total,
    scope2Total: master.scope2Total, scope3Total: master.scope3Total, totalCO2e: master.totalCO2e,
    subsidiaryBreakdown: subsidiaries, subsidiaries, company, sectionB, essentialIndicators, leadershipIndicators,
    consolidationId: master.id, methodology: `Generated from sealed MEIL batch ${master.id}. Only verified Level 3 submissions for ${reportingYear} are included.`,
  };
  writeStoredValue('meil_brsr_reports', [...saved, report]);
  return report;
}

type PdfLine = { text: string; size?: number; bold?: boolean; color?: [number, number, number] };
const safeAscii = (text: string) => text.normalize('NFKD').replace(/[^\x20-\x7E]/g, '').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

function wrap(text: string, maxChars = 92): string[] {
  const words = text.split(/\s+/); const lines: string[] = []; let line = '';
  for (const word of words) { if (line && `${line} ${word}`.length > maxChars) { lines.push(line); line = word; } else line = line ? `${line} ${word}` : word; }
  if (line) lines.push(line); return lines.length ? lines : [''];
}

export function createBRSRPdf(report: FullBRSRReport): string {
  const lines: PdfLine[] = [];
  const cover = (title: string) => lines.push({ text: title, size: 18, bold: true, color: [0.04, 0.18, 0.29] });
  const heading = (title: string) => lines.push({ text: title, size: 13, bold: true, color: [0.02, 0.36, 0.35] });
  const paragraph = (text: string) => wrap(text).forEach(line => lines.push({ text: line, size: 9 }));
  cover('BUSINESS RESPONSIBILITY & SUSTAINABILITY REPORT');
  lines.push({ text: 'SEBI BRSR | Consolidated reporting draft', size: 11, bold: true });
  paragraph(`${report.company['Entity name']} | ${report.reportingYear} | Generated ${report.generatedAt}`);
  paragraph(`Consolidation reference: ${report.consolidationId}`);
  paragraph('This report includes available verified information from the MEIL reporting workspace. Items marked Not provided require company input and must be completed and reviewed before statutory filing. This generated document is a draft, not an assurance opinion.');
  heading('REPORT CONTENTS');
  paragraph('Section A - General Disclosures'); paragraph('Section B - Management and Process Disclosures'); paragraph('Section C - Principle-wise Performance Disclosures: Essential and Leadership indicators');

  heading('SECTION A - GENERAL DISCLOSURES');
  Object.entries(report.company).forEach(([key, value]) => paragraph(`${key}: ${value}`));
  paragraph(`Consolidated GHG emissions: Scope 1 ${formatted(report.scope1Total)} tCO2e; Scope 2 ${formatted(report.scope2Total)} tCO2e; Scope 3 ${formatted(report.scope3Total)} tCO2e; total ${formatted(report.totalCO2e)} tCO2e.`);
  heading('Subsidiary reporting boundary');
  if (report.subsidiaries.length) report.subsidiaries.forEach(item => paragraph(`${item.entityName}: Scope 1 ${formatted(item.scope1Total)}, Scope 2 ${formatted(item.scope2Total)}, Scope 3 ${formatted(item.scope3Total)}, total ${formatted(item.totalCO2e)} tCO2e; ${item.submissionCount || 0} verified parameter submissions.`));
  else paragraph('No verified subsidiary-level detail was available for this period.');

  heading('SECTION B - MANAGEMENT AND PROCESS DISCLOSURES');
  paragraph('The responses below are not configured in the current workspace and require confirmation by the reporting company.');
  report.sectionB.forEach(item => paragraph(`${item.disclosure}: ${item.response}`));

  heading('SECTION C - PRINCIPLE-WISE PERFORMANCE DISCLOSURES');
  paragraph('The workspace currently collects operational indicators listed below. Indicator classification follows this application workflow: Scope 1 and Scope 2 are shown under Essential Indicators; Scope 3 and additional Section C metrics are shown under Leadership Indicators. Complete the applicable SEBI indicator responses for all nine principles before filing.');
  const principleNames = [
    'Principle 1 - Ethical, transparent and accountable conduct', 'Principle 2 - Sustainable and safe goods and services',
    'Principle 3 - Employee well-being', 'Principle 4 - Stakeholder responsiveness', 'Principle 5 - Human rights',
    'Principle 6 - Protecting and restoring the environment', 'Principle 7 - Responsible public and regulatory policy',
    'Principle 8 - Inclusive growth and equitable development', 'Principle 9 - Consumer value',
  ];
  for (const principle of principleNames) {
    heading(principle);
    const number = principle.match(/Principle (\d+)/)?.[1] || '';
    const essential = report.essentialIndicators.filter(row => row.principle.includes(number));
    const leadership = report.leadershipIndicators.filter(row => row.principle.includes(number));
    lines.push({ text: 'Essential Indicators', size: 10, bold: true });
    if (essential.length) essential.forEach(row => paragraph(`${row.indicator}: ${row.value} ${row.unit}; ${row.status}; Evidence: ${row.evidence}`));
    else paragraph('No principle-specific essential indicator data configured; response not provided.');
    lines.push({ text: 'Leadership Indicators', size: 10, bold: true });
    if (leadership.length) leadership.forEach(row => paragraph(`${row.indicator}: ${row.value} ${row.unit}; ${row.status}; Evidence: ${row.evidence}`));
    else paragraph('No principle-specific leadership indicator data configured; response not provided.');
  }
  heading('METHODOLOGY AND COMPLETION NOTE');
  paragraph(report.methodology);
  paragraph('Values are aggregated from verified Level 3 records in the sealed consolidation. Uncollected statutory disclosures are explicitly identified as Not provided; no values have been inferred. Confirm units, boundaries, prior-year comparatives, policy disclosures and assurance requirements with the company reporting team.');

  const pages: PdfLine[][] = []; let page: PdfLine[] = []; let used = 0;
  for (const item of lines) { const height = item.size && item.size >= 13 ? 28 : 16; if (used + height > 700) { pages.push(page); page = []; used = 0; } page.push(item); used += height; }
  if (page.length) pages.push(page);
  const objects: string[] = [];
  const add = (value: string) => { objects.push(value); return objects.length; };
  const catalogId = add(''); const pagesId = add('');
  const regularFontId = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const boldFontId = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  const pageIds: number[] = [];
  pages.forEach((pageLines, pageIndex) => {
    let y = 790; const commands: string[] = ['0.12 w'];
    commands.push('0.04 0.18 0.29 rg 40 812 515 1 re f');
    pageLines.forEach(item => {
      const size = item.size || 9; const color = item.color || [0.12, 0.16, 0.2];
      y -= size >= 18 ? 30 : size >= 13 ? 24 : size >= 10 ? 18 : 14;
      commands.push(`${color[0]} ${color[1]} ${color[2]} rg BT /${item.bold ? 'F2' : 'F1'} ${size} Tf 42 ${y} Td (${safeAscii(item.text)}) Tj ET`);
    });
    commands.push(`0.4 0.4 0.4 rg BT /F1 8 Tf 42 28 Td (${safeAscii(`${report.id} | ${report.reportingYear} | Page ${pageIndex + 1} of ${pages.length}`)}) Tj ET`);
    const stream = commands.join('\n');
    const contentId = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    const pageId = add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${regularFontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    pageIds.push(pageId);
  });
  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
  let pdf = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xrefOffset = pdf.length; pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach(offset => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}

export function downloadBRSRPdf(report: FullBRSRReport) {
  const blob = new Blob([createBRSRPdf(report)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
  anchor.href = url; anchor.download = `${report.id}.pdf`; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
