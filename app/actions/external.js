import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { remote, shell } from 'electron';
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
    const buffer = await repoActions.getRepo().readFile(ptr.nodeId, ptr.entry);

    let absPath = path.join(tempDir, ptr.entry);
    let ctr = 0;
    while (fs.existsSync(absPath)) {
      absPath = path.join(tempDir, `${path.parse(ptr.entry).name}_${ctr}${path.parse(ptr.entry).ext}`);
      ctr += 1;
    }

    await fs.writeFile(absPath, buffer);
    // TODO mark file for erase, wait for app to close, then a) check for changes, prompt to update b) rm after little delay
    shell.openItem(absPath);
  };
}

export function browseForSaveAs(ptr) {
  EntryPtr.assert(ptr);
  return async (dispatch, getState) => {
    const targetPath = remote.dialog.showSaveDialog({
      title: 'Save as *UNENCRYPTED*',
      defaultPath: ptr.entry
    });
    if (targetPath) {
      dispatch(saveAs(ptr, targetPath));
    }
  };
}

function saveAs(ptr, targetPath) {
  EntryPtr.assert(ptr);
  return async (dispatch, getState) => {
    try {
      const buffer = await repoActions.getRepo().readFile(ptr.nodeId, ptr.entry);

      await fs.writeFile(targetPath, buffer);
      toastr.success(`${ptr.entry} saved successfully.`);
    } catch (e) {
      toastr.error(`Save failed: ${e}.`);
    }
  };
}

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stash-'));
window.addEventListener('beforeunload', () => {
  if (tempDir && fs.existsSync(tempDir)) {
    // TODO secure overwrite
    fs.removeSync(tempDir);
  }
});

export default function reducer(state = {}, action) {
  switch (action.type) {
    case OPEN:
    default:
      return state;
  }
}
