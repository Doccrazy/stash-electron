import { remote } from 'electron';
import Node from '../domain/Node';
import KeePassExporter, { ExportNodeId } from '../import/KeePassExporter';
import { isAccessible, isAnyAccessible } from '../utils/repository';
import * as Repository from './repository';
import {State, ExportSettings, StatusType} from './types/fileExport';
import EntryPtr from '../domain/EntryPtr';
import {OptionalAction, TypedAction, TypedThunk} from './types';

export enum Actions {
  OPEN = 'fileExport/OPEN',
  CLOSE = 'fileExport/CLOSE',
  CHANGE_SETTINGS = 'fileExport/CHANGE_SETTINGS',
  STATUS = 'fileExport/STATUS'
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

export function changeSettings(settings: ExportSettings): Action {
  return {
    type: Actions.CHANGE_SETTINGS,
    payload: settings
  };
}

export function valid(settings: ExportSettings): settings is { masterKey: string } {
  return !!settings.masterKey && settings.masterKey === settings.repeatMasterKey;
}

export function performExport(): Thunk<Promise<void>> {
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

    const { currentNode, repository, privateKey, fileExport: { settings } } = getState();
    if (!currentNode.nodeId) {
      return;
    }

    if (!valid(settings)) {
      return;
    }

    const targetFile = remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
      title: 'Save KeePass database',
      filters: [{name: 'KeePass database file', extensions: ['kdbx']}]
    });
    if (!targetFile) {
      return;
    }

    status('progress', 'Starting export...');

    try {
      const nodeToExport = repository.nodes[currentNode.nodeId];
      const exporter = new KeePassExporter(settings.masterKey, nodeToExport.name);

      await new NodesExporter(exporter, msg => status('progress', msg), repository.nodes, privateKey.username).exportNode(nodeToExport);

      await exporter.save(targetFile);

      status('success', `Export successful (${exporter.groupCount} groups, ${exporter.entryCount} entries).`);
    } catch (e) {
      status('error',  `Error: ${e}`);
    }
  };
}

class NodesExporter {
  constructor(private exporter: KeePassExporter, private progress: (msg: string) => void,
              private allNodes: { [nodeId: string]: Node }, private username?: string) {
  }

  async exportNode(node: Node, parentExportId?: ExportNodeId) {
    for (const childId of node.childIds) {
      // do not write empty folders
      if (!isAnyAccessible(this.allNodes, childId, this.username)) {
        continue;
      }
      const childNode = this.allNodes[childId];
      const childExportId = this.exporter.createNode(parentExportId, childNode.name);
      await this.exportNode(childNode, childExportId);
    }
    // only write entries if they can actually be decrypted
    if (isAccessible(this.allNodes, node.id, this.username)) {
      this.progress(`Exporting folder ${node.name}`);
      for (const entryName of node.entries) {
        const data = await Repository.getRepo().readFile(node.id, entryName);
        await this.exporter.createEntry(parentExportId, entryName, data);
      }
    }
  }
}

type Action =
  OptionalAction<Actions.OPEN, EntryPtr>
  | OptionalAction<Actions.CLOSE, EntryPtr>
  | TypedAction<Actions.CHANGE_SETTINGS, ExportSettings>
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
