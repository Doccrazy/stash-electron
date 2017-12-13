import {Set} from 'immutable';

export interface AccessToggle {
  nodeId: string,
  username: string
}

export interface State {
  nodeId?: string,
  users?: Set<string>,
  inherited?: boolean
  initialInherited?: boolean,
  initialUsers?: Set<string>,
  bulkChanges: Set<AccessToggle>
}
