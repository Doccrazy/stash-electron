// @flow
import { List } from 'immutable';
import debounce from 'lodash.debounce';
import { getRepo } from './repository';
import { selectSpecial } from './currentNode';
import { afterAction } from '../store/eventMiddleware';
import { hierarchy, recursiveChildIds } from '../utils/repository';
import EntryPtr from '../domain/EntryPtr.ts';
import typeFor from '../fileType/index';

const CHANGE_FILTER = 'search/CHANGE_FILTER';
const START = 'search/START';
const RESULTS = 'search/RESULTS';
const SET_OPTIONS = 'search/SET_OPTIONS';

function quickFilter() {
  return (dispatch, getState) => {
    const { repository, search, currentNode } = getState();

    if (!search.filter || search.filter.length < 2) {
      if (currentNode.specialId === 'searchResults') {
        dispatch(selectSpecial());
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

const quickFilterDelayed = debounce(dispatch => {
  dispatch(quickFilter());
}, 0);

export function changeFilter(filter: string) {
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
    || typeFor(ptr.entry).matches(content, filterLC);
}

async function filterByContent(nodes, rootNodeId: string = '/', filter: string) {
  console.time('resolve');
  const allSupportedEntries = new List(recursiveChildIds(nodes, rootNodeId))
    .flatMap(nodeId => (nodes[nodeId].entries || []).map(entry => new EntryPtr(nodeId, entry)))
    .filter(ptr => typeFor(ptr.entry).parse);
  console.timeEnd('resolve');
  console.log('# supported items: ', allSupportedEntries.size);

  console.time('readAll');
  const buffers = new List(await Promise.all(allSupportedEntries.map(ptr => getRepo().readFile(ptr.nodeId, ptr.entry).then(buffer => ({ ptr, buffer }))).toArray()));
  console.timeEnd('readAll');
  console.time('parse');
  const parsed = buffers.map(({ ptr, buffer }) => ({ ptr, content: typeFor(ptr.entry).parse(buffer) }));
  console.timeEnd('parse');

  console.time('filter');
  const filterLC = filter.toLowerCase();
  const results = parsed.filter(({ ptr, content }) => matches(ptr, content, filterLC))
    .map(item => item.ptr);
  console.timeEnd('filter');

  return results;
}

function filterByName(nodes, rootNodeId: string = '/', filter: string, matchPath: boolean = false) {
  console.time('resolve');
  const allEntries = new List(recursiveChildIds(nodes, rootNodeId))
    .flatMap(nodeId => (nodes[nodeId].entries || []).map(entry => new EntryPtr(nodeId, entry)));
  console.timeEnd('resolve');
  console.log('# items: ', allEntries.size);

  console.time('filter');
  const filterLC = filter.toLowerCase();
  const results = allEntries.filter(ptr => ptr.entry.toLowerCase().includes(filterLC)
    || (matchPath && hierarchy(nodes, ptr.nodeId).find(node => node.id !== '/' && node.name.toLowerCase().includes(filterLC))));
  console.timeEnd('filter');

  return results;
}

export function startSearch() {
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

export function toggleScope() {
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

type StateType = {
  filter: string,
  results: List<EntryPtr>,
  options: {}
};

export default function reducer(state: StateType = { filter: '', results: new List(), options: {} }, action: { type: string, payload: any }) {
  switch (action.type) {
    case CHANGE_FILTER:
      return { ...state, filter: action.payload || '' };
    case SET_OPTIONS:
      return { ...state, options: { ...state.options, ...action.payload } };
    case START:
      return { ...state, running: true, results: new List() };
    case RESULTS:
      return { ...state, running: false, results: action.payload.results, quick: action.payload.quick };
    default:
      return state;
  }
}
