export type SettingsKeys = keyof SettingsMap;

export enum KeyFormat {
  SHA256 = 'sha256',
  MD5 = 'md5',
  FULL = 'full'
}

export interface StringSettings {
  repositoryPath?: string;
  rootFontSize: number;
  privateKeyFile?: string;
  inactivityTimeout: number;
  keyDisplayFormat: KeyFormat;
  locale: string;
  privateBinSite: string;
}

export interface BoolSettings {
  hideInaccessible?: boolean;
}

export interface RepositoryInfo {
  path: string;
  name: string;
  id?: string;
}

export interface PrivateKeyInfo {
  path: string;
  publicKey: string;
}

export type SettingsMap = StringSettings &
  BoolSettings & {
    storedLogins: string[];
    repositories: RepositoryInfo[];
    privateKeys: PrivateKeyInfo[];
  };

export interface State {
  readonly current: SettingsMap;
  readonly edited: Partial<SettingsMap>;
  readonly previous: SettingsMap;
}
