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
}

interface ConfigState {
  config: FormatterConfig;
  updateConfig: (newConfig: Partial<FormatterConfig>) => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
  config: {
    noTabs: true,
    noEmptyLines: true,
    keywordUppercase: true,
    functionUppercase: true,
    fieldLowercase: true,
    tableLowercase: true,
    variableLowercase: true,
    selectFieldWrapLimit: 100,
    newlineWhere: true,
    newlineJoin: true,
    newlineGroupBy: true,
    newlineOrderBy: true,
    newlineLimit: true,
    newlineOffset: true,
    indentSize: 2,
  },
  updateConfig: (newConfig) =>
    set((state) => ({ config: { ...state.config, ...newConfig } })),
}));
