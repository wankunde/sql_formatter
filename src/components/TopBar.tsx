import {
  Check,
  Clipboard,
  Database,
  Eraser,
  Settings2,
  TriangleAlert,
} from 'lucide-react';

export type CopyState = 'idle' | 'success' | 'error';
export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

interface TopBarProps {
  sourceLines: number;
  sourceChars: number;
  outputLines: number;
  outputChars: number;
  canCopy: boolean;
  copyState: CopyState;
  mode: ViewportMode;
  isInspectorOpen: boolean;
  hasFormattingError: boolean;
  onCopy: () => void;
  onClear: () => void;
  onToggleInspector: () => void;
}

function getCopyLabel(copyState: CopyState) {
  if (copyState === 'success') return 'Copied';
  if (copyState === 'error') return 'Copy failed';
  return 'Copy output';
}

export function TopBar({
  sourceLines,
  sourceChars,
  outputLines,
  outputChars,
  canCopy,
  copyState,
  mode,
  isInspectorOpen,
  hasFormattingError,
  onCopy,
  onClear,
  onToggleInspector,
}: TopBarProps) {
  return (
    <header className="topbar">
      <div className="topbar__brand">
        <div className="topbar__brand-dot" aria-hidden />
        <div>
          <p className="topbar__title">SQL Refinery</p>
          <p className="topbar__subtitle">Professional formatting workbench</p>
        </div>
      </div>

      <div className="topbar__meta" aria-label="editor-metrics">
        <div className="topbar__meta-card">
          <span>Source</span>
          <strong>{sourceLines}L / {sourceChars}C</strong>
        </div>
        <div className="topbar__meta-card">
          <span>Output</span>
          <strong>{outputLines}L / {outputChars}C</strong>
        </div>
        <div className={`topbar__meta-card ${hasFormattingError ? 'is-danger' : ''}`}>
          <Database size={14} strokeWidth={2.2} />
          <strong>{hasFormattingError ? 'Formatter error' : 'Formatter ready'}</strong>
          {hasFormattingError ? <TriangleAlert size={14} strokeWidth={2.2} /> : null}
        </div>
      </div>

      <div className="topbar__actions">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onClear}
        >
          <Eraser size={15} strokeWidth={2.2} />
          <span>Clear</span>
        </button>

        <button
          type="button"
          className={`btn btn--primary ${copyState === 'success' ? 'is-success' : ''} ${copyState === 'error' ? 'is-error' : ''}`}
          disabled={!canCopy}
          aria-label="Copy formatted SQL"
          onClick={onCopy}
        >
          {copyState === 'success' ? (
            <Check size={15} strokeWidth={2.4} />
          ) : (
            <Clipboard size={15} strokeWidth={2.2} />
          )}
          <span>{getCopyLabel(copyState)}</span>
        </button>

        <button
          type="button"
          className="btn btn--ghost"
          aria-label={mode === 'desktop' ? 'Toggle inspector panel' : 'Open inspector panel'}
          onClick={onToggleInspector}
        >
          <Settings2 size={15} strokeWidth={2.2} />
          <span>{mode === 'desktop' ? (isInspectorOpen ? 'Hide panel' : 'Show panel') : 'Config'}</span>
        </button>
      </div>
    </header>
  );
}
