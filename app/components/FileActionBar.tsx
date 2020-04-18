import * as React from 'react';
import { Button, DropdownItem } from 'reactstrap';
import withTrans from '../utils/i18n/withTrans';
import BarsMenu from './BarsMenu';
import HistoryMenu, { Props as HistoryProps } from './HistoryMenu';

export interface Props extends HistoryProps {
  accessible?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onCopyLink: () => void;
}

export default withTrans<Props>()(({ t, accessible, history, selectedCommit, onEdit, onDelete, onCopyLink, onSelectHistory }) => (
  <div>
    {accessible && !selectedCommit && (
      <Button size="sm" title={t('action.common.edit')} onClick={onEdit}>
        <i className="fa fa-pencil" />
      </Button>
    )}
    &nbsp;
    <Button size="sm" title={t('action.common.shareLink')} onClick={onCopyLink}>
      <i className="fa fa-share" />
    </Button>
    &nbsp;
    {history.length > 1 && <HistoryMenu history={history} selectedCommit={selectedCommit} onSelectHistory={onSelectHistory} />}
    {history.length > 1 && ' '}
    {accessible && (
      <BarsMenu up right size="sm">
        <DropdownItem onClick={onDelete}>
          <i className="fa fa-trash-o" /> {t('action.common.delete')}
        </DropdownItem>
      </BarsMenu>
    )}
  </div>
));
