import { List } from 'immutable';
import { debounce } from 'lodash-es';
import { getRepo } from './repository';
import {deselectSpecial, selectSpecial} from './currentNode';
import { hierarchy, recursiveChildIds } from '../utils/repository';
import EntryPtr from '../domain/EntryPtr';
import typeFor, {typeForInt} from '../fileType/index';
import {Dispatch, Thunk} from './types/index';
import {State} from './types/search';
import {State as RepositoryState} from './types/repository';

const CHANGE_FILTER = 'search/CHANGE_FILTER';
const START = 'search/START';
const RESULTS = 'search/RESULTS';
const SET_OPTIONS = 'search/SET_OPTIONS';

function quickFilter(): Thunk<void> {
  return (dispatch, getState) => {
    const { repository, search, currentNode } = getState();

    if (!search.filter || search.filter.length < 2) {
      if (currentNode.specialId === 'searchResults') {
        dispatch(deselectSpecial());
      }
      return;
    }

    const results = filterByName(repository.nodes, (search.options.limitedScope && currentNode.nodeId) || '/', search.filter);

    dispatch({
      type: RESULTS,
      payload: {
        quick: true,
        results
      }
    });
    if (currentNode.specialId !== 'searchResults') {
      dispatch(selectSpecial('searchResults'));
    }
  };
}

const quickFilterDelayed = debounce((dispatch: Dispatch) => {
  dispatch(quickFilter());
}, 0);

export function changeFilter(filter: string): Thunk<void> {
  return (dispatch, getState) => {
    dispatch({
      type: CHANGE_FILTER,
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

async function filterByContent(nodes: RepositoryState['nodes'], rootNodeId: string = '/', filter: string) {
  console.time('resolve');
  const allSupportedEntries = List(recursiveChildIds(nodes, rootNodeId))
    .flatMap((nodeId: string) => (nodes[nodeId].entries).map((entry: string) => new EntryPtr(nodeId, entry)))
    .filter(ptr => !!typeFor((ptr as EntryPtr).entry).parse);
  console.timeEnd('resolve');
  console.log('# supported items: ', allSupportedEntries.size);

  console.time('readAll');
  const buffers = List(await Promise.all(allSupportedEntries.map(readContentBuffer).toArray()));
  console.timeEnd('readAll');
  console.time('parse');
  const parsed = buffers.map(({ ptr, buffer }: PtrWithBuffer) => ({ ptr, content: typeForInt(ptr.entry).parse(buffer) }));
  console.timeEnd('parse');

  console.time('filter');
  const filterLC = filter.toLowerCase();
  const results = parsed.filter(({ ptr, content }: PtrWithContent) => matches(ptr, content, filterLC))
    .map((item: PtrWithContent) => item.ptr);
  console.timeEnd('filter');

  return results;
}

function filterByName(nodes: RepositoryState['nodes'], rootNodeId: string = '/', filter: string, matchPath: boolean = false) {
  console.time('resolve');
  const allEntries = List(recursiveChildIds(nodes, rootNodeId))
    .flatMap((nodeId: string) => (nodes[nodeId].entries || []).map((entry: string) => new EntryPtr(nodeId, entry)));
  console.timeEnd('resolve');
  console.log('# items: ', allEntries.size);

  console.time('filter');
  const filterLC = filter.toLowerCase();
  const results = allEntries.filter((ptr: EntryPtr) => ptr.entry.toLowerCase().includes(filterLC)
    || (matchPath && !!hierarchy(nodes, ptr.nodeId).find(node => node.id !== '/' && node.name.toLowerCase().includes(filterLC))));
  console.timeEnd('filter');

  return results;
}

export function startSearch(): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const { repository, search, currentNode } = getState();

    if (!search.filter || search.filter.length < 2) {
      return;
    }

    quickFilterDelayed.cancel();
    dispatch({
      type: START
    });

    const results = await filterByContent(repository.nodes, (search.options.limitedScope && currentNode.nodeId) || '/', search.filter);

    dispatch({
      type: RESULTS,
      payload: {
        results
      }
    });
    dispatch(selectSpecial('searchResults'));
  };
}

export function toggleScope(): Thunk<void> {
  return (dispatch, getState) => {
    const { search, currentNode } = getState();

    dispatch({
      type: SET_OPTIONS,
      payload: {
        limitedScope: !getState().search.options.limitedScope
      }
    });

    if (currentNode.specialId === 'searchResults') {
      dispatch(search.quick ? quickFilter() : startSearch());
    }
  };
}

export default function reducer(state: State = { filter: '', results: List(), options: {} }, action: { type: string, payload: any }): State {
  switch (action.type) {
    case CHANGE_FILTER:
      return { ...state, filter: action.payload || '' };
    case SET_OPTIONS:
      return { ...state, options: { ...state.options, ...action.payload } };
    case START:
      return { ...state, running: true, results: List() };
    case RESULTS:
      return { ...state, running: false, results: action.payload.results, quick: action.payload.quick };
    default:
      return state;
  }
}
