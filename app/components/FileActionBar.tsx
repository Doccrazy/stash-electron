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
  onSharePrivateBin: () => void;
}

export default withTrans<Props>()(
  ({ t, accessible, history, selectedCommit, onEdit, onDelete, onCopyLink, onSharePrivateBin, onSelectHistory }) => (
    <div>
      {accessible && !selectedCommit && (
        <Button size="sm" title={t('action.common.edit')} onClick={onEdit}>
          <i className="fa fa-pencil" />
        </Button>
      )}
      &nbsp;
      <Button size="sm" title={t('action.common.sharePrivateBin')} onClick={onSharePrivateBin}>
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
          <DropdownItem onClick={onCopyLink}>
            <i className="fa fa-link" /> {t('action.common.shareLink')}
          </DropdownItem>
        </BarsMenu>
      )}
    </div>
  )
);
