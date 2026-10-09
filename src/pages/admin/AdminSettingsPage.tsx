import React, { useState } from 'react';
import { Settings, Save, ShieldCheck, Database, Lock, CheckCircle2, Sliders } from 'lucide-react';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [factorsVersion, setFactorsVersion] = useState('DEFRA 2024 / CEA v19');
  const [collisionPrefix, setCollisionPrefix] = useState('MEIL_ESG');
  const [varianceAlertThreshold, setVarianceAlertThreshold] = useState('15');
  const [mandatoryEvidence, setMandatoryEvidence] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Platform Governance &amp; Administration Settings</h1>
        <p className="text-sm text-navy-500 mt-1">
          Configure regulatory emission factor tables, collision-safe file schemes, and audit retention policies
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>Platform configuration updated and applied across all organizational tiers.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Emission Factor Versioning */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
            <Database size={18} className="text-esg-600" /> GHG Calculation &amp; Factor Governance
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                Active Factor Database
              </label>
              <input
                type="text"
                value={factorsVersion}
                onChange={(e) => setFactorsVersion(e.target.value)}
                className="input-field w-full text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                Site Variance Flag Threshold (%)
              </label>
              <input
                type="number"
                value={varianceAlertThreshold}
                onChange={(e) => setVarianceAlertThreshold(e.target.value)}
                className="input-field w-full text-xs font-medium"
              />
            </div>
          </div>
        </div>

        {/* Evidence & File Naming Policy */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
            <ShieldCheck size={18} className="text-esg-600" /> Evidence Vault &amp; Zero-Collision Policy
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                System File Prefix
              </label>
              <input
                type="text"
                value={collisionPrefix}
                onChange={(e) => setCollisionPrefix(e.target.value)}
                className="input-field w-full text-xs font-mono"
              />
            </div>

            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={mandatoryEvidence}
                onChange={(e) => setMandatoryEvidence(e.target.checked)}
                className="rounded text-esg-600 focus:ring-esg-500 w-4 h-4"
              />
              <div className="text-xs">
                <span className="font-bold text-navy-900 block">Enforce Mandatory Evidence Document on All Scope Submissions</span>
                <span className="text-navy-400">Blocks site submission if no invoice PDF or weighbridge voucher is attached</span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="btn-primary flex items-center gap-2 py-2.5 px-6 text-xs font-semibold shadow-md"
          >
            <Save size={16} /> Save Platform Settings
          </button>
        </div>
      </form>
    </div>
  );
}
