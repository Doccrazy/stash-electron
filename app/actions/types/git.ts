import {GitCommitInfo} from '../../utils/git';

export interface State {
  status: GitStatus,
  lastStatusUpdate: Date,
  working?: boolean,
  progressStatus?: string,
  popupOpen?: boolean,
  markedForReset?: string,
  clone: CloneState,
  signature: SignatureState
}

export interface GitStatus {
  initialized: boolean,
  commits?: GitCommitInfo[],
  commitsAheadOrigin?: number,
  conflict?: boolean,
  branchName?: string,
  upstreamName?: string,
  incomingCommits?: number,
  allowBackgroundFetch?: boolean,
  error?: string
}

export interface FetchResult {
  success: true,
  allowNonInteractive?: boolean
}

export interface CloneState {
  open?: boolean,
  remoteUrl?: string,
  target?: string
}

export interface SignatureState {
  open?: boolean,
  name?: string,
  email?: string,
  local?: boolean
}
