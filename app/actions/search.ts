import { List } from 'immutable';
import { debounce } from 'lodash-es';
import { getRepo, Actions as RepoActions } from './repository';
import {deselectSpecial, selectSpecial} from './currentNode';
import {hierarchy, isAccessible, recursiveChildIds} from '../utils/repository';
import EntryPtr from '../domain/EntryPtr';
import typeFor, {typeForInt} from '../fileType/index';
import { Dispatch, GetState, OptionalAction, TypedAction, TypedThunk } from './types/index';
import {SearchOptions, State} from './types/search';
import {State as RepositoryState} from './types/repository';
import { afterAction } from '../store/eventMiddleware';
import { FuzzyStringMatcher, StringMatcher } from '../utils/StringMatcher';

export enum Actions {
  CHANGE_FILTER = 'search/CHANGE_FILTER',
  START = 'search/START',
  RESULTS = 'search/RESULTS',
  SET_OPTIONS = 'search/SET_OPTIONS'
}

// TODO refactor 'as any' dispatches

function quickFilter(): Thunk<void> {
  return (dispatch, getState) => {
    const { repository, search, currentNode } = getState();

    if (!search.filter || search.filter.length < 2) {
      if (currentNode.specialId === 'searchResults') {
        dispatch(deselectSpecial() as any);
      }
      return;
    }

    const results: List<EntryPtr> = filterByName(repository.nodes, (search.options.limitedScope && currentNode.nodeId) || '/', search.filter);

    dispatch({
      type: Actions.RESULTS,
      payload: {
        quick: true,
        results
      }
    });
    if (currentNode.specialId !== 'searchResults') {
      dispatch(selectSpecial('searchResults') as any);
    }
  };
}

const quickFilterDelayed = debounce((dispatch: Dispatch) => {
  dispatch(quickFilter());
}, 0);

export function changeFilter(filter: string): Thunk<void> {
  return (dispatch, getState) => {
    dispatch({
      type: Actions.CHANGE_FILTER,
      payload: filter
    });

    quickFilterDelayed(dispatch);
  };
}

function matches(ptr: EntryPtr, content: any, matcher: StringMatcher) {
  return matcher.matches(ptr.entry)
    || typeForInt(ptr.entry).matches(content, matcher);
}

type PtrWithBuffer = { ptr: EntryPtr, buffer: Buffer };
type PtrWithContent = { ptr: EntryPtr, content: any };

function readContentBuffer(ptr: EntryPtr): Promise<PtrWithBuffer> {
  return getRepo().readFile(ptr.nodeId, ptr.entry).then((buffer: Buffer) => ({ ptr, buffer }));
}

function allEntriesBelow(nodes: RepositoryState['nodes'], rootNodeId: string, nodeFilter?: (nodeId: string) => boolean): EntryPtr[] {
  let allChildIds = recursiveChildIds(nodes, rootNodeId);
  if (nodeFilter) {
    allChildIds = allChildIds.filter(nodeFilter);
  }
  return allChildIds
    .map(nodeId => nodes[nodeId].entries.toArray().map(entry => new EntryPtr(nodeId, entry)))
    .reduce((acc, ptrs) => { acc.push(...ptrs); return acc; }, []);
}

async function filterByContent(nodes: RepositoryState['nodes'], rootNodeId: string = '/', filter: string, currentUser?: string) {
  console.time('resolve');
  const allSupportedEntries = allEntriesBelow(nodes, rootNodeId, (nodeId) => isAccessible(nodes, nodeId, currentUser))
    .filter(ptr => !!typeFor((ptr as EntryPtr).entry).parse);
  console.timeEnd('resolve');
  console.log('# supported items: ', allSupportedEntries.length);

  console.time('readAll');
  const buffers = await Promise.all(allSupportedEntries.map(readContentBuffer));
  console.timeEnd('readAll');
  console.time('parse');
  const parsed = buffers.map(({ ptr, buffer }: PtrWithBuffer) => ({ ptr, content: typeForInt(ptr.entry).parse(buffer) }));
  console.timeEnd('parse');

  console.time('filter');
  const matcher = new FuzzyStringMatcher(filter);
  const results = parsed.filter(({ ptr, content }: PtrWithContent) => matches(ptr, content, matcher))
    .map((item: PtrWithContent) => item.ptr);
  console.timeEnd('filter');

  return List(results);
}

function filterByName(nodes: RepositoryState['nodes'], rootNodeId: string = '/', filter: string, matchPath: boolean = false) {
  console.time('resolve');
  const allEntries = allEntriesBelow(nodes, rootNodeId);
  console.timeEnd('resolve');
  console.log('# items: ', allEntries.length);

  console.time('filter');
  const matcher = new FuzzyStringMatcher(filter);
  const results = allEntries.filter((ptr: EntryPtr) => matcher.matches(ptr.entry)
    || (matchPath && !!hierarchy(nodes, ptr.nodeId).find(node => node.id !== '/' && matcher.matches(node.name))));
  console.timeEnd('filter');

  return List(results);
}

export function startSearch(): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const { repository, search, currentNode, privateKey } = getState();

    if (!search.filter || search.filter.length < 2) {
      return;
    }

    quickFilterDelayed.cancel();
    dispatch({
      type: Actions.START
    });

    const results: List<EntryPtr> = await filterByContent(repository.nodes, (search.options.limitedScope && currentNode.nodeId) || '/',
      search.filter, privateKey.username);

    dispatch({
      type: Actions.RESULTS,
      payload: {
        results
      }
    });
    dispatch(selectSpecial('searchResults') as any);
  };
}

export function toggleScope(): Thunk<void> {
  return (dispatch, getState) => {
    const { search, currentNode } = getState();

    dispatch({
      type: Actions.SET_OPTIONS,
      payload: {
        limitedScope: !getState().search.options.limitedScope
      }
    });

    if (currentNode.specialId === 'searchResults') {
      dispatch(search.quick ? quickFilter() : startSearch());
    }
  };
}

export function showResults(): Thunk<void> {
  return (dispatch, getState) => {
    if (getState().search.filter && getState().search.filter.length >= 2 && getState().currentNode.specialId !== 'searchResults') {
      dispatch(selectSpecial('searchResults') as any);
    }
  };
}

afterAction(RepoActions.RENAME_ENTRY, (dispatch, getState: GetState, { ptr, newName }: { ptr: EntryPtr, newName: string }) => {
  const { search } = getState();
  const idx = search.results.indexOf(ptr);
  if (idx >= 0) {
    dispatch({
      type: Actions.RESULTS,
      payload: {
        results: search.results.set(idx, new EntryPtr(ptr.nodeId, newName))
      }
    });
  }
});

type Action =
  TypedAction<Actions.CHANGE_FILTER, string>
  | OptionalAction<Actions.START>
  | TypedAction<Actions.RESULTS, { quick?: boolean, results: List<EntryPtr> }>
  | TypedAction<Actions.SET_OPTIONS, SearchOptions>;

type Thunk<R> = TypedThunk<Action, R>;

export default function reducer(state: State = { filter: '', results: List(), options: {} }, action: Action): State {
  switch (action.type) {
    case Actions.CHANGE_FILTER:
      return { ...state, filter: action.payload || '' };
    case Actions.SET_OPTIONS:
      return { ...state, options: { ...state.options, ...action.payload } };
    case Actions.START:
      return { ...state, running: true, results: List() };
    case Actions.RESULTS:
      return { ...state, running: false, results: action.payload.results, quick: action.payload.quick };
    default:
      return state;
  }
}
