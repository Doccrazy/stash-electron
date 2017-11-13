import * as React from 'react';
import * as jsonParser from './parser/json';
import { StringMatcher } from '../utils/StringMatcher';

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

export interface StaticFormMethods<C, S> {
  initFormState?: (content: C) => S;
  validate?: (name: string, content: C, formState: S) => string | boolean;
}

export interface ReactTypeExt {
  format?: (name: string) => React.ReactNode
  panel?: React.ComponentType<PanelProps<any>>,
  form?: React.ComponentType<FormProps<any, any>> & StaticFormMethods<any, any>
}

export interface Type<C> extends ReactTypeExt {
  id?: string,
  test: (name: string) => boolean,
  toDisplayName: (name: string) => string,
  toFileName: (displayName: string) => string,
  initialize?: () => C,
  matches?: (content: C, matcher: StringMatcher) => boolean,
  fromKdbxEntry?: (entry: any) => C,
  parse?: (buf: Buffer) => C,
  write?: (content: C) => Buffer
}

export type InternalType<C> = Type<C> & { matches: any, fromKdbxEntry: any, parse: any, write: any };

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
    matches: (content, matcher) => (content.username && matcher.matches(content.username))
      || (content.description && matcher.matches(content.description)),
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

export function typeForInt(entry: string) {
  return typeFor(entry) as InternalType<any>;
}

export function typeById(id: string | undefined) {
  return TYPES.find(type => type.id === id) || DEFAULT_TYPE;
}

export function mergeConfig(id: string | undefined, config: ReactTypeExt) {
  const type = typeById(id);
  Object.assign(type, config);
}
