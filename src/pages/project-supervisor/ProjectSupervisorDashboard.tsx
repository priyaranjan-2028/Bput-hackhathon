import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  parameterSubmissions,
  evidenceRecords,
  projects,
  users,
  getParameterById,
  getUserById,
  formatDateTime
} from '../../data/mockData';
import { SubmissionStatus, UserRole, Evidence } from '../../types';
import { getBusinessUnitProjects } from '../../services/businessUnitService';
import { prepareDemoProjectData } from '../../services/demoProjectDataService';
import KPICard from '../../components/dashboard/KPICard';
import StatusBadge from '../../components/common/StatusBadge';
import { ScopeBarChart, EmissionsBreakdownChart } from '../../components/charts/ESGCharts';
import EvidenceDetailDrawer from '../../components/evidence/EvidenceDetailDrawer';
import {
  CheckCircle2,
  Clock,
  Layers,
  AlertTriangle,
  ArrowRight,
  Shield,
  Eye,
  FileCheck,
  Building2,
  Users,
  Check,
  X
} from 'lucide-react';

export default function ProjectSupervisorDashboard() {
  const { user } = useAuth();
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [demoMessage, setDemoMessage] = useState('');

  const projectList = getBusinessUnitProjects(user?.businessUnitId || 'BU001');
  const assignedProject = projectList.find(project => user?.assignedProjectIds?.includes(project.id)) || projectList[0] || projects[0];

  // Submissions for this project
  const projectSubmissions = parameterSubmissions.filter(s => s.projectId === assignedProject.id);

  const pendingCount = projectSubmissions.filter(s => s.status === SubmissionStatus.SUBMITTED).length;
  const verifiedCount = projectSubmissions.filter(s => s.status === SubmissionStatus.VERIFIED_LEVEL_1).length;
  const correctionCount = projectSubmissions.filter(s => s.status === SubmissionStatus.CORRECTION_REQUESTED).length;
  const consolidatedCount = projectSubmissions.filter(s => s.status === SubmissionStatus.CONSOLIDATED_PROJECT).length;

  const totalCalculatedCO2e = projectSubmissions.reduce((acc, curr) => acc + (curr.calculatedCO2e || 0), 0);

  // Field users under this supervisor
  const projectSiteUsers = users.filter(
    u => u.role === UserRole.PROJECT_USER && u.projectId === assignedProject.id
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-esg-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Shield size={14} />
              <span>Project Supervisory & Level-1 Verification Cell</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {assignedProject.name}
            </h1>
            <p className="text-navy-200 text-xs sm:text-sm mt-1">
              Location: {assignedProject.location} &bull; Code: <span className="font-mono text-white">{assignedProject.code}</span> &bull; Budget: ₹{assignedProject.budget} Cr
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/project-supervisor/review"
              className="btn-primary flex items-center gap-2 bg-esg-500 hover:bg-esg-600 text-white text-xs font-semibold py-2.5 px-4 shadow-sm"
            >
              <CheckCircle2 size={16} /> Review Submissions ({pendingCount})
            </Link>
            <Link
              to="/project-supervisor/consolidation"
              className="btn-secondary flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-semibold py-2.5 px-4"
            >
              <Layers size={16} /> Project Consolidation
            </Link>
          </div>
        </div>
      </div>

      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:flex-row sm:items-center">
        <div><p className="font-bold text-blue-950">Judge demo workflow</p><p className="mt-1 text-xs text-blue-800">Generate Project User records for Scopes 1–3 and Section C with sample PDF evidence. Review and verify each parameter before consolidating.</p>{demoMessage&&<p role="status" className="mt-2 text-xs font-semibold text-emerald-800">{demoMessage}</p>}</div>
        <button type="button" onClick={()=>{try{const result=prepareDemoProjectData(assignedProject.id);setDemoMessage(`Ready: ${result.users} Project Users, ${result.submissions} submissions and ${result.files} evidence files. Open Submission Review and verify each parameter.`);}catch(error){setDemoMessage(error instanceof Error?error.message:'Could not prepare the demo records.');}}} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-blue-800"><CheckCircle2 size={16}/> Prepare demo data</button>
      </section>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Pending Verification"
          value={pendingCount.toString()}
          subtitle="Awaiting Level-1 supervisor sign-off"
          icon={<Clock size={20} />}
          badgeText={pendingCount > 0 ? "Action Required" : "Up to Date"}
          badgeColor={pendingCount > 0 ? "warning" : "success"}
        />
        <KPICard
          title="Verified (Level 1)"
          value={verifiedCount.toString()}
          subtitle="Audit approved and factor certified"
          icon={<CheckCircle2 size={20} />}
          badgeText="Certified"
          badgeColor="success"
        />
        <KPICard
          title="Corrections Issued"
          value={correctionCount.toString()}
          subtitle="Returned to site officers"
          icon={<AlertTriangle size={20} />}
          badgeText="Pending Field Fix"
          badgeColor="danger"
        />
        <KPICard
          title="Consolidated Batches"
          value={consolidatedCount.toString()}
          subtitle="Pushed to BU roll-up"
          icon={<Layers size={20} />}
          badgeText="BU Ready"
          badgeColor="info"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-navy-900">Project Emissions by Category</h2>
              <p className="text-xs text-navy-400">GHG emissions split across operational site sources (tCO₂e)</p>
            </div>
            <span className="text-xs font-semibold text-esg-700 bg-esg-50 px-2.5 py-1 rounded-full border border-esg-200">
              Verified & In-Review
            </span>
          </div>
          <ScopeBarChart
            data={[
              { name: 'Diesel / DG', value: 245 },
              { name: 'Grid Elect.', value: 180 },
              { name: 'Heavy Fleet', value: 95 },
              { name: 'Rebar Steel', value: 65 },
              { name: 'Cement Mix', value: 30 }
            ]}
            height={260}
          />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-navy-900 mb-1">GHG Protocol Scope Ratio</h2>
            <p className="text-xs text-navy-400 mb-4">Site carbon footprint distribution</p>
            <EmissionsBreakdownChart
              scope1={340}
              scope2={180}
              scope3={95}
              height={190}
            />
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-navy-500 font-medium">Consolidated Footprint:</span>
            <span className="font-bold text-navy-900 text-sm">615.00 tCO₂e</span>
          </div>
        </div>
      </div>

      {/* Verification Queue Preview & Team Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-navy-900">Pending Level-1 Verification Items</h2>
              <p className="text-xs text-navy-400">Submissions awaiting evidentiary inspection and certification</p>
            </div>
            <Link
              to="/project-supervisor/review"
              className="text-xs font-semibold text-esg-600 hover:text-esg-700 inline-flex items-center gap-1"
            >
              Open Full Review <ArrowRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-navy-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Parameter</th>
                  <th className="py-3 px-4">Reported Qty</th>
                  <th className="py-3 px-4">CO₂e</th>
                  <th className="py-3 px-4">Submitted By</th>
                  <th className="py-3 px-4">Evidence</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projectSubmissions.slice(0, 5).map(sub => {
                  const param = getParameterById(sub.parameterId);
                  const submissionId = sub.id ?? sub.submissionId;
                  const submitter = getUserById(sub.submittedBy ?? sub.userId ?? '');
                  const ev = evidenceRecords.find(e => e.submissionId === submissionId);

                  return (
                    <tr key={submissionId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-navy-900">
                        {param ? param.name : sub.parameterId}
                      </td>
                      <td className="py-3 px-4 text-navy-700">
                        {(sub.value ?? sub.activityData)?.toLocaleString() ?? '—'} {param?.unit}
                      </td>
                      <td className="py-3 px-4 font-bold text-navy-900">
                        {sub.calculatedCO2e ? `${sub.calculatedCO2e.toFixed(2)} t` : '—'}
                      </td>
                      <td className="py-3 px-4 text-navy-500">
                        {submitter?.name || 'Field Officer'}
                      </td>
                      <td className="py-3 px-4">
                        {ev ? (
                          <button
                            onClick={() => setSelectedEvidence(ev)}
                            className="text-esg-600 hover:text-esg-800 font-semibold underline text-[11px] inline-flex items-center gap-1"
                          >
                            <Eye size={12} /> Inspect
                          </button>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to="/project-supervisor/review"
                          className="btn-secondary btn-sm inline-flex items-center gap-1 text-[11px] py-1 px-2.5"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Site Users & Consolidation Status */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-navy-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users size={18} className="text-esg-600" /> Site Field Officers
              </span>
              <Link to="/project-supervisor/users" className="text-xs text-esg-600 hover:text-esg-700 font-medium">
                Manage
              </Link>
            </h3>

            <div className="space-y-3">
              {projectSiteUsers.map(u => (
                <div key={u.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-navy-800 text-white text-xs font-bold flex items-center justify-center">
                      {u.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-navy-900">{u.name}</div>
                      <div className="text-[10px] text-navy-400">{u.email}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-navy-900 text-white p-6 rounded-2xl shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-esg-300">Level-1 Consolidation Status</h3>
            <p className="text-xs text-navy-200 leading-relaxed">
              Consolidation groups all verified submissions into a sealed Project Block for BU roll-up.
              {pendingCount > 0 ? (
                <span className="text-amber-300 block mt-1 font-semibold">
                  Note: {pendingCount} submissions still require verification before consolidation can be sealed.
                </span>
              ) : (
                <span className="text-emerald-300 block mt-1 font-semibold">
                  All submissions verified. Project block ready to seal!
                </span>
              )}
            </p>
            <Link
              to="/project-supervisor/consolidation"
              className="btn-primary btn-sm inline-flex items-center gap-2 mt-2 w-full justify-center text-xs"
            >
              Go to Consolidation Center <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {selectedEvidence && (
        <EvidenceDetailDrawer
          evidence={selectedEvidence}
          onClose={() => setSelectedEvidence(null)}
        />
      )}
    </div>
  );
}
