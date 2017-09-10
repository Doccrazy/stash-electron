export type StatusType = 'progress' | 'success' | 'error';

export interface ImportSettings {
  filePath?: string,
  masterKey?: string,
  keyFile?: string
}

export interface State {
  open: boolean,
  settings: ImportSettings,
  status?: StatusType,
  statusMessage?: string
}
