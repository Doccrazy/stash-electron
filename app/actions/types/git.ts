export interface State {
  status: GitStatus,
  lastStatusUpdate: Date,
  working?: boolean,
  progressStatus?: string,
  popupOpen?: boolean,
  markedForReset?: string,
  clonePopupOpen?: boolean,
  cloneRemoteUrl?: string,
  cloneTarget?: string
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

export interface GitCommitInfo {
  hash: string,
  message: string,
  authorName: string,
  authorEmail: string,
  date: Date,
  pushed?: boolean
}

export interface FetchResult {
  success: true,
  allowNonInteractive?: boolean
}
