import React, { useState } from 'react';
import { Globe, Search, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { fetchSkillFromSkillPatch } from '../scanner/skillpatchApi';

interface SkillPatchAuditorProps {
  onScanContent: (content: string, name?: string) => void;
}

export const SkillPatchAuditor: React.FC<SkillPatchAuditorProps> = ({ onScanContent }) => {
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFetchAndAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    const result = await fetchSkillFromSkillPatch(slug);
    setLoading(false);

    if (result.success && result.skillContent) {
      onScanContent(result.skillContent, `skillpatch-${result.slug}.md`);
    } else {
      setErrorMsg(result.error || 'Failed to retrieve skill from SkillPatch registry.');
    }
  };

  const handleQuickSelect = (quickSlug: string) => {
    setSlug(quickSlug);
    fetchSkillFromSkillPatch(quickSlug).then((res) => {
      if (res.success && res.skillContent) {
        onScanContent(res.skillContent, `skillpatch-${res.slug}.md`);
      } else {
        setErrorMsg(res.error || 'Failed to retrieve skill from SkillPatch registry.');
      }
    });
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-extrabold text-white">Audit SkillPatch Registry Skill</h2>
        </div>
        <span className="text-xs text-slate-500 font-mono">Live HTTP Fetch • Untrusted Text Sandbox</span>
      </div>

      <form onSubmit={handleFetchAndAudit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Enter SkillPatch slug (e.g. implement, research-deck, loop-me)"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors font-mono"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !slug.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Audit Registry
        </button>
      </form>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="font-semibold text-slate-500">Popular Registry Slugs:</span>
        <button
          type="button"
          onClick={() => handleQuickSelect('implement')}
          className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg text-slate-300 border border-slate-700/60 font-mono text-[11px] transition-colors"
        >
          implement
        </button>
        <button
          type="button"
          onClick={() => handleQuickSelect('research-deck')}
          className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg text-slate-300 border border-slate-700/60 font-mono text-[11px] transition-colors"
        >
          research-deck
        </button>
      </div>
    </div>
  );
};
