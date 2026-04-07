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
  Code
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm shadow-slate-200/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Database size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 leading-tight">
              Spark SQL <span className="text-indigo-600 font-extrabold uppercase text-[10px] ml-1 tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">Formatter</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleClear}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all active:scale-95"
            title="Clear"
          >
            <Trash2 size={19} />
          </button>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all"
          >
            <Settings2 size={18} />
            <span>Settings</span>
          </button>
          <button 
            onClick={handleCopy}
            disabled={!formattedSql}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-lg transition-all shadow-sm active:scale-[0.98] ${
              copied 
                ? 'bg-emerald-500 text-white shadow-emerald-100' 
                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200 disabled:opacity-40 disabled:pointer-events-none'
            }`}
          >
            {copied ? <Check size={17} strokeWidth={3} /> : <Copy size={17} strokeWidth={2.5} />}
            <span>{copied ? 'Copied' : 'Copy SQL'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col p-6 max-w-[1800px] mx-auto w-full gap-6 overflow-hidden">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
          
          {/* Input Area */}
          <div className="flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-3 px-1">
              <Code size={14} className="text-indigo-500" />
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Input SQL Source</h2>
            </div>
            <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-focus-within focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50">
              <textarea
                value={inputSql}
                onChange={(e) => setInputSql(e.target.value)}
                className="w-full h-full p-6 font-mono text-[14px] leading-relaxed text-slate-800 placeholder:text-slate-300 resize-none focus:outline-none"
                placeholder="-- Paste your unformatted Spark SQL here..."
                spellCheck={false}
              />
            </div>
          </div>

          {/* Output Area */}
          <div className="flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-3 px-1">
              <FileCode2 size={14} className="text-emerald-500" />
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Formatted Result</h2>
            </div>
            <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-slate-300 transition-colors">
              <div className="h-full overflow-auto custom-scrollbar">
                <SyntaxHighlighter
                  language="sql"
                  style={tomorrow}
                  showLineNumbers={true}
                  wrapLines={true}
                  customStyle={{
                    margin: 0,
                    padding: '1.5rem',
                    backgroundColor: 'transparent',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                  }}
                  lineNumberStyle={{
                    minWidth: '3em',
                    paddingRight: '1.5em',
                    color: '#cbd5e1',
                    textAlign: 'right',
                    userSelect: 'none',
                    fontSize: '12px',
                  }}
                >
                  {formattedSql || '-- No output yet'}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        </div>

        {/* Status Footer */}
        <div className="flex items-center justify-between py-2 px-1 text-slate-400 border-t border-slate-200 mt-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[11px] font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              SQL Integrity Verified
            </div>
            <div className="group relative flex items-center gap-1.5 text-[11px] font-medium hover:text-slate-600 transition-colors cursor-help">
              <Info size={13} />
              Formatting Policy
              <div className="absolute bottom-full left-0 mb-2 w-72 p-4 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all text-[11px] text-slate-500 leading-relaxed z-50">
                <p className="font-bold text-slate-900 mb-1">Standard Logic:</p>
                - Keywords & Functions normalization<br />
                - Subquery recursive indentation<br />
                - Clause-specific line breaks (WHERE, JOIN, etc.)<br />
                - Comma-delimited SELECT wrapping
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter text-slate-300">
            Powered by Antlr4 Parser
            <ExternalLink size={10} className="ml-1" />
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowSettings(false)}>
          <div 
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Settings2 size={20} className="text-indigo-600" />
                Format Settings
              </h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors text-slate-400"
              >
                &times;
              </button>
            </div>

            <div className="p-8 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
              
              <SettingsGroup title="Basic Syntax">
                <MinimalToggle label="Use spaces instead of tabs" value={config.noTabs} onChange={(v) => updateConfig({ noTabs: v })} />
                <MinimalToggle label="No empty lines (Compact)" value={config.noEmptyLines} onChange={(v) => updateConfig({ noEmptyLines: v })} />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-medium text-slate-700">Indentation</span>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    {[2, 4, 8].map(size => (
                      <button 
                        key={size}
                        onClick={() => updateConfig({ indentSize: size })}
                        className={`w-9 h-7 rounded text-[11px] font-bold transition-all ${config.indentSize === size ? 'bg-white shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </SettingsGroup>

              <SettingsGroup title="Case Normalization">
                <MinimalToggle label="Uppercase Keywords" value={config.keywordUppercase} onChange={(v) => updateConfig({ keywordUppercase: v })} />
                <MinimalToggle label="Uppercase Functions" value={config.functionUppercase} onChange={(v) => updateConfig({ functionUppercase: v })} />
                <MinimalToggle label="Lowercase Identifiers" value={config.fieldLowercase} onChange={(v) => updateConfig({ fieldLowercase: v, tableLowercase: v })} />
              </SettingsGroup>

              <SettingsGroup title="Layout & Logic">
                <MinimalToggle label="Newlines for WHERE clauses" value={config.newlineWhere} onChange={(v) => updateConfig({ newlineWhere: v })} />
                <MinimalToggle label="Newlines for JOIN clauses" value={config.newlineJoin} onChange={(v) => updateConfig({ newlineJoin: v })} />
                <MinimalToggle label="Multi-line GROUP/ORDER BY" value={config.newlineGroupBy} onChange={(v) => updateConfig({ newlineGroupBy: v, newlineOrderBy: v })} />
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-medium text-slate-700">Line Wrap limit</span>
                    <span className="text-[11px] font-mono font-bold text-indigo-600">{config.selectFieldWrapLimit} chr</span>
                  </div>
                  <input 
                    type="range" min="40" max="240" step="10"
                    value={config.selectFieldWrapLimit} 
                    onChange={(e) => updateConfig({ selectFieldWrapLimit: parseInt(e.target.value) })}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                  />
                </div>
              </SettingsGroup>

            </div>

            <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsGroup: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div className="flex flex-col gap-4">
    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const MinimalToggle: React.FC<{ label: string, value: boolean, onChange: (v: boolean) => void }> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between group cursor-pointer" onClick={() => onChange(!value)}>
    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{label}</span>
    <div className={`w-10 h-5.5 rounded-full p-1 transition-colors duration-300 ${value ? 'bg-indigo-600' : 'bg-slate-200'}`}>
      <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform duration-300 shadow-sm ${value ? 'translate-x-4.5' : 'translate-x-0'}`} />
    </div>
  </div>
);

export default App;
