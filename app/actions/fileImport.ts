/* eslint-disable no-await-in-loop,no-restricted-syntax,no-plusplus */
import * as fs from 'fs-extra';
import kdbxweb from 'kdbxweb';
import {State, ImportSettings, StatusType} from './types/fileImport';
import { childNodeByName, cleanFileName } from '../utils/repository';
import EntryPtr from '../domain/EntryPtr';
import { createChildNode, writeEntry } from './repository';
import {InternalType, typeById} from '../fileType/index';
import {Action, Thunk} from './types/index';

const OPEN = 'fileImport/OPEN';
const CLOSE = 'fileImport/CLOSE';
const CHANGE_SETTINGS = 'fileImport/CHANGE_SETTINGS';
const STATUS = 'fileImport/STATUS';

export function open() {
  return {
    type: OPEN
  };
}

export function close(): Action<void> {
  return {
    type: CLOSE
  };
}

export function changeSettings(settings: ImportSettings): Action<ImportSettings> {
  return {
    type: CHANGE_SETTINGS,
    payload: settings
  };
}

export function performImport(): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const passwordType = typeById('password') as InternalType<any>;

    function status(type: StatusType, message: string) {
      dispatch({
        type: STATUS,
        payload: {
          type,
          message
        }
      });
    }

    let groupCount = 0;
    let entryCount = 0;

    async function importGroup(group: any, nodeId: string) {
      groupCount++;
      status('progress', `Importing group ${group.name}`);

      const targetNode = getState().repository.nodes[nodeId];
      for (const childGroup of group.groups) {
        // sanitize / de-conflict name
        let safeName = cleanFileName(childGroup.name, '_').trim();
        while (targetNode.entries && targetNode.entries.includes(safeName)) {
          // conflict
          safeName += '_';
        }

        // create node if it does not exist
        let childNodeId = childNodeByName(getState().repository.nodes, targetNode.id, safeName);
        if (!childNodeId) {
          await dispatch(createChildNode(targetNode.id, safeName));
          childNodeId = childNodeByName(getState().repository.nodes, targetNode.id, safeName);
        }
        if (!childNodeId) {
          throw new Error(`Group ${safeName} could not be created`);
        }

        await importGroup(childGroup, childNodeId);
      }

      let nameCtr = 1;
      for (const entry of group.entries) {
        entryCount++;

        // sanitize / de-conflict name
        let safeName = cleanFileName(entry.fields.Title || `Unnamed ${nameCtr++}`, '_').trim();
        while (childNodeByName(getState().repository.nodes, targetNode.id, passwordType.toFileName(safeName))) {
          // conflict
          safeName += '_';
        }

        // transform content
        const passwordContent = passwordType.fromKdbxEntry(entry);
        const buffer = passwordType.write(passwordContent);

        await dispatch(writeEntry(new EntryPtr(targetNode.id, passwordType.toFileName(safeName)), buffer));
      }
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
      const dataBuffer = await fs.readFile(settings.filePath);
      const keyFileBuffer = settings.keyFile ? await fs.readFile(settings.keyFile) : null;

      const credentials = new kdbxweb.Credentials(settings.masterKey ? kdbxweb.ProtectedValue.fromString(settings.masterKey) : null,
        keyFileBuffer ? keyFileBuffer.buffer : null);
      const kdbx = await kdbxweb.Kdbx.load(dataBuffer.buffer, credentials);

      await importGroup(kdbx.getDefaultGroup(), currentNode.nodeId);

      status('success', `Import successful (${groupCount} groups, ${entryCount} entries).`);
    } catch (e) {
      const msg = e instanceof kdbxweb.KdbxError ? `${e.message}.` : `Error: ${e}`;
      status('error', msg);
    }
  };
}

export default function reducer(state: State = { open: false, settings: {} }, action: Action<any>): State {
  switch (action.type) {
    case OPEN:
      return { open: true, settings: {} };
    case CLOSE:
      return { open: false, settings: {} };
    case CHANGE_SETTINGS:
      return { ...state, settings: action.payload };
    case STATUS:
      return { ...state, status: action.payload.type, statusMessage: action.payload.message };
    default:
      return state;
  }
}
