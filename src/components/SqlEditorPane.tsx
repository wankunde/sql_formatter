import Editor from 'react-simple-code-editor';
import { FileCode2, PencilLine } from 'lucide-react';
import { highlightSql } from '../lib/sqlHighlight';

interface SqlEditorPaneProps {
  title: string;
  subtitle: string;
  value: string;
  placeholder: string;
  readOnly?: boolean;
  onChange?: (nextValue: string) => void;
  testId: string;
  textAreaLabel: string;
}

const CodeEditor = (Editor as unknown as { default?: typeof Editor }).default ?? Editor;

function getLineCount(sql: string) {
  return sql.length === 0 ? 1 : sql.split('\n').length;
}

export function SqlEditorPane({
  title,
  subtitle,
  value,
  placeholder,
  readOnly = false,
  onChange,
  testId,
  textAreaLabel,
}: SqlEditorPaneProps) {
  const lineCount = getLineCount(value);
  const lineNumbers = Array.from({ length: lineCount }, (_, index) => index + 1);
  const isEmptyReadOnly = readOnly && value.length === 0;

  return (
    <section className="editor-pane" data-testid={testId}>
      <header className="editor-pane__header">
        <div className="editor-pane__title-wrap">
          {readOnly ? <FileCode2 size={15} strokeWidth={2.2} /> : <PencilLine size={15} strokeWidth={2.2} />}
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
        </div>
        <div className="editor-pane__metrics">
          <span>{lineCount} lines</span>
          <span>{value.length} chars</span>
          {readOnly ? <span className="editor-pane__pill">Read only</span> : null}
        </div>
      </header>

      <div className="editor-pane__body">
        <div className="editor-pane__scroll custom-scrollbar">
          <div className="editor-pane__code">
            <aside className="editor-pane__gutter" aria-hidden>
              {lineNumbers.map((lineNumber) => (
                <div key={lineNumber}>{lineNumber}</div>
              ))}
            </aside>

            <div className="editor-pane__editor-wrap">
              <label className="sr-only" htmlFor={`${testId}-textarea`}>
                {textAreaLabel}
              </label>
              <CodeEditor
                value={value}
                onValueChange={(nextValue: string) => onChange?.(nextValue)}
                highlight={highlightSql}
                padding={20}
                readOnly={readOnly}
                textareaId={`${testId}-textarea`}
                textareaClassName="sql-editor-textarea"
                className="sql-editor"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  lineHeight: '1.65',
                  minHeight: '100%',
                  minWidth: '100%',
                  width: 'max-content',
                }}
                placeholder={placeholder}
              />

              {isEmptyReadOnly ? (
                <div className="editor-pane__empty">
                  <h3>Formatted output appears here</h3>
                  <p>Paste SQL on the left, then tune rules in the inspector.</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
