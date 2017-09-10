import * as  React from 'react';
import { Button } from 'reactstrap';
import { clipboard } from 'electron';
import { toastr } from 'react-redux-toastr';
import BarsMenu from './BarsMenu';
import EntryPtr from '../domain/EntryPtr';

function copyEntryUrl(node: { id: string }, entry: string) {
  clipboard.writeText(new EntryPtr(node.id, entry).toHref());
  toastr.success('', 'Stash link to entry copied');
}

export interface Props {
  node: { id: string },
  entry: string,
  onEdit: () => void,
  onDelete: () => void
}

export default ({ node, entry, onEdit, onDelete }: Props) => (<div>
  <Button size="sm" title="Edit" onClick={onEdit}><i className="fa fa-pencil" /></Button>&nbsp;
  <Button size="sm" title="Share link" onClick={() => copyEntryUrl(node, entry)}><i className="fa fa-share" /></Button>&nbsp;
  <BarsMenu up right size="sm">
    <a className="dropdown-item" href="#" onClick={onDelete}><i className="fa fa-trash-o" /> Delete</a>
  </BarsMenu>
</div>);
