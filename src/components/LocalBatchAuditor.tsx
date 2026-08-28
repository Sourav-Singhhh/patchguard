import React from 'react';
import { FolderSearch, FolderInput, FileCode } from 'lucide-react';
import { performLocalBatchAudit } from '../scanner/localBatchAudit';
import type { LocalAuditSummary } from '../scanner/localBatchAudit';

interface LocalBatchAuditorProps {
  onSelectSkill: (content: string, name: string) => void;
}

export const LocalBatchAuditor: React.FC<LocalBatchAuditorProps> = ({ onSelectSkill }) => {
  const [batchSummary, setBatchSummary] = React.useState<LocalAuditSummary | null>(null);

  const handleDirectorySelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;

    const markdownFiles: { name: string; content: string }[] = [];

    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      if (file.name.endsWith('.md') || file.name.endsWith('.skill') || file.name === 'SKILL.md') {
        const text = await file.text();
        markdownFiles.push({ name: file.webkitRelativePath || file.name, content: text });
      }
    }

    if (markdownFiles.length > 0) {
      const summary = performLocalBatchAudit(markdownFiles);
      setBatchSummary(summary);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderSearch className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-extrabold text-white">Local Skills Directory Audit</h2>
        </div>
        <span className="text-xs text-slate-500 font-mono">Select Directory / Multiple Files</span>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer">
          <FolderInput className="w-4 h-4" />
          <span>Select Skills Folder</span>
          <input
            type="file"
            // @ts-ignore - directory attributes supported in modern browsers
            webkitdirectory=""
            directory=""
            multiple
            onChange={handleDirectorySelect}
            className="hidden"
          />
        </label>
        <p className="text-xs text-slate-400">
          Audits all <code className="text-indigo-300 font-mono">SKILL.md</code> files in `.latentcode/skills` or local folders.
        </p>
      </div>

      {batchSummary && (
        <div className="space-y-4 pt-3 border-t border-slate-800 animate-fadeIn">
          {/* Aggregate Metrics Bar */}
          <div className="grid grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block">Total Scanned</span>
              <span className="text-lg font-bold text-slate-100">{batchSummary.totalSkills}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-emerald-400 block font-bold">Safe</span>
              <span className="text-lg font-bold text-emerald-400">{batchSummary.safeCount}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-amber-400 block font-bold">Warnings</span>
              <span className="text-lg font-bold text-amber-400">{batchSummary.warningCount}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-rose-400 block font-bold">Critical</span>
              <span className="text-lg font-bold text-rose-400">{batchSummary.criticalCount}</span>
            </div>
          </div>

          {/* List of Batch Audited Files */}
          <div className="space-y-2 max-h-60 overflow-y-auto font-mono text-xs">
            {batchSummary.items.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onSelectSkill(item.content, item.fileName)}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">{item.fileName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-bold">{item.result.score}/100</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    item.result.riskLevel === 'SAFE' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                    item.result.riskLevel === 'CRITICAL RISK' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                    'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {item.result.riskLevel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
