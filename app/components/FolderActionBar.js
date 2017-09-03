import React from 'react';
import { Button } from 'reactstrap';
import BarsMenu from './BarsMenu';

export default ({ editable, onRename, onDelete, onCreateNode, onCreateItem, onEditPermissions, onAddExternal, onImport }) => (<div>
  <BarsMenu>
    <a className="dropdown-item" href="#" onClick={onEditPermissions}><i className="fa fa-user" /> Permissions</a>
    <a className="dropdown-item" href="#" onClick={onAddExternal}><i className="fa fa-file-o" /> Add external file</a>
    <a className="dropdown-item" href="#" onClick={onImport}><i className="fa fa-download" /> Import</a>
    {editable && <div className="dropdown-divider" />}
    {editable && <a className="dropdown-item" href="#" onClick={onRename}><i className="fa fa-pencil" /> Rename folder</a>}
    {editable && <a className="dropdown-item" href="#" onClick={onDelete}><i className="fa fa-trash-o" /> Delete folder</a>}
  </BarsMenu>&nbsp;
  <Button onClick={onCreateNode}><i className="fa fa-folder" /> New folder</Button>&nbsp;
  <Button onClick={onCreateItem}><i className="fa fa-plus-circle" /> Create item</Button>
</div>);
