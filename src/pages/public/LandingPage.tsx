import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf, Shield, BarChart3, GitBranch, Building2, FileText, ArrowRight,
  CheckCircle2, ChevronRight, Users, Layers, Eye, Lock, ShieldCheck,
  TrendingUp, Sparkles, Database, ArrowUpRight, Copy, Check, Activity,
  Sliders, Award, RefreshCw, ChevronDown, Cpu, FileCheck, HelpCircle,
  Clock, Hash, Send, AlertCircle
} from 'lucide-react';

export default function LandingPage() {
  const [copiedEmail, setCopiedEmail] = useState(null);
  const [activeHeroTab, setActiveHeroTab] = useState('overview');
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    setTimeout(() => setCopiedEmail(null), 2200);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (contactForm.name && contactForm.email) {
      setContactSubmitted(true);
      setTimeout(() => {
        setContactSubmitted(false);
        setContactForm({ name: '', email: '', message: '' });
      }, 4000);
    }
  };

  const workflowSteps = [
    {
      step: '01',
      title: 'Collect',
      role: 'Project Site Engineers',
      desc: 'Raw consumption logs (diesel, power, concrete, municipal water) logged directly with photographic vouchers.',
      metrics: '1,420+ monthly data points'
    },
    {
      step: '02',
      title: 'Verify',
      role: 'Site Project Supervisors',
      desc: 'First-line supervisory audit. Cross-references vendor weight slips and calibrated metering logs.',
      metrics: 'Zero-tolerance outlier screening'
    },
    {
      step: '03',
      title: 'Calculate',
      role: 'Automated Emission Engine',
      desc: 'Converts raw energy units into standardized tCO₂e via CEA grid factors & IPCC guidelines.',
      metrics: 'Deterministic calculations'
    },
    {
      step: '04',
      title: 'Consolidate',
      role: 'BU & Subsidiary Heads',
      desc: 'Bottom-up aggregation across Irrigation, Roads, Hydro, and Hydrocarbons without flattening granular nodes.',
      metrics: 'Non-destructive roll-up'
    },
    {
      step: '05',
      title: 'Trace',
      role: 'Independent / Internal Auditors',
      desc: 'Every consolidated number links backwards to its origin file, author timestamp, and review signature.',
      metrics: 'SHA-256 cryptographically indexed'
    },
    {
      step: '06',
      title: 'Report',
      role: 'MEIL Corporate Board',
      desc: 'One-click automated export to SEBI BRSR Section C format with pre-configured GRI indicator mappings.',
      metrics: 'SEBI Circular compliant'
    }
  ];

  const features = [
    {
      icon: Building2,
      title: 'Organizational Hierarchy',
      desc: 'Multi-level structural governance spanning MEIL Corporate → Subsidiaries → Business Units → Infrastructure Sites.',
      badge: 'Core Engine'
    },
    {
      icon: FileText,
      title: 'BRSR Section C Coverage',
      desc: 'Complete coverage for Scope 1, Scope 2, Scope 3, effluent water discharge, zero-waste cycles, and workforce safety.',
      badge: 'SEBI Mandatory'
    },
    {
      icon: BarChart3,
      title: 'Automated CO₂e Engine',
      desc: 'Dynamically transforms activity metrics into GHG carbon equivalent figures using audited Indian national baseline factors.',
      badge: 'Automated'
    },
    {
      icon: ShieldCheck,
      title: 'Multi-Tier Verification',
      desc: 'Rigid gatekeeping requiring consecutive approvals from Site, Unit, and Subsidiary chiefs prior to corporate absorption.',
      badge: 'Data Integrity'
    },
    {
      icon: GitBranch,
      title: 'Forensic Lineage',
      desc: 'Drill down from high-level corporate disclosures directly to the concrete batching ticket uploaded at site level.',
      badge: 'Traceability'
    },
    {
      icon: Eye,
      title: 'Evidence Integrity',
      desc: 'Every evidence voucher receives an encrypted system identifier encoding the hierarchy path. Tamper-evident.',
      badge: 'Audit Ready'
    },
    {
      icon: Layers,
      title: 'Additive Aggregation',
      desc: 'Bottom-up rollups preserve raw inputs while displaying high-altitude performance KPIs to stakeholders.',
      badge: 'Non-Destructive'
    },
    {
      icon: Lock,
      title: 'Immutable Audit Trail',
      desc: 'Forensic event logs tracking every creation, correction request, sign-off, and download event across timezones.',
      badge: 'Compliance'
    },
    {
      icon: Users,
      title: '5 Distinct User Roles',
      desc: 'Bespoke interfaces for Project Contributors, Site Supervisors, BU Managers, Subsidiary Heads, and Board Admins.',
      badge: 'RBAC Security'
    }
  ];

  const demoAccounts = [
    { role: 'Project Data User', email: 'projectuser@demo.com', access: 'Data Input & Vouchers', tier: 'Tier 1' },
    { role: 'Project Supervisor', email: 'projectsup@demo.com', access: 'Site Level Approval', tier: 'Tier 2' },
    { role: 'BU Supervisor', email: 'busupervisor@demo.com', access: 'Business Unit Roll-up', tier: 'Tier 3' },
    { role: 'Subsidiary Supervisor', email: 'subsupervisor@demo.com', access: 'Subsidiary Consolidation', tier: 'Tier 4' },
    { role: 'MEIL Main Admin', email: 'admin@meil-demo.com', access: 'Enterprise Oversight & BRSR Export', tier: 'Tier 5' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-navy-900 selection:bg-esg-500 selection:text-white font-sans antialiased">
      
      {/* Top Banner Notice */}
      <div className="bg-navy-950 border-b border-navy-800 text-slate-300 text-xs py-2.5 px-6 relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-esg-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="font-bold text-white tracking-wide">MEIL ESG BRSR PLATFORM</span>
            <span className="text-navy-700 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">Regulatory Environmental Management System</span>
          </div>
          <div className="flex items-center gap-5 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1.5"><Shield size={12} className="text-esg-400" /> SEBI Circular Compliant</span>
            <span className="hidden md:flex items-center gap-1.5"><Award size={12} className="text-esg-400" /> GHG Protocol & BRSR Core</span>
          </div>
        </div>
      </div>

      {/* Main Glass Header */}
      <header className="sticky top-0 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/80 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-10 h-10 bg-navy-900 rounded-xl flex items-center justify-center shadow-lg shadow-navy-900/15 group-hover:scale-105 transition-transform duration-200">
              <Leaf size={20} className="text-esg-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-navy-900 tracking-tight">MEIL ESG</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-esg-50 text-esg-800 px-2 py-0.5 rounded-full border border-esg-300/60 shadow-2xs">
                  Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">BRSR Compliance Architecture</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/80 shadow-inner">
            <a href="#features" className="text-xs font-semibold px-4 py-1.5 text-slate-600 hover:text-navy-900 rounded-full hover:bg-white transition-all">
              Modules
            </a>
            <a href="#how-it-works" className="text-xs font-semibold px-4 py-1.5 text-slate-600 hover:text-navy-900 rounded-full hover:bg-white transition-all">
              Chain of Custody
            </a>
            <a href="#demo" className="text-xs font-semibold px-4 py-1.5 text-slate-600 hover:text-navy-900 rounded-full hover:bg-white transition-all">
              Role Sandboxes
            </a>
            <a href="#about" className="text-xs font-semibold px-4 py-1.5 text-slate-600 hover:text-navy-900 rounded-full hover:bg-white transition-all">
              Governance
            </a>
            <a href="#contact" className="text-xs font-semibold px-4 py-1.5 text-slate-600 hover:text-navy-900 rounded-full hover:bg-white transition-all">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-xs font-bold text-navy-800 hover:text-navy-950 transition-colors">
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 shadow-md shadow-navy-900/20 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section: Vivid Colored Lighting + High-Tech Glass Panels */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden bg-navy-950 text-white">
        
        {/* Dynamic Multi-Color Background Meshes */}
        <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-esg-500/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-10 right-10 w-[600px] h-[600px] bg-teal-500/15 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[380px] h-[380px] bg-navy-700/60 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Tech Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:32px_32px] opacity-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-7">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <span className="w-2.5 h-2.5 rounded-full bg-esg-400 animate-pulse" />
                <span className="text-xs font-bold text-esg-300 tracking-wider uppercase">
                  Centralized BRSR Reporting Suite
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
                Precision ESG Data. <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-esg-300 via-teal-200 to-white">
                  Auditable BRSR Output.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                A unified compliance engine for Megha Engineering & Infrastructures Limited. 
                Collect verified data across distributed construction sites, calculate accurate Scope 1-3 emissions, 
                and generate SEBI-compliant BRSR Section C reports with complete data lineage.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-esg-500 hover:bg-esg-400 text-navy-950 font-bold text-sm shadow-xl shadow-esg-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  Enter ESG Workspace <ArrowRight size={17} />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 text-white font-semibold text-sm transition-all"
                >
                  View Custody Model
                </a>
              </div>

              {/* Trust & Metric Highlights */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-6 max-w-lg">
                <div className="space-y-1">
                  <div className="text-2xl lg:text-3xl font-black text-white">100%</div>
                  <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-esg-400" /> Evidence-backed
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl lg:text-3xl font-black text-white">Scope 1-3</div>
                  <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Cpu size={12} className="text-esg-400" /> Auto-converted
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl lg:text-3xl font-black text-white">5 Levels</div>
                  <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <ShieldCheck size={12} className="text-esg-400" /> Gate approval
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Glassmorphic Cockpit */}
            <div className="lg:col-span-5 relative">
              
              {/* Radial Halo behind cards */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-esg-500/30 via-teal-500/20 to-navy-500/40 rounded-3xl blur-2xl opacity-75" />

              {/* Primary Glass Screen Container */}
              <div className="relative rounded-2xl bg-slate-900/80 backdrop-blur-2xl border border-white/20 p-6 shadow-2xl shadow-black/60 space-y-5">
                
                {/* Console Topbar */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-esg-500/20 border border-esg-400/40 flex items-center justify-center text-esg-400 shadow-inner">
                      <Activity size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white tracking-wide">MEIL Enterprise Dashboard</div>
                      <div className="text-[10px] text-slate-400">Consolidated Environmental Telemetry</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-esg-500/20 border border-esg-400/40 px-2.5 py-1 rounded-full text-esg-300 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-esg-400 animate-pulse" />
                    LIVE TELEMETRY
                  </div>
                </div>

                {/* Glass Tab Switcher */}
                <div className="flex p-1 bg-black/40 rounded-xl border border-white/10 text-xs">
                  <button
                    onClick={() => setActiveHeroTab('overview')}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                      activeHeroTab === 'overview'
                        ? 'bg-esg-500 text-navy-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveHeroTab('scopes')}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                      activeHeroTab === 'scopes'
                        ? 'bg-esg-500 text-navy-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Scope 1-3
                  </button>
                  <button
                    onClick={() => setActiveHeroTab('lineage')}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                      activeHeroTab === 'lineage'
                        ? 'bg-esg-500 text-navy-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Verification
                  </button>
                </div>

                {/* Dynamic Screen Content */}
                {activeHeroTab === 'overview' && (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-esg-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                        <div>
                          <div className="text-xs font-semibold text-white">Direct Fuel Emissions (Scope 1)</div>
                          <div className="text-[10px] text-slate-400">Diesel generator & plant machinery</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-white">42,890.40</div>
                        <div className="text-[10px] text-esg-300 font-mono">tCO₂e</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.9)]" />
                        <div>
                          <div className="text-xs font-semibold text-white">Electricity Consumption (Scope 2)</div>
                          <div className="text-[10px] text-slate-400">Grid draw across project offices & substations</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-white">18,340.12</div>
                        <div className="text-[10px] text-teal-300 font-mono">tCO₂e</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
                        <div>
                          <div className="text-xs font-semibold text-white">Upstream Procurement (Scope 3)</div>
                          <div className="text-[10px] text-slate-400">Cement, reinforced rebar freight</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-white">105,720.00</div>
                        <div className="text-[10px] text-amber-300 font-mono">tCO₂e</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeHeroTab === 'scopes' && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Reporting Completeness</span>
                        <span className="font-bold text-esg-400">96.8%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="w-[96.8%] h-full bg-gradient-to-r from-esg-400 to-teal-400" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[10px] text-slate-400 block">Active Emission Factors</span>
                        <span className="text-sm font-bold text-white mt-1 block">CEA Version 19.0</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[10px] text-slate-400 block">Verified Projects</span>
                        <span className="text-sm font-bold text-white mt-1 block">348 / 352 Sites</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeHeroTab === 'lineage' && (
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span>Last Hash Batch</span>
                        <span className="font-mono text-esg-400">#MEIL-2026-Q1-98F</span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-200 truncate">
                        e7f13a02c98d629a7384210e7b419df0996bc8e...
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-emerald-400 pt-1">
                        <CheckCircle2 size={12} /> Sign-off confirmed by Subsidiary Level Supervisor
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-navy-800/80 border border-navy-700 text-[11px] text-slate-300 flex items-center justify-between">
                      <span>Audit-Ready Format</span>
                      <span className="font-bold text-white">SEBI Annexure II (BRSR)</span>
                    </div>
                  </div>
                )}

                {/* Footprint Aggregate Strip */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-navy-900 to-slate-900 border border-white/15 flex items-center justify-between shadow-xl">
                  <div>
                    <div className="text-[11px] text-slate-400">Total Consolidated Emissions</div>
                    <div className="text-base font-black text-white mt-0.5 tracking-tight">166,950.52 tCO₂e</div>
                  </div>
                  <span className="text-[11px] text-navy-950 font-bold bg-esg-400 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                    BRSR Formatted <CheckCircle2 size={13} className="text-navy-950" />
                  </span>
                </div>
              </div>

              {/* Floating Glass Sub-Card */}
              <div className="hidden sm:flex items-center gap-3 absolute -bottom-6 -left-6 rounded-2xl bg-navy-900/95 backdrop-blur-2xl border border-white/20 p-4 shadow-2xl z-20">
                <div className="w-9 h-9 rounded-xl bg-esg-500/20 border border-esg-400/40 flex items-center justify-center text-esg-400">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Immutable Lineage</div>
                  <div className="text-[10px] text-slate-400">Zero data overwriting; full chain of custody</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* KPI Stats Strip */}
      <section className="bg-navy-900 text-white py-12 px-6 border-y border-navy-800 relative z-30">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-esg-400 font-bold">Onboarded Units</span>
            <div className="text-3xl font-black text-white">350+ Projects</div>
            <p className="text-xs text-slate-400">Active monitoring points across MEIL</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-esg-400 font-bold">Data Fidelity</span>
            <div className="text-3xl font-black text-white">99.98%</div>
            <p className="text-xs text-slate-400">Verified voucher attachment rate</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-esg-400 font-bold">Traceability</span>
            <div className="text-3xl font-black text-white">6 Tier Lineage</div>
            <p className="text-xs text-slate-400">Project to SEBI BRSR export</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-esg-400 font-bold">Audit Duration</span>
            <div className="text-3xl font-black text-white">&lt; 48 Hours</div>
            <p className="text-xs text-slate-400">Instant evidence document discovery</p>
          </div>
        </div>
      </section>

      {/* Standardized Execution Protocol (Interactive Workflow) */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-100/70 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-esg-700 font-bold uppercase text-xs tracking-wider">End-To-End Architecture</span>
            <h2 className="text-3xl font-black text-navy-900 mt-2">Hierarchical Chain of Custody</h2>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Every data point flows upward across MEIL’s organizational hierarchy. Consolidation is additive—original records are never overwritten or lost.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Step Selector Column */}
            <div className="lg:col-span-5 space-y-3">
              {workflowSteps.map((item, index) => (
                <div
                  key={item.title}
                  onClick={() => setActiveWorkflowStep(index)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-between ${
                    activeWorkflowStep === index
                      ? 'bg-navy-900 text-white border-navy-900 shadow-md'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-navy-900'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className={`text-xs font-mono font-bold px-2 py-1 rounded-md ${
                      activeWorkflowStep === index ? 'bg-esg-500 text-navy-950' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.step}
                    </span>
                    <div>
                      <div className="text-sm font-bold">{item.title}</div>
                      <div className={`text-xs ${activeWorkflowStep === index ? 'text-slate-300' : 'text-slate-500'}`}>
                        {item.role}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} className={activeWorkflowStep === index ? 'text-esg-400' : 'text-slate-400'} />
                </div>
              ))}
            </div>

            {/* Step Detail Card */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl bg-white border border-slate-200 p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-esg-50 border border-esg-200 flex items-center justify-center font-bold text-esg-700">
                      {workflowSteps[activeWorkflowStep].step}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-navy-900">{workflowSteps[activeWorkflowStep].title} Phase</h3>
                      <p className="text-xs text-slate-500">{workflowSteps[activeWorkflowStep].role}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
                    Step {activeWorkflowStep + 1} of 6
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Functional Description</h4>
                    <p className="text-sm text-slate-700 leading-relaxed font-normal">
                      {workflowSteps[activeWorkflowStep].desc}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Verification Criterion</span>
                    <p className="text-xs font-semibold text-navy-900 mt-1">
                      {workflowSteps[activeWorkflowStep].metrics}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-esg-600" /> Tamper-evident logging</span>
                  <span className="flex items-center gap-1.5"><Lock size={14} className="text-esg-600" /> RBAC authenticated</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Enterprise Platform Features */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-esg-700 font-bold uppercase text-xs tracking-wider">Modular Platform Suite</span>
            <h2 className="text-3xl font-black text-navy-900 mt-2">Comprehensive BRSR Capabilities</h2>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Tailored specifically for mega infrastructure, EPC, water systems, hydrocarbons, and renewable assets.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative p-7 rounded-2xl bg-white border border-slate-200/90 hover:border-navy-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center text-navy-700 group-hover:bg-navy-900 group-hover:text-white transition-colors shadow-sm">
                      <feature.icon size={22} />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-navy-900 mb-2">{feature.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Demonstration Access (Sandboxes) */}
      <section id="demo" className="py-24 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl bg-navy-950 text-white p-8 sm:p-14 relative overflow-hidden border border-navy-800 shadow-2xl">
            
            {/* Background Glow Orbs */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-esg-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mb-10">
              <span className="text-esg-400 font-bold uppercase text-xs tracking-wider">Evaluation Environment</span>
              <h2 className="text-3xl font-black text-white mt-2">Test Drive Platform Roles</h2>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Experience how different permission tiers streamline execution. Click on any credential to copy.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-xs bg-navy-900/90 px-3.5 py-2 rounded-xl border border-navy-700">
                <span className="text-slate-400">Master Password:</span>
                <code className="text-esg-300 font-mono font-bold bg-black/40 px-2 py-0.5 rounded">demo123</code>
              </div>
            </div>

            <div className="relative z-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {demoAccounts.map((account) => (
                <div
                  key={account.email}
                  onClick={() => copyToClipboard(account.email)}
                  className="cursor-pointer p-5 rounded-2xl bg-navy-900/90 border border-navy-700/80 hover:border-esg-400/80 hover:bg-navy-850 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white group-hover:text-esg-300 transition-colors">
                        {account.role}
                      </span>
                      {copiedEmail === account.email ? (
                        <span className="text-[10px] text-esg-400 font-bold flex items-center gap-1 bg-esg-500/10 px-2 py-0.5 rounded">
                          <Check size={11} /> Copied
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-300 flex items-center gap-1">
                          <Copy size={11} />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-mono truncate">{account.email}</p>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-navy-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{account.access}</span>
                    <span className="font-mono text-[10px] bg-navy-800 text-slate-400 px-2 py-0.5 rounded">
                      {account.tier}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative z-10 mt-10 pt-8 border-t border-navy-800 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-slate-400">
                All demo accounts are populated with realistic project datasets.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-esg-500 text-navy-950 font-bold text-xs hover:bg-esg-400 transition-all shadow-sm"
              >
                Sign In to Demo <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Overview / About */}
      <section id="about" className="py-24 px-6 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-esg-700 font-bold uppercase text-xs tracking-wider">Megha Engineering Governance</span>
          <h2 className="text-3xl font-black text-navy-900">Built for Critical Infrastructure</h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl mx-auto">
            Megha Engineering & Infrastructures Limited manages nationwide infrastructure portfolios spanning water supply, 
            energy, hydrocarbons, power networks, and urban transport. This platform provides MEIL’s leadership and sustainability 
            teams with complete assurance over data authenticity, mathematical accuracy, and timely compliance with SEBI BRSR Core guidelines.
          </p>
          <div className="pt-4 flex justify-center">
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-4 py-2 rounded-full border border-slate-200 flex items-center gap-2">
              <ShieldCheck size={14} className="text-esg-600" />
              Standardized Under ISO 14064 & GHG Protocol Principles
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Contact / Support Console */}
      <section id="contact" className="py-24 px-6 bg-slate-50">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-esg-700 font-bold uppercase text-xs tracking-wider">Support & Verification Help</span>
            <h2 className="text-2xl font-black text-navy-900 mt-1">Platform Admin Desk</h2>
            <p className="text-xs text-slate-600 mt-1">Direct inquiries regarding emission factors, audit inquiries, or site onboarding.</p>
          </div>

          <form onSubmit={handleContactSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            {contactSubmitted && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                <span>Message received. The MEIL platform administrator has been notified.</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1.5">Official Name</label>
              <input
                type="text"
                required
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                placeholder="Site Engineer or Unit Manager"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900/10 focus:border-navy-900 transition-all placeholder:text-slate-400"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1.5">Corporate Email</label>
              <input
                type="email"
                required
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                placeholder="username@meil.in"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900/10 focus:border-navy-900 transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1.5">Message / Inquiry</label>
              <textarea
                rows={3}
                required
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="Specify project site ID, emission discrepancy, or query..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900/10 focus:border-navy-900 transition-all placeholder:text-slate-400 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-navy-900 text-white font-bold text-xs hover:bg-navy-800 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Send size={13} /> Transmit Query
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-950 text-slate-400 py-14 px-6 border-t border-navy-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-navy-900 border border-navy-800 flex items-center justify-center">
              <Leaf size={18} className="text-esg-400" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">MEIL ESG Platform</p>
              <p className="text-[11px] text-slate-500">Megha Engineering & Infrastructures Limited</p>
            </div>
          </div>

          <div className="text-center md:text-right text-[11px] space-y-1">
            <p>© {new Date().getFullYear()} Megha Engineering & Infrastructures Limited. All rights reserved.</p>
            <p className="text-slate-500 font-mono">SEBI BRSR Compliance Framework & Emissions Engine</p>
          </div>
        </div>
      </footer>
    </div>
  );
}