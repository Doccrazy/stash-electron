import React from 'react';
import { Button } from 'reactstrap';
import BarsMenu from './BarsMenu';

export default ({ node, entry, onEdit, onDelete }) => (<div>
  <Button size="sm" onClick={onEdit}><i className="fa fa-pencil" /></Button>&nbsp;
  <Button size="sm"><i className="fa fa-share" /></Button>&nbsp;
  <BarsMenu up right size="sm">
    <a className="dropdown-item" href="#" onClick={onDelete}><i className="fa fa-trash-o" /> Delete</a>
  </BarsMenu>
</div>);
