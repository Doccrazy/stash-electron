import {Set} from 'immutable';

export interface State {
  nodeId?: string,
  users?: Set<string>,
  inherited?: boolean
  initialInherited?: boolean,
  initialUsers?: Set<string>,
}
