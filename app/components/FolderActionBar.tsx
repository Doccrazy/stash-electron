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
  onImport: () => void
}

export default ({ nodeEditable, contentsEditable, accessible, onRename, onDelete, onCreateNode, onCreateItem, onEditPermissions, onAddExternal, onImport }: Props) => (<div>
  {(nodeEditable || contentsEditable) && <BarsMenu>
    {contentsEditable && <DropdownItem onClick={onEditPermissions}><i className="fa fa-users" /> Permissions</DropdownItem>}
    {contentsEditable && accessible && <DropdownItem onClick={onAddExternal}><i className="fa fa-file-o" /> Add external files</DropdownItem>}
    {contentsEditable && accessible && <DropdownItem onClick={onImport}><i className="fa fa-download" /> KeePass Import</DropdownItem>}
    {nodeEditable && contentsEditable && <DropdownItem divider />}
    {nodeEditable && <DropdownItem onClick={onRename}><i className="fa fa-pencil" /> Rename folder</DropdownItem>}
    {nodeEditable && <DropdownItem onClick={onDelete}><i className="fa fa-trash-o" /> Delete folder</DropdownItem>}
  </BarsMenu>}&nbsp;
  <Button disabled={!contentsEditable} onClick={onCreateNode}><i className="fa fa-folder" /> New folder</Button>&nbsp;
  <Button disabled={!contentsEditable || !accessible} onClick={onCreateItem}><i className="fa fa-plus-circle" /> Create item</Button>
</div>);
