import * as React from 'react';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
import cx from 'classnames';

export interface Props {
  nodes: { id: string, name: string }[],
  onClick?: (nodeId: string) => void,
  editLink?: React.ReactNode,
  className?: string
}

export default ({ nodes, onClick, editLink, ...props }: Props) => (<Breadcrumb tag="div" listClassName={cx(props.className, 'hover-container')}>
  {nodes.map((node, idx) => (idx < nodes.length - 1
    ? <BreadcrumbItem key={node.id}><a href="" onClick={ev => { onClick && onClick(node.id); }}>{node.name}</a></BreadcrumbItem>
    : <BreadcrumbItem key={node.id} active>{node.name}</BreadcrumbItem>
  ))}
  {editLink && <li className="text-right" style={{ flexGrow: 1 }}>
    {editLink}
  </li>}
</Breadcrumb>);
