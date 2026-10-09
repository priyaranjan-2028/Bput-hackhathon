import { SubmissionStatus } from '../../types';
import { projectUserStatusConfig, projectUserStatusLabel, projectUserStatusStyle } from '../../utils/submissionStatus';

export default function ProjectUserStatusBadge({ status }: { status: SubmissionStatus }) {
  const config = projectUserStatusConfig[status];
  return (
    <span title={config?.description} className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${projectUserStatusStyle(status)}`}>
      {projectUserStatusLabel(status)}
    </span>
  );
}
