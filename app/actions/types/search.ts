import EntryPtr from '../../domain/EntryPtr';
import {List} from 'immutable';

export interface SearchOptions {
  limitedScope?: boolean;
}

export interface State {
  filter: string,
  results: List<EntryPtr>,
  options: SearchOptions,
  running?: boolean,
  quick?: boolean
}
