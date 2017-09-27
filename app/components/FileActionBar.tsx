import * as  React from 'react';
import { Button, DropdownItem } from 'reactstrap';
import { clipboard } from 'electron';
import { toastr } from 'react-redux-toastr';
import BarsMenu from './BarsMenu';
import EntryPtr from '../domain/EntryPtr';

function copyEntryUrl(node: { id: string }, entry: string) {
  clipboard.writeText(new EntryPtr(node.id, entry).toHref());
  toastr.success('', 'Stash link to entry copied', { timeOut: 2000 });
}

export interface Props {
  node: { id: string },
  entry: string,
  accessible?: boolean,
  onEdit: () => void,
  onDelete: () => void
}

export default ({ node, entry, accessible, onEdit, onDelete }: Props) => (<div>
  {accessible && <Button size="sm" title="Edit" onClick={onEdit}><i className="fa fa-pencil" /></Button>}&nbsp;
  <Button size="sm" title="Share link" onClick={() => copyEntryUrl(node, entry)}><i className="fa fa-share" /></Button>&nbsp;
  {accessible && <BarsMenu up right size="sm">
    <DropdownItem onClick={onDelete}><i className="fa fa-trash-o" /> Delete</DropdownItem>
  </BarsMenu>}
</div>);
