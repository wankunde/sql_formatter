import React, { useState, useEffect } from 'react';
import { useConfigStore } from './store/useConfigStore';
import { formatSql } from './formatter';
import { 
  Settings2, 
  Check, 
  Database, 
  FileCode2,
  Code,
  X,
  Zap,
  Sliders
} from 'lucide-react';
import Editor from 'react-simple-code-editor';
import * as Prism from 'prismjs';
import 'prismjs/components/prism-sql';
import 'prismjs/themes/prism.css'; 

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

  const LineNumbers = ({ content }: { content: string }) => {
    const lines = content.split('\n');
    return (
      <div className="flex flex-col text-right pr-4 pt-[24px] select-none text-slate-300 font-mono text-[12px] leading-[1.6] bg-slate-50/50 border-r border-slate-100 shrink-0 min-w-[45px]">
        {lines.map((_, i) => (
          <div key={i} className="h-[19.2px]">{i + 1}</div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-screen bg-white flex flex-col font-sans text-slate-900 selection:bg-indigo-100 overflow-hidden relative">
      
      {/* Ultra-slim Navbar - Clean and Professional */}
      <header className="h-10 shrink-0 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          <Database size={14} className="text-indigo-600" strokeWidth={3} />
          <h1 className="text-[11px] font-black tracking-widest text-slate-900 uppercase">
            SQL <span className="text-indigo-600">Refinery</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
            SPARK 3.5
          </div>
          <div className="w-px h-3 bg-slate-200" />
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase"
          >
            <Sliders size={12} strokeWidth={2.5} />
            Config
          </button>
          <button 
            onClick={handleCopy}
            disabled={!formattedSql}
            className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded transition-all active:scale-95 ${
              copied 
                ? 'text-emerald-600' 
                : 'text-indigo-600 hover:bg-indigo-50 disabled:opacity-30'
            }`}
          >
            {copied ? <Check size={12} strokeWidth={3} /> : <Zap size={12} strokeWidth={2.5} />}
            {copied ? 'COPIED' : 'FORMAT & COPY'}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex min-h-0">
        
        {/* Left: Input */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200">
          <div className="h-8 shrink-0 flex items-center justify-between px-4 bg-slate-50 border-b border-slate-200/60">
            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              <Code size={10} strokeWidth={3} />
              Source SQL
            </div>
            <button 
              onClick={handleClear}
              className="text-[9px] font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase"
            >
              Clear
            </button>
          </div>
          <div className="flex-1 flex overflow-hidden">
            <LineNumbers content={inputSql} />
            <div className="flex-1 relative overflow-auto custom-scrollbar bg-white">
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
        </div>

        {/* Right: Output */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#fdfdfd]">
          <div className="h-8 shrink-0 flex items-center justify-between px-4 bg-slate-50 border-b border-slate-200/60">
            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              <FileCode2 size={10} strokeWidth={3} />
              Refined Output
            </div>
            <div className="text-[9px] font-black text-slate-300 uppercase italic">Immutable</div>
          </div>
          <div className="flex-1 flex overflow-hidden">
            <LineNumbers content={formattedSql} />
            <div className="flex-1 overflow-auto custom-scrollbar">
              <div className="min-h-full bg-[#f8fafc]/30">
                <CodeEditor
                  value={formattedSql || '-- No output'}
                  onValueChange={() => {}}
                  highlight={(code: string) => highlightWithLineNumbers(code)}
                  padding={24}
                  readOnly
                  style={{
                    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                    fontSize: 12,
                    lineHeight: '1.6',
                    color: '#0f172a',
                    fontWeight: 500,
                  }}
                  className="min-h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Settings Drawer */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Overlay - Darker and clearer */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" 
            onClick={() => setShowSettings(false)} 
          />
          
          {/* Drawer - Explicitly solid white background */}
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in-right border-l border-slate-200 z-10">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white">
                  <Settings2 size={16} />
                </div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Preferences</h2>
              </div>
              <button 
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              <SettingsCategory title="Editor Layout">
                <ModernSwitch label="Use Spaces" value={config.noTabs} onChange={(v) => updateConfig({ noTabs: v })} />
                <ModernSwitch label="Compact View" value={config.noEmptyLines} onChange={(v) => updateConfig({ noEmptyLines: v })} />
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Indent Size</span>
                  <div className="flex bg-slate-100 rounded p-0.5">
                    {[2, 4].map(s => (
                      <button key={s} onClick={() => updateConfig({ indentSize: s })} className={`px-3 py-1 text-[10px] font-bold rounded ${config.indentSize === s ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>{s}</button>
                    ))}
                  </div>
                </div>
              </SettingsCategory>

              <SettingsCategory title="Sql Style">
                <ModernSwitch label="Upper Keywords" value={config.keywordUppercase} onChange={(v) => updateConfig({ keywordUppercase: v })} />
                <ModernSwitch label="Upper Functions" value={config.functionUppercase} onChange={(v) => updateConfig({ functionUppercase: v })} />
                <ModernSwitch label="Lower Identifiers" value={config.fieldLowercase} onChange={(v) => updateConfig({ fieldLowercase: v, tableLowercase: v })} />
              </SettingsCategory>

              <SettingsCategory title="Alignment">
                <ModernSwitch label="Keyword Alignment" value={config.alignKeywords} onChange={(v) => updateConfig({ alignKeywords: v })} />
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                    <span>Line Wrap</span>
                    <span className="text-indigo-600">{config.selectFieldWrapLimit} chr</span>
                  </div>
                  <input type="range" min="40" max="120" step="10" value={config.selectFieldWrapLimit} onChange={(e) => updateConfig({ selectFieldWrapLimit: parseInt(e.target.value) })} className="w-full accent-indigo-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer" />
                </div>
              </SettingsCategory>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button onClick={() => setShowSettings(false)} className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold text-[10px] tracking-widest hover:bg-slate-800 transition-all uppercase">Apply & Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsCategory: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-4">
    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600/50">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const ModernSwitch: React.FC<{ label: string, value: boolean, onChange: (v: boolean) => void }> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between group cursor-pointer" onClick={() => onChange(!value)}>
    <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{label}</span>
    <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 ${value ? 'bg-indigo-600' : 'bg-slate-200'}`}>
      <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform duration-200 shadow-sm ${value ? 'translate-x-3.5' : 'translate-x-0'}`} />
    </div>
  </div>
);

export default App;
