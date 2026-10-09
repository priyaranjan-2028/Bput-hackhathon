import React, { useState } from 'react';
import { ScopeBarChart, TrendLineChart } from '../../components/charts/ESGCharts';
import { Scope } from '../../types';
import { BarChart3, Filter, Zap, Truck, Flame, Sparkles } from 'lucide-react';

export default function ScopeAnalyticsPage() {
  const [selectedScope, setSelectedScope] = useState<Scope>(Scope.SCOPE_1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Scope 1, 2 & 3 Emissions Analytics</h1>
        <p className="text-sm text-navy-500 mt-1">
          Deep-dive analysis of greenhouse gas emissions categorized according to the GHG Protocol Corporate Standard
        </p>
      </div>

      {/* Scope Selector Tabs */}
      <div className="flex flex-wrap gap-3 border-b border-slate-200 pb-3">
        <button
          onClick={() => setSelectedScope(Scope.SCOPE_1)}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            selectedScope === Scope.SCOPE_1
              ? 'bg-navy-900 text-white shadow-sm'
              : 'bg-white text-navy-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Flame size={14} className="text-amber-400" /> Scope 1: Direct Emissions (14,800 tCO₂e)
        </button>

        <button
          onClick={() => setSelectedScope(Scope.SCOPE_2)}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            selectedScope === Scope.SCOPE_2
              ? 'bg-navy-900 text-white shadow-sm'
              : 'bg-white text-navy-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Zap size={14} className="text-yellow-400" /> Scope 2: Grid Electricity (6,250 tCO₂e)
        </button>

        <button
          onClick={() => setSelectedScope(Scope.SCOPE_3)}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            selectedScope === Scope.SCOPE_3
              ? 'bg-navy-900 text-white shadow-sm'
              : 'bg-white text-navy-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Truck size={14} className="text-blue-400" /> Scope 3: Supply Chain (3,800 tCO₂e)
        </button>
      </div>

      {/* Scope Specific Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-navy-900">
                {selectedScope === Scope.SCOPE_1
                  ? 'Scope 1 Fuel & Equipment Breakdown'
                  : selectedScope === Scope.SCOPE_2
                  ? 'Scope 2 Power Grid vs Renewable Wheeling'
                  : 'Scope 3 Upstream Embedded Carbon Sources'}
              </h2>
              <p className="text-xs text-navy-400">Emissions by operational category (tCO₂e)</p>
            </div>
          </div>

          <ScopeBarChart
            data={
              selectedScope === Scope.SCOPE_1
                ? [
                    { name: 'Diesel / DG Sets', value: 8900 },
                    { name: 'Excavator & Heavy Fleet', value: 3400 },
                    { name: 'Petrol Light Vehicles', value: 1600 },
                    { name: 'LPG / Stationary Fuel', value: 900 }
                  ]
                : selectedScope === Scope.SCOPE_2
                ? [
                    { name: 'State DISCOM Grid', value: 5200 },
                    { name: 'Substation Wheeling', value: 1050 }
                  ]
                : [
                    { name: 'TMT Steel Rebar', value: 2100 },
                    { name: 'OPC/PPC Cement Mix', value: 1200 },
                    { name: 'Business Travel', value: 320 },
                    { name: 'Waste Disposal', value: 180 }
                  ]
            }
            height={280}
          />
        </div>

        {/* Applied Emission Factors Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
            <Sparkles size={18} className="text-esg-600" /> Regulatory Factors in Use
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-navy-400 block mb-0.5">High Speed Diesel (HSD)</span>
              <span className="font-mono font-bold text-navy-900">2.68 kg CO₂e / Liter</span>
              <span className="text-[10px] text-navy-400 block mt-0.5">DEFRA 2024 / IPCC Guidelines</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-navy-400 block mb-0.5">Indian National Grid Power</span>
              <span className="font-mono font-bold text-navy-900">0.71 kg CO₂e / kWh</span>
              <span className="text-[10px] text-navy-400 block mt-0.5">CEA CO₂ Baseline Database v19</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-navy-400 block mb-0.5">Reinforced Steel Rebar</span>
              <span className="font-mono font-bold text-navy-900">1.82 t CO₂e / Tonne</span>
              <span className="text-[10px] text-navy-400 block mt-0.5">World Steel Association EPD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
