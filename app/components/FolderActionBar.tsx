import * as React from 'react';
import { Button, DropdownItem } from 'reactstrap';
import withTrans from '../utils/i18n/withTrans';
import BarsMenu from './BarsMenu';

export interface Props {
  nodeEditable?: boolean,
  contentsEditable?: boolean,
  accessible?: boolean,
  onRename: () => void,
  onDelete: () => void,
  onCreateNode: () => void,
  onCreateItem: () => void,
  onEditPermissions: () => void,
  onAddExternal: () => void,
  onImport: () => void,
  onExport: () => void,
  onCopyLink: () => void
  onShowHistory: () => void
}

export default withTrans<Props>('action.folder')(
  ({ t, nodeEditable, contentsEditable, accessible, onRename, onDelete, onCreateNode, onCreateItem, onEditPermissions,
     onAddExternal, onImport, onExport, onCopyLink, onShowHistory}) => <div>
  {contentsEditable && <BarsMenu>
    {<DropdownItem onClick={onCopyLink}><i className="fa fa-share" /> {t('action.common.shareLink')}</DropdownItem>}
    {<DropdownItem onClick={onEditPermissions}><i className="fa fa-users" /> {t('.permissions')}</DropdownItem>}
    {<DropdownItem onClick={onShowHistory}><i className="fa fa-history" /> {t('action.common.history')}</DropdownItem>}
    {accessible && <DropdownItem onClick={onAddExternal}><i className="fa fa-file-o" /> {t('.addExternal')}</DropdownItem>}
    {accessible && <DropdownItem divider />}
    {accessible && <DropdownItem onClick={onImport}><i className="fa fa-download" /> {t('.import')}</DropdownItem>}
    {<DropdownItem onClick={onExport}><i className="fa fa-upload" /> {t('.export')}</DropdownItem>}
    {nodeEditable && <DropdownItem divider />}
    {nodeEditable && <DropdownItem onClick={onRename}><i className="fa fa-pencil" /> {t('.rename')}</DropdownItem>}
    {nodeEditable && <DropdownItem onClick={onDelete}><i className="fa fa-trash-o" /> {t('.delete')}</DropdownItem>}
  </BarsMenu>}&nbsp;
  <Button disabled={!contentsEditable} onClick={onCreateNode}><i className="fa fa-folder" /> {t('.create')}</Button>&nbsp;
  <Button disabled={!contentsEditable || !accessible} onClick={onCreateItem}><i className="fa fa-plus-circle" /> {t('.createItem')}</Button>
</div>);
