export type SettingsKeys = keyof SettingsMap;

export interface StringSettings {
  repositoryPath?: string,
  rootFontSize?: number,
  privateKeyFile?: string,
  inactivityTimeout?: number,
  keyDisplayFormat?: 'sha256' | 'md5' | 'full'
}

export interface BoolSettings {
  hideInaccessible?: boolean
}

export type SettingsMap = StringSettings & BoolSettings & {
  storedLogins?: string[]
};

export interface State {
  readonly current: SettingsMap,
  readonly edited: SettingsMap,
  readonly previous: SettingsMap
}
