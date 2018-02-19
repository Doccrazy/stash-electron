export type SettingsKeys = keyof SettingsMap;

export enum KeyFormat {
  SHA256 = 'sha256',
  MD5 = 'md5',
  FULL = 'full'
}

export interface StringSettings {
  repositoryPath?: string,
  rootFontSize: number,
  privateKeyFile?: string,
  inactivityTimeout: number,
  keyDisplayFormat: KeyFormat
}

export interface BoolSettings {
  hideInaccessible?: boolean
}

export type SettingsMap = StringSettings & BoolSettings & {
  storedLogins?: string[]
};

export interface State {
  readonly current: SettingsMap,
  readonly edited: Partial<SettingsMap>,
  readonly previous: SettingsMap
}
