import { GitCommitInfo } from '../../utils/git';

export interface State {
  readonly usersOpen: boolean
  readonly authOpen: boolean
  readonly authHistory: AuthHistory[]
  readonly authNodeId?: string
  readonly filterNodeId?: string
}

export interface AuthHistory extends GitCommitInfo {
  nodeId: string
  added: string[]
  removed: string[]
}
