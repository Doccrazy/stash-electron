import * as React from 'react';
import { Button, FormGroup, Label, Input, InputGroup, InputGroupAddon } from 'reactstrap';
import { GitStatus } from '../../actions/types/git';
import { formatStatusLine } from '../../utils/git';

export enum GitInitAction {
  OFFLINE,
  INIT,
  CLONE
}

export interface Props {
  repoLoading?: boolean,
  repoLoaded?: boolean,
  status: GitStatus,
  working?: boolean,
  action?: GitInitAction,
  cloneUrl?: string,
  onChangeAction: (action: GitInitAction) => void,
  onChangeCloneUrl: (url: string) => void,
  onClone: () => void
}

export default ({ repoLoading, repoLoaded, status, working, action, cloneUrl, onChangeAction, onChangeCloneUrl, onClone }: Props) => (<div>
  {repoLoading && <i className="fa fa-spinner fa-pulse" />}
  {status.initialized && <div>
    <p><i className="fa fa-check text-success" /> A git repository has been set up at the selected location.</p>
    {status.upstreamName && <p>{formatStatusLine(status.commitsAheadOrigin, status.upstreamName)}</p>}
    {status.error && <p className="text-danger">{status.error}</p>}
  </div>}
  {repoLoaded && !status.initialized && <div>
    <p>
      While it is possible to use Stash purely offline, you will miss out on its collaboration features
      without using a <b>protected git repository</b>.
    </p>
    <FormGroup>
      <Label check>
        <Input type="radio" checked={action === GitInitAction.OFFLINE} onClick={() => onChangeAction(GitInitAction.OFFLINE)} disabled={working}/>{' '}
        I am not using git, keep my repository offline
      </Label>
    </FormGroup>
    <FormGroup>
      <Label check>
        <Input type="radio" checked={action === GitInitAction.INIT} onClick={() => onChangeAction(GitInitAction.INIT)} disabled={working} />{' '}
        Initialize a new, empty git repository
      </Label>
    </FormGroup>
    <FormGroup>
      <Label check>
        <Input type="radio" checked={action === GitInitAction.CLONE} onClick={() => onChangeAction(GitInitAction.CLONE)} disabled={working} />{' '}
        Clone an existing repository from a remote URL
      </Label>
    </FormGroup>
    {action === GitInitAction.CLONE && <FormGroup>
      <InputGroup>
        <Input placeholder="Remote repository URL" value={cloneUrl || ''} onChange={ev => onChangeCloneUrl(ev.target.value)} disabled={working} />
        <InputGroupAddon addonType="append">
          <Button color="info" onClick={onClone} disabled={working}>{working ? <i className="fa fa-spinner fa-pulse" /> : 'Clone'}</Button>
        </InputGroupAddon>
      </InputGroup>
      {status.error && <small className="form-text text-danger">{status.error}</small>}
    </FormGroup>}
  </div>}
</div>);
