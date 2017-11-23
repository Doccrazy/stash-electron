import * as React from 'react';
import { Button, DropdownItem } from 'reactstrap';
import BarsMenu from './BarsMenu';
import EntryPtr from '../domain/EntryPtr';
import { copyStashLink } from '../store/stashLinkHandler';

export interface Props {
  node: { id: string },
  entry: string,
  accessible?: boolean,
  onEdit: () => void,
  onDelete: () => void
}

export default ({ node, entry, accessible, onEdit, onDelete }: Props) => (<div>
  {accessible && <Button size="sm" title="Edit" onClick={onEdit}><i className="fa fa-pencil" /></Button>}&nbsp;
  <Button size="sm" title="Share link" onClick={() => copyStashLink(new EntryPtr(node.id, entry))}><i className="fa fa-share" /></Button>&nbsp;
  {accessible && <BarsMenu up right size="sm">
    <DropdownItem onClick={onDelete}><i className="fa fa-trash-o" /> Delete</DropdownItem>
  </BarsMenu>}
</div>);
