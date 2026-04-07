import React, { useState, useEffect } from 'react';
import { useConfigStore } from './store/useConfigStore';
import { formatSql } from './formatter';
import { 
  Settings2, 
  Check, 
  Database, 
  FileCode2,
  ExternalLink,
  Code,
  X,
  Zap,
  RotateCcw,
  Sliders
} from 'lucide-react';
import Editor from 'react-simple-code-editor';
import * as Prism from 'prismjs';
import 'prismjs/components/prism-sql';
import 'prismjs/themes/prism.css'; 

// Fix for potentially incompatible default exports in production builds
const CodeEditor = (Editor as any).default || Editor;

const highlightWithLineNumbers = (input: string) => {
  const lang = Prism.languages.sql;
  if (!lang) return input;
  return Prism.highlight(input, lang, 'sql');
};

const App: React.FC = () => {
  const { config, updateConfig } = useConfigStore();
  const [inputSql, setInputSql] = useState('');
  const [formattedSql, setFormattedSql] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      setFormattedSql(formatSql(inputSql, config));
    } catch (e) {
      console.error("Formatting error:", e);
    }
  }, [inputSql, config]);

  const handleCopy = () => {
    if (!formattedSql) return;
    navigator.clipboard.writeText(formattedSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => setInputSql('');

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-100 overflow-hidden relative">
      
      {/* Navbar - Simple, Dark, Professional */}
      <header className="h-14 shrink-0 bg-[#0f172a] border-b border-white/5 px-6 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Database size={16} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xs font-black tracking-[0.2em] text-white uppercase leading-none">
              Spark SQL <span className="text-indigo-400">Refinery</span>
            </h1>
            <span className="text-[8px] font-bold text-slate-500 tracking-widest mt-1 uppercase">Pro Studio Edition</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-black text-slate-400 hover:text-white hover:bg-white/10 rounded transition-all uppercase tracking-widest"
          >
            <Sliders size={14} />
            Configure
          </button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button 
            onClick={handleCopy}
            disabled={!formattedSql}
            className={`flex items-center gap-2 px-5 py-1.5 text-[10px] font-black rounded transition-all active:scale-[0.98] uppercase tracking-widest shadow-xl ${
              copied 
                ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/30 disabled:opacity-30 disabled:pointer-events-none'
            }`}
          >
            {copied ? <Check size={14} strokeWidth={3} /> : <Zap size={14} fill="currentColor" />}
            <span>{copied ? 'Copied' : 'Format & Copy'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace - 50/50 Split */}
      <main className="flex-1 flex min-h-0 relative">
        
        {/* Left: Input */}
        <div className="flex-1 flex flex-col min-w-0 bg-white border-r border-slate-200 shadow-sm">
          <div className="h-10 shrink-0 flex items-center justify-between px-5 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Code size={12} strokeWidth={3} className="text-indigo-500" />
              Source Input
            </div>
            <button 
              onClick={handleClear}
              className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-tight"
            >
              <RotateCcw size={10} />
              Reset
            </button>
          </div>
          <div className="flex-1 relative overflow-auto custom-scrollbar">
            <CodeEditor
              value={inputSql}
              onValueChange={(code: string) => setInputSql(code)}
              highlight={(code: string) => highlightWithLineNumbers(code)}
              padding={24}
              style={{
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                fontSize: 12,
                minHeight: '100%',
                lineHeight: '1.6',
                color: '#334155',
              }}
              className="focus:outline-none min-h-full"
              textareaClassName="focus:outline-none"
              placeholder="-- Paste raw SQL here..."
            />
          </div>
        </div>

        {/* Right: Output */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#fdfdfd]">
          <div className="h-10 shrink-0 flex items-center justify-between px-5 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <FileCode2 size={12} strokeWidth={3} className="text-emerald-500" />
              Formatted Result
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Read Only</span>
            </div>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar">
            <div className="min-h-full bg-[#f8fafc]/30">
              <CodeEditor
                value={formattedSql || '-- Output will appear here'}
                onValueChange={() => {}}
                highlight={(code: string) => highlightWithLineNumbers(code)}
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

      {/* Floating Settings Drawer */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
          {/* Overlay */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
          
          {/* Drawer */}
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in-right overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white">
                  <Settings2 size={16} />
                </div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                  Preferences
                </h2>
              </div>
              <button 
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-12">
              
              <SettingsCategory title="General Layout">
                <ModernSwitch 
                  label="Convert Tabs to Spaces" 
                  description="Maintains consistent indentation across all editors."
                  value={config.noTabs} 
                  onChange={(v) => updateConfig({ noTabs: v })} 
                />
                <ModernSwitch 
                  label="Compact Representation" 
                  description="Removes all unnecessary empty lines for a denser view."
                  value={config.noEmptyLines} 
                  onChange={(v) => updateConfig({ noEmptyLines: v })} 
                />
                
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700 uppercase">Indentation Size</span>
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{config.indentSize} spaces</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[2, 4, 8].map(size => (
                      <button 
                        key={size}
                        onClick={() => updateConfig({ indentSize: size })}
                        className={`py-2 rounded border text-[10px] font-black transition-all ${
                          config.indentSize === size 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                            : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </SettingsCategory>

              <SettingsCategory title="Content Casing">
                <ModernSwitch 
                  label="Keywords to UPPERCASE" 
                  value={config.keywordUppercase} 
                  onChange={(v) => updateConfig({ keywordUppercase: v })} 
                />
                <ModernSwitch 
                  label="Functions to UPPERCASE" 
                  value={config.functionUppercase} 
                  onChange={(v) => updateConfig({ functionUppercase: v })} 
                />
                <ModernSwitch 
                  label="Identifiers to lowercase" 
                  value={config.fieldLowercase} 
                  onChange={(v) => updateConfig({ fieldLowercase: v, tableLowercase: v })} 
                />
              </SettingsCategory>

              <SettingsCategory title="Structural Logic">
                <ModernSwitch 
                  label="Right-align Top-level Keywords" 
                  description="Aligns SELECT, FROM, WHERE, etc. to the right for vertical content alignment."
                  value={config.alignKeywords} 
                  onChange={(v) => updateConfig({ alignKeywords: v })} 
                />
                <ModernSwitch 
                  label="Smart WHERE/JOIN Breaks" 
                  value={config.newlineWhere} 
                  onChange={(v) => updateConfig({ newlineWhere: v, newlineJoin: v })} 
                />
                <ModernSwitch 
                  label="Split GROUP/ORDER clauses" 
                  value={config.newlineGroupBy} 
                  onChange={(v) => updateConfig({ newlineGroupBy: v, newlineOrderBy: v })} 
                />
                
                <div className="space-y-4 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-tighter">Line Complexity Limit</span>
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{config.selectFieldWrapLimit} chr</span>
                  </div>
                  <input 
                    type="range" min="40" max="120" step="10"
                    value={config.selectFieldWrapLimit} 
                    onChange={(e) => updateConfig({ selectFieldWrapLimit: parseInt(e.target.value) })}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer appearance-none border-none"
                  />
                  <p className="text-[10px] text-slate-400 italic">Determines when long SELECT or GROUP BY lists should wrap.</p>
                </div>
              </SettingsCategory>

            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50">
              <button 
                onClick={() => setShowSettings(false)}
                className="w-full py-3 bg-[#0f172a] text-white rounded font-black text-[11px] tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98] uppercase"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Micro-Footer */}
      <footer className="h-7 shrink-0 bg-slate-900 border-t border-white/5 px-5 flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest">
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5"><Database size={10} /> Engine: ANTLR4</span>
          <span className="flex items-center gap-1.5 text-indigo-400/60"><Zap size={10} /> Mode: Real-time</span>
        </div>
        <a href="https://github.com/wankunde/sql_formatter" className="hover:text-white transition-colors flex items-center gap-1">
          Open Source <ExternalLink size={8} />
        </a>
      </footer>
    </div>
  );
};

const SettingsCategory: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div className="flex flex-col gap-5">
    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600/60 flex items-center gap-2">
      <span className="w-1.5 h-[1px] bg-indigo-600/30" />
      {title}
    </h3>
    <div className="space-y-5">
      {children}
    </div>
  </div>
);

const ModernSwitch: React.FC<{ label: string, description?: string, value: boolean, onChange: (v: boolean) => void }> = ({ label, description, value, onChange }) => (
  <div 
    className="flex items-start justify-between group cursor-pointer" 
    onClick={() => onChange(!value)}
  >
    <div className="flex flex-col gap-0.5 max-w-[80%]">
      <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{label}</span>
      {description && <p className="text-[10px] text-slate-400 leading-tight pr-4">{description}</p>}
    </div>
    <div className={`shrink-0 w-9 h-5 rounded-full p-1 transition-all duration-300 shadow-inner ${value ? 'bg-indigo-600 shadow-indigo-200' : 'bg-slate-200'}`}>
      <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-300 shadow-sm ${value ? 'translate-x-4' : 'translate-x-0'}`} />
    </div>
  </div>
);

export default App;
