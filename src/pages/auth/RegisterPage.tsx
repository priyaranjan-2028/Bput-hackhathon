import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, ArrowRight, Building2, User, Mail, Lock, ShieldCheck } from 'lucide-react';
import { subsidiaries, businessUnits, projects } from '../../data/mockData';

const filteredBUs = (subsidiaryId: string) => businessUnits.filter(unit => unit.subsidiaryId === subsidiaryId);

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    subsidiaryId: subsidiaries[0]?.id || '',
    businessUnitId: filteredBUs(subsidiaries[0]?.id || '')[0]?.id || '',
    projectId: projects.find(project => project.businessUnitId === filteredBUs(subsidiaries[0]?.id || '')[0]?.id)?.id || '',
    role: 'PROJECT_USER'
  });
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  const availableBUs = filteredBUs(formData.subsidiaryId);
  const availableProjects = projects.filter(project => project.businessUnitId === formData.businessUnitId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (formData.name.trim().length < 2) { setFormError('Enter your full name.'); return; }
    if (formData.password.length < 8) { setFormError('Use a password with at least 8 characters.'); return; }
    if (formData.password !== formData.confirmPassword) { setFormError('The passwords do not match.'); return; }
    setSuccess(true);
    setTimeout(() => {
      navigate('/verify-email');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-esg-50/70 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-10 h-10 bg-navy-800 rounded-xl flex items-center justify-center shadow-md">
            <Leaf size={22} className="text-esg-400" />
          </div>
          <span className="text-2xl font-bold text-navy-900 tracking-tight">MEIL ESG Platform</span>
        </Link>
        <h2 className="mt-4 text-xl font-bold text-navy-800">Register Enterprise Account</h2>
        <p className="mt-1 text-sm text-navy-500">
          Request system access for site data collection or reporting
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="form-card py-8 sm:px-10">
          {success ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 bg-esg-100 text-esg-600 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-lg font-bold text-navy-900">Registration Submitted!</h3>
              <p className="text-sm text-navy-500 max-w-sm mx-auto">
                Your request has been routed for supervisor approval. Redirecting to email verification...
              </p>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {formError && <p role="alert" className="form-error">{formError}</p>}
              <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-xs leading-relaxed text-blue-900">Create an access request using your corporate details. Your supervisor will review the organization and project assignment.</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      minLength={2}
                      maxLength={80}
                      autoComplete="name"
                      placeholder="e.g. Ramesh V."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">
                    Corporate Email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      maxLength={120}
                      autoComplete="email"
                      placeholder="name@meilgroup.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field pl-9 w-full text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">
                    Subsidiary
                  </label>
                  <select
                    required
                    value={formData.subsidiaryId}
                    onChange={(e) => { const subsidiaryId=e.target.value; const nextBU=filteredBUs(subsidiaryId)[0]; setFormData({ ...formData, subsidiaryId, businessUnitId: nextBU?.id || '', projectId: projects.find(project=>project.businessUnitId===nextBU?.id)?.id || '' }); }}
                    className="input-field w-full"
                  >
                    {subsidiaries.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">
                    Business Unit
                  </label>
                  <select
                    required
                    value={formData.businessUnitId}
                    onChange={(e) => { const businessUnitId=e.target.value; setFormData({ ...formData, businessUnitId, projectId: projects.find(project=>project.businessUnitId===businessUnitId)?.id || '' }); }}
                    className="input-field w-full"
                  >
                    {availableBUs.map((bu) => (
                      <option key={bu.id} value={bu.id}>
                        {bu.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">
                  Assigned Project / Site
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-3 text-slate-400" />
                  <select
                    required
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="input-field pl-10"
                  >
                    {availableProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.location})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 mt-4 font-medium"
              >
                Create Account Request <ArrowRight size={16} />
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-navy-500">
            Already have an account?{' '}
            <Link to="/login" className="text-esg-600 hover:text-esg-700 font-semibold">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
