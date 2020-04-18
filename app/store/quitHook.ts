import { remote } from 'electron';
import { Dispatch, GetState } from '../actions/types/index';
import { openPopup } from '../actions/git';
import { t } from '../utils/i18n/redux';

export default function installQuitHook(dispatch: Dispatch, getState: GetState) {
  // https://github.com/electron/electron/issues/7977#issuecomment-267430262
  let closeWindow = false;

  window.addEventListener('beforeunload', (evt) => {
    if (closeWindow) {
      return;
    }

    if (getState().git.status.commitsAheadOrigin) {
      evt.returnValue = false;

      setTimeout(() => {
        const choice = remote.dialog.showMessageBoxSync(remote.getCurrentWindow(), {
          type: 'question',
          buttons: [t('utils.quitHook.button.quit'), t('utils.quitHook.button.return')],
          defaultId: 0,
          cancelId: 1,
          title: t('utils.quitHook.title'),
          message: t('utils.quitHook.message')
        });
        if (choice === 1) {
          dispatch(openPopup());
        } else {
          closeWindow = true;
          remote.getCurrentWindow().close();
        }
      });
    }
  });
}
