import * as React from 'react';
import { StringMatcher } from '../utils/StringMatcher';

export interface KeePassFields {
  Title?: string
  UserName?: string
  Password?: string
  URL?: string
  Notes?: string
  [key: string]: string | undefined
}

export interface NameProps {
  fileName: string
}

export interface PanelProps<C> {
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

export interface TypeRenderer<C, S> {
  NameLabel: React.ComponentType<NameProps>
  Panel: React.ComponentType<PanelProps<C>>
  Form: React.ComponentType<FormProps<C, S>> & StaticFormMethods<C, S>
}

export interface Type<C> {
  id: string,
  // returns the quality of the match (higher is better, default/fallback is 0)
  test: (name: string) => number | null,
  toDisplayName: (name: string) => string,
  toFileName: (displayName: string) => string,
  initialize?: () => C,
  matches?: (content: C, matcher: StringMatcher) => boolean,
  isValidKdbxEntry?: (fields: KeePassFields) => boolean,
  fromKdbxEntry?: (fields: KeePassFields) => C,
  toKdbxEntry?: (content: C) => KeePassFields,
  parse?: (buf: Buffer) => C,
  write?: (content: C) => Buffer,
  readField?: (content: C, field: WellKnownField) => string | null | undefined
}

const TYPES: { [id: string]: Type<any> } = {};
const RENDERERS: { [id: string]: TypeRenderer<any, any> } = {};

export function typeFor(entry: string) {
  const matches = Object.values(TYPES)
    .map(type => ({ type, match: type.test(entry) }))
    .filter(m => m.match !== null);
  // best matches first
  matches.sort((a, b) => b.match! - a.match!);
  return matches[0].type;
}

export function typeById(id: string) {
  return TYPES[id];
}

export function rendererById(id: string) {
  return RENDERERS[id];
}

export function rendererFor(entry: string) {
  return rendererById(typeFor(entry).id);
}

export function register<C>(type: Type<C>, typeRenderer: TypeRenderer<C, any>) {
  TYPES[type.id] = type;
  RENDERERS[type.id] = typeRenderer;
}

export enum WellKnownField {
  USERNAME,
  PASSWORD,
  URL
}
