import { ProjectUserEvidence } from '../types/projectUser';
import { evidenceRecords as mockEvidence } from '../data/mockData';
import { readStoredValue, PROJECT_USER_STORAGE_KEYS, writeStoredValue } from './localStorageService';

export interface EvidenceUploadInput {
  file: File;
  userId: string;
  projectId: string;
  businessUnitId: string;
  subsidiaryId: string;
  parameterId: string;
  submissionId?: string;
}

const fileToDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read the selected evidence file.'));
  reader.onerror = () => reject(new Error('Could not read the selected evidence file.'));
  reader.readAsDataURL(file);
});

export function getUserEvidence(userId: string): ProjectUserEvidence[] {
  const stored = readStoredValue<ProjectUserEvidence[] | null>(PROJECT_USER_STORAGE_KEYS.evidence, null);
  const seeded = mockEvidence.map(evidence => ({
      evidenceId: evidence.evidenceId,
      originalFilename: evidence.originalFilename,
      systemFilename: evidence.systemFilename,
      fileExtension: evidence.fileExtension ?? evidence.originalFilename.split('.').pop() ?? '',
      fileType: evidence.fileType ?? 'application/octet-stream',
      fileSize: evidence.fileSize,
      meilId: evidence.meilId ?? 'MEIL',
      subsidiaryId: evidence.subsidiaryId,
      businessUnitId: evidence.businessUnitId,
      projectId: evidence.projectId,
      userId: evidence.userId ?? userId,
      parameterId: evidence.parameterId,
      submissionId: evidence.submissionId,
      uploadedAt: evidence.uploadedAt,
      verificationStatus: evidence.verificationStatus ?? 'SUBMITTED' as ProjectUserEvidence['verificationStatus'],
  }));
  const current = stored ?? [];
  const missing = seeded.filter(item => !current.some(existing => existing.evidenceId === item.evidenceId));
  const merged = [...current, ...missing];
  if (stored === null || missing.length) writeStoredValue(PROJECT_USER_STORAGE_KEYS.evidence, merged);
  return merged.filter(evidence => evidence.userId === userId);
}

export async function createEvidenceMetadata(input: EvidenceUploadInput): Promise<ProjectUserEvidence> {
  getUserEvidence(input.userId);
  const allowedExtensions = new Set(['pdf', 'jpg', 'jpeg', 'png', 'xlsx', 'docx']);
  const extension = input.file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!allowedExtensions.has(extension)) {
    throw new Error('Unsupported file type. Upload a PDF, JPG, JPEG, PNG, XLSX or DOCX file.');
  }
  if (input.file.size > 25 * 1024 * 1024) {
    throw new Error('The file exceeds the 25 MB upload limit.');
  }

  const allEvidence = readStoredValue<ProjectUserEvidence[]>(PROJECT_USER_STORAGE_KEYS.evidence, []);
  const highestSequence = [...mockEvidence, ...allEvidence].reduce((max, evidence) => {
    const sequenceNumber = Number(evidence.evidenceId.match(/\d+$/)?.[0] ?? 0);
    return Math.max(max, sequenceNumber);
  }, 0);
  const sequence = highestSequence + 1;
  const now = new Date();
  const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
  const dataUrl = await fileToDataUrl(input.file);
  const evidence: ProjectUserEvidence = {
    evidenceId: `EVD-${String(sequence).padStart(6, '0')}`,
    originalFilename: input.file.name,
    systemFilename: `MEIL_${input.subsidiaryId}_${input.businessUnitId}_${input.projectId}_${input.userId}_${input.parameterId}_${timestamp}_${String(sequence).padStart(2, '0')}.${extension}`,
    fileExtension: extension,
    fileType: input.file.type || 'application/octet-stream',
    fileSize: input.file.size,
    meilId: 'MEIL',
    subsidiaryId: input.subsidiaryId,
    businessUnitId: input.businessUnitId,
    projectId: input.projectId,
    userId: input.userId,
    parameterId: input.parameterId,
    submissionId: input.submissionId,
    uploadedAt: now.toISOString(),
    verificationStatus: 'DRAFT' as ProjectUserEvidence['verificationStatus'],
    dataUrl,
  };
  const updated = [...allEvidence, evidence];
  writeStoredValue(PROJECT_USER_STORAGE_KEYS.evidence, updated);
  return evidence;
}

export function attachEvidenceToSubmission(evidenceIds: string[], submissionId: string, userId: string): void {
  const allEvidence = readStoredValue<ProjectUserEvidence[]>(PROJECT_USER_STORAGE_KEYS.evidence, []);
  const updatedEvidence = allEvidence.map(evidence =>
    evidence.userId === userId && evidenceIds.includes(evidence.evidenceId)
      ? { ...evidence, submissionId }
      : evidence
  );
  writeStoredValue(PROJECT_USER_STORAGE_KEYS.evidence, updatedEvidence);
}
