import React, { useState, useEffect } from 'react';
import { useConfigStore } from './store/useConfigStore';
import { formatSql } from './formatter';
import { 
  Settings2, 
  Copy, 
  Check, 
  Database, 
  FileCode2,
  ExternalLink,
  Code,
  Layout,
  Type,
  AlignLeft,
  X,
  Zap
} from 'lucide-react';
import Editor from 'react-simple-code-editor';
import * as Prism from 'prismjs';
import 'prismjs/components/prism-sql';
import 'prismjs/themes/prism.css'; 

const highlightWithLineNumbers = (input: string, language: any, label: string) => {
  if (!language) return input;
  return Prism.highlight(input, language, label);
};

const App: React.FC = () => {
  const { config, updateConfig } = useConfigStore();
  const [inputSql, setInputSql] = useState('');
  const [formattedSql, setFormattedSql] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setFormattedSql(formatSql(inputSql, config));
  }, [inputSql, config]);

  const handleCopy = () => {
    if (!formattedSql) return;
    navigator.clipboard.writeText(formattedSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => setInputSql('');

  return (
    <div className="h-screen bg-[#f1f3f5] flex flex-col font-sans text-slate-900 selection:bg-indigo-100 overflow-hidden">
      
      {/* Navbar - Ultra minimalist and grand */}
      <header className="h-14 shrink-0 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between z-40 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 rotate-3">
            <Zap size={18} fill="currentColor" strokeWidth={0} />
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-sm font-black tracking-tight text-white uppercase italic">
              Spark SQL <span className="text-indigo-400 not-italic">Refinery</span>
            </h1>
            <span className="text-[9px] font-bold text-slate-500 tracking-[0.2em] border-l border-slate-700 pl-2">V3.5.0</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-black text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-all uppercase tracking-widest"
          >
            <Settings2 size={14} strokeWidth={2.5} />
            Config
          </button>
          <div className="w-px h-4 bg-slate-800 mx-1" />
          <button 
            onClick={handleCopy}
            disabled={!formattedSql}
            className={`flex items-center gap-2 px-5 py-1.5 text-[10px] font-black rounded-md transition-all active:scale-[0.98] uppercase tracking-widest ${
              copied 
                ? 'bg-emerald-500 text-white' 
                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 disabled:opacity-30 disabled:pointer-events-none'
            }`}
          >
            {copied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} strokeWidth={2.5} />}
            <span>{copied ? 'Copied' : 'Format & Export'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace - 50/50 Split */}
      <main className="flex-1 flex min-h-0 relative">
        
        {/* Left: Input with Highlighting */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <div className="h-9 shrink-0 flex items-center justify-between px-4 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">
              <Code size={12} strokeWidth={3} className="text-indigo-500" />
              Source SQL
            </div>
            <button 
              onClick={handleClear}
              className="text-[9px] font-bold text-slate-400 hover:text-rose-500 uppercase transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="flex-1 relative overflow-auto custom-scrollbar">
            <Editor
              value={inputSql}
              onValueChange={code => setInputSql(code)}
              highlight={code => highlightWithLineNumbers(code, Prism.languages.sql, 'sql')}
              padding={24}
              style={{
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                fontSize: 12,
                minHeight: '100%',
                lineHeight: '1.6',
                color: '#1e293b',
              }}
              className="focus:outline-none min-h-full"
              textareaClassName="focus:outline-none"
              placeholder="-- Paste raw SQL here..."
            />
          </div>
        </div>

        {/* Right: Output with Clear Formatting */}
        <div className="flex-1 flex flex-col min-w-0 border-l border-slate-200 bg-[#f8fafc]">
          <div className="h-9 shrink-0 flex items-center justify-between px-4 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">
              <FileCode2 size={12} strokeWidth={3} className="text-emerald-500" />
              Refined Output
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              <span className="text-[9px] font-black text-slate-300 uppercase italic">Immutable</span>
            </div>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar bg-slate-50/30">
            <div className="min-h-full">
              <Editor
                value={formattedSql || '-- No output generated'}
                onValueChange={() => {}}
                highlight={code => highlightWithLineNumbers(code, Prism.languages.sql, 'sql')}
                padding={24}
                readOnly
                style={{
                  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                  fontSize: 12,
                  lineHeight: '1.7',
                  color: '#0f172a',
                  fontWeight: 500,
                }}
                className="min-h-full"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="h-7 shrink-0 bg-slate-100 border-t border-slate-200 px-4 flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <Database size={10} />
            Apache Spark Grammar
          </div>
          <div className="flex items-center gap-1.5">
            <AlignLeft size={10} />
            WRAP: {config.selectFieldWrapLimit} CHR
          </div>
        </div>
        <a href="https://github.com/wankunde/sql_formatter" className="text-[9px] font-black hover:text-indigo-600 transition-colors flex items-center gap-1">
          REFINERY GITHUB <ExternalLink size={8} />
        </a>
      </footer>

      {/* Settings Modal - Professional Redesign */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setShowSettings(false)}>
          <div 
            className="w-full max-w-2xl bg-white rounded-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden border border-slate-200 flex"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Sidebar */}
            <div className="w-48 bg-slate-50 border-r border-slate-100 p-6 flex flex-col gap-8 shrink-0">
              <div className="flex flex-col gap-1">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white mb-2">
                  <Settings2 size={16} />
                </div>
                <h3 className="text-xs font-black text-slate-900 uppercase">Configuration</h3>
              </div>
              <nav className="flex flex-col gap-2">
                <button className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-md text-left flex items-center gap-2">
                  <Layout size={12} /> LAYOUT
                </button>
                <button className="text-[10px] font-bold text-slate-400 hover:text-slate-600 px-3 py-2 rounded-md text-left flex items-center gap-2">
                  <Type size={12} /> CASING
                </button>
              </nav>
            </div>

            {/* Modal Content */}
            <div className="flex-1 flex flex-col">
              <div className="p-8 space-y-10">
                <SettingsGroup title="Core Layout Rules">
                  <MinimalToggle label="Use spaces instead of tabs" value={config.noTabs} onChange={(v) => updateConfig({ noTabs: v })} />
                  <MinimalToggle label="Compact SQL (No empty lines)" value={config.noEmptyLines} onChange={(v) => updateConfig({ noEmptyLines: v })} />
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-slate-600">Line Wrap limit</span>
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{config.selectFieldWrapLimit} characters</span>
                    </div>
                    <input 
                      type="range" min="40" max="160" step="10"
                      value={config.selectFieldWrapLimit} 
                      onChange={(e) => updateConfig({ selectFieldWrapLimit: parseInt(e.target.value) })}
                      className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer appearance-none"
                    />
                  </div>
                </SettingsGroup>

                <SettingsGroup title="Normalization">
                  <MinimalToggle label="UPPERCASE Keywords" value={config.keywordUppercase} onChange={(v) => updateConfig({ keywordUppercase: v })} />
                  <MinimalToggle label="UPPERCASE Functions" value={config.functionUppercase} onChange={(v) => updateConfig({ functionUppercase: v })} />
                  <MinimalToggle label="lowercase identifiers" value={config.fieldLowercase} onChange={(v) => updateConfig({ fieldLowercase: v, tableLowercase: v })} />
                </SettingsGroup>

                <SettingsGroup title="Auto Line Breaks">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                    <MinimalToggle label="WHERE / JOIN" value={config.newlineWhere} onChange={(v) => updateConfig({ newlineWhere: v, newlineJoin: v })} />
                    <MinimalToggle label="GROUP / ORDER" value={config.newlineGroupBy} onChange={(v) => updateConfig({ newlineGroupBy: v, newlineOrderBy: v })} />
                  </div>
                </SettingsGroup>
              </div>

              <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="px-8 py-2.5 bg-slate-900 text-white rounded-lg text-[10px] font-black tracking-[0.2em] shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 uppercase"
                >
                  Confirm Changes
                </button>
              </div>
            </div>
            <button 
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsGroup: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div className="flex flex-col gap-4">
    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
      <div className="w-1 h-1 rounded-full bg-indigo-400" />
      {title}
    </h3>
    <div className="space-y-3.5">
      {children}
    </div>
  </div>
);

const MinimalToggle: React.FC<{ label: string, value: boolean, onChange: (v: boolean) => void }> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between group cursor-pointer" onClick={() => onChange(!value)}>
    <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{label}</span>
    <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-300 ${value ? 'bg-indigo-600' : 'bg-slate-200'}`}>
      <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform duration-300 shadow-sm ${value ? 'translate-x-3.5' : 'translate-x-0'}`} />
    </div>
  </div>
);

export default App;
