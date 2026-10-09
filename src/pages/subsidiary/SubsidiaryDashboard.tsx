import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projects, consolidationRecords } from '../../data/mockData';
import { readStoredValue } from '../../services/localStorageService';
import { getCurrentSubsidiary, getSubsidiaryBusinessUnits, getSubsidiarySupervisors } from '../../services/subsidiaryService';
import { ConsolidationRecord } from '../../types';
import KPICard from '../../components/dashboard/KPICard';
import { ScopeBarChart, EmissionsBreakdownChart } from '../../components/charts/ESGCharts';
import {
  Building2,
  Layers,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Award
} from 'lucide-react';

export default function SubsidiaryDashboard() {
  const { user } = useAuth();
  const sub = getCurrentSubsidiary(user);
  const subBUs = getSubsidiaryBusinessUnits(sub.id);
  const subSupervisors = getSubsidiarySupervisors(sub.id);
  const incoming = readStoredValue<ConsolidationRecord[]>('meil_subsidiary_incoming_batches', []);
  const buConsolidations = [...incoming, ...consolidationRecords.filter(r => r.level === 'BUSINESS_UNIT')]
    .filter((record, index, all) => all.findIndex(item => item.id === record.id) === index)
    .filter(record => record.parentEntityId === sub.id && subBUs.some(unit => unit.id === record.entityId));
  const pendingBUReviews = buConsolidations.filter(record => record.status === 'FORWARDED').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-esg-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Building2 size={14} />
              <span>Subsidiary Corporate ESG Command & Level-3 Review</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {sub.name}
            </h1>
            <p className="text-navy-200 text-xs sm:text-sm mt-1">
              Legal Code: <span className="font-mono text-white">{sub.code}</span> &bull; Sector: {sub.sector} &bull; Turnover: ₹{sub.turnover} Cr
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/subsidiary/review"
              className="btn-primary flex items-center gap-2 bg-esg-500 hover:bg-esg-600 text-white text-xs font-semibold py-2.5 px-4 shadow-sm"
            >
              <CheckCircle2 size={16} /> Review BU Blocks ({pendingBUReviews})
            </Link>
            <Link
              to="/subsidiary/consolidation"
              className="btn-secondary flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-semibold py-2.5 px-4"
            >
              <Layers size={16} /> Subsidiary Consolidation
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Business Units"
          value={subBUs.length.toString()}
          subtitle="Operating enterprise divisions"
          icon={<Building2 size={20} />}
          badgeText="Active"
          badgeColor="info"
        />
        <KPICard
          title="Pending Level-3 Review"
          value={pendingBUReviews.toString()}
          subtitle="BU roll-ups awaiting sign-off"
          icon={<Clock size={20} />}
          badgeText={pendingBUReviews > 0 ? "Review Ready" : "Clear"}
          badgeColor={pendingBUReviews > 0 ? "warning" : "success"}
        />
        <KPICard
          title="Emissions Intensity"
          value="0.32 t/₹Cr"
          subtitle="tCO₂e per Cr revenue"
          icon={<TrendingUp size={20} />}
          badgeText="ESG Benchmark"
          badgeColor="success"
        />
        <KPICard
          title="Consolidated Footprint"
          value="4,820 t"
          subtitle="Total Scope 1+2+3"
          icon={<Layers size={20} />}
          badgeText="Verified"
          badgeColor="info"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-navy-900">Emissions by Business Division</h2>
              <p className="text-xs text-navy-400">Total footprint split across operating units (tCO₂e)</p>
            </div>
            <span className="text-xs font-semibold text-esg-700 bg-esg-50 px-2.5 py-1 rounded-full border border-esg-200">
              FY 2025-26
            </span>
          </div>
          <ScopeBarChart
            data={[
              { name: 'Hydrocarbon & Civil', value: 2005 },
              { name: 'Water & Irrigation', value: 1420 },
              { name: 'Power & Transmission', value: 980 },
              { name: 'Transportation Infra', value: 415 }
            ]}
            height={260}
          />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-navy-900 mb-1">Subsidiary Scope Ratios</h2>
            <p className="text-xs text-navy-400 mb-4">Corporate emission split</p>
            <EmissionsBreakdownChart
              scope1={2650}
              scope2={1350}
              scope3={820}
              height={190}
            />
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-navy-500 font-medium">Corporate Total:</span>
            <span className="font-bold text-navy-900 text-sm">4,820.00 tCO₂e</span>
          </div>
        </div>
      </div>

      {/* Business Units Listing */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-navy-900">Operating Business Units</h2>
            <p className="text-xs text-navy-400">Roll-up progress across divisions</p>
          </div>
          <Link
            to="/subsidiary/business-units"
            className="text-xs font-semibold text-esg-600 hover:text-esg-700 inline-flex items-center gap-1"
          >
            All Divisions <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-navy-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Business Unit</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Head / Supervisor</th>
                <th className="py-3 px-4">Total Projects</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subBUs.map(b => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-navy-900">{b.name}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-navy-700">{b.code}</td>
                  <td className="py-3.5 px-4 text-navy-800">{subSupervisors.find(person => person.id === b.supervisorId || person.assignedBUIds?.includes(b.id))?.name ?? 'Not assigned'}</td>
                  <td className="py-3.5 px-4 font-medium text-navy-700">{projects.filter(project => project.businessUnitId === b.id).length} Projects</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {buConsolidations.find(record => record.entityId === b.id)?.status ?? 'Awaiting submission'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to="/subsidiary/review"
                      className="btn-secondary btn-sm inline-flex items-center gap-1 text-[11px] py-1 px-3"
                    >
                      Audit Roll-Up
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
