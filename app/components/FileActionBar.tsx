import * as React from 'react';
import { Button, DropdownItem } from 'reactstrap';
import BarsMenu from './BarsMenu';
import HistoryMenu, { Props as HistoryProps } from './HistoryMenu';

export interface Props extends HistoryProps {
  accessible?: boolean,
  onEdit: () => void,
  onDelete: () => void,
  onCopyLink: () => void,
}

export default ({ accessible, history, selectedCommit, onEdit, onDelete, onCopyLink, onSelectHistory }: Props) => (<div>
  {accessible && !selectedCommit && <Button size="sm" title="Edit" onClick={onEdit}><i className="fa fa-pencil" /></Button>}&nbsp;
  <Button size="sm" title="Share link" onClick={onCopyLink}><i className="fa fa-share" /></Button>&nbsp;
  {history.length > 1 && <HistoryMenu history={history} selectedCommit={selectedCommit} onSelectHistory={onSelectHistory} />}{history.length > 1 && ' '}
  {accessible && <BarsMenu up right size="sm">
    <DropdownItem onClick={onDelete}><i className="fa fa-trash-o" /> Delete</DropdownItem>
  </BarsMenu>}
</div>);
