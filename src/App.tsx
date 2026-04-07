import React, { useState, useEffect } from 'react';
import { useConfigStore } from './store/useConfigStore';
import { formatSql } from './formatter';
import { 
  Settings2, 
  Trash2, 
  Copy, 
  Check, 
  Database, 
  FileCode2,
  Info,
  ExternalLink,
  Code,
  Maximize2
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// Switching to a high-contrast light theme for better clarity
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
    <div className="h-screen bg-white flex flex-col font-sans text-slate-900 selection:bg-indigo-100 overflow-hidden">
      
      {/* Navbar - More compact and professional */}
      <header className="h-14 shrink-0 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center text-white shadow-sm">
            <Database size={16} strokeWidth={2.5} />
          </div>
          <h1 className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Spark SQL <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider border border-indigo-100/50">Studio</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleClear}
            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-all"
            title="Clear All"
          >
            <Trash2 size={18} />
          </button>
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-all"
          >
            <Settings2 size={14} strokeWidth={2.5} />
            SETTINGS
          </button>
          <button 
            onClick={handleCopy}
            disabled={!formattedSql}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-black rounded transition-all active:scale-[0.98] ${
              copied 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100 disabled:opacity-30 disabled:pointer-events-none'
            }`}
          >
            {copied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} strokeWidth={2.5} />}
            <span>{copied ? 'COPIED' : 'FORMAT & COPY'}</span>
          </button>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="flex-1 flex min-h-0 bg-slate-50/50">
        
        {/* Left: Input */}
        <div className="flex-1 flex flex-col border-r border-slate-200 min-w-0">
          <div className="h-10 shrink-0 flex items-center justify-between px-4 bg-white/80 border-b border-slate-100">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
              <Code size={12} strokeWidth={3} className="text-indigo-500" />
              Source Input
            </div>
            <div className="text-[9px] font-bold text-slate-300">SPARK_SQL_V3</div>
          </div>
          <div className="flex-1 relative bg-white">
            <textarea
              value={inputSql}
              onChange={(e) => setInputSql(e.target.value)}
              className="absolute inset-0 w-full h-full p-6 font-mono text-[14px] leading-relaxed text-slate-800 placeholder:text-slate-300 resize-none focus:outline-none bg-transparent"
              placeholder="-- Paste SQL here..."
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right: Output */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-10 shrink-0 flex items-center justify-between px-4 bg-white/80 border-b border-slate-100">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
              <FileCode2 size={12} strokeWidth={3} className="text-emerald-500" />
              Formatted Result
            </div>
            <button className="text-slate-300 hover:text-slate-500 transition-colors">
              <Maximize2 size={12} />
            </button>
          </div>
          <div className="flex-1 bg-[#fafafa] overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto custom-scrollbar shadow-inner">
              <SyntaxHighlighter
                language="sql"
                style={oneLight}
                showLineNumbers={true}
                wrapLines={true}
                customStyle={{
                  margin: 0,
                  padding: '1.5rem',
                  backgroundColor: 'transparent',
                  fontSize: '14px',
                  lineHeight: '1.7',
                  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                  fontWeight: 500, // Slightly bolder for better clarity
                }}
                lineNumberStyle={{
                  minWidth: '3.5em',
                  paddingRight: '1.5em',
                  color: '#cbd5e1',
                  textAlign: 'right',
                  userSelect: 'none',
                  fontSize: '12px',
                  fontStyle: 'italic'
                }}
              >
                {formattedSql || '-- No output yet'}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      </main>

      {/* Subtle Footer Bar */}
      <footer className="h-8 shrink-0 bg-white border-t border-slate-200 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            SYNTAX READY
          </div>
          <div className="group relative flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-help">
            <Info size={10} strokeWidth={3} />
            LOGIC POLICY
            <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-white border border-slate-200 rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all text-[10px] text-slate-500 font-medium normal-case leading-normal z-50">
              Antlr4-based formatting with subquery nesting and keyword normalization.
            </div>
          </div>
        </div>
        <div className="text-[9px] font-black text-slate-300 uppercase tracking-tighter flex items-center gap-1">
          ANtlr4 Engine <ExternalLink size={8} />
        </div>
      </footer>

      {/* Settings Modal - Focused and Professional */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-xs animate-fade-in" onClick={() => setShowSettings(false)}>
          <div 
            className="w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                <Settings2 size={16} className="text-indigo-600" />
                Format Configuration
              </h2>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-900 text-xl font-light">&times;</button>
            </div>

            <div className="p-6 space-y-8">
              <SettingsGroup title="Core Rules">
                <MinimalToggle label="Use spaces (no tabs)" value={config.noTabs} onChange={(v) => updateConfig({ noTabs: v })} />
                <MinimalToggle label="Compact mode" value={config.noEmptyLines} onChange={(v) => updateConfig({ noEmptyLines: v })} />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-slate-600">Indent Size</span>
                  <div className="flex bg-slate-100 p-0.5 rounded">
                    {[2, 4, 8].map(size => (
                      <button 
                        key={size}
                        onClick={() => updateConfig({ indentSize: size })}
                        className={`px-3 py-1 rounded text-[10px] font-black transition-all ${config.indentSize === size ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </SettingsGroup>

              <SettingsGroup title="Casing">
                <MinimalToggle label="UPPERCASE Keywords" value={config.keywordUppercase} onChange={(v) => updateConfig({ keywordUppercase: v })} />
                <MinimalToggle label="UPPERCASE Functions" value={config.functionUppercase} onChange={(v) => updateConfig({ functionUppercase: v })} />
                <MinimalToggle label="lowercase identifiers" value={config.fieldLowercase} onChange={(v) => updateConfig({ fieldLowercase: v, tableLowercase: v })} />
              </SettingsGroup>

              <SettingsGroup title="Layout">
                <MinimalToggle label="WHERE / JOIN Newlines" value={config.newlineWhere} onChange={(v) => updateConfig({ newlineWhere: v, newlineJoin: v })} />
                <MinimalToggle label="GROUP / ORDER BY Newlines" value={config.newlineGroupBy} onChange={(v) => updateConfig({ newlineGroupBy: v, newlineOrderBy: v })} />
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-600">Max Line Length</span>
                    <span className="text-[10px] font-mono font-black text-indigo-600">{config.selectFieldWrapLimit}</span>
                  </div>
                  <input 
                    type="range" min="40" max="240" step="10"
                    value={config.selectFieldWrapLimit} 
                    onChange={(e) => updateConfig({ selectFieldWrapLimit: parseInt(e.target.value) })}
                    className="w-full accent-indigo-600 h-1 bg-slate-100 rounded-lg cursor-pointer appearance-none"
                  />
                </div>
              </SettingsGroup>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-6 py-2 bg-slate-900 text-white rounded text-[11px] font-black tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
              >
                SAVE & CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsGroup: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div className="flex flex-col gap-3">
    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-1.5">{title}</h3>
    <div className="space-y-2.5">
      {children}
    </div>
  </div>
);

const MinimalToggle: React.FC<{ label: string, value: boolean, onChange: (v: boolean) => void }> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between group cursor-pointer" onClick={() => onChange(!value)}>
    <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{label}</span>
    <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 ${value ? 'bg-indigo-600' : 'bg-slate-200'}`}>
      <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform duration-200 shadow-sm ${value ? 'translate-x-3.5' : 'translate-x-0'}`} />
    </div>
  </div>
);

export default App;
