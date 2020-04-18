import EntryPtr from '../../domain/EntryPtr';
import { Map } from 'immutable';
import { RootState } from './index';

export interface Details {
  modified: { date?: Date; user?: string };
}

type Provider<T> = (state: RootState, entries: EntryPtr[]) => Promise<T[]>;

export type Providers = {
  [P in keyof Details]: Provider<Details[P]>;
};

export type DetailMap = Map<EntryPtr, Details>;

export type State = DetailMap;
