import { List } from 'immutable';
import { debounce } from 'lodash';
import { getRepo, Actions as RepoActions } from './repository';
import { deselectSpecial, selectSpecial } from './currentNode';
import { hierarchy, isAccessible, recursiveChildIds } from '../utils/repository';
import EntryPtr from '../domain/EntryPtr';
import { typeFor } from '../fileType/index';
import { Dispatch, GetState, OptionalAction, TypedAction, TypedThunk } from './types/index';
import { SearchOptions, SearchResult, State } from './types/search';
import { State as RepositoryState } from './types/repository';
import { afterAction } from '../store/eventMiddleware';
import { FuzzyStringMatcher } from '../utils/StringMatcher';

export enum Actions {
  CHANGE_FILTER = 'search/CHANGE_FILTER',
  START = 'search/START',
  RESULTS = 'search/RESULTS',
  SET_OPTIONS = 'search/SET_OPTIONS'
}

// TODO refactor 'as any' dispatches

function quickFilter(): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const { repository, search, currentNode, privateKey } = getState();

    if (!search.filter || search.filter.length < 2) {
      if (currentNode.specialId === 'searchResults') {
        dispatch(deselectSpecial() as any);
      }
      return;
    }

    // search by name/path
    const nameResults: List<SearchResult> = filterByName(repository.nodes, '/', search.filter, true, currentNode.nodeId);

    // merge new results by name with previous content results to prevent result "flashing"
    let nameWithLastResults = nameResults;
    const lastContentResults = search.results.filter((res) => res.match === 'CONTENT');
    lastContentResults.forEach((res) => {
      if (!nameWithLastResults.some((v) => v.ptr.equals(res.ptr))) {
        nameWithLastResults = nameWithLastResults.push(res);
      }
    });

    dispatch({
      type: Actions.RESULTS,
      payload: {
        quick: true,
        results: nameWithLastResults
      }
    });

    if (currentNode.specialId !== 'searchResults') {
      dispatch(selectSpecial('searchResults') as any);
    }

    // search by content (slow, asynchronous)
    const contentResults: List<SearchResult> = await filterByContent(
      repository.nodes,
      '/',
      search.filter,
      privateKey.username,
      currentNode.nodeId
    );
    // merge results and order by score
    let allResults = nameResults;
    contentResults.forEach((res) => {
      if (!allResults.some((v) => v.ptr.equals(res.ptr))) {
        allResults = allResults.push(res);
      }
    });
    dispatch({
      type: Actions.RESULTS,
      payload: {
        results: allResults
      }
    });
  };
}

const quickFilterDelayed = debounce((dispatch: Dispatch) => {
  dispatch(quickFilter());
}, 150);

export function changeFilter(filter: string): Thunk<void> {
  return (dispatch) => {
    dispatch({
      type: Actions.CHANGE_FILTER,
      payload: filter
    });

    quickFilterDelayed(dispatch);
  };
}

type PtrWithBuffer = { ptr: EntryPtr; buffer: Buffer };
type PtrWithContent = { ptr: EntryPtr; content: any };

function readContentBuffer(ptr: EntryPtr): Promise<PtrWithBuffer> {
  return getRepo()
    .readFile(ptr.nodeId, ptr.entry)
    .then((buffer: Buffer) => ({ ptr, buffer }));
}

function allEntriesBelow(nodes: RepositoryState['nodes'], rootNodeId: string, nodeFilter?: (nodeId: string) => boolean): EntryPtr[] {
  let allChildIds = recursiveChildIds(nodes, rootNodeId);
  if (nodeFilter) {
    allChildIds = allChildIds.filter(nodeFilter);
  }
  return allChildIds
    .map((nodeId) => nodes[nodeId].entries.toArray().map((entry) => new EntryPtr(nodeId, entry)))
    .reduce((acc, ptrs) => {
      acc.push(...ptrs);
      return acc;
    }, []);
}

