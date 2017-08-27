import React from 'react';
import { Button } from 'reactstrap';

export default ({ node, entry }) => (<div>
  <Button size="sm"><i className="fa fa-pencil" /></Button>&nbsp;
  <Button size="sm"><i className="fa fa-share" /></Button>&nbsp;
  <Button size="sm"><i className="fa fa-bars" /></Button>
</div>);
