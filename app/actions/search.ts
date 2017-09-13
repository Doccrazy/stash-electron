import { List } from 'immutable';
import { debounce } from 'lodash-es';
import { getRepo } from './repository';
import {deselectSpecial, selectSpecial} from './currentNode';
import { hierarchy, recursiveChildIds } from '../utils/repository';
import EntryPtr from '../domain/EntryPtr';
import typeFor, {typeForInt} from '../fileType/index';
import {Dispatch, OptionalAction, TypedAction, TypedThunk} from './types/index';
import {SearchOptions, State} from './types/search';
import {State as RepositoryState} from './types/repository';

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

function matches(ptr: EntryPtr, content: any, filterLC: string) {
  return ptr.entry.toLowerCase().includes(filterLC)
    || typeForInt(ptr.entry).matches(content, filterLC);
}

type PtrWithBuffer = { ptr: EntryPtr, buffer: Buffer };
type PtrWithContent = { ptr: EntryPtr, content: any };

function readContentBuffer(ptr: EntryPtr): Promise<PtrWithBuffer> {
  return getRepo().readFile(ptr.nodeId, ptr.entry).then((buffer: Buffer) => ({ ptr, buffer }));
}

function allEntriesBelow(nodes: RepositoryState['nodes'], rootNodeId: string): EntryPtr[] {
  return recursiveChildIds(nodes, rootNodeId)
    .map(nodeId => nodes[nodeId].entries.toArray().map(entry => new EntryPtr(nodeId, entry)))
    .reduce((acc, ptrs) => { acc.push(...ptrs); return acc; }, []);
}

async function filterByContent(nodes: RepositoryState['nodes'], rootNodeId: string = '/', filter: string) {
  console.time('resolve');
  const allSupportedEntries = allEntriesBelow(nodes, rootNodeId)
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
  const filterLC = filter.toLowerCase();
  const results = parsed.filter(({ ptr, content }: PtrWithContent) => matches(ptr, content, filterLC))
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
  const filterLC = filter.toLowerCase();
  const results = allEntries.filter((ptr: EntryPtr) => ptr.entry.toLowerCase().includes(filterLC)
    || (matchPath && !!hierarchy(nodes, ptr.nodeId).find(node => node.id !== '/' && node.name.toLowerCase().includes(filterLC))));
  console.timeEnd('filter');

  return List(results);
}

export function startSearch(): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const { repository, search, currentNode } = getState();

    if (!search.filter || search.filter.length < 2) {
      return;
    }

    quickFilterDelayed.cancel();
    dispatch({
      type: Actions.START
    });

    const results: List<EntryPtr> = await filterByContent(repository.nodes, (search.options.limitedScope && currentNode.nodeId) || '/', search.filter);

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
