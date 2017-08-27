import React from 'react';
import { Button } from 'reactstrap';

export default ({ node, entry, onEdit }) => (<div>
  <Button size="sm" onClick={onEdit}><i className="fa fa-pencil" /></Button>&nbsp;
  <Button size="sm"><i className="fa fa-share" /></Button>&nbsp;
  <Button size="sm"><i className="fa fa-bars" /></Button>
</div>);
