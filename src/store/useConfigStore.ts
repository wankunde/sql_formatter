import { create } from 'zustand';

export interface FormatterConfig {
  noTabs: boolean;
  noEmptyLines: boolean;
  keywordUppercase: boolean;
  functionUppercase: boolean;
  fieldLowercase: boolean;
  tableLowercase: boolean;
  variableLowercase: boolean;
  selectFieldWrapLimit: number;
  newlineWhere: boolean;
  newlineJoin: boolean;
  newlineGroupBy: boolean;
  newlineOrderBy: boolean;
  newlineLimit: boolean;
  newlineOffset: boolean;
  indentSize: number;
  alignKeywords: boolean; // New option
}

interface ConfigState {
  config: FormatterConfig;
  updateConfig: (newConfig: Partial<FormatterConfig>) => void;
}

export const DEFAULT_FORMATTER_CONFIG: FormatterConfig = {
  noTabs: true,
  noEmptyLines: true,
  keywordUppercase: true,
  functionUppercase: true,
  fieldLowercase: true,
  tableLowercase: true,
  variableLowercase: true,
  selectFieldWrapLimit: 80,
  newlineWhere: true,
  newlineJoin: true,
  newlineGroupBy: true,
  newlineOrderBy: true,
  newlineLimit: true,
  newlineOffset: true,
  indentSize: 2,
  alignKeywords: true,
};

export const useConfigStore = create<ConfigState>((set) => ({
  config: { ...DEFAULT_FORMATTER_CONFIG },
  updateConfig: (newConfig) =>
    set((state) => ({ config: { ...state.config, ...newConfig } })),
}));
