import React, { useState } from 'react';
import {
  consolidationRecords as initialRecords,
  formatDateTime
} from '../../data/mockData';
import { ConsolidationRecord } from '../../types';
import { Layers, Lock, CheckCircle2, ShieldCheck, Building2, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { readStoredValue, writeStoredValue } from '../../services/localStorageService';
import { getCurrentSubsidiary, getSubsidiaryBusinessUnits } from '../../services/subsidiaryService';

const SELECT_STYLE = 'input-field w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm font-semibold text-navy-900 shadow-sm transition focus:border-esg-500 focus:outline-none focus:ring-4 focus:ring-esg-100 sm:w-auto';

export default function SubsidiaryConsolidationPage() {
  const { user } = useAuth();
  const sub = getCurrentSubsidiary(user);
  const subUnitIds = new Set(getSubsidiaryBusinessUnits(sub.id).map(unit => unit.id));
  const [selectedPeriod, setSelectedPeriod] = useState('202509');
  const [isConsolidated, setIsConsolidated] = useState(false);
  const [records, setRecords] = useState<ConsolidationRecord[]>(() => {
    const incoming = readStoredValue<ConsolidationRecord[]>('meil_subsidiary_incoming_batches', []);
    const local = readStoredValue<ConsolidationRecord[]>('meil_subsidiary_consolidations', []);
    return [...incoming, ...local, ...initialRecords].filter((record, index, all) => all.findIndex(item => item.id === record.id) === index);
  });

  const buBlocks = records.filter(record => record.level === 'BUSINESS_UNIT' && record.parentEntityId === sub.id && subUnitIds.has(record.entityId) && record.status === 'VERIFIED_LEVEL_3' && (record.period === selectedPeriod || record.reportingPeriod === selectedPeriod));
  const scope1Sum = buBlocks.reduce((acc, r) => acc + r.scope1Total, 0);
  const scope2Sum = buBlocks.reduce((acc, r) => acc + r.scope2Total, 0);
  const scope3Sum = buBlocks.reduce((acc, r) => acc + r.scope3Total, 0);
  const totalEmissions = scope1Sum + scope2Sum + scope3Sum;

  const handleSealSubsidiary = () => {
    setIsConsolidated(true);
    const newRecord: ConsolidationRecord = {
      id: `CON-SUB-${selectedPeriod}-${Math.floor(Math.random() * 900 + 100)}`,
      level: 'SUBSIDIARY',
      entityId: sub.id,
      entityName: sub.name,
      period: selectedPeriod,
      scope1Total: scope1Sum,
      scope2Total: scope2Sum,
      scope3Total: scope3Sum,
      totalCO2e: totalEmissions,
      status: 'SEALED',
      consolidatedBy: user?.id ?? sub.supervisorId ?? '',
      consolidatedAt: new Date().toISOString(),
      submissionCount: buBlocks.reduce((count, record) => count + (record.submissionCount ?? 0), 0)
    };
    setRecords(current => { const next = [newRecord, ...current]; writeStoredValue('meil_subsidiary_consolidations', next); return next; });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Subsidiary Corporate Consolidation</h1>
        <p className="text-sm text-navy-500 mt-1">
          Certify and seal aggregate corporate emissions across all operational business divisions
        </p>
      </div>

      {isConsolidated && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm shadow-sm animate-fade-in">
          <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" />
          <div>
            <span className="font-bold">Subsidiary Master Block Sealed & Certified!</span>
            <p className="text-xs text-emerald-700 mt-0.5">
              The {sub.name} block has been saved for the selected reporting period.
            </p>
          </div>
        </div>
      )}

      {/* Consolidation Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-navy-900">Subsidiary Roll-Up Summary</h2>
            <p className="text-xs text-navy-400">Target Entity: {sub.name} &bull; Period: {selectedPeriod}</p>
          </div>
          <span className="relative block"><select
            value={selectedPeriod}
            onChange={(e) => { setSelectedPeriod(e.target.value); setIsConsolidated(false); }}
            className={SELECT_STYLE}
          >
            <option value="202509">Sep 2025 (202509)</option>
            <option value="202508">Aug 2025 (202508)</option>
          </select><span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">⌄</span></span>
        </div>

        {/* Aggregated totals */}
        <div className="bg-navy-900 text-white rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-navy-700 pb-3">
            <span className="text-xs uppercase font-bold text-esg-400 tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} /> Subsidiary Consolidated Footprint
            </span>
            <span className="text-xs text-navy-300 font-mono">Level-3 Master Block</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center sm:text-left">
            <div>
              <span className="text-[11px] text-navy-400 block">Scope 1 (Direct)</span>
              <span className="text-xl font-bold text-white">{scope1Sum.toFixed(2)} <span className="text-xs font-normal text-navy-400">tCO₂e</span></span>
            </div>
            <div>
              <span className="text-[11px] text-navy-400 block">Scope 2 (Electricity)</span>
              <span className="text-xl font-bold text-white">{scope2Sum.toFixed(2)} <span className="text-xs font-normal text-navy-400">tCO₂e</span></span>
            </div>
            <div>
              <span className="text-[11px] text-navy-400 block">Scope 3 (Supply Chain)</span>
              <span className="text-xl font-bold text-white">{scope3Sum.toFixed(2)} <span className="text-xs font-normal text-navy-400">tCO₂e</span></span>
            </div>
            <div className="sm:border-l sm:border-navy-700 sm:pl-4">
              <span className="text-[11px] text-esg-300 font-semibold block">Subsidiary Total</span>
              <span className="text-2xl font-extrabold text-esg-400">{totalEmissions.toFixed(2)} <span className="text-xs font-normal text-white">tCO₂e</span></span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-navy-500">
            <Lock size={14} className="text-slate-400" />
            <span>Sealing certifies all underlying division blocks and locks records for SEBI BRSR Core.</span>
          </div>

          <button
            onClick={handleSealSubsidiary}
            disabled={!buBlocks.length}
            className="btn-primary flex items-center justify-center gap-2 py-3 px-6 text-xs font-bold shadow-md"
          >
            <Lock size={14} /> Seal Subsidiary Master Block
          </button>
        </div>
      </div>

      {/* Subsidiary Ledgers */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-navy-900">Subsidiary Consolidation Records</h3>
          <span className="text-xs text-navy-400">Level-3 Audit Chain</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-navy-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Record ID</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Total Footprint</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Sealed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.filter(record => record.level === 'SUBSIDIARY' && record.entityId === sub.id).map(rec => (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-navy-800">{rec.id}</td>
                  <td className="py-3 px-4 font-semibold text-navy-700">{rec.entityName}</td>
                  <td className="py-3 px-4">{rec.period}</td>
                  <td className="py-3 px-4 font-bold text-navy-900">{rec.totalCO2e.toFixed(2)} t</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {rec.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-navy-400">{formatDateTime(rec.consolidatedAt).split(' ')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
