import * as React from 'react';
import * as jsonParser from './parser/json';

export interface PanelProps<C> {
  node: any,
  entry: string,
  parsedContent: C
}

export interface FormProps<C, S> {
  name: string,
  onChangeName: (newName: string) => void,
  value: C,
  onChange: (newContent: C) => void,
  formState: S,
  onChangeState: (newState: S) => void
}

export interface ReactTypeExt {
  format?: (name: string) => React.ReactNode
  panel?: React.ComponentType<PanelProps<any>>,
  form?: React.ComponentType<FormProps<any, any>>
}

export interface Type<C> extends ReactTypeExt {
  id?: string,
  test: (name: string) => boolean,
  toDisplayName: (name: string) => string,
  toFileName: (displayName: string) => string,
  initialize?: () => C,
  matches?: (content: C, filter: string) => boolean,
  fromKdbxEntry?: (entry: any) => C,
  parse?: (buf: Buffer) => C,
  write?: (content: C) => Buffer
}

const DEFAULT_TYPE: Type<void> = {
  test: () => true,
  toDisplayName: name => name,
  toFileName: name => name
};

const TYPES: Type<any>[] = [
  {
    id: 'password',
    test: fn => fn.endsWith('.pass.json'),
    toDisplayName: fn => fn.substr(0, fn.length - 10),
    toFileName: name => `${name}.pass.json`,
    initialize: () => ({}),
    matches: (content, filterLC) => (content.username && content.username.toLowerCase().includes(filterLC))
      || (content.description && content.description.toLowerCase().includes(filterLC)),
    fromKdbxEntry: entry => ({
      description: entry.fields.Notes,
      username: entry.fields.UserName,
      password: entry.fields.Password ? entry.fields.Password.getText() : undefined,
      url: entry.fields.URL
    }),
    ...jsonParser
  },
  DEFAULT_TYPE
];

export default function typeFor(entry: string) {
  return TYPES.find(type => type.test(entry)) || DEFAULT_TYPE;
}

export function typeById(id: string | undefined) {
  return TYPES.find(type => type.id === id) || DEFAULT_TYPE;
}

export function mergeConfig(id: string | undefined, config: ReactTypeExt) {
  const type = typeById(id);
  Object.assign(type, config);
}
