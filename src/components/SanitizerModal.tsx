import React from 'react';
import type { SanitizationResult } from '../scanner/types';
import { X, ShieldCheck, CheckCircle2, Download, FileCode } from 'lucide-react';

interface SanitizerModalProps {
  originalContent: string;
  sanitizationResult: SanitizationResult;
  fileName: string;
  onClose: () => void;
}

export const SanitizerModal: React.FC<SanitizerModalProps> = ({
  originalContent,
  sanitizationResult,
  fileName,
  onClose,
}) => {
  const originalLines = originalContent.split(/\r?\n/);
  const sanitizedLines = sanitizationResult.sanitizedContent.split(/\r?\n/);

  const handleDownloadSanitized = () => {
    const sanitizedFileName = fileName.endsWith('.md')
      ? fileName.replace('.md', '-sanitized.md')
      : `${fileName}-sanitized.md`;

    const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(sanitizationResult.sanitizedContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', sanitizedFileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-6xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">Auto-Sanitizer & Safe Skill Patch Generator</h2>
              <p className="text-xs text-slate-400">Neutralized threats while preserving skill layout & structure</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Verification Rescan Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-2xl">
                {sanitizationResult.rescanResult.score}
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Rescan Status</span>
                <h3 className="text-base font-bold text-slate-100">{sanitizationResult.verificationLabel}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Neutralized {sanitizationResult.totalNeutralized} threat{sanitizationResult.totalNeutralized === 1 ? '' : 's'}. Original file remains untouched.
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadSanitized}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all"
            >
              <Download className="w-4 h-4" />
              Download Safe SKILL.md
            </button>
          </div>

          {/* Remediation Audit Log */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Remediation Action Log ({sanitizationResult.remediations.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sanitizationResult.remediations.map((rem, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-400">Line {rem.lineNumber} • Rule {rem.ruleId}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {rem.status}
                    </span>
                  </div>
                  <p className="text-slate-300 font-medium">{rem.actionTaken}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Side-by-Side Diff Viewer */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileCode className="w-4 h-4 text-blue-400" />
              Original vs. Sanitized Output Diff
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Code */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col h-80">
                <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs font-mono font-bold text-rose-400">
                  Original (Unsanitized)
                </div>
                <div className="p-3 overflow-y-auto font-mono text-xs text-slate-400 space-y-1 flex-1">
                  {originalLines.map((line, idx) => (
                    <div key={idx} className="whitespace-pre-wrap break-all">
                      <span className="text-slate-600 select-none mr-3 w-6 inline-block text-right">{idx + 1}</span>
                      {line || ' '}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sanitized Code */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col h-80">
                <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs font-mono font-bold text-emerald-400">
                  Sanitized Output
                </div>
                <div className="p-3 overflow-y-auto font-mono text-xs text-emerald-300/90 space-y-1 flex-1">
                  {sanitizedLines.map((line, idx) => (
                    <div key={idx} className="whitespace-pre-wrap break-all">
                      <span className="text-slate-600 select-none mr-3 w-6 inline-block text-right">{idx + 1}</span>
                      {line || ' '}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
