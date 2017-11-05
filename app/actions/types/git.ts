export interface State {
  status: GitStatus,
  working?: boolean,
  progressStatus?: string
}

export interface GitStatus {
  initialized: boolean,
  headCommit?: GitCommitInfo,
  commitsAheadOrigin?: number,
  conflict?: boolean,
  branchName?: string,
  upstreamName?: string,
  incomingCommits?: number,
  allowBackgroundFetch?: boolean,
  error?: string
}

export interface GitCommitInfo {
  message: string,
  author: string,
  date: Date
}

export interface FetchResult {
  success: true,
  allowNonInteractive?: boolean
}
