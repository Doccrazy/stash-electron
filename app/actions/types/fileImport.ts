export type StatusType = 'progress' | 'success' | 'error';

export interface ImportSettings {
  filePath?: string,
  masterKey?: string,
  keyFile?: string
}

export interface State {
  readonly open: boolean,
  readonly settings: ImportSettings,
  readonly status?: StatusType,
  readonly statusMessage?: string
}
