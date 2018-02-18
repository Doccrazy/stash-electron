import { List, Map, OrderedMap } from 'immutable';
import {GitCommitInfo} from '../../utils/git';

export interface State {
  readonly status: GitStatus,
  readonly lastStatusUpdate: Date,
  readonly working?: boolean,
  readonly progressStatus?: string,
  readonly popupOpen?: boolean,
  readonly markedForReset?: string,
  readonly clone: CloneState,
  readonly signature: SignatureState,
  readonly history: GitHistory
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

export interface GitHistory {
  commits: OrderedMap<string, GitCommitInfo>,
  files: Map<string, List<string>>
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
