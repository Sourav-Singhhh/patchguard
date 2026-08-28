import React from 'react';
import { Clock, Download, RefreshCw, AlertOctagon, ShieldAlert, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import type { ScanResult } from '../scanner/types';

interface HeaderProps {
  result: ScanResult;
  onReset: () => void;
  onExport: () => void;
  onSanitize?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ result, onReset, onExport, onSanitize }) => {
  const getScoreTheme = (score: number, risk: ScanResult['riskLevel']) => {
    if (risk === 'SAFE' || score >= 90) {
      return {
        badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        scoreColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10 shadow-emerald-500/10',
        icon: CheckCircle2,
      };
    }
    if (risk === 'CRITICAL RISK' || score < 40) {
      return {
        badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        scoreColor: 'text-rose-500 border-rose-500/40 bg-rose-500/10 shadow-rose-500/10',
        icon: AlertOctagon,
      };
    }
    if (risk === 'HIGH RISK' || score < 60) {
      return {
        badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
        scoreColor: 'text-orange-400 border-orange-500/40 bg-orange-500/10 shadow-orange-500/10',
        icon: ShieldAlert,
      };
    }
    return {
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      scoreColor: 'text-amber-400 border-amber-500/40 bg-amber-500/10 shadow-amber-500/10',
      icon: AlertTriangle,
    };
  };

  const theme = getScoreTheme(result.score, result.riskLevel);
  const StatusIcon = theme.icon;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className={`flex flex-col items-center justify-center w-28 h-28 rounded-2xl border-2 shadow-lg ${theme.scoreColor} transition-all`}>
            <span className="text-4xl font-black tracking-tight">{result.score}</span>
            <span className="text-[10px] uppercase font-extrabold tracking-widest mt-1 opacity-80">Score</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${theme.badgeBg}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {result.riskLevel}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {result.scanDurationMs}ms
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Security Audit Report</h1>
            <p className="text-sm text-slate-400">
              Detected <span className="text-slate-200 font-bold">{result.findings.length} security finding{result.findings.length === 1 ? '' : 's'}</span> across{' '}
              <span className="text-slate-200 font-bold">{result.totalLinesScanned} lines</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:self-center flex-wrap">
          {result.findings.length > 0 && onSanitize && (
            <button
              onClick={onSanitize}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              Sanitize & Neutralize
            </button>
          )}
          <button
            onClick={onExport}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-sm font-semibold border border-slate-700 transition-all shadow-md"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Export Report
          </button>
          <button
            onClick={onReset}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/25 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Scan Another
          </button>
        </div>
      </div>
    </div>
  );
};
