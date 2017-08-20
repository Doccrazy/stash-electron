import React from 'react';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';

export default ({ nodes, onClick, ...props }) => (<Breadcrumb {...props}>
  {nodes.map((node, idx) => (idx < nodes.length - 1
    ? <BreadcrumbItem key={node.id}><a href onClick={ev => { /*ev.preventDefault(); */onClick(node.id); }}>{node.title}</a></BreadcrumbItem>
    : <BreadcrumbItem key={node.id} active>{node.title}</BreadcrumbItem>
  ))}
</Breadcrumb>);
