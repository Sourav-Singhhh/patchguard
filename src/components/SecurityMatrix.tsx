import React from 'react';
import type { ScanResult } from '../scanner/types';
import { ShieldCheck, ShieldAlert, Lock, Network, Terminal, Box } from 'lucide-react';

interface SecurityMatrixProps {
  result: ScanResult;
}

export const SecurityMatrix: React.FC<SecurityMatrixProps> = ({ result }) => {
  const categories = [
    {
      id: 'prompt_injection',
      name: 'Prompt Injection',
      icon: Terminal,
      ruleCount: result.findings.filter(f => f.category === 'prompt_injection').length,
      desc: 'System directives, safety overrides, concealment commands.',
    },
    {
      id: 'credential_access',
      name: 'Auth & Secrets',
      icon: Lock,
      ruleCount: result.findings.filter(f => f.category === 'credential_access').length,
      desc: '.env files, SSH keys, API keys, token exfiltration.',
    },
    {
      id: 'destructive_command',
      name: 'Code Execution',
      icon: ShieldAlert,
      ruleCount: result.findings.filter(f => f.category === 'destructive_command').length,
      desc: 'Recursive force deletes (rm -rf /), drive formatting.',
    },
    {
      id: 'network_exfiltration',
      name: 'Network Safety',
      icon: Network,
      ruleCount: result.findings.filter(f => f.category === 'network_exfiltration').length,
      desc: 'Outbound HTTP POST payloads, curl uploads.',
    },
    {
      id: 'suspicious_file_access',
      name: 'Supply Chain & Files',
      icon: Box,
      ruleCount: result.findings.filter(f => f.category === 'suspicious_file_access').length,
      desc: 'System directory traversal (~/.ssh, /etc/passwd).',
    },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-extrabold text-white">Security Dimension Matrix</h2>
        </div>
        <span className="text-xs text-slate-500 font-mono">Heuristic Static Rules Evaluation</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map(cat => {
          const Icon = cat.icon;
          const isThreatDetected = cat.ruleCount > 0;

          return (
            <div
              key={cat.id}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
                isThreatDetected
                  ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${isThreatDetected ? 'text-rose-400' : 'text-emerald-400'}`} />
                  <span className="font-bold text-sm text-slate-200">{cat.name}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    isThreatDetected
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {isThreatDetected ? `${cat.ruleCount} Triggered` : '0 Detected'}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{cat.desc}</p>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-500 font-mono text-center pt-2">
        * "0 Detected" indicates 0 detected threats under PatchGuard rules. Static heuristic analysis cannot guarantee protection against unknown attack vectors.
      </p>
    </div>
  );
};
