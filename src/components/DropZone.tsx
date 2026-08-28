import React from 'react';
import { Upload, FileCode, Play, Sparkles } from 'lucide-react';
import { fixtures } from '../fixtures';
import type { Fixture } from '../fixtures';

interface DropZoneProps {
  onScanContent: (content: string, fileName?: string) => void;
  onSelectFixture: (fixture: Fixture) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onScanContent, onSelectFixture }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        onScanContent(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        onScanContent(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto py-6">
      {/* Hero Title */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Automated Agent Skill Security Scanner</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Audit Agent Skills <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Before Execution</span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          PatchGuard performs rule-based static analysis on <code className="text-blue-300 font-mono bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/50">SKILL.md</code> files and shell commands to catch prompt injections, credential exfiltration, and destructive commands.
        </p>
      </div>

      {/* Main Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="relative group border-2 border-dashed border-slate-800 hover:border-blue-500/60 rounded-2xl p-8 sm:p-12 text-center bg-slate-900/40 hover:bg-slate-900/80 backdrop-blur-xl transition-all cursor-pointer shadow-2xl"
      >
        <input
          type="file"
          accept=".md,.txt,.skill"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform shadow-inner">
            <Upload className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-slate-200">
              Drop your <code className="text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded font-mono text-sm border border-blue-800/50">SKILL.md</code> file here, or click to browse
            </p>
            <p className="text-xs text-slate-500">Supports Markdown, Plaintext, and Skill definitions</p>
          </div>
        </div>
      </div>

      {/* Synthetic Demo Fixtures Grid */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Synthetic Demo Test Fixtures
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">100% Client-Side • Safe Harmless Examples</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fixtures.map((fix) => (
            <button
              key={fix.id}
              onClick={() => onSelectFixture(fix)}
              className="flex flex-col text-left p-5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700/80 transition-all group shadow-md hover:shadow-xl relative overflow-hidden cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors">
                  {fix.name}
                </span>
                <Play className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{fix.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
