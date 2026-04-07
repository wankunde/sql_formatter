import React, { useState, useEffect } from 'react';
import { useConfigStore } from './store/useConfigStore';
import { formatSql } from './formatter';
import { Copy, Settings, Trash2, Sparkles, CheckCheck } from 'lucide-react';
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

  const handleClear = () => {
    setInputSql('');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-300 font-sans p-4 sm:p-8 flex flex-col items-center">
      
      {/* Header */}
      <header className="w-full max-w-7xl flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/20">
            <Sparkles className="text-white" size={24} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 tracking-tight">
            SQL Formatter
          </h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleClear}
            className="flex items-center justify-center p-2.5 sm:px-4 sm:py-2.5 text-sm font-medium rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:text-rose-400 hover:border-rose-900/50 transition-all duration-200 group"
            title="Clear Input"
          >
            <Trash2 size={18} className="sm:mr-2 group-hover:scale-110 transition-transform" /> 
            <span className="hidden sm:inline">Clear</span>
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center justify-center p-2.5 sm:px-4 sm:py-2.5 text-sm font-medium rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:text-indigo-400 hover:border-indigo-900/50 transition-all duration-200 group"
            title="Settings"
          >
            <Settings size={18} className="sm:mr-2 group-hover:rotate-45 transition-transform duration-300" />
            <span className="hidden sm:inline">Settings</span>
          </button>
          <button 
            onClick={handleCopy}
            className="flex items-center justify-center p-2.5 sm:px-5 sm:py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            {copied ? <CheckCheck size={18} className="sm:mr-2" /> : <Copy size={18} className="sm:mr-2" />}
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy SQL'}</span>
          </button>
        </div>
      </header>

      {/* Main Editor Grid */}
      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 flex-1 min-h-[600px] h-[calc(100vh-160px)]">
        
        {/* Input Panel */}
        <div className="flex flex-col h-full bg-[#1e1e24]/60 border border-slate-800/60 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm relative group transition-all duration-300 hover:border-indigo-500/30">
          {/* Mac-style Window Header */}
          <div className="h-12 bg-slate-900/80 border-b border-slate-800 flex items-center px-4 justify-between select-none">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-600"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600"></div>
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Input</span>
            <div className="w-12"></div> {/* Spacer for centering */}
          </div>
          
          <textarea
            value={inputSql}
            onChange={(e) => setInputSql(e.target.value)}
            className="flex-1 w-full bg-transparent p-6 font-mono text-sm sm:text-[15px] leading-relaxed text-slate-300 resize-none focus:outline-none focus:ring-0 custom-scrollbar"
            placeholder="Paste your unformatted Spark SQL here..."
            spellCheck={false}
          />
        </div>

        {/* Output Panel */}
        <div className="flex flex-col h-full bg-[#1e1e24]/60 border border-slate-800/60 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm relative group transition-all duration-300 hover:border-purple-500/30">
          {/* Mac-style Window Header */}
          <div className="h-12 bg-slate-900/80 border-b border-slate-800 flex items-center px-4 justify-between select-none">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-700"></div>
              <div className="w-3 h-3 rounded-full bg-slate-700"></div>
              <div className="w-3 h-3 rounded-full bg-slate-700"></div>
            </div>
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-widest">Formatted Output</span>
            <div className="w-12"></div> {/* Spacer */}
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar bg-transparent">
            <SyntaxHighlighter
              language="sql"
              style={vscDarkPlus}
              showLineNumbers={true}
              wrapLines={true}
              customStyle={{
                margin: 0,
                padding: '1.5rem',
                backgroundColor: 'transparent',
                fontSize: '0.9375rem',
                lineHeight: '1.6',
                minHeight: '100%',
              }}
              lineNumberStyle={{
                minWidth: '3em',
                paddingRight: '1.5em',
                color: '#475569',
                textAlign: 'right',
                userSelect: 'none',
              }}
            >
              {formattedSql || ' '}
            </SyntaxHighlighter>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl shadow-indigo-500/10 transform transition-all">
            
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-t-3xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="text-indigo-400" /> Formatting Preferences
              </h2>
              <button 
                onClick={() => setShowSettings(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                &times;
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                
                <SettingsSection title="General">
                  <SettingToggle label="No Tabs (Use Spaces)" value={config.noTabs} onChange={(v) => updateConfig({ noTabs: v })} />
                  <SettingToggle label="Remove Empty Lines" value={config.noEmptyLines} onChange={(v) => updateConfig({ noEmptyLines: v })} />
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm font-medium text-slate-300">Indent Size</span>
                    <input 
                      type="number" 
                      min="1"
                      max="8"
                      value={config.indentSize} 
                      onChange={(e) => updateConfig({ indentSize: parseInt(e.target.value) || 2 })}
                      className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-center text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>
                </SettingsSection>

                <SettingsSection title="Casing Rules">
                  <SettingToggle label="Uppercase Keywords" value={config.keywordUppercase} onChange={(v) => updateConfig({ keywordUppercase: v })} />
                  <SettingToggle label="Uppercase Functions" value={config.functionUppercase} onChange={(v) => updateConfig({ functionUppercase: v })} />
                  <SettingToggle label="Lowercase Fields" value={config.fieldLowercase} onChange={(v) => updateConfig({ fieldLowercase: v })} />
                  <SettingToggle label="Lowercase Tables" value={config.tableLowercase} onChange={(v) => updateConfig({ tableLowercase: v })} />
                </SettingsSection>

                <SettingsSection title="Clause Line Breaks">
                  <SettingToggle label="Newline before WHERE" value={config.newlineWhere} onChange={(v) => updateConfig({ newlineWhere: v })} />
                  <SettingToggle label="Newline before JOIN" value={config.newlineJoin} onChange={(v) => updateConfig({ newlineJoin: v })} />
                  <SettingToggle label="Newline after GROUP BY items" value={config.newlineGroupBy} onChange={(v) => updateConfig({ newlineGroupBy: v })} />
                  <SettingToggle label="Newline after ORDER BY items" value={config.newlineOrderBy} onChange={(v) => updateConfig({ newlineOrderBy: v })} />
                  <SettingToggle label="Newline before LIMIT" value={config.newlineLimit} onChange={(v) => updateConfig({ newlineLimit: v })} />
                  <SettingToggle label="Newline before OFFSET" value={config.newlineOffset} onChange={(v) => updateConfig({ newlineOffset: v })} />
                </SettingsSection>

                <SettingsSection title="Line Wrapping">
                  <div className="flex flex-col gap-3">
                    <span className="text-sm font-medium text-slate-300">SELECT Clause Wrap Limit (Characters)</span>
                    <input 
                      type="number" 
                      min="10"
                      max="500"
                      value={config.selectFieldWrapLimit} 
                      onChange={(e) => updateConfig({ selectFieldWrapLimit: parseInt(e.target.value) || 100 })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                    <p className="text-xs text-slate-500">Lines will break after a comma if they exceed this character count.</p>
                  </div>
                </SettingsSection>

              </div>
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-end bg-slate-900/50 rounded-b-3xl">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-8 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-medium border border-slate-700 shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <section className="flex flex-col gap-4">
    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 mb-2 border-b border-slate-800/50 pb-2">
      {title}
    </h3>
    <div className="space-y-1">
      {children}
    </div>
  </section>
);

const SettingToggle: React.FC<{ label: string, value: boolean, onChange: (v: boolean) => void }> = ({ label, value, onChange }) => (
  <div 
    className="flex items-center justify-between cursor-pointer group py-2 px-3 -mx-3 rounded-lg hover:bg-slate-800/50 transition-colors" 
    onClick={() => onChange(!value)}
  >
    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{label}</span>
    <div className={`w-11 h-6 rounded-full relative transition-colors duration-300 ease-in-out ${value ? 'bg-indigo-600' : 'bg-slate-700'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ease-in-out shadow-sm ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </div>
  </div>
);

export default App;
