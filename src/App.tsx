import React, { useState, useEffect } from 'react';
import { useConfigStore } from './store/useConfigStore';
import { formatSql } from './formatter';
import { Copy, Settings, Trash2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const App: React.FC = () => {
  const { config, updateConfig } = useConfigStore();
  const [inputSql, setInputSql] = useState('');
  const [formattedSql, setFormattedSql] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setFormattedSql(formatSql(inputSql, config));
  }, [inputSql, config]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedSql);
    alert('Copied to clipboard!');
  };

  const handleClear = () => {
    setInputSql('');
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-gray-300 font-sans p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Spark SQL Formatter</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings size={20} />
          </button>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Copy size={16} /> Copy
          </button>
          <button 
            onClick={handleClear}
            className="p-2 hover:bg-red-900 rounded-lg transition-colors text-red-400"
            title="Clear"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold uppercase tracking-wider text-gray-500">Raw SQL</label>
          <textarea
            value={inputSql}
            onChange={(e) => setInputSql(e.target.value)}
            className="flex-1 bg-[#252526] border border-[#3c3c3c] rounded-lg p-4 font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none text-gray-200"
            placeholder="Enter your Spark SQL here..."
          />
        </div>

        <div className="flex flex-col gap-2 relative">
          <label className="text-sm font-semibold uppercase tracking-wider text-gray-500">Formatted SQL</label>
          <div className="flex-1 overflow-auto bg-[#252526] border border-[#3c3c3c] rounded-lg font-mono text-sm">
            <SyntaxHighlighter
              language="sql"
              style={vscDarkPlus}
              showLineNumbers={true}
              customStyle={{
                margin: 0,
                padding: '1rem',
                backgroundColor: 'transparent',
                fontSize: '0.875rem',
              }}
              lineNumberStyle={{
                minWidth: '2.5em',
                paddingRight: '1em',
                color: '#858585',
                textAlign: 'right',
                userSelect: 'none',
              }}
            >
              {formattedSql || ' '}
            </SyntaxHighlighter>
          </div>
        </div>
      </main>

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#252526] border border-[#3c3c3c] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl">
            <div className="p-6 border-b border-[#3c3c3c] flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Formatting Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">&times;</button>
            </div>
            
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <section>
                <h3 className="text-blue-400 text-xs font-bold uppercase mb-4 tracking-widest">General</h3>
                <div className="space-y-4">
                  <SettingToggle label="No Tabs" value={config.noTabs} onChange={(v) => updateConfig({ noTabs: v })} />
                  <SettingToggle label="No Empty Lines" value={config.noEmptyLines} onChange={(v) => updateConfig({ noEmptyLines: v })} />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Indent Size</span>
                    <input 
                      type="number" 
                      value={config.indentSize} 
                      onChange={(e) => updateConfig({ indentSize: parseInt(e.target.value) || 2 })}
                      className="w-16 bg-[#1e1e1e] border border-[#3c3c3c] rounded px-2 py-1 text-sm"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-blue-400 text-xs font-bold uppercase mb-4 tracking-widest">Casing</h3>
                <div className="space-y-4">
                  <SettingToggle label="Keyword Uppercase" value={config.keywordUppercase} onChange={(v) => updateConfig({ keywordUppercase: v })} />
                  <SettingToggle label="Function Uppercase" value={config.functionUppercase} onChange={(v) => updateConfig({ functionUppercase: v })} />
                  <SettingToggle label="Field Lowercase" value={config.fieldLowercase} onChange={(v) => updateConfig({ fieldLowercase: v })} />
                  <SettingToggle label="Table Lowercase" value={config.tableLowercase} onChange={(v) => updateConfig({ tableLowercase: v })} />
                </div>
              </section>

              <section>
                <h3 className="text-blue-400 text-xs font-bold uppercase mb-4 tracking-widest">Select Clause</h3>
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm">Max Characters per Line</span>
                    <input 
                      type="number" 
                      value={config.selectFieldWrapLimit} 
                      onChange={(e) => updateConfig({ selectFieldWrapLimit: parseInt(e.target.value) || 100 })}
                      className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-2 py-1 text-sm"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-blue-400 text-xs font-bold uppercase mb-4 tracking-widest">New Lines</h3>
                <div className="space-y-4">
                  <SettingToggle label="Newline WHERE" value={config.newlineWhere} onChange={(v) => updateConfig({ newlineWhere: v })} />
                  <SettingToggle label="Newline JOIN" value={config.newlineJoin} onChange={(v) => updateConfig({ newlineJoin: v })} />
                  <SettingToggle label="Newline GROUP BY" value={config.newlineGroupBy} onChange={(v) => updateConfig({ newlineGroupBy: v })} />
                  <SettingToggle label="Newline ORDER BY" value={config.newlineOrderBy} onChange={(v) => updateConfig({ newlineOrderBy: v })} />
                  <SettingToggle label="Newline LIMIT" value={config.newlineLimit} onChange={(v) => updateConfig({ newlineLimit: v })} />
                  <SettingToggle label="Newline OFFSET" value={config.newlineOffset} onChange={(v) => updateConfig({ newlineOffset: v })} />
                </div>
              </section>
            </div>

            <div className="p-6 border-t border-[#3c3c3c] flex justify-end">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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

const SettingToggle: React.FC<{ label: string, value: boolean, onChange: (v: boolean) => void }> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between cursor-pointer group" onClick={() => onChange(!value)}>
    <span className="text-sm group-hover:text-white transition-colors">{label}</span>
    <div className={`w-10 h-5 rounded-full relative transition-colors ${value ? 'bg-blue-600' : 'bg-gray-600'}`}>
      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${value ? 'left-6' : 'left-1'}`} />
    </div>
  </div>
);

export default App;
