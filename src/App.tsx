import { useEffect, useMemo, useRef, useState } from 'react';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { formatSql } from './formatter';
import { InspectorPanel } from './components/InspectorPanel';
import { SqlEditorPane } from './components/SqlEditorPane';
import { TopBar } from './components/TopBar';
import { useViewportMode } from './hooks/useViewportMode';
import { DEFAULT_FORMATTER_CONFIG, useConfigStore } from './store/useConfigStore';

type MobilePane = 'source' | 'output';

function getMetrics(sql: string) {
  const lines = sql.length === 0 ? 1 : sql.split('\n').length;
  return { lines, chars: sql.length };
}

const SOURCE_PLACEHOLDER = `-- Paste SQL to format
-- Example:
SELECT user_id, COUNT(*) AS event_count
FROM analytics.events
WHERE dt >= '2026-01-01'
GROUP BY user_id`;

function isDesktopMode(mode: ReturnType<typeof useViewportMode>) {
  return mode === 'desktop';
}

export default function App() {
  const { config, updateConfig } = useConfigStore();
  const viewportMode = useViewportMode();

  const [sourceSql, setSourceSql] = useState('');
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle');
  const [activeMobilePane, setActiveMobilePane] = useState<MobilePane>('source');
  const [isInspectorDrawerOpen, setIsInspectorDrawerOpen] = useState(false);
  const [isDesktopInspectorOpen, setIsDesktopInspectorOpen] = useState(true);
  const copyStateTimerRef = useRef<number | null>(null);

  const { formattedSql, formattingError } = useMemo(() => {
    try {
      return {
        formattedSql: formatSql(sourceSql, config),
        formattingError: null as string | null,
      };
    } catch (error) {
      return {
        formattedSql: '',
        formattingError: error instanceof Error ? error.message : 'Unknown formatting error',
      };
    }
  }, [sourceSql, config]);

  useEffect(() => {
    return () => {
      if (copyStateTimerRef.current) {
        window.clearTimeout(copyStateTimerRef.current);
      }
    };
  }, []);

  const sourceMetrics = useMemo(() => getMetrics(sourceSql), [sourceSql]);
  const outputMetrics = useMemo(() => getMetrics(formattedSql), [formattedSql]);
  const canCopy = formattedSql.length > 0 && formattingError === null;

  const resetCopyState = () => {
    if (copyStateTimerRef.current) {
      window.clearTimeout(copyStateTimerRef.current);
    }
    copyStateTimerRef.current = window.setTimeout(() => {
      setCopyState('idle');
    }, 1500);
  };

  const handleCopy = async () => {
    if (!canCopy) return;
    try {
      await navigator.clipboard.writeText(formattedSql);
      setCopyState('success');
    } catch {
      setCopyState('error');
    }
    resetCopyState();
  };

  const handleToggleInspector = () => {
    if (isDesktopMode(viewportMode)) {
      setIsDesktopInspectorOpen((current) => !current);
      return;
    }
    setIsInspectorDrawerOpen((current) => !current);
  };

  const handleClear = () => {
    setSourceSql('');
    setActiveMobilePane('source');
  };

  const handleCloseInspectorDrawer = () => {
    setIsInspectorDrawerOpen(false);
  };

  const handleResetConfig = () => {
    updateConfig(DEFAULT_FORMATTER_CONFIG);
  };

  const showDesktopInspector = isDesktopMode(viewportMode) && isDesktopInspectorOpen;
  const isMobile = viewportMode === 'mobile';
  const showSourcePane = !isMobile || activeMobilePane === 'source';
  const showOutputPane = !isMobile || activeMobilePane === 'output';

  return (
    <div className="app-shell">
      <div className="app-shell__texture" aria-hidden />

      <TopBar
        sourceLines={sourceMetrics.lines}
        sourceChars={sourceMetrics.chars}
        outputLines={outputMetrics.lines}
        outputChars={outputMetrics.chars}
        canCopy={canCopy}
        copyState={copyState}
        mode={viewportMode}
        isInspectorOpen={isDesktopMode(viewportMode) ? isDesktopInspectorOpen : isInspectorDrawerOpen}
        hasFormattingError={formattingError !== null}
        onCopy={handleCopy}
        onClear={handleClear}
        onToggleInspector={handleToggleInspector}
      />

      {isMobile ? (
        <nav className="mobile-pane-switch" data-testid="mobile-pane-switch">
          <button
            type="button"
            className={activeMobilePane === 'source' ? 'is-active' : ''}
            onClick={() => setActiveMobilePane('source')}
          >
            Source
          </button>
          <button
            type="button"
            className={activeMobilePane === 'output' ? 'is-active' : ''}
            onClick={() => setActiveMobilePane('output')}
          >
            Output
          </button>
        </nav>
      ) : null}

      <main className={`workspace workspace--${viewportMode}`}>
        {showSourcePane ? (
          <SqlEditorPane
            title="Source SQL"
            subtitle="Editable raw query input"
            value={sourceSql}
            onChange={setSourceSql}
            placeholder={SOURCE_PLACEHOLDER}
            testId="source-pane"
            textAreaLabel="Source SQL input"
          />
        ) : null}

        {showOutputPane ? (
          <SqlEditorPane
            title="Formatted SQL"
            subtitle={formattingError ? formattingError : 'Read-only formatter result'}
            value={formattedSql}
            placeholder=""
            readOnly
            testId="output-pane"
            textAreaLabel="Formatted SQL output"
          />
        ) : null}

        {showDesktopInspector ? (
          <InspectorPanel
            config={config}
            onUpdateConfig={updateConfig}
            onResetConfig={handleResetConfig}
            onClose={() => setIsDesktopInspectorOpen(false)}
            showCloseButton
          />
        ) : null}

        {isDesktopMode(viewportMode) && !isDesktopInspectorOpen ? (
          <aside className="inspector-rail">
            <button
              type="button"
              className="icon-btn icon-btn--rail"
              onClick={() => setIsDesktopInspectorOpen(true)}
              aria-label="Expand inspector panel"
            >
              <PanelRightOpen size={18} strokeWidth={2.2} />
              <span>Inspector</span>
            </button>
          </aside>
        ) : null}
      </main>

      {!isDesktopMode(viewportMode) && isInspectorDrawerOpen ? (
        <div className="inspector-overlay" data-testid="inspector-overlay">
          <button
            type="button"
            className="inspector-overlay__backdrop"
            aria-label="Close inspector panel"
            onClick={handleCloseInspectorDrawer}
          />

          <div
            className={`inspector-overlay__sheet ${isMobile ? 'is-mobile' : 'is-tablet'}`}
            role="dialog"
            aria-modal="true"
            aria-label="SQL formatter configuration panel"
          >
            <div className="inspector-overlay__sheet-header">
              <button
                type="button"
                className="icon-btn"
                onClick={handleCloseInspectorDrawer}
                aria-label="Collapse inspector panel"
              >
                <PanelRightClose size={17} strokeWidth={2.2} />
              </button>
            </div>
            <InspectorPanel
              config={config}
              onUpdateConfig={updateConfig}
              onResetConfig={handleResetConfig}
              onClose={handleCloseInspectorDrawer}
              showCloseButton
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
