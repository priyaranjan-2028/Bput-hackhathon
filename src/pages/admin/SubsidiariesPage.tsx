import React, { useState } from 'react';
import { subsidiaries, businessUnits, projects } from '../../data/mockData';
import { Building2, Search, Plus, ExternalLink, ArrowRight, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SubsidiariesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = subsidiaries.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">MEIL Subsidiaries & Corporate Entities</h1>
          <p className="text-sm text-navy-500 mt-1">
            Group subsidiary companies reporting into the consolidated MEIL ESG compliance architecture
          </p>
        </div>
      </div>

      <div className="search-panel">
        <div className="relative w-full sm:max-w-md">
          <Search size={17} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="search"
            aria-label="Search subsidiaries"
            placeholder="Search by subsidiary name, code, or sector"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-field pl-10"
          />
        </div>
        <div className="text-xs text-navy-400">
          Showing <span className="font-bold text-navy-800">{filtered.length}</span> of {subsidiaries.length} subsidiaries
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(sub => {
          const subBUs = businessUnits.filter(b => b.subsidiaryId === sub.id);

          return (
            <div key={sub.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 hover:border-esg-400 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[11px] font-bold text-navy-400 block mb-1">{sub.code}</span>
                  <h3 className="text-lg font-bold text-navy-900">{sub.name}</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Active
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-navy-400">Sector:</span>
                  <span className="font-semibold text-navy-800">{sub.sector}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-navy-400">Annual Revenue:</span>
                  <span className="font-bold text-navy-900">₹{sub.turnover} Cr</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-navy-400">Business Divisions:</span>
                  <span className="font-semibold text-esg-700">{subBUs.length || 3} Operating Units</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                <span className="text-navy-500 font-medium">Head: Vikram Singh</span>
                <Link
                  to="/admin/hierarchy"
                  className="font-semibold text-esg-600 hover:text-esg-700 inline-flex items-center gap-1"
                >
                  Explore Org Tree <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
