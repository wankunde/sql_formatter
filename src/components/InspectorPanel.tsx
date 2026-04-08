import { RotateCcw, X } from 'lucide-react';
import type { FormatterConfig } from '../store/useConfigStore';

interface InspectorPanelProps {
  config: FormatterConfig;
  onUpdateConfig: (nextConfig: Partial<FormatterConfig>) => void;
  onResetConfig: () => void;
  onClose?: () => void;
  showCloseButton: boolean;
}

interface ToggleFieldProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onToggle: (value: boolean) => void;
}

function ToggleField({ id, label, description, checked, onToggle }: ToggleFieldProps) {
  return (
    <div className="inspector-toggle">
      <div>
        <h4>{label}</h4>
        <p>{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`inspector-toggle__control ${checked ? 'is-on' : ''}`}
        onClick={() => onToggle(!checked)}
      >
        <span />
      </button>
    </div>
  );
}

interface SegmentOptionProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

function SegmentOption({ label, selected, onClick }: SegmentOptionProps) {
  return (
    <button
      type="button"
      className={`segment-option ${selected ? 'is-selected' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function InspectorPanel({
  config,
  onUpdateConfig,
  onResetConfig,
  onClose,
  showCloseButton,
}: InspectorPanelProps) {
  return (
    <aside className="inspector-panel" data-testid="inspector-panel">
      <header className="inspector-panel__header">
        <div>
          <p className="inspector-panel__eyebrow">Inspector</p>
          <h2>Formatting rules</h2>
        </div>
        {showCloseButton && onClose ? (
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close inspector panel"
          >
            <X size={16} strokeWidth={2.4} />
          </button>
        ) : null}
      </header>

      <div className="inspector-panel__content custom-scrollbar">
        <section className="inspector-section">
          <h3>Indentation</h3>
          <p className="inspector-section__desc">Whitespace and layout structure.</p>

          <ToggleField
            id="config-no-tabs"
            label="Convert tabs to spaces"
            description="Keeps indentation consistent across editors and CI tools."
            checked={config.noTabs}
            onToggle={(value) => onUpdateConfig({ noTabs: value })}
          />

          <ToggleField
            id="config-no-empty-lines"
            label="Remove empty lines"
            description="Compacts output by stripping blank lines after formatting."
            checked={config.noEmptyLines}
            onToggle={(value) => onUpdateConfig({ noEmptyLines: value })}
          />

          <div className="inspector-control">
            <label htmlFor="indent-size">Indent size</label>
            <div className="segment-group" id="indent-size">
              {[2, 4, 8].map((size) => (
                <SegmentOption
                  key={size}
                  label={`${size} spaces`}
                  selected={config.indentSize === size}
                  onClick={() => onUpdateConfig({ indentSize: size })}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="inspector-section">
          <h3>Casing</h3>
          <p className="inspector-section__desc">Control keyword, function, and identifier casing.</p>

          <ToggleField
            id="config-keyword-uppercase"
            label="Keywords uppercase"
            description="Examples: SELECT, FROM, WHERE."
            checked={config.keywordUppercase}
            onToggle={(value) => onUpdateConfig({ keywordUppercase: value })}
          />

          <ToggleField
            id="config-function-uppercase"
            label="Functions uppercase"
            description="Examples: COUNT, SUM, DATEDIFF."
            checked={config.functionUppercase}
            onToggle={(value) => onUpdateConfig({ functionUppercase: value })}
          />

          <ToggleField
            id="config-field-lowercase"
            label="Fields lowercase"
            description="Column names and aliases are converted to lowercase."
            checked={config.fieldLowercase}
            onToggle={(value) => onUpdateConfig({ fieldLowercase: value })}
          />

          <ToggleField
            id="config-table-lowercase"
            label="Tables lowercase"
            description="Table names and dataset references are converted to lowercase."
            checked={config.tableLowercase}
            onToggle={(value) => onUpdateConfig({ tableLowercase: value })}
          />

          <ToggleField
            id="config-variable-lowercase"
            label="Variables lowercase"
            description="Variables starting with $ or : are converted to lowercase."
            checked={config.variableLowercase}
            onToggle={(value) => onUpdateConfig({ variableLowercase: value })}
          />
        </section>

        <section className="inspector-section">
          <h3>Output shape</h3>
          <p className="inspector-section__desc">Line wrapping and keyword alignment.</p>

          <ToggleField
            id="config-align-keywords"
            label="Align clause keywords"
            description="Aligns major clauses into a consistent keyword column."
            checked={config.alignKeywords}
            onToggle={(value) => onUpdateConfig({ alignKeywords: value })}
          />

          <div className="inspector-control">
            <label htmlFor="select-wrap-limit">Select wrap limit</label>
            <div className="inspector-control__range-row">
              <input
                id="select-wrap-limit"
                type="range"
                min={40}
                max={120}
                step={10}
                value={config.selectFieldWrapLimit}
                onChange={(event) =>
                  onUpdateConfig({ selectFieldWrapLimit: Number.parseInt(event.target.value, 10) })
                }
              />
              <strong>{config.selectFieldWrapLimit} chars</strong>
            </div>
          </div>
        </section>
      </div>

      <footer className="inspector-panel__footer">
        <button type="button" className="btn btn--ghost" onClick={onResetConfig}>
          <RotateCcw size={14} strokeWidth={2.3} />
          <span>Reset to defaults</span>
        </button>
        {showCloseButton && onClose ? (
          <button type="button" className="btn btn--primary" onClick={onClose}>
            <span>Collapse</span>
          </button>
        ) : null}
      </footer>
    </aside>
  );
}
