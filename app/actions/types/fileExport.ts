export type StatusType = 'progress' | 'success' | 'error';

export interface ExportSettings {
  masterKey?: string;
  repeatMasterKey?: string;
}

export interface State {
  readonly open: boolean;
  readonly settings: ExportSettings;
  readonly status?: StatusType;
  readonly statusMessage?: string;
}