async function filterByContent(
  nodes: RepositoryState['nodes'],
  rootNodeId = '/',
  filter: string,
  currentUser?: string,
  currentNodeId?: string
): Promise<List<SearchResult>> {
  console.time('resolve');
  const allSupportedEntries = allEntriesBelow(nodes, rootNodeId, (nodeId) => isAccessible(nodes, nodeId, currentUser)).filter(
    (ptr) => !!typeFor(ptr.entry).parse
  );
  console.timeEnd('resolve');
  console.log('# supported items: ', allSupportedEntries.length);

  console.time('readAll');
  const buffers = await Promise.all(allSupportedEntries.map(readContentBuffer));
  console.timeEnd('readAll');
  console.time('parse');
  const parsed = buffers.map(({ ptr, buffer }: PtrWithBuffer) => ({ ptr, content: typeFor(ptr.entry).parse!(buffer) }));
  console.timeEnd('parse');

  console.time('filter');
  const matcher = new FuzzyStringMatcher(filter);
  const results = parsed
    .map<SearchResult | undefined>(({ ptr, content }: PtrWithContent) => {
      if (typeFor(ptr.entry).matches!(content, matcher)) {
        return { ptr, match: 'CONTENT', currentNode: ptr.nodeId === currentNodeId };
      }
      return undefined;
    })
    .filter((v): v is SearchResult => !!v);
  console.timeEnd('filter');

  return List(results);
}

function filterByName(
  nodes: RepositoryState['nodes'],
  rootNodeId = '/',
  filter: string,
  matchPath = false,
  currentNodeId?: string
): List<SearchResult> {
  console.time('resolve');
  const allEntries = allEntriesBelow(nodes, rootNodeId);
  console.timeEnd('resolve');
  console.log('# items: ', allEntries.length);

  const hierarchyCache: { [nodeId: string]: string } = {};
  function hierToStr(nodeId: string): string {
    const cached = hierarchyCache[nodeId];
    if (cached) {
      return cached;
    }
    return (hierarchyCache[nodeId] = FuzzyStringMatcher.prepare(
      `/${hierarchy(nodes, nodeId)
        .slice(1)
        .map((node) => node.name)
        .join('/')}/`
    ));
  }

  console.time('filter');
  const matcher = new FuzzyStringMatcher(filter);
  const results = allEntries
    .map<SearchResult | undefined>((ptr: EntryPtr) => {
      const nameMatch = matcher.matchAndHighlight(typeFor(ptr.entry).toDisplayName(ptr.entry));
      if (nameMatch.matches) {
        return { ptr, match: 'NAME', currentNode: ptr.nodeId === currentNodeId, highlightHtml: nameMatch.highlight };
      } else if (matchPath && matcher.matchesPrepared(hierToStr(ptr.nodeId))) {
        return { ptr, match: 'PATH' };
      }
      return undefined;
    })
    .filter((v): v is SearchResult => !!v);
  console.timeEnd('filter');

  return List(results);
}

export function showResults(): Thunk<void> {
  return (dispatch, getState) => {
    if (getState().search.filter && getState().search.filter.length >= 2 && getState().currentNode.specialId !== 'searchResults') {
      dispatch(selectSpecial('searchResults') as any);
    }
  };
}

afterAction(RepoActions.RENAME_ENTRY, (dispatch, getState: GetState, { ptr, newName }: { ptr: EntryPtr; newName: string }) => {
  const { search } = getState();
  const idx = search.results.findIndex((res) => res.ptr.equals(ptr));
  if (idx >= 0) {
    dispatch({
      type: Actions.RESULTS,
      payload: {
        results: search.results.set(idx, { ...search.results.get(idx)!, ptr: new EntryPtr(ptr.nodeId, newName) })
      }
    });
  }
});

afterAction(RepoActions.DELETE_ENTRY, (dispatch, getState: GetState, { ptr }: { ptr: EntryPtr }) => {
  const { search } = getState();
  const idx = search.results.findIndex((res) => res.ptr.equals(ptr));
  if (idx >= 0) {
    dispatch({
      type: Actions.RESULTS,
      payload: {
        results: search.results.delete(idx)
      }
    });
  }
});

afterAction(RepoActions.MOVE_ENTRY, (dispatch, getState: GetState, { ptr, newNodeId }: { ptr: EntryPtr; newNodeId: string }) => {
  const { search } = getState();
  const idx = search.results.findIndex((res) => res.ptr.equals(ptr));
  if (idx >= 0) {
    dispatch({
      type: Actions.RESULTS,
      payload: {
        results: search.results.set(idx, { ...search.results.get(idx)!, ptr: new EntryPtr(newNodeId, ptr.entry) })
      }
    });
  }
});

type Action =
  | TypedAction<Actions.CHANGE_FILTER, string>
  | OptionalAction<Actions.START>
  | TypedAction<Actions.RESULTS, { quick?: boolean; results: List<SearchResult> }>
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
