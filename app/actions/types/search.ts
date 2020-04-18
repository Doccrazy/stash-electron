import EntryPtr from '../../domain/EntryPtr';
import { List } from 'immutable';

export interface SearchOptions {
  limitedScope?: boolean;
}

export interface State {
  readonly filter: string;
  readonly results: List<EntryPtr>;
  readonly options: SearchOptions;
  readonly running?: boolean;
  readonly quick?: boolean;
}
