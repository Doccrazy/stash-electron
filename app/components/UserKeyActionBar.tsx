import * as React from 'react';
import { Button } from 'reactstrap';
import Trans from '../utils/i18n/Trans';

export interface Props {
  modified?: boolean;
  onAdd: () => void;
  onSave: () => void;
  onUndo: () => void;
}

const UserKeyActionBar = ({ modified, onAdd, onSave, onUndo }: Props) => (
  <div>
    {/*<Button><i className="fa fa-key" /> {loggedIn ? 'Update my private key' : 'Load private key'}</Button>&nbsp;*/}
    <Button onClick={onAdd}>
      <i className="fa fa-plus-circle" /> <Trans id="action.user.add" />
    </Button>
    &nbsp;
    <Button onClick={onSave} disabled={!modified} color="success">
      <i className="fa fa-save" /> <Trans id="action.common.saveChanges" />
    </Button>
    &nbsp;
    <Button onClick={onUndo} disabled={!modified}>
      <i className="fa fa-undo" /> <Trans id="action.common.revertChanges" />
    </Button>
  </div>
);

export default UserKeyActionBar;
