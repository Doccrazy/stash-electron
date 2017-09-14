export type SettingsKeys = keyof SettingsMap;

export type SettingsMap = {
  repositoryPath?: string,
  rootFontSize?: number
};

export interface State {
  readonly current: SettingsMap,
  readonly edited: SettingsMap,
  readonly previous: SettingsMap
}
