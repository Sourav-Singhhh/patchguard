import React from 'react';
import type { Finding } from '../scanner/types';
import { FileCode } from 'lucide-react';

interface CodeViewProps {
  content: string;
  findings: Finding[];
  selectedFinding: Finding | null;
  onSelectFinding: (finding: Finding) => void;
}

export const CodeView: React.FC<CodeViewProps> = ({ content, findings, selectedFinding, onSelectFinding }) => {
  const lines = content.split(/\r?\n/);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full backdrop-blur-xl">
      <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Scanned SKILL.md Source</span>
        </div>
        <span className="text-xs text-slate-500 font-mono">{lines.length} lines</span>
      </div>

      <div className="p-4 overflow-y-auto font-mono text-xs text-slate-300 space-y-1 max-h-[520px]">
        {lines.map((line, idx) => {
          const lineNumber = idx + 1;
          const matchingFinding = findings.find((f) => f.lineNumber === lineNumber);
          const isSelected = selectedFinding?.lineNumber === lineNumber;

          let bgClass = 'hover:bg-slate-800/40';
          if (isSelected) {
            bgClass = 'bg-blue-900/40 border-l-4 border-blue-500 font-semibold ring-1 ring-blue-500/20';
          } else if (matchingFinding) {
            bgClass = matchingFinding.severity === 'critical' || matchingFinding.severity === 'high'
              ? 'bg-rose-950/40 border-l-4 border-rose-500'
              : 'bg-amber-950/40 border-l-4 border-amber-500';
          }

          return (
            <div
              key={idx}
              onClick={() => matchingFinding && onSelectFinding(matchingFinding)}
              className={`flex items-start gap-4 px-3 py-1.5 rounded-lg transition-colors ${bgClass} ${matchingFinding ? 'cursor-pointer' : ''}`}
            >
              <span className="text-slate-600 select-none w-8 text-right font-mono text-[11px] shrink-0">{lineNumber}</span>
              <span className={`flex-1 whitespace-pre-wrap break-all ${matchingFinding ? 'text-rose-200 font-medium' : ''}`}>
                {line || ' '}
              </span>
              {matchingFinding && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                  {matchingFinding.severity}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
