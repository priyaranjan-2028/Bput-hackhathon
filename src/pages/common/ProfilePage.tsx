import React, { useState } from 'react';
import { useAuth, getRoleLabel } from '../../context/AuthContext';
import { getProjectById, getBusinessUnitById, getSubsidiaryById, getUserById } from '../../data/mockData';
import { User, Mail, Shield, Building2, MapPin, CheckCircle2, Lock, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [phone, setPhone] = useState('+91 98490 12345');
  const [designation, setDesignation] = useState('Senior Environmental Officer');

  if (!user) return null;

  const project = user.projectId ? getProjectById(user.projectId) : undefined;
  const bu = user.businessUnitId ? getBusinessUnitById(user.businessUnitId) : undefined;
  const subsidiary = user.subsidiaryId ? getSubsidiaryById(user.subsidiaryId) : undefined;
  const supervisor = project?.supervisorId ? getUserById(project.supervisorId) : undefined;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Profile</h1>
        <p className="text-sm text-navy-500 mt-1">
          Review your organizational assignment, scope authorization, and security settings
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>Profile changes saved successfully.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-4">
          <div className="w-24 h-24 bg-navy-800 text-esg-400 font-bold text-3xl rounded-full flex items-center justify-center mx-auto shadow-inner">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h2 className="text-lg font-bold text-navy-900">{user.name}</h2>
            <p className="text-xs text-navy-400 mt-0.5">{user.email}</p>
          </div>
          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-esg-100 text-esg-800">
            {getRoleLabel(user.role)}
          </div>
          <div className="pt-4 border-t border-slate-100 text-left text-xs space-y-2 text-navy-600">
            <div><span className="text-navy-400">Employee ID:</span> <span className="font-mono font-medium">{user.id}</span></div>
            <div><span className="text-navy-400">Account status:</span> <span className="font-semibold text-emerald-700">Active (demo)</span></div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-navy-900 mb-4 flex items-center gap-2">
              <Building2 size={18} className="text-esg-600" /> Organizational Hierarchy Assignment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-navy-400 block mb-1">Company / Group</span>
                <span className="font-semibold text-navy-800 text-sm">Megha Engineering & Infrastructures Ltd.</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-navy-400 block mb-1">Assigned Subsidiary</span>
                <span className="font-semibold text-navy-800 text-sm">{subsidiary ? subsidiary.name : 'Corporate Group-wide'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-navy-400 block mb-1">Business Unit</span>
                <span className="font-semibold text-navy-800 text-sm">{bu ? bu.name : 'Multi-BU Executive Oversight'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-navy-400 block mb-1">Site / Project Boundary</span>
                <span className="font-semibold text-navy-800 text-sm">{project ? `${project.name}${project.location ? ` (${project.location})` : ''}` : 'All Group Projects'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-navy-400 block mb-1">Project Supervisor</span>
                <span className="font-semibold text-navy-800 text-sm">{supervisor?.name ?? 'Not assigned'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-navy-400 block mb-1">Reporting Period</span>
                <span className="font-semibold text-navy-800 text-sm">{project?.reportingPeriod ?? 'FY 2025-26'}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
              <User size={18} className="text-esg-600" /> Operational Details
            </h3>
            <p className="text-xs text-slate-500">Project, role, business unit and subsidiary assignments are system-controlled and cannot be changed here.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                  Designation / Title
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="input-field w-full text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field w-full text-sm"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button type="submit" className="btn-primary flex items-center gap-2 text-xs py-2 px-5 font-semibold">
                <Save size={14} /> Update Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
