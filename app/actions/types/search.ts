import EntryPtr from '../../domain/EntryPtr';
import { List } from 'immutable';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SearchOptions {}

export interface SearchResult {
  ptr: EntryPtr;
  highlightHtml?: string;
  match: 'NAME' | 'PATH' | 'CONTENT';
  currentNode?: boolean;
  highlightName?: string;
}

export interface State {
  readonly filter: string;
  readonly results: List<SearchResult>;
  readonly options: SearchOptions;
  readonly running?: boolean;
  readonly quick?: boolean;
}
