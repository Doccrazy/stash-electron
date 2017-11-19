import { updateStatus } from '../actions/git';
import { Dispatch, GetState } from '../actions/types/index';

const CHECK_INTERVAL_SUCCESS_MINS = 5;
const CHECK_INTERVAL_ERROR_MINS = 1;

export default function setupGitPolling(dispatch: Dispatch, getState: GetState) {
  setInterval(() => {
    const gitStatus = getState().git.status;
    const lastUpdate = getState().git.lastStatusUpdate;
    const working = getState().git.working;
    if (gitStatus.initialized && gitStatus.upstreamName && gitStatus.allowBackgroundFetch && !working) {
      const interval = gitStatus.error ? CHECK_INTERVAL_ERROR_MINS : CHECK_INTERVAL_SUCCESS_MINS;
      if ((Date.now() - lastUpdate.getTime()) / 60000 > interval) {
        dispatch(updateStatus(true));
      }
    }
  }, 10000);
}
