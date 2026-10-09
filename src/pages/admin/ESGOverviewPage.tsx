import React from 'react';
import { Leaf, Users, Shield, TrendingDown, Droplets, Zap, Award, CheckCircle2 } from 'lucide-react';
import KPICard from '../../components/dashboard/KPICard';
import { EmissionsBreakdownChart, TrendLineChart } from '../../components/charts/ESGCharts';

export default function ESGOverviewPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">MEIL Group ESG Performance Overview</h1>
        <p className="text-sm text-navy-500 mt-1">
          Consolidated performance metrics across Environmental, Social, and Governance pillars under SEBI BRSR guidelines
        </p>
      </div>

      {/* 3 Pillars Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Environmental */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-esg-100 text-esg-700 flex items-center justify-center font-bold">
              <Leaf size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-900">Environmental (E)</h3>
              <p className="text-xs text-navy-400">GHG, Energy, Water & Waste</p>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-navy-500">Gross GHG Emissions:</span>
              <span className="font-bold text-navy-900">24,850.5 tCO₂e</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-navy-500">Renewable Energy Share:</span>
              <span className="font-bold text-esg-700">32.4%</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-navy-500">Water Recycled:</span>
              <span className="font-bold text-navy-900">68,400 kL (48%)</span>
            </div>
          </div>
        </div>

        {/* Social */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-900">Social (S)</h3>
              <p className="text-xs text-navy-400">Workforce, Safety & CSR</p>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-navy-500">LTIFR (Lost Time Injury):</span>
              <span className="font-bold text-navy-900">0.08 / million hrs</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-navy-500">Total Workforce:</span>
              <span className="font-bold text-navy-900">42,500 Personnel</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-navy-500">CSR Spend:</span>
              <span className="font-bold text-esg-700">₹84.6 Cr (102% of target)</span>
            </div>
          </div>
        </div>

        {/* Governance */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-900">Governance (G)</h3>
              <p className="text-xs text-navy-400">Ethics, Audit & Compliance</p>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-navy-500">Independent Directors:</span>
              <span className="font-bold text-navy-900">54.5% of Board</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-navy-500">Anti-Corruption Training:</span>
              <span className="font-bold text-esg-700">100% Coverage</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-navy-500">Whistleblower Resolution:</span>
              <span className="font-bold text-navy-900">100% Resolved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-navy-900 mb-1">Corporate Emissions Trajectory</h2>
          <p className="text-xs text-navy-400 mb-4">Quarterly reported GHG footprint against decarbonization targets (tCO₂e)</p>
          <TrendLineChart
            data={[
              { period: 'Q1 FY25', value: 6850 },
              { period: 'Q2 FY25', value: 6420 },
              { period: 'Q3 FY25', value: 6100 },
              { period: 'Q4 FY25', value: 5480 }
            ]}
            height={260}
          />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-navy-900 mb-1">GHG Scope Distribution</h2>
            <p className="text-xs text-navy-400 mb-4">Scope 1, 2, and 3 aggregate breakdown</p>
            <EmissionsBreakdownChart
              scope1={14800}
              scope2={6250}
              scope3={3800}
              height={190}
            />
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-navy-500 font-medium">Compliance Assurance:</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 size={14} /> SEBI BRSR Core Certified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
