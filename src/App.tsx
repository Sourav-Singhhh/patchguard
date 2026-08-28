import { useState, useEffect } from 'react';
import { scanSkill, sanitizeSkill } from './scanner';
import type { ScanResult, Finding, SanitizationResult } from './scanner';
import type { Fixture } from './fixtures';
import { DropZone } from './components/DropZone';
import { Header } from './components/Header';
import { SeverityOverview } from './components/SeverityOverview';
import { FindingsList } from './components/FindingsList';
import { CodeView } from './components/CodeView';
import { Summary } from './components/Summary';
import { SanitizerModal } from './components/SanitizerModal';
import { SkillPatchAuditor } from './components/SkillPatchAuditor';
import { LocalBatchAuditor } from './components/LocalBatchAuditor';
import { SecurityMatrix } from './components/SecurityMatrix';
import { Shield, Lock } from 'lucide-react';

export function App() {
  const [skillContent, setSkillContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('uploaded-skill.md');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [sanitizationResult, setSanitizationResult] = useState<SanitizationResult | null>(null);

  // Sync state with popstate browser navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (!event.state || !event.state.scanned) {
        setSkillContent(null);
        setScanResult(null);
        setSelectedFinding(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleScan = (content: string, name?: string) => {
    const result = scanSkill(content);
    setSkillContent(content);
    setFileName(name || 'scanned-skill.md');
    setScanResult(result);
    setSelectedFinding(result.findings[0] || null);

    // Push browser history state safely for seamless back-button behavior
    if (!window.history.state?.scanned) {
      window.history.pushState({ scanned: true }, '', window.location.href);
    }
  };

  const handleSelectFixture = (fix: Fixture) => {
    handleScan(fix.content, `${fix.id}.md`);
  };

  const handleReset = () => {
    setSkillContent(null);
    setScanResult(null);
    setSelectedFinding(null);
    setSanitizationResult(null);
    if (window.history.state?.scanned) {
      window.history.back();
    }
  };

  const handleOpenSanitizer = () => {
    if (!skillContent || !scanResult) return;
    const result = sanitizeSkill(skillContent, scanResult.findings);
    setSanitizationResult(result);
  };

  const handleExport = () => {
    if (!scanResult) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(scanResult, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `patchguard-report-${fileName.replace('.md', '')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col selection:bg-blue-500/30 selection:text-blue-20">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={handleReset}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-extrabold shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  PatchGuard
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  BuildSprint 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Agent Skill Security & Audit Harness</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              Local Deterministic Scanner
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {!scanResult || !skillContent ? (
          <div className="space-y-8">
            <DropZone onScanContent={handleScan} onSelectFixture={handleSelectFixture} />
            <SkillPatchAuditor onScanContent={handleScan} />
            <LocalBatchAuditor onSelectSkill={handleScan} />
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            <Header
              result={scanResult}
              onReset={handleReset}
              onExport={handleExport}
              onSanitize={handleOpenSanitizer}
            />
            
            <SeverityOverview counts={scanResult.counts} />

            <SecurityMatrix result={scanResult} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-6 space-y-6">
                <FindingsList
                  findings={scanResult.findings}
                  selectedFinding={selectedFinding}
                  onSelectFinding={setSelectedFinding}
                />
              </div>
              <div className="lg:col-span-6 sticky top-24">
                <CodeView
                  content={skillContent}
                  findings={scanResult.findings}
                  selectedFinding={selectedFinding}
                  onSelectFinding={setSelectedFinding}
                />
              </div>
            </div>

            <Summary result={scanResult} />

            {sanitizationResult && (
              <SanitizerModal
                originalContent={skillContent}
                sanitizationResult={sanitizationResult}
                fileName={fileName}
                onClose={() => setSanitizationResult(null)}
              />
            )}
          </div>
        )}
      </main>

      {/* Security Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-slate-400">Don't execute an agent skill until you know what it does.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>LatentCode Harness</span>
            <span>•</span>
            <span>SkillPatch Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
