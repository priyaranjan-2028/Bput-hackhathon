import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowRight, CheckCircle2, ChevronRight, Layers, FileSpreadsheet, ShieldAlert, FileCheck2, Building, BarChart2 } from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Collect at the Project Boundary',
      desc: 'Project engineers enter consumption metrics (diesel liters, grid kWh, municipal water, steel rebar) and attach source invoices or meter photographs.',
      tag: 'Role: Project User'
    },
    {
      num: '02',
      title: 'Supervisor Primary Verification',
      desc: 'Site and Project Supervisors inspect the submitted volume, scrutinize the linked evidence PDF/image in the Evidence Drawer, and certify or request corrections.',
      tag: 'Role: Project Supervisor'
    },
    {
      num: '03',
      title: 'Business Unit Consolidation',
      desc: 'BU Supervisors review all projects within their division (Hydrocarbon, Power, Irrigation), perform variance checks, and approve the unit consolidation batch.',
      tag: 'Role: BU Supervisor'
    },
    {
      num: '04',
      title: 'Subsidiary Roll-Up & Calculation',
      desc: 'Subsidiary executives verify aggregated emissions across operational BUs. Normalized emissions per crore turnover and Scope totals are automatically calculated.',
      tag: 'Role: Subsidiary Supervisor'
    },
    {
      num: '05',
      title: 'MEIL Corporate Master BRSR Generation',
      desc: 'Central ESG Admin consolidates all subsidiaries, runs lineage audits, checks emission intensity indices, and generates the SEBI Principle 6 BRSR report.',
      tag: 'Role: MEIL Admin'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 border-b border-slate-100 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-navy-800 rounded-lg flex items-center justify-center">
              <Leaf size={18} className="text-esg-400" />
            </div>
            <div>
              <span className="text-base font-bold text-navy-900">MEIL ESG</span>
              <span className="hidden sm:inline text-xs text-navy-400 ml-2">BRSR Platform</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/features" className="text-sm text-navy-500 hover:text-navy-800 transition-colors">Features</Link>
            <Link to="/how-it-works" className="text-sm font-semibold text-esg-600">How It Works</Link>
            <Link to="/about" className="text-sm text-navy-500 hover:text-navy-800 transition-colors">About</Link>
            <Link to="/contact" className="text-sm text-navy-500 hover:text-navy-800 transition-colors">Contact</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost btn-sm">Sign In</Link>
            <Link to="/login" className="btn-primary btn-sm">Launch Portal</Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 max-w-5xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-esg-50 text-esg-700 text-xs font-medium mb-4 border border-esg-200">
            End-to-End Workflow Architecture
          </div>
          <h1 className="text-4xl font-bold text-navy-900 mb-4">
            How ESG Data Moves from Site to SEBI Report
          </h1>
          <p className="text-navy-500 text-base leading-relaxed">
            A zero-compromise chain of custody ensuring that every gram of reported carbon dioxide equivalent is supported by verifiable evidence and multi-tier executive approval.
          </p>
        </div>

        <div className="space-y-6">
          {steps.map((s, idx) => (
            <div key={idx} className="flex flex-col md:flex-row items-start gap-6 p-6 rounded-2xl border border-slate-200 bg-white hover:border-esg-400 transition-all shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-navy-900 text-esg-400 flex items-center justify-center font-bold text-xl flex-shrink-0">
                {s.num}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="text-lg font-bold text-navy-900">{s.title}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-navy-600">
                    {s.tag}
                  </span>
                </div>
                <p className="text-sm text-navy-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link to="/login" className="btn-primary btn-lg inline-flex items-center gap-2">
            Try the Interactive Workflow <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    </div>
  );
}
