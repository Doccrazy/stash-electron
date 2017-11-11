import * as PrivateKey from '../actions/privateKey';
import { Dispatch, GetState } from '../actions/types/index';

export default function setupInactivityLock(dispatch: Dispatch, getState: GetState) {
  let lastUserActivity: number = Date.now();
  function updateLastActivity() {
    lastUserActivity = Date.now();
  }

  document.addEventListener('keydown', updateLastActivity);
  document.addEventListener('mousedown', updateLastActivity);

  setInterval(() => {
    const timeout = getState().settings.current.inactivityTimeout;
    const mayLock = getState().privateKey.encrypted && !!getState().privateKey.key;
    if (timeout && mayLock && (Date.now() - lastUserActivity) / 60000 > timeout) {
      lastUserActivity = Date.now();
      dispatch(PrivateKey.lock());
    }
  }, 1000);
}
