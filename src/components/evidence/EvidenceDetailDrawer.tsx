import React, { useState } from 'react';
import { Evidence, SubmissionStatus } from '../../types';
import { ProjectUserEvidence } from '../../types/projectUser';
import { getParameterById, getUserById, getProjectById, getBusinessUnitById, getSubsidiaryById, getSubmissionById, formatFileSize, formatDateTime } from '../../data/mockData';
import StatusBadge from '../common/StatusBadge';
import { X, Download, Eye, GitBranch, Clock, FileText, ExternalLink } from 'lucide-react';

interface EvidenceDetailDrawerProps {
  evidence: Evidence | ProjectUserEvidence;
  onClose: () => void;
}

export default function EvidenceDetailDrawer({ evidence, onClose }: EvidenceDetailDrawerProps) {
  const parameter = getParameterById(evidence.parameterId);
  const user = getUserById(evidence.userId);
  const project = getProjectById(evidence.projectId);
  const bu = getBusinessUnitById(evidence.businessUnitId);
  const subsidiary = getSubsidiaryById(evidence.subsidiaryId);
  const submission = getSubmissionById(evidence.submissionId);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} style={{ backdropFilter: 'blur(2px)' }} />
      <div className="drawer w-[520px] z-50 animate-slide-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-navy-800">Evidence Details</h3>
            <p className="text-xs text-navy-400 mt-0.5">{evidence.evidenceId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} className="text-navy-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* File Information */}
          <section>
            <h4 className="text-xs font-semibold text-navy-400 uppercase tracking-wide mb-3">File Information</h4>
            <div className="space-y-2.5">
              <InfoRow label="Evidence ID" value={evidence.evidenceId} />
              <InfoRow label="Original Filename" value={evidence.originalFilename} />
              <div>
                <span className="text-xs text-navy-400">System Filename</span>
                <p className="text-xs font-mono text-navy-600 mt-0.5 break-all bg-slate-50 rounded px-2 py-1.5">{evidence.systemFilename}</p>
              </div>
              <InfoRow label="File Type" value={evidence.fileExtension.toUpperCase()} />
              <InfoRow label="File Size" value={formatFileSize(evidence.fileSize)} />
              <InfoRow label="Uploaded By" value={user?.name || evidence.uploadedBy} />
              <InfoRow label="Upload Date" value={formatDateTime(evidence.uploadedAt)} />
            </div>
          </section>

          {/* Organizational Hierarchy */}
          <section>
            <h4 className="text-xs font-semibold text-navy-400 uppercase tracking-wide mb-3">Organizational Hierarchy</h4>
            <div className="bg-navy-50 rounded-lg p-4">
              <div className="space-y-2">
                <HierarchyLevel label="MEIL" value="Megha Engineering & Infrastructures Limited" level={0} />
                <HierarchyLevel label="Subsidiary" value={`${evidence.subsidiaryId} — ${subsidiary?.name || ''}`} level={1} />
                <HierarchyLevel label="Business Unit" value={`${evidence.businessUnitId} — ${bu?.name || ''}`} level={2} />
                <HierarchyLevel label="Project" value={`${evidence.projectId} — ${project?.name || ''}`} level={3} />
                <HierarchyLevel label="User" value={`${evidence.userId} — ${user?.name || ''}`} level={4} />
                <HierarchyLevel label="Parameter" value={`${evidence.parameterId} — ${parameter?.name || ''}`} level={5} />
              </div>
            </div>
          </section>

          {/* ESG Data */}
          {submission && (
            <section>
              <h4 className="text-xs font-semibold text-navy-400 uppercase tracking-wide mb-3">ESG Calculation</h4>
              <div className="card p-4">
                <div className="text-center space-y-3">
                  <div>
                    <span className="text-xs text-navy-400">Activity Data</span>
                    <p className="text-lg font-bold text-navy-800">
                      {submission.activityData.toLocaleString()} {submission.unit}
                    </p>
                  </div>
                  <div className="text-navy-300 text-lg">×</div>
                  <div>
                    <span className="text-xs text-navy-400">Emission Factor</span>
                    <p className="text-lg font-bold text-navy-800">
                      {submission.emissionFactorValue} {parameter?.unit ? `kgCO2e/${parameter.unit.replace(/s$/, '')}` : 'kgCO2e/unit'}
                    </p>
                    <span className="demo-badge mt-1">Demo emission factor</span>
                  </div>
                  <div className="text-navy-300 text-lg">=</div>
                  <div className="bg-esg-50 rounded-lg p-3">
                    <span className="text-xs text-esg-600">Calculated Emission</span>
                    <p className="text-xl font-bold text-esg-700">{submission.calculatedCO2e} tCO2e</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Verification Status */}
          <section>
            <h4 className="text-xs font-semibold text-navy-400 uppercase tracking-wide mb-3">Verification</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-navy-600">Status</span>
                <StatusBadge status={evidence.verificationStatus} />
              </div>
              {Boolean(evidence.verificationHistory?.length) && (
                <div className="space-y-2 mt-3">
                  {evidence.verificationHistory?.map(vh => (
                    <div key={vh.id} className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-navy-700">{vh.action}</span>
                        <span className="text-[10px] text-navy-400">{formatDateTime(vh.performedAt)}</span>
                      </div>
                      <p className="text-xs text-navy-500">{vh.comment}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={vh.previousStatus} size="sm" />
                        <span className="text-[10px] text-navy-300">→</span>
                        <StatusBadge status={vh.newStatus} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Actions */}
          <section>
            <h4 className="text-xs font-semibold text-navy-400 uppercase tracking-wide mb-3">Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <button className="btn-secondary btn-sm"><Eye size={14} /> Preview</button>
              <button className="btn-secondary btn-sm"><Download size={14} /> Download</button>
              <button className="btn-secondary btn-sm"><FileText size={14} /> View Submission</button>
              <button className="btn-secondary btn-sm"><GitBranch size={14} /> View Lineage</button>
              <button className="btn-secondary btn-sm col-span-2"><Clock size={14} /> Verification History</button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between">
      <span className="text-xs text-navy-400 flex-shrink-0">{label}</span>
      <span className="text-sm text-navy-700 text-right ml-4">{value}</span>
    </div>
  );
}

function HierarchyLevel({ label, value, level }: { label: string; value: string; level: number }) {
  return (
    <div className="flex items-start gap-2" style={{ paddingLeft: `${level * 12}px` }}>
      {level > 0 && <span className="text-navy-300 text-xs mt-0.5">→</span>}
      <div>
        <span className="text-[10px] text-navy-400 uppercase">{label}</span>
        <p className="text-xs text-navy-700 font-medium">{value}</p>
      </div>
    </div>
  );
}
