/* eslint-disable no-await-in-loop,no-restricted-syntax,no-plusplus */
import * as kdbxweb from 'kdbxweb';
import * as path from 'path';
import KeePassImporter from '../import/KeePassImporter';
import {State, ImportSettings, StatusType} from './types/fileImport';
import { childNodeByName } from '../utils/repository';
import EntryPtr from '../domain/EntryPtr';
import { createChildNode, writeEntry } from './repository';
import {OptionalAction, TypedAction, TypedThunk} from './types/index';

export enum Actions {
  OPEN = 'fileImport/OPEN',
  CLOSE = 'fileImport/CLOSE',
  CHANGE_SETTINGS = 'fileImport/CHANGE_SETTINGS',
  STATUS = 'fileImport/STATUS'
}

export function open(): Action {
  return {
    type: Actions.OPEN
  };
}

export function close(): Action {
  return {
    type: Actions.CLOSE
  };
}

export function changeSettings(settings: ImportSettings): Action {
  return {
    type: Actions.CHANGE_SETTINGS,
    payload: settings
  };
}

export function performImport(): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    function status(type: StatusType, message: string) {
      dispatch({
        type: Actions.STATUS,
        payload: {
          type,
          message
        }
      });
    }

    const { currentNode, fileImport: { settings } } = getState();
    if (!currentNode.nodeId) {
      return;
    }

    if (!settings.filePath) {
      status('error', 'Please select a file to import.');
      return;
    }
    if (!settings.masterKey && !settings.keyFile) {
      status('error', 'Please provide either a master key or a key file.');
      return;
    }

    status('progress', 'Starting import...');

    try {
      const importer = new KeePassImporter<string>(settings.filePath, settings, {
        createNode: async (parentNode, name) => {
          const targetNode = getState().repository.nodes[parentNode];
          while (targetNode.entryByName(name)) {
            // conflict
            name += '_';
          }

          // create node if it does not exist
          let childNodeId = childNodeByName(getState().repository.nodes, targetNode.id, name);
          if (!childNodeId) {
            await dispatch(createChildNode(targetNode.id, name));
            childNodeId = childNodeByName(getState().repository.nodes, targetNode.id, name);
          }
          if (!childNodeId) {
            throw new Error(`Group ${name} could not be created`);
          }
          return childNodeId;
        },
        createEntry: async (parentNode, fileName, content) => {
          while (childNodeByName(getState().repository.nodes, parentNode, fileName)) {
            // conflict
            const parsed = path.parse(fileName);
            fileName = `${parsed.name}_${parsed.ext}`;
          }
          await dispatch(writeEntry(new EntryPtr(parentNode, fileName), content));
        },
        progress: message => status('progress', message)
      });

      await importer.performImport(currentNode.nodeId);

      status('success', `Import successful (${importer.groupCount} groups, ${importer.entryCount} entries).`);
    } catch (e) {
      const msg = e instanceof kdbxweb.KdbxError ? `${e.message}.` : `Error: ${e}`;
      status('error', msg);
    }
  };
}

type Action =
  OptionalAction<Actions.OPEN, EntryPtr>
  | OptionalAction<Actions.CLOSE, EntryPtr>
  | TypedAction<Actions.CHANGE_SETTINGS, ImportSettings>
  | TypedAction<Actions.STATUS, { type: StatusType, message: string }>;

type Thunk<R> = TypedThunk<Action, R>;

export default function reducer(state: State = { open: false, settings: {} }, action: Action): State {
  switch (action.type) {
    case Actions.OPEN:
      return { open: true, settings: {} };
    case Actions.CLOSE:
      return { open: false, settings: {} };
    case Actions.CHANGE_SETTINGS:
      return { ...state, settings: action.payload };
    case Actions.STATUS:
      return { ...state, status: action.payload.type, statusMessage: action.payload.message };
    default:
      return state;
  }
}
