import React from 'react';
import type { Finding, Severity } from '../scanner/types';
import { AlertOctagon, ShieldAlert, AlertTriangle, Info, ChevronRight, CheckCircle2 } from 'lucide-react';

interface FindingsListProps {
  findings: Finding[];
  selectedFinding: Finding | null;
  onSelectFinding: (finding: Finding) => void;
}

export const FindingsList: React.FC<FindingsListProps> = ({ findings, selectedFinding, onSelectFinding }) => {
  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case 'critical':
        return { label: 'CRITICAL', color: 'bg-rose-500/10 text-rose-300 border-rose-500/30', icon: AlertOctagon };
      case 'high':
        return { label: 'HIGH', color: 'bg-orange-500/10 text-orange-300 border-orange-500/30', icon: ShieldAlert };
      case 'medium':
        return { label: 'MEDIUM', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30', icon: AlertTriangle };
      default:
        return { label: 'LOW', color: 'bg-blue-500/10 text-blue-300 border-blue-500/30', icon: Info };
    }
  };

  if (findings.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center space-y-3 shadow-2xl backdrop-blur-xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-extrabold text-white">No Security Threats Detected</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          The scanned skill passed all static rule heuristics cleanly. No prompt injections, credential references, or destructive commands were found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Security Findings <span className="text-sm text-slate-400 font-normal">({findings.length})</span>
        </h2>
        <span className="text-xs text-slate-500">Select a finding to jump to line</span>
      </div>

      <div className="space-y-3">
        {findings.map((f) => {
          const badge = getSeverityBadge(f.severity);
          const Icon = badge.icon;
          const isSelected = selectedFinding?.id === f.id;

          return (
            <div
              key={f.id}
              onClick={() => onSelectFinding(f)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-lg ${
                isSelected
                  ? 'bg-slate-900 border-blue-500 ring-2 ring-blue-500/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-2 rounded-xl border ${badge.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {f.category.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-blue-400 font-mono font-bold">Line {f.lineNumber}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-100 mt-1.5">{f.title}</h3>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 text-slate-500 transition-transform ${isSelected ? 'rotate-90 text-blue-400' : ''}`} />
              </div>

              <div className="mt-3 bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono text-xs text-rose-300 overflow-x-auto">
                <code>{f.lineContent}</code>
              </div>

              {isSelected && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 text-xs text-slate-300">
                  <div>
                    <span className="font-bold text-slate-200 block mb-1">Explanation:</span>
                    <p className="text-slate-400 leading-relaxed">{f.explanation}</p>
                  </div>
                  <div>
                    <span className="font-bold text-rose-400 block mb-1">Why It Matters:</span>
                    <p className="text-slate-400 leading-relaxed">{f.whyItMatters}</p>
                  </div>
                  <div className="bg-emerald-950/40 border border-emerald-500/30 p-3.5 rounded-xl">
                    <span className="font-bold text-emerald-400 block mb-1">Recommended Remediation:</span>
                    <p className="text-emerald-200/90 leading-relaxed">{f.remediation}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
