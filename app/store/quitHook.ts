import { remote } from 'electron';
import { Dispatch, GetState } from '../actions/types/index';
import { openPopup } from '../actions/git';

const MESSAGE = `You have committed some changes, but did not push them to the remote repository. Only pushed commits are visible to others.

Are you sure you want to quit?`;

export default function installQuitHook(dispatch: Dispatch, getState: GetState) {
  window.onbeforeunload = ev => {
    if (getState().git.status.commitsAheadOrigin) {
      const choice = remote.dialog.showMessageBox(remote.getCurrentWindow(), {
        type: 'question',
        buttons: ['Quit anyway', 'Return to Stash'],
        defaultId: 0,
        cancelId: 1,
        title: 'Pending commits',
        message: MESSAGE
      });
      if (choice === 1) {
        dispatch(openPopup());
        return false;
      }
    }
    return undefined;
  };
}
