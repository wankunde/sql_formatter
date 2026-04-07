import React, { useState, useEffect } from 'react';
import { useConfigStore } from './store/useConfigStore';
import { formatSql } from './formatter';
import { 
  Settings2, 
  Trash2, 
  Terminal, 
  Check, 
  Code2, 
  Zap,
  Info,
  ChevronRight,
  Monitor
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
    <div className="relative min-h-screen selection:bg-primary/30 selection:text-primary-foreground font-sans">
      <div className="mesh-bg" />
      
      {/* Navbar */}
      <nav className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Code2 className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground leading-none mb-1">
                Spark SQL <span className="text-primary">Studio</span>
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Antlr4 Parser</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleClear}
              className="hidden sm:flex items-center gap-2 px-3 h-10 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all active:scale-95"
            >
              <Trash2 size={16} />
              Clear
            </button>
            <div className="w-px h-6 bg-border/60 mx-2" />
            <button 
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-4 h-10 rounded-lg text-sm font-medium border border-border bg-background hover:bg-secondary transition-all active:scale-95 shadow-sm"
            >
              <Settings2 size={16} className="text-muted-foreground" />
              Settings
            </button>
            <button 
              onClick={handleCopy}
              disabled={!formattedSql}
              className="flex items-center gap-2 px-5 h-10 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:pointer-events-none"
            >
              {copied ? <Check size={16} /> : <Zap size={16} />}
              {copied ? 'Copied' : 'Format & Copy'}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 animate-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
          
          {/* Editor Input */}
          <div className="flex flex-col group h-full">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                <Terminal size={14} className="text-primary" />
                Raw SQL Source
              </div>
              <span className="text-[10px] font-medium text-muted-foreground/60 bg-secondary/50 px-2 py-0.5 rounded uppercase">UTF-8</span>
            </div>
            <div className="relative flex-1 bg-card border border-border/60 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 group-hover:border-primary/30 group-focus-within:ring-2 ring-primary/20">
              <textarea
                value={inputSql}
                onChange={(e) => setInputSql(e.target.value)}
                className="absolute inset-0 w-full h-full bg-transparent p-6 font-mono text-[14px] sm:text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/30 resize-none focus:outline-none custom-scrollbar"
                placeholder="-- Paste your unformatted SQL here..."
                spellCheck={false}
              />
            </div>
          </div>

          {/* Formatted Output */}
          <div className="flex flex-col group h-full">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest font-mono">
                <Monitor size={14} className="text-primary" />
                Beauty Output
              </div>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
              </div>
            </div>
            <div className="relative flex-1 bg-slate-950 border border-border/60 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 group-hover:border-primary/30 glow-indigo">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="h-full overflow-auto custom-scrollbar">
                <SyntaxHighlighter
                  language="sql"
                  style={vscDarkPlus}
                  showLineNumbers={true}
                  wrapLines={true}
                  customStyle={{
                    margin: 0,
                    padding: '1.5rem',
                    backgroundColor: 'transparent',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                  lineNumberStyle={{
                    minWidth: '3.5em',
                    paddingRight: '1.5em',
                    color: 'rgba(255,255,255,0.15)',
                    textAlign: 'right',
                    userSelect: 'none',
                    fontSize: '12px',
                  }}
                >
                  {formattedSql || '-- No input provided'}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <footer className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-muted-foreground border-t border-border/40 pt-6">
          <div className="flex items-center gap-6 text-xs font-medium">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Spark SQL Grammar v3.5
            </div>
            <div className="flex items-center gap-2 hover:text-foreground transition-colors cursor-help group relative">
              <Info size={14} />
              Formatting Policy
              <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-popover border border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all text-[11px] leading-relaxed z-50">
                Automatically handles subquery nesting, function spacing, and clause alignment based on your custom configuration.
              </div>
            </div>
          </div>
          <p className="text-[11px] tracking-wide uppercase font-bold text-muted-foreground/40">
            Powered by Antlr4 & Tailwind CSS
          </p>
        </footer>
      </main>

      {/* Settings Panel (Drawer/Modal) */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-sm animate-in">
          <div 
            className="w-full max-w-4xl bg-card border border-border rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-secondary/30 p-8 border-b md:border-b-0 md:border-r border-border flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Settings</h2>
                <p className="text-xs text-muted-foreground mt-1">Configure your SQL formatter</p>
              </div>
              
              <nav className="flex flex-col gap-1">
                {['General', 'Casing', 'Layout', 'Advanced'].map((item) => (
                  <button key={item} className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${item === 'General' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}>
                    {item}
                    <ChevronRight size={14} className={item === 'General' ? 'opacity-100' : 'opacity-0'} />
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col max-h-[80vh] md:max-h-[600px]">
              <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                  
                  <SettingsGroup title="Basic Formatting">
                    <ModernToggle label="Use Spaces instead of Tabs" value={config.noTabs} onChange={(v) => updateConfig({ noTabs: v })} />
                    <ModernToggle label="Compact (No Empty Lines)" value={config.noEmptyLines} onChange={(v) => updateConfig({ noEmptyLines: v })} />
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm font-medium">Indent Size</span>
                      <div className="flex items-center bg-secondary/50 rounded-lg p-1">
                        {[2, 4].map(size => (
                          <button 
                            key={size}
                            onClick={() => updateConfig({ indentSize: size })}
                            className={`w-8 h-7 rounded md text-[11px] font-bold transition-all ${config.indentSize === size ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </SettingsGroup>

                  <SettingsGroup title="Casing Policy">
                    <ModernToggle label="UPPERCASE Keywords" value={config.keywordUppercase} onChange={(v) => updateConfig({ keywordUppercase: v })} />
                    <ModernToggle label="UPPERCASE Functions" value={config.functionUppercase} onChange={(v) => updateConfig({ functionUppercase: v })} />
                    <ModernToggle label="lowercase fields" value={config.fieldLowercase} onChange={(v) => updateConfig({ fieldLowercase: v })} />
                    <ModernToggle label="lowercase tables" value={config.tableLowercase} onChange={(v) => updateConfig({ tableLowercase: v })} />
                  </SettingsGroup>

                  <SettingsGroup title="Clause Structure">
                    <ModernToggle label="WHERE / HAVING Newlines" value={config.newlineWhere} onChange={(v) => updateConfig({ newlineWhere: v })} />
                    <ModernToggle label="JOIN Clause Newlines" value={config.newlineJoin} onChange={(v) => updateConfig({ newlineJoin: v })} />
                    <ModernToggle label="Multi-line GROUP BY" value={config.newlineGroupBy} onChange={(v) => updateConfig({ newlineGroupBy: v })} />
                    <ModernToggle label="Multi-line ORDER BY" value={config.newlineOrderBy} onChange={(v) => updateConfig({ newlineOrderBy: v })} />
                  </SettingsGroup>

                  <SettingsGroup title="Constraints">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-end">
                        <span className="text-sm font-medium">Line Wrap Limit</span>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{config.selectFieldWrapLimit} CHR</span>
                      </div>
                      <input 
                        type="range" 
                        min="20"
                        max="200"
                        step="10"
                        value={config.selectFieldWrapLimit} 
                        onChange={(e) => updateConfig({ selectFieldWrapLimit: parseInt(e.target.value) })}
                        className="w-full accent-primary h-1.5 bg-secondary rounded-lg cursor-pointer"
                      />
                    </div>
                  </SettingsGroup>

                </div>
              </div>

              <div className="p-6 border-t border-border bg-secondary/10 flex justify-end">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="px-8 py-3 bg-foreground text-background hover:opacity-90 rounded-2xl transition-all font-bold text-sm"
                >
                  Save & Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsGroup: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-4">
    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/60 mb-4">{title}</h3>
    <div className="space-y-3">
      {children}
    </div>
  </div>
);

const ModernToggle: React.FC<{ label: string, value: boolean, onChange: (v: boolean) => void }> = ({ label, value, onChange }) => (
  <div 
    className="flex items-center justify-between group cursor-pointer" 
    onClick={() => onChange(!value)}
  >
    <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">{label}</span>
    <div className={`w-10 h-5.5 rounded-full p-1 transition-all duration-300 ${value ? 'bg-primary' : 'bg-muted'}`}>
      <div className={`w-3.5 h-3.5 bg-white rounded-full transition-all duration-300 shadow-sm ${value ? 'translate-x-4.5' : 'translate-x-0'}`} />
    </div>
  </div>
);

export default App;
