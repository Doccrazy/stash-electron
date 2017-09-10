import * as React from 'react';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';

export interface Props {
  nodes: { id: string, name: string }[],
  onClick?: (nodeId: string) => void,
  [propName: string]: any;
}

export default ({ nodes, onClick, ...props }: Props) => (<Breadcrumb {...props}>
  {nodes.map((node, idx) => (idx < nodes.length - 1
    ? <BreadcrumbItem key={node.id}><a href="" onClick={ev => { onClick && onClick(node.id); }}>{node.name}</a></BreadcrumbItem>
    : <BreadcrumbItem key={node.id} active>{node.name}</BreadcrumbItem>
  ))}
</Breadcrumb>);
