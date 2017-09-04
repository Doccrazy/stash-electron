import fs from 'fs-extra';
import path from 'path';
import { remote } from 'electron';
import { toastr } from 'react-redux-toastr';
import { childNodeByName, EntryPtr } from '../utils/repository';
import * as repoActions from './repository';
import { afterAction } from '../store/eventMiddleware';
import typeFor from '../fileType/index';

const OPEN = 'external/OPEN';

export function browseForAdd() {
  return async (dispatch, getState) => {
    const files = remote.dialog.showOpenDialog({
      title: 'Select file(s) to encrypt into Stash',
      properties: ['openFile', 'multiSelections']
    });
    if (files) {
      dispatch(addFiles(files));
    }
  };
}

export function addFiles(files) {
  return async (dispatch, getState) => {
    const { repository, currentNode } = getState();
    if (!currentNode.nodeId) {
      return;
    }
    const node = repository.nodes[currentNode.nodeId];

    let count = 0;
    for (const fileName of files) {
      const baseName = path.parse(fileName).base;
      const stat = await fs.stat(fileName);

      if (typeFor(fileName).parse) {
        toastr.error(`Failed to add ${baseName}: Reserved file extension.`);
      } else if (childNodeByName(repository.nodes, node, baseName)) {
        toastr.error(`Failed to add ${baseName}: A folder with the same name already exists.`);
      } else if (stat.isFile()) {
        if (stat.size > 1024 * 1024 * 10) {
          toastr.warning(`File size of ${baseName} exceeds recommended 10MiB.`);
        }

        const buffer = await fs.readFile(fileName);
        const ptr = new EntryPtr(node.id, baseName);
        await dispatch(repoActions.writeEntry(ptr, buffer));
        count += 1;
      }
    }

    if (count) {
      toastr.success(`${count} file(s) have been successfully added.`);
    }
  };
}

export function open(ptr) {
  EntryPtr.assert(ptr);
  return async (dispatch, getState) => {
  };
}

export default function reducer(state = {}, action) {
  switch (action.type) {
    case OPEN:
    default:
      return state;
  }
}
