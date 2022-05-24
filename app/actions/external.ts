import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import { shell } from 'electron';
import * as remote from '@electron/remote';
import { toastr } from 'react-redux-toastr';
import { childNodeByName, isAccessible } from '../utils/repository';
import EntryPtr from '../domain/EntryPtr';
import * as repoActions from './repository';
import { typeFor } from '../fileType/index';
import { State } from './types/external';
import { RootState, TypedAction, TypedThunk } from './types/index';

export enum Actions {
  FILES_WRITTEN = 'external/FILES_WRITTEN'
}

export function browseForAdd(): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const files = (
      await remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
        title: 'Select file(s) to encrypt into Stash',
        properties: ['openFile', 'multiSelections']
      })
    ).filePaths;
    if (files && files.length) {
      await dispatch(addFiles(files));
    }
  };
}

export function addFiles(files: string[]): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const { repository, currentNode } = getState();
    if (!currentNode.nodeId) {
      return;
    }
    if (!isAccessible(getState().repository.nodes, currentNode.nodeId, getState().privateKey.username)) {
      return;
    }
    const node = repository.nodes[currentNode.nodeId];

    const filePtrs: EntryPtr[] = [];
    for (const fileName of files) {
      const baseName = path.parse(fileName).base;
      const stat = await fs.stat(fileName);

      if (typeFor(fileName).parse) {
        toastr.error('', `Failed to add ${baseName}: Reserved file extension.`);
      } else if (childNodeByName(repository.nodes, node, baseName)) {
        toastr.error('', `Failed to add ${baseName}: A folder with the same name already exists.`);
      } else if (stat.isFile()) {
        if (stat.size > 1024 * 1024 * 10) {
          toastr.warning('', `File size of ${baseName} exceeds recommended 10MiB.`);
        }

        const buffer = await fs.readFile(fileName);
        const ptr = new EntryPtr(node.id, baseName);
        await dispatch(repoActions.writeEntry(ptr, buffer));
        filePtrs.push(ptr);
      }
    }

    if (filePtrs.length) {
      dispatch({
        type: Actions.FILES_WRITTEN,
        payload: filePtrs
      });

      toastr.success('', `${filePtrs.length} file(s) have been successfully added.`, { timeOut: 2000 });
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

export function open(ptr?: EntryPtr): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    if (!ptr) {
      ptr = getState().currentEntry.ptr;
    }
    if (!ptr) {
      return;
    }

    const buffer = await read(getState(), ptr);

    let absPath = path.join(tempDir, ptr.entry);
    let ctr = 0;
    while (fs.existsSync(absPath)) {
      absPath = path.join(tempDir, `${path.parse(ptr.entry).name}_${ctr}${path.parse(ptr.entry).ext}`);
      ctr += 1;
    }

    await fs.writeFile(absPath, buffer);
    // TODO mark file for erase, wait for app to close, then a) check for changes, prompt to update b) rm after little delay
    shell.openPath(absPath);
  };
}

export function browseForSaveAs(ptr?: EntryPtr): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    if (!ptr) {
      ptr = getState().currentEntry.ptr;
    }
    if (!ptr) {
      return;
    }

    const targetPath = (
      await remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
        title: 'Save as *UNENCRYPTED*',
        defaultPath: ptr.entry
      })
    ).filePath;
    if (targetPath) {
      dispatch(saveAs(ptr, targetPath));
    }
  };
}

function saveAs(ptr: EntryPtr, targetPath: string): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    try {
      const buffer = await read(getState(), ptr);

      await fs.writeFile(targetPath, buffer);
      toastr.success('', `${ptr.entry} saved successfully.`, { timeOut: 2000 });
    } catch (e) {
      toastr.error('', `Save failed: ${e}.`);
    }
  };
}

// TODO git history
async function read(state: RootState, ptr: EntryPtr) {
  return repoActions.getRepo().readFile(ptr.nodeId, ptr.entry);
}

type Action = TypedAction<Actions.FILES_WRITTEN, EntryPtr[]>;

type Thunk<R> = TypedThunk<Action, R>;

export default function reducer(state: State = {}, action: Action): State {
  switch (action.type) {
    default:
      return state;
  }
}
