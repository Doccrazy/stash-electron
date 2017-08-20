import alphanumSort from 'alphanum-sort';
import * as actions from '../actions/repository';
import { hierarchy } from '../utils/repository';

const MULTI_OPEN = false;

export default function repository(state = { nodes: { }, open: new Set() }, action) {
  switch (action.type) {
    case actions.LOAD:
      return { ...state, path: action.payload };
    case actions.RESET_DIRS:
      return { ...state, nodes: { '/': { id: '/', title: 'Root' } }, open: new Set(), selected: null };
    case actions.READ_DIR: {
      const newNodes = { ...state.nodes };
      const subPath = action.payload.path;

      newNodes[subPath] = {
        ...newNodes[subPath],
        children: alphanumSort(action.payload.children.map(dir => `${subPath}${dir}/`)),
        entries: alphanumSort(action.payload.entries)
      };

      action.payload.children.forEach(dir => {
        newNodes[`${subPath}${dir}/`] = {
          ...newNodes[`${subPath}${dir}/`],
          id: `${subPath}${dir}/`,
          name: dir,
          title: dir,
          parent: subPath
        };
      });
      return { ...state, nodes: newNodes };
    }
    case actions.EXPAND: {
      let newOpen;
      if (MULTI_OPEN) {
        newOpen = new Set(state.open).add(action.payload);
      } else {
        newOpen = new Set(hierarchy(state.nodes, action.payload).map(node => node.id));
      }
      return { ...state, open: newOpen };
    }
    case actions.CLOSE: {
      const newOpen = new Set(state.open);
      newOpen.delete(action.payload);
      return { ...state, open: newOpen };
    }
    case actions.SELECT:
      return { ...state, selected: action.payload };
    default:
      return state;
  }
}
