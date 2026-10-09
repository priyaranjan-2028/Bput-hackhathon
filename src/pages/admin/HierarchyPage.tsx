import React, { useState } from 'react';
import { subsidiaries, businessUnits, projects } from '../../data/mockData';
import {
  FolderTree,
  Building2,
  ChevronRight,
  ChevronDown,
  Layers,
  MapPin,
  CheckCircle2,
  Users,
  ShieldCheck,
  TrendingUp,
  FolderKanban
} from 'lucide-react';

interface SelectedNode {
  type: 'ORG' | 'SUB' | 'BU' | 'PRJ';
  id: string;
  name: string;
  code?: string;
  details?: any;
}

export default function HierarchyPage() {
  const [expandedSubs, setExpandedSubs] = useState<string[]>(['SUB001']);
  const [expandedBUs, setExpandedBUs] = useState<string[]>(['BU001']);
  const [selectedNode, setSelectedNode] = useState<SelectedNode>({
    type: 'ORG',
    id: 'MEIL-ROOT',
    name: 'Megha Engineering & Infrastructures Ltd. (MEIL Group)'
  });

  const toggleSub = (subId: string) => {
    setExpandedSubs(prev =>
      prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]
    );
  };

  const toggleBU = (buId: string) => {
    setExpandedBUs(prev =>
      prev.includes(buId) ? prev.filter(id => id !== buId) : [...prev, buId]
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Enterprise Organizational Hierarchy</h1>
        <p className="text-sm text-navy-500 mt-1">
          Interactive tree architecture modeling the 4-tier ESG consolidation flow from site boundary to corporate parent
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Interactive Tree */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
              <FolderTree size={18} className="text-esg-600" /> Structure Browser
            </h2>
            <span className="text-xs text-navy-400">Click any entity to inspect audit parameters</span>
          </div>

          {/* Root: MEIL Conglomerate */}
          <div className="space-y-2">
            <div
              onClick={() => setSelectedNode({
                type: 'ORG',
                id: 'MEIL-ROOT',
                name: 'Megha Engineering & Infrastructures Ltd. (MEIL Group)'
              })}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                selectedNode.type === 'ORG'
                  ? 'bg-navy-900 text-white border-navy-900 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-navy-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 size={20} className={selectedNode.type === 'ORG' ? 'text-esg-400' : 'text-navy-700'} />
                <div>
                  <span className="text-sm font-bold block">MEIL Conglomerate (Parent Entity)</span>
                  <span className={`text-[11px] ${selectedNode.type === 'ORG' ? 'text-navy-300' : 'text-navy-400'}`}>
                    Hyderabad, Telangana &bull; Master Consolidation Root
                  </span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                selectedNode.type === 'ORG' ? 'bg-esg-500 text-white' : 'bg-navy-100 text-navy-800'
              }`}>
                Tier 4
              </span>
            </div>

            {/* Level 1: Subsidiaries */}
            <div className="pl-6 space-y-2 border-l-2 border-slate-200 ml-4">
              {subsidiaries.map(sub => {
                const isSubExpanded = expandedSubs.includes(sub.id);
                const subBUs = businessUnits.filter(b => b.subsidiaryId === sub.id);
                const isSubSelected = selectedNode.type === 'SUB' && selectedNode.id === sub.id;

                return (
                  <div key={sub.id} className="space-y-2">
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSubSelected
                          ? 'bg-navy-800 text-white border-navy-800'
                          : 'bg-white border-slate-200 text-navy-800 hover:bg-slate-50'
                      }`}
                      onClick={() => {
                        setSelectedNode({ type: 'SUB', id: sub.id, name: sub.name, code: sub.code, details: sub });
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSub(sub.id);
                          }}
                          className="p-1 hover:bg-slate-200/50 rounded"
                        >
                          {isSubExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                        <Layers size={18} className={isSubSelected ? 'text-esg-400' : 'text-esg-600'} />
                        <div>
                          <span className="text-xs font-bold block">{sub.name}</span>
                          <span className={`text-[10px] font-mono ${isSubSelected ? 'text-navy-300' : 'text-navy-400'}`}>
                            {sub.code} &bull; {sub.sector}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-navy-700">
                        Tier 3
                      </span>
                    </div>

                    {/* Level 2: Business Units under Subsidiary */}
                    {isSubExpanded && (
                      <div className="pl-6 space-y-2 border-l-2 border-slate-200 ml-4">
                        {subBUs.map(bu => {
                          const isBUExpanded = expandedBUs.includes(bu.id);
                          const buPrjs = projects.filter(p => p.businessUnitId === bu.id);
                          const isBUSelected = selectedNode.type === 'BU' && selectedNode.id === bu.id;

                          return (
                            <div key={bu.id} className="space-y-2">
                              <div
                                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                  isBUSelected
                                    ? 'bg-navy-800 text-white border-navy-800'
                                    : 'bg-white border-slate-200 text-navy-800 hover:bg-slate-50'
                                }`}
                                onClick={() => {
                                  setSelectedNode({ type: 'BU', id: bu.id, name: bu.name, code: bu.code, details: bu });
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleBU(bu.id);
                                    }}
                                    className="p-1 hover:bg-slate-200/50 rounded"
                                  >
                                    {isBUExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                  </button>
                                  <FolderKanban size={16} className={isBUSelected ? 'text-esg-400' : 'text-navy-500'} />
                                  <div>
                                    <span className="text-xs font-semibold block">{bu.name}</span>
                                    <span className={`text-[10px] font-mono ${isBUSelected ? 'text-navy-300' : 'text-navy-400'}`}>
                                      {bu.code}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-navy-700">
                                  Tier 2
                                </span>
                              </div>

                              {/* Level 3: Projects under BU */}
                              {isBUExpanded && (
                                <div className="pl-6 space-y-1.5 border-l-2 border-slate-200 ml-4">
                                  {buPrjs.map(prj => {
                                    const isPrjSelected = selectedNode.type === 'PRJ' && selectedNode.id === prj.id;
                                    return (
                                      <div
                                        key={prj.id}
                                        onClick={() => {
                                          setSelectedNode({ type: 'PRJ', id: prj.id, name: prj.name, code: prj.code, details: prj });
                                        }}
                                        className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                                          isPrjSelected
                                            ? 'bg-esg-600 text-white border-esg-600 shadow-sm'
                                            : 'bg-white border-slate-200 text-navy-700 hover:bg-slate-50'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2 truncate">
                                          <MapPin size={14} className={isPrjSelected ? 'text-white' : 'text-esg-600'} />
                                          <span className="font-medium truncate">{prj.name}</span>
                                        </div>
                                        <span className={`font-mono text-[10px] ${isPrjSelected ? 'text-esg-100' : 'text-navy-400'}`}>
                                          {prj.code}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Selected Entity Inspection Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 h-fit sticky top-24">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[10px] uppercase font-bold text-esg-700 tracking-wider block mb-1">
              {selectedNode.type === 'ORG' ? 'Corporate Parent' : selectedNode.type === 'SUB' ? 'Subsidiary Entity' : selectedNode.type === 'BU' ? 'Business Unit Division' : 'Site Project Boundary'}
            </span>
            <h3 className="text-lg font-bold text-navy-900 leading-snug">{selectedNode.name}</h3>
            {selectedNode.code && (
              <span className="font-mono text-xs text-navy-400 block mt-1">Code: {selectedNode.code}</span>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-navy-400 block">Reporting Tier & Role</span>
              <span className="font-semibold text-navy-900">
                {selectedNode.type === 'ORG'
                  ? 'Tier 4 — Corporate Central ESG Admin (BRSR Principle 6)'
                  : selectedNode.type === 'SUB'
                  ? 'Tier 3 — Subsidiary Corporate ESG Lead'
                  : selectedNode.type === 'BU'
                  ? 'Tier 2 — Business Unit Supervisory Cell'
                  : 'Tier 1 — Site Field Engineers & Project Supervisor'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-navy-400 block">Verification Authority</span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Certified & Audit-Linked
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-navy-400 block">Consolidation Status</span>
              <span className="font-semibold text-navy-900">
                Sealed with SHA-256 batch cryptographic checksum
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-semibold text-navy-600">
              <span>Traceability Integrity:</span>
              <span className="text-emerald-700 font-bold">100% SEBI BRSR Core</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
