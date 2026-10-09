import React, { useState, useRef } from 'react';
import { Upload, File, X, Check, AlertCircle } from 'lucide-react';
import { generateSystemFilename, generateEvidenceId, formatFileSize } from '../../data/mockData';

interface EvidenceUploadProps {
  parameterId: string;
  projectId: string;
  businessUnitId: string;
  subsidiaryId: string;
  userId?: string;
  period?: string;
  onUpload?: (evidence: UploadedFile) => void;
  onUploadComplete?: (evidence: any) => void;
}

interface UploadedFile {
  evidenceId: string;
  originalFilename: string;
  systemFilename: string;
  fileExtension: string;
  fileType: string;
  fileSize: number;
  status: 'uploading' | 'uploaded' | 'error';
  progress: number;
}

const ALLOWED_TYPES = ['pdf', 'jpg', 'jpeg', 'png', 'xlsx', 'csv', 'docx'];

export default function EvidenceUpload({
  parameterId, projectId, businessUnitId, subsidiaryId, userId = 'USR005', onUpload, onUploadComplete
}: EvidenceUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_TYPES.includes(ext)) {
      alert(`File type .${ext} is not supported. Allowed: ${ALLOWED_TYPES.join(', ')}`);
      return;
    }

    const sequence = files.filter(f => f.status === 'uploaded').length + 1;
    const evidenceId = `EVD-${(Date.now() % 1000000).toString().padStart(6, '0')}`;
    const systemFilename = generateSystemFilename(subsidiaryId, businessUnitId, projectId, userId, parameterId, ext, sequence);

    const uploadedFile: UploadedFile = {
      evidenceId,
      originalFilename: file.name,
      systemFilename,
      fileExtension: ext,
      fileType: file.type,
      fileSize: file.size,
      status: 'uploading',
      progress: 0,
    };

    setFiles(prev => [...prev, uploadedFile]);

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFiles(prev => prev.map(f =>
          f.evidenceId === evidenceId ? { ...f, status: 'uploaded', progress: 100 } : f
        ));
        onUpload?.({ ...uploadedFile, status: 'uploaded', progress: 100 });
      } else {
        setFiles(prev => prev.map(f =>
          f.evidenceId === evidenceId ? { ...f, progress } : f
        ));
      }
    }, 200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(processFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(processFile);
    }
  };

  const removeFile = (evidenceId: string) => {
    setFiles(prev => prev.filter(f => f.evidenceId !== evidenceId));
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
          dragOver
            ? 'border-navy-400 bg-navy-50'
            : 'border-slate-300 hover:border-navy-300 hover:bg-slate-25'
        }`}
      >
        <Upload size={32} className="mx-auto text-navy-300 mb-3" />
        <p className="text-sm font-medium text-navy-700">Drag files here</p>
        <p className="text-xs text-navy-400 mt-1">or <span className="text-navy-600 underline">Browse Files</span></p>
        <p className="text-xs text-navy-300 mt-2">
          Supported: PDF, JPG, JPEG, PNG, XLSX, CSV, DOCX
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.xlsx,.csv,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-navy-500 uppercase tracking-wide">Uploaded Evidence</h4>
          {files.map(file => (
            <div key={file.evidenceId} className="card p-3">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
                  file.status === 'uploaded' ? 'bg-esg-50' : file.status === 'error' ? 'bg-red-50' : 'bg-navy-50'
                }`}>
                  {file.status === 'uploaded' ? <Check size={16} className="text-esg-600" /> :
                   file.status === 'error' ? <AlertCircle size={16} className="text-red-600" /> :
                   <File size={16} className="text-navy-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-navy-800 truncate">
                        <span className="text-navy-400 text-xs mr-1">Original:</span>
                        {file.originalFilename}
                      </p>
                      <p className="text-[11px] text-navy-400 truncate mt-0.5 font-mono">
                        <span className="text-navy-300 mr-1">System:</span>
                        {file.systemFilename}
                      </p>
                    </div>
                    <button onClick={() => removeFile(file.evidenceId)} className="text-slate-400 hover:text-red-500 flex-shrink-0">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] text-navy-400">{file.evidenceId}</span>
                    <span className="text-[10px] text-navy-300">|</span>
                    <span className="text-[10px] text-navy-400">.{file.fileExtension}</span>
                    <span className="text-[10px] text-navy-300">|</span>
                    <span className="text-[10px] text-navy-400">{formatFileSize(file.fileSize)}</span>
                    {file.status === 'uploaded' && (
                      <>
                        <span className="text-[10px] text-navy-300">|</span>
                        <span className="text-[10px] text-esg-600 font-medium">Uploaded</span>
                      </>
                    )}
                  </div>
                  {file.status === 'uploading' && (
                    <div className="mt-2">
                      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-navy-600 rounded-full transition-all duration-200"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
