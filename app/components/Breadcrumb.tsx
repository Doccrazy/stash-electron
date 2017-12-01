import * as React from 'react';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
import * as cx from 'classnames';

export interface Props {
  nodes: { id: string, name: string }[],
  onClick?: (nodeId: string) => void,
  onEdit?: () => void,
  [propName: string]: any;
}

export default ({ nodes, onClick, onEdit, ...props }: Props) => (<Breadcrumb {...props} className={cx(props.className, 'hover-container')}>
  {nodes.map((node, idx) => (idx < nodes.length - 1
    ? <BreadcrumbItem key={node.id}><a href="" onClick={ev => { onClick && onClick(node.id); }}>{node.name}</a></BreadcrumbItem>
    : <BreadcrumbItem key={node.id} active>{node.name}</BreadcrumbItem>
  ))}
  {onEdit && <li className="text-right" style={{ flexGrow: 1 }}>
    <a href="" className="text-dark hover-content" title="Rename folder" onClick={onEdit}><i className="fa fa-pencil" /></a>
  </li>}
</Breadcrumb>);
