import React from 'react';
import { SubmissionStatus } from '../../types';

interface StatusBadgeProps {
  status: SubmissionStatus | string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { label: string; className: string }> = {
  [SubmissionStatus.DRAFT]: { label: 'Draft', className: 'badge-draft' },
  [SubmissionStatus.SUBMITTED]: { label: 'Submitted', className: 'badge-submitted' },
  [SubmissionStatus.UNDER_REVIEW]: { label: 'Under Review', className: 'badge-under-review' },
  [SubmissionStatus.CORRECTION_REQUIRED]: { label: 'Correction Required', className: 'badge-correction' },
  [SubmissionStatus.REJECTED]: { label: 'Rejected', className: 'badge-rejected' },
  [SubmissionStatus.APPROVED]: { label: 'Approved', className: 'badge-approved' },
  [SubmissionStatus.CONSOLIDATED]: { label: 'Consolidated', className: 'badge-consolidated' },
  [SubmissionStatus.FORWARDED]: { label: 'Forwarded', className: 'badge-forwarded' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'badge-draft' };
  return (
    <span className={`${config.className} ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : ''}`}>
      {config.label}
    </span>
  );
}
