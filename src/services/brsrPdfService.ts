import { ConsolidationRecord, Scope, SubmissionStatus, BRSRReport, ESGParameter } from '../types';
import { MEIL_ORG, esgParameters, subsidiaries as seedSubsidiaries } from '../data/mockData';
import { ProjectUserSubmission } from '../types/projectUser';
import { getAdminConsolidationRecords } from './adminDemoDataService';
import { MEIL_STORAGE_KEYS, readStoredValue, writeStoredValue } from './localStorageService';
import type { PDFFont, PDFPage } from 'pdf-lib';

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

const clean = (value: string) => value.normalize('NFKD').replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, ' ').trim();

export async function createBRSRPdf(report: FullBRSRReport): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const templateUrl = `${import.meta.env.BASE_URL}documents/MEIL_BRSR_FY2025-26_Comprehensive_Draft.pdf`;
  const response = await fetch(templateUrl);
  if (!response.ok) throw new Error('The MEIL BRSR template could not be loaded.');
  const document = await PDFDocument.load(await response.arrayBuffer());
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const pages: PDFPage[] = [];
  let page: PDFPage;
  let y = 0;
  let pageNumber = 0;
  const margin = 48;
  const bodyWidth = 595 - margin * 2;
  const bodyColor = rgb(0.12, 0.17, 0.22);
  const teal = rgb(0.02, 0.38, 0.36);
  const navy = rgb(0.04, 0.15, 0.27);

  const nextPage = () => {
    page = document.addPage([595, 842]); pages.push(page); pageNumber += 1; y = 790;
    page.drawText('MEIL | ESG / BRSR REPORTING', { x: margin, y: 816, size: 8, font: bold, color: teal });
    page.drawLine({ start: { x: margin, y: 806 }, end: { x: 595 - margin, y: 806 }, thickness: 0.8, color: teal });
  };
  const ensureSpace = (height: number) => { if (!pages.length || y - height < 58) nextPage(); };
  const wrap = (text: string, size: number, font: PDFFont) => {
    const words = clean(text).split(' '); const result: string[] = []; let line = '';
    for (const word of words) { const candidate = line ? `${line} ${word}` : word; if (font.widthOfTextAtSize(candidate, size) > bodyWidth && line) { result.push(line); line = word; } else line = candidate; }
    if (line) result.push(line); return result.length ? result : [''];
  };
  const paragraph = (text: string, options: {size?:number; bold?:boolean; color?:typeof bodyColor; indent?:number} = {}) => {
    const size = options.size ?? 9; const font = options.bold ? bold : regular; const lines = wrap(text, size, font); const lineHeight = size + 4;
    ensureSpace(lines.length * lineHeight + 3);
    for (const line of lines) { page.drawText(line, { x: margin + (options.indent ?? 0), y: y - lineHeight, size, font, color: options.color ?? bodyColor, maxWidth: bodyWidth - (options.indent ?? 0) }); y -= lineHeight; }
    y -= 3;
  };
  const heading = (text: string, level: 1|2 = 1) => {
    const size = level === 1 ? 15 : 11; ensureSpace(size + 18); y -= 7;
    page.drawText(clean(text), { x: margin, y: y - size, size, font: bold, color: level === 1 ? navy : teal, maxWidth: bodyWidth });
    y -= size + 9;
    if (level === 1) { page.drawLine({ start: {x:margin,y}, end:{x:595-margin,y}, thickness:0.5,color:rgb(0.82,0.87,0.89)}); y -= 8; }
  };
  const keyValue = (key: string, value: string) => paragraph(`${key}: ${value}`, {size:9});
  const indicator = (row: BRSRIndicatorRow) => {
    paragraph(`${row.indicator} | ${row.value} ${row.unit} | ${row.status}`, {size:9,bold:true,indent:10});
    paragraph(`Evidence: ${row.evidence}`, {size:8,indent:20});
  };

  nextPage();
  heading('POPULATED DATA APPENDIX', 1);
  paragraph('This appendix is attached to the MEIL Comprehensive BRSR Draft template supplied for this reporting period. It brings in values available in the reporting workspace while preserving the source template pages.', {size:10});
  paragraph(`Entity: ${report.company['Entity name']} | Financial year: ${report.reportingYear} | Report ID: ${report.id}`);
  paragraph(`Sealed consolidation: ${report.consolidationId} | Generated: ${report.generatedAt}`);
  paragraph('Draft status: not a verified final company disclosure. The original template remains unchanged. Fields without saved company data remain marked as required in the source template; this appendix does not invent values or claim statutory completeness.', {size:9,bold:true,color:teal});

  heading('SECTION A - GENERAL DISCLOSURES');
  Object.entries(report.company).forEach(([key,value])=>keyValue(key,value));
  heading('Company consolidated GHG summary',2);
  keyValue('Scope 1 emissions',`${formatted(report.scope1Total)} tCO2e`);
  keyValue('Scope 2 emissions',`${formatted(report.scope2Total)} tCO2e`);
  keyValue('Scope 3 emissions',`${formatted(report.scope3Total)} tCO2e`);
  keyValue('Total Scope 1 + Scope 2 + Scope 3',`${formatted(report.totalCO2e)} tCO2e`);
  heading('Verified subsidiary breakdown',2);
  if(report.subsidiaries.length) report.subsidiaries.forEach(item=>paragraph(`${item.entityName} | Scope 1 ${formatted(item.scope1Total)} tCO2e | Scope 2 ${formatted(item.scope2Total)} tCO2e | Scope 3 ${formatted(item.scope3Total)} tCO2e | Total ${formatted(item.totalCO2e)} tCO2e | ${item.submissionCount||0} verified submissions`,{size:8}));
  else paragraph('No verified subsidiary data was available for this reporting period.');

  heading('SECTION B - MANAGEMENT AND PROCESS DISCLOSURES');
  paragraph('These disclosures were not captured in the reporting workspace at generation time. Enter approved company responses in the source template before filing.');
  report.sectionB.forEach(item=>keyValue(item.disclosure,item.response));

  heading('SECTION C - PRINCIPLE-WISE PERFORMANCE DISCLOSURES');
  paragraph('The available operational metrics are classified for this application workflow: Scope 1 and Scope 2 under Essential Indicators; Scope 3 and additional Section C data under Leadership Indicators. Confirm indicator mapping and applicability against the current SEBI format before filing.');
  for(let principle=1;principle<=9;principle++) {
    heading(`PRINCIPLE ${principle}`,2);
    const essential=report.essentialIndicators.filter(row=>row.principle.toLowerCase().includes(`principle ${principle}`));
    const leadership=report.leadershipIndicators.filter(row=>row.principle.toLowerCase().includes(`principle ${principle}`));
    paragraph('Essential Indicators',{size:9,bold:true,color:teal,indent:5});
    if(essential.length) essential.forEach(indicator); else paragraph('Data required - no saved response for this principle.',{size:8,indent:10});
    paragraph('Leadership Indicators',{size:9,bold:true,color:teal,indent:5});
    if(leadership.length) leadership.forEach(indicator); else paragraph('Data required - no saved response for this principle.',{size:8,indent:10});
  }
  heading('Data provenance and completion notes');
  paragraph(report.methodology);
  paragraph('Source evidence filenames and verification state are included with the relevant indicators above. Missing prior-year figures, management narratives, legal applicability, assurance details, and other company disclosures remain incomplete until supplied and approved by MEIL.');

  pages.forEach((pdfPage,index)=>pdfPage.drawText(`${report.id} | FY ${report.reportingYear} | Data appendix page ${index+1} of ${pages.length}`,{x:margin,y:28,size:7,font:regular,color:rgb(0.4,0.45,0.48)}));
  return document.save();
}

export async function downloadBRSRPdf(report: FullBRSRReport) {
  const bytes = await createBRSRPdf(report);
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
  anchor.href = url; anchor.download = `${report.id}.pdf`; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
