import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  consolidationRecords,
  parameterSubmissions,
  formatDateTime
} from '../../data/mockData';
import { getBusinessUnitProjects, getBusinessUnitSupervisors, getCurrentBusinessUnit } from '../../services/businessUnitService';
import KPICard from '../../components/dashboard/KPICard';
import { ScopeBarChart, EmissionsBreakdownChart } from '../../components/charts/ESGCharts';
import {
  Building2,
  FolderKanban,
  Users,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Eye,
  Check,
  X
} from 'lucide-react';

export default function BUDashboard() {
  const { user } = useAuth();
  const currentBU = getCurrentBusinessUnit(user);

  const buProjects = getBusinessUnitProjects(currentBU.id);
  const buSupervisors = getBusinessUnitSupervisors(currentBU.id);

  // Consolidation records for this BU's projects
  const projectConsolidations = consolidationRecords.filter(r => r.level === 'PROJECT' && buProjects.some(project => project.id === r.entityId));
  const pendingReviewCount = projectConsolidations.filter(r => r.status === 'SEALED').length;

  const totalCO2e = buProjects.reduce((acc, p) => {
    const pSubs = parameterSubmissions.filter(s => s.projectId === p.id);
    return acc + pSubs.reduce((sum, s) => sum + (s.calculatedCO2e || 0), 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-esg-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Building2 size={14} />
              <span>Business Unit Oversight & Level-2 Review</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {currentBU.name}
            </h1>
            <p className="text-navy-200 text-xs sm:text-sm mt-1">
              BU Code: <span className="font-mono text-white">{currentBU.code}</span> &bull; Subsidiary: MEIL Infrastructure Ltd. &bull; Active Sites: {buProjects.length} Projects
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/business-unit/review"
              className="btn-primary flex items-center gap-2 bg-esg-500 hover:bg-esg-600 text-white text-xs font-semibold py-2.5 px-4 shadow-sm"
            >
              <CheckCircle2 size={16} /> Review Project Batches ({pendingReviewCount})
            </Link>
            <Link
              to="/business-unit/consolidation"
              className="btn-secondary flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-semibold py-2.5 px-4"
            >
              <Layers size={16} /> BU Consolidation
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Active Projects"
          value={buProjects.length.toString()}
          subtitle="Heavy infrastructure sites"
          icon={<FolderKanban size={20} />}
          badgeText="Operational"
          badgeColor="info"
        />
        <KPICard
          title="Project Supervisors"
          value={buSupervisors.length.toString()}
          subtitle="Directing site ESG compliance"
          icon={<Users size={20} />}
          badgeText="Assigned"
          badgeColor="success"
        />
        <KPICard
          title="Pending Level-2 Review"
          value={pendingReviewCount.toString()}
          subtitle="Project batches awaiting sign-off"
          icon={<Clock size={20} />}
          badgeText={pendingReviewCount > 0 ? "Review Ready" : "Clear"}
          badgeColor={pendingReviewCount > 0 ? "warning" : "success"}
        />
        <KPICard
          title="Total BU Emissions"
          value={`${totalCO2e.toFixed(1)} t`}
          subtitle="Consolidated FY 2025-26"
          icon={<TrendingUp size={20} />}
          badgeText="Normalized"
          badgeColor="info"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-navy-900">Emissions by Infrastructure Project</h2>
              <p className="text-xs text-navy-400">Carbon footprints compared across sites within BU (tCO₂e)</p>
            </div>
            <span className="text-xs font-semibold text-esg-700 bg-esg-50 px-2.5 py-1 rounded-full border border-esg-200">
              BU001 Division
            </span>
          </div>
          <ScopeBarChart
            data={[
              { name: 'Polavaram Dam', value: 615 },
              { name: 'Zojila Tunnel', value: 480 },
              { name: 'Western Dedicated Freight', value: 390 },
              { name: 'Kaleshwaram Lift', value: 520 }
            ]}
            height={260}
          />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-navy-900 mb-1">BU GHG Scope Breakdown</h2>
            <p className="text-xs text-navy-400 mb-4">Proportion across all sites in division</p>
            <EmissionsBreakdownChart
              scope1={1150}
              scope2={540}
              scope3={315}
              height={190}
            />
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-navy-500 font-medium">Division Total:</span>
            <span className="font-bold text-navy-900 text-sm">2,005.00 tCO₂e</span>
          </div>
        </div>
      </div>

      {/* Projects Table & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-navy-900">Projects in this Division</h2>
              <p className="text-xs text-navy-400">Reporting status and supervisors</p>
            </div>
            <Link
              to="/business-unit/projects"
              className="text-xs font-semibold text-esg-600 hover:text-esg-700 inline-flex items-center gap-1"
            >
              All Projects <ArrowRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-navy-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Project Name</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Supervisor</th>
                  <th className="py-3 px-4">Budget</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {buProjects.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-navy-900">{p.name}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-navy-700">{p.code}</td>
                    <td className="py-3.5 px-4 text-navy-600">{p.location}</td>
                    <td className="py-3.5 px-4 text-navy-800 font-medium">Priya Sharma</td>
                    <td className="py-3.5 px-4 text-navy-600">₹{p.budget} Cr</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Reporting Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Level-2 Consolidation Callout */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
              <ShieldCheck size={18} className="text-esg-600" /> Level-2 Verification Checklist
            </h3>
            <div className="space-y-3 text-xs text-navy-600">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-semibold text-navy-800 block">Variance Analysis</span>
                <span className="text-navy-500 text-[11px]">Cross-check diesel per kilometer or cement volume against prior month benchmarks.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-semibold text-navy-800 block">Multi-Site Consistency</span>
                <span className="text-navy-500 text-[11px]">Verify that high-density projects have supplied complete evidentiary vouchers.</span>
              </div>
            </div>
          </div>

          <div className="bg-navy-900 text-white p-6 rounded-2xl shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-esg-300">Ready to Seal Division Roll-Up?</h3>
            <p className="text-xs text-navy-200 leading-relaxed">
              Once project batches are approved, consolidate the Hydrocarbon & Heavy Civil block for Subsidiary sign-off.
            </p>
            <Link
              to="/business-unit/consolidation"
              className="btn-primary btn-sm inline-flex items-center gap-2 mt-2 w-full justify-center text-xs"
            >
              BU Consolidation Center <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
