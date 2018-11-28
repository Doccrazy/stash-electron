import * as React from 'react';
import { Button, DropdownItem } from 'reactstrap';
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

export default ({ nodeEditable, contentsEditable, accessible, onRename, onDelete, onCreateNode, onCreateItem, onEditPermissions, onAddExternal,
                  onImport, onExport, onCopyLink, onShowHistory}: Props) => (<div>
  {contentsEditable && <BarsMenu>
    {<DropdownItem onClick={onCopyLink}><i className="fa fa-share" /> Share link</DropdownItem>}
    {<DropdownItem onClick={onEditPermissions}><i className="fa fa-users" /> Permissions</DropdownItem>}
    {<DropdownItem onClick={onShowHistory}><i className="fa fa-history" /> Show history</DropdownItem>}
    {accessible && <DropdownItem onClick={onAddExternal}><i className="fa fa-file-o" /> Add external files</DropdownItem>}
    {accessible && <DropdownItem divider />}
    {accessible && <DropdownItem onClick={onImport}><i className="fa fa-download" /> KeePass import</DropdownItem>}
    {<DropdownItem onClick={onExport}><i className="fa fa-upload" /> KeePass export</DropdownItem>}
    {nodeEditable && <DropdownItem divider />}
    {nodeEditable && <DropdownItem onClick={onRename}><i className="fa fa-pencil" /> Rename folder</DropdownItem>}
    {nodeEditable && <DropdownItem onClick={onDelete}><i className="fa fa-trash-o" /> Delete folder</DropdownItem>}
  </BarsMenu>}&nbsp;
  <Button disabled={!contentsEditable} onClick={onCreateNode}><i className="fa fa-folder" /> New folder</Button>&nbsp;
  <Button disabled={!contentsEditable || !accessible} onClick={onCreateItem}><i className="fa fa-plus-circle" /> Create item</Button>
</div>);
