import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Shield, BarChart3, GitBranch, Layers, FileCheck, ArrowRight, CheckCircle2, Lock, Database } from 'lucide-react';

export default function FeaturesPage() {
  const featureList = [
    {
      icon: <Layers className="text-esg-600" size={24} />,
      title: 'Hierarchical 5-Tier Data Consolidation',
      desc: 'Rigorous multi-stage data flow from Project Level -> Project Supervisor -> Business Unit -> Subsidiary -> MEIL Central Admin with progressive rollups.'
    },
    {
      icon: <FileCheck className="text-esg-600" size={24} />,
      title: 'Zero-Collision Evidence Vault',
      desc: 'Automatic collision-safe naming convention (`{SUB}_{BU}_{PRJ}_{PARAM}_{YYMM}_{SEQ}_{HASH}.ext`) preserving original filenames while preventing file overwrites.'
    },
    {
      icon: <BarChart3 className="text-esg-600" size={24} />,
      title: 'Automated CO₂e Emissions Engine',
      desc: 'Instant calculation across Scope 1 (direct fuels), Scope 2 (grid electricity), and Scope 3 (supply chain & travel) using DEFRA/CEA factor databases.'
    },
    {
      icon: <GitBranch className="text-esg-600" size={24} />,
      title: 'Full Audit Trail & Data Lineage',
      desc: 'Complete bidirectional traceability from the consolidated SEBI BRSR summary table down to the original fuel meter invoice and supervisor signature.'
    },
    {
      icon: <Shield className="text-esg-600" size={24} />,
      title: 'Enterprise Role-Based Access Control',
      desc: 'Segregated interfaces and authorization boundaries for field project users, supervisors, BU heads, subsidiary executives, and corporate ESG auditors.'
    },
    {
      icon: <Database className="text-esg-600" size={24} />,
      title: 'BRSR & ESG Regulatory Generator',
      desc: 'One-click consolidated SEBI BRSR Principle 6 reporting output with downloadable audit packages, verification timestamps, and compliance readiness.'
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
            <Link to="/features" className="text-sm font-semibold text-esg-600">Features</Link>
            <Link to="/how-it-works" className="text-sm text-navy-500 hover:text-navy-800 transition-colors">How It Works</Link>
            <Link to="/about" className="text-sm text-navy-500 hover:text-navy-800 transition-colors">About</Link>
            <Link to="/contact" className="text-sm text-navy-500 hover:text-navy-800 transition-colors">Contact</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost btn-sm">Sign In</Link>
            <Link to="/login" className="btn-primary btn-sm">Launch Portal</Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-esg-50 text-esg-700 text-xs font-medium mb-4 border border-esg-200">
            Enterprise Architecture
          </div>
          <h1 className="text-4xl font-bold text-navy-900 mb-4">
            Built Specifically for High-Stakes ESG Compliance
          </h1>
          <p className="text-navy-500 text-base leading-relaxed">
            Every layer of the MEIL ESG Platform is engineered to satisfy the rigorous evidentiary and audit standards demanded by SEBI BRSR guidelines and statutory environmental regulators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureList.map((f, i) => (
            <div key={i} className="p-6 bg-slate-50 border border-slate-200/80 rounded-2xl hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-5">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-2">{f.title}</h3>
              <p className="text-sm text-navy-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-navy-900 rounded-3xl p-10 md:p-14 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Experience the Complete Verification Cycle
            </h2>
            <p className="text-navy-200 text-sm leading-relaxed">
              Log in with our preconfigured roles to explore how project data traverses through each tier into the final consolidated BRSR report.
            </p>
          </div>
          <Link to="/login" className="btn-primary btn-lg whitespace-nowrap bg-esg-500 hover:bg-esg-600 text-white font-semibold">
            Test Drive Prototype <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    </div>
  );
}
