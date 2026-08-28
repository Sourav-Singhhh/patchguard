import React from 'react';
import type { ScanResult } from '../scanner/types';
import { BarChart3 } from 'lucide-react';

interface SummaryProps {
  result: ScanResult;
}

export const Summary: React.FC<SummaryProps> = ({ result }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl backdrop-blur-md">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-blue-400" />
        Audit Summary Metrics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-sans mb-1">Total Lines</span>
          <span className="text-xl font-extrabold text-slate-100">{result.totalLinesScanned}</span>
        </div>
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-sans mb-1">Rules Triggered</span>
          <span className="text-xl font-extrabold text-slate-100">{result.rulesTriggeredCount}</span>
        </div>
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-sans mb-1">Categories Detected</span>
          <span className="text-xl font-extrabold text-slate-100">{result.categoriesDetected.length}</span>
        </div>
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-sans mb-1">Scan Latency</span>
          <span className="text-xl font-extrabold text-slate-100">{result.scanDurationMs} ms</span>
        </div>
      </div>
    </div>
  );
};
