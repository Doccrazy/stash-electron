import React from 'react';
import { Button } from 'reactstrap';
import BarsMenu from './BarsMenu';

export default ({ nodeEditable, contentsEditable, onRename, onDelete, onCreateNode, onCreateItem, onEditPermissions, onAddExternal, onImport }) => (<div>
  {(nodeEditable || contentsEditable) && <BarsMenu>
    {contentsEditable && <a className="dropdown-item" href="#" onClick={onEditPermissions}><i className="fa fa-user" /> Permissions</a>}
    {contentsEditable && <a className="dropdown-item" href="#" onClick={onAddExternal}><i className="fa fa-file-o" /> Add external files</a>}
    {contentsEditable && <a className="dropdown-item" href="#" onClick={onImport}><i className="fa fa-download" /> KeePass Import</a>}
    {nodeEditable && contentsEditable && <div className="dropdown-divider" />}
    {nodeEditable && <a className="dropdown-item" href="#" onClick={onRename}><i className="fa fa-pencil" /> Rename folder</a>}
    {nodeEditable && <a className="dropdown-item" href="#" onClick={onDelete}><i className="fa fa-trash-o" /> Delete folder</a>}
  </BarsMenu>}&nbsp;
  <Button disabled={!contentsEditable} onClick={onCreateNode}><i className="fa fa-folder" /> New folder</Button>&nbsp;
  <Button disabled={!contentsEditable} onClick={onCreateItem}><i className="fa fa-plus-circle" /> Create item</Button>
</div>);
