/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { DEFAULT_FORMATTER_CONFIG, useConfigStore } from './store/useConfigStore';

function setViewport(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event('resize'));
}

const clipboardWriteMock = vi.fn();

describe('App UI workbench', () => {
  beforeEach(() => {
    useConfigStore.setState({ config: { ...DEFAULT_FORMATTER_CONFIG } });
    clipboardWriteMock.mockReset();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: clipboardWriteMock },
    });
    setViewport(1400);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('renders desktop shell with source, output, and inspector', () => {
    render(<App />);

    expect(screen.getByTestId('source-pane')).toBeInTheDocument();
    expect(screen.getByTestId('output-pane')).toBeInTheDocument();
    expect(screen.getByTestId('inspector-panel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy formatted SQL' })).toBeDisabled();
  });

  it('formats SQL in real time as input changes', async () => {
    render(<App />);

    const sourceTextarea = screen.getByLabelText('Source SQL input') as HTMLTextAreaElement;
    const outputTextarea = screen.getByLabelText('Formatted SQL output') as HTMLTextAreaElement;

    fireEvent.change(sourceTextarea, { target: { value: 'select ColumnA from TableA where $Var = 1' } });

    await waitFor(() => {
      expect(outputTextarea.value).toContain('SELECT');
      expect(outputTextarea.value).toContain('columna');
      expect(outputTextarea.value).toContain('tablea');
    });
  });

  it('supports copy state and clear action', async () => {
    clipboardWriteMock.mockResolvedValue(undefined);
    render(<App />);

    const sourceTextarea = screen.getByLabelText('Source SQL input') as HTMLTextAreaElement;
    const outputTextarea = screen.getByLabelText('Formatted SQL output') as HTMLTextAreaElement;
    const copyButton = screen.getByRole('button', { name: 'Copy formatted SQL' });

    fireEvent.change(sourceTextarea, { target: { value: 'select a from t' } });

    await waitFor(() => {
      expect(copyButton).toBeEnabled();
      expect(outputTextarea.value).toContain('SELECT');
    });

    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(clipboardWriteMock).toHaveBeenCalledWith(outputTextarea.value);
      expect(copyButton).toHaveTextContent('Copied');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(sourceTextarea.value).toBe('');
    expect(outputTextarea.value).toBe('');
    expect(copyButton).toBeDisabled();
  });

  it('applies indentation and casing configuration changes', async () => {
    render(<App />);

    const sourceTextarea = screen.getByLabelText('Source SQL input') as HTMLTextAreaElement;
    const outputTextarea = screen.getByLabelText('Formatted SQL output') as HTMLTextAreaElement;

    fireEvent.change(sourceTextarea, {
      target: { value: 'select ColumnA from (select ValueA from TableA where $Var = 1) AliasA' },
    });

    await waitFor(() => {
      expect(outputTextarea.value).toContain('columna');
      expect(outputTextarea.value).toContain('tablea');
      expect(outputTextarea.value).toContain('$var');
    });

    const defaultOutput = outputTextarea.value;

    fireEvent.click(screen.getByRole('button', { name: '4 spaces' }));

    await waitFor(() => {
      expect(outputTextarea.value).not.toEqual(defaultOutput);
      expect(outputTextarea.value).toContain('    SELECT');
    });

    fireEvent.click(screen.getByRole('switch', { name: 'Fields lowercase' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Tables lowercase' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Variables lowercase' }));

    await waitFor(() => {
      expect(outputTextarea.value).toContain('ColumnA');
      expect(outputTextarea.value).toContain('TableA');
      expect(outputTextarea.value).toContain('$Var');
    });
  });

  it('supports tablet inspector drawer flow', async () => {
    setViewport(900);
    render(<App />);

    expect(screen.queryByTestId('inspector-panel')).not.toBeInTheDocument();
    expect(screen.getByTestId('source-pane')).toBeInTheDocument();
    expect(screen.getByTestId('output-pane')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Open inspector panel' }));

    await waitFor(() => {
      expect(screen.getByTestId('inspector-overlay')).toBeInTheDocument();
      expect(screen.getByTestId('inspector-panel')).toBeInTheDocument();
    });
  });

  it('supports mobile pane switching and sheet inspector', async () => {
    setViewport(600);
    render(<App />);

    expect(screen.getByTestId('mobile-pane-switch')).toBeInTheDocument();
    expect(screen.getByTestId('source-pane')).toBeInTheDocument();
    expect(screen.queryByTestId('output-pane')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Output' }));
    expect(screen.getByTestId('output-pane')).toBeInTheDocument();
    expect(screen.queryByTestId('source-pane')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Open inspector panel' }));

    await waitFor(() => {
      expect(screen.getByTestId('inspector-overlay')).toBeInTheDocument();
      expect(screen.getByTestId('inspector-panel')).toBeInTheDocument();
    });
  });
});
