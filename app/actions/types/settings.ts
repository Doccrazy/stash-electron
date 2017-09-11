export type SettingsKeys = keyof SettingsMap;

export type SettingsMap = {
  repositoryPath?: string,
  rootFontSize?: number
};

export interface State {
  current: SettingsMap,
  edited: SettingsMap,
  previous: SettingsMap
}
