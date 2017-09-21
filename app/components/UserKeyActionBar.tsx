import * as React from 'react';
import { Button } from 'reactstrap';

export interface Props {
  modified?: boolean,
  onAdd: () => void,
  onSave: () => void,
  onUndo: () => void
}

export default ({ modified, onAdd, onSave, onUndo }: Props) => (<div>
  {/*<Button><i className="fa fa-key" /> {loggedIn ? 'Update my private key' : 'Load private key'}</Button>&nbsp;*/}
  <Button onClick={onAdd}><i className="fa fa-plus-circle" /> Add user</Button>&nbsp;
  <Button onClick={onSave} disabled={!modified} color="success"><i className="fa fa-save" /> Save changes</Button>&nbsp;
  <Button onClick={onUndo} disabled={!modified}><i className="fa fa-undo" /> Revert changes</Button>
</div>);
