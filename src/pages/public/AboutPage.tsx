import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Award, Building2, CheckCircle2, ShieldCheck, Users, Globe2 } from 'lucide-react';

export default function AboutPage() {
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
            <Link to="/how-it-works" className="text-sm text-navy-500 hover:text-navy-800 transition-colors">How It Works</Link>
            <Link to="/about" className="text-sm font-semibold text-esg-600">About</Link>
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
            Corporate Sustainability Mission
          </div>
          <h1 className="text-4xl font-bold text-navy-900 mb-4">
            About MEIL ESG & BRSR Compliance
          </h1>
          <p className="text-navy-500 text-base leading-relaxed">
            Megha Engineering & Infrastructures Limited (MEIL) is one of India's preeminent engineering and infrastructure conglomerates, delivering critical national projects across irrigation, hydrocarbons, power, transportation, and green mobility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-5 text-esg-600">
              <Building2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-navy-900 mb-3">Our Scale & Responsibility</h3>
            <p className="text-sm text-navy-600 leading-relaxed mb-4">
              With multi-billion dollar operations encompassing over 15 subsidiaries, 45 business units, and hundreds of active infrastructure sites across India and abroad, MEIL requires an institutional ESG management system that ensures zero greenwashing and complete regulatory fidelity.
            </p>
            <div className="space-y-2 text-xs text-navy-700">
              <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-esg-600" /> SEBI Business Responsibility & Sustainability Reporting (BRSR) Core compliant</div>
              <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-esg-600" /> GHG Protocol Corporate Accounting Standard Scope 1, 2, and 3</div>
              <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-esg-600" /> ISO 14064 Carbon Footprint Verification alignment</div>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-5 text-navy-800">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-navy-900 mb-3">Audit-Ready Principles</h3>
            <p className="text-sm text-navy-600 leading-relaxed mb-4">
              Every reported emission figure is backed by documented evidentiary artifacts. No unverified numbers are consolidated into statutory filings. Each supervisor along the reporting chain takes accountability through timestamped cryptographic verification.
            </p>
            <div className="space-y-2 text-xs text-navy-700">
              <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-esg-600" /> Complete data lineage down to original fuel meter slips</div>
              <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-esg-600" /> Role-isolated review & correction workflows</div>
              <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-esg-600" /> Centralized emission factor governance & audit logging</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
