import * as React from 'react';
import { NativeTypes } from 'react-dnd-html5-backend';
import { DropTarget, DropTargetMonitor, ConnectDropTarget } from 'react-dnd';

function mapFiles(files: File[]) {
  return files.map((file: File) => file.path);
}

export interface Props {
  children: any,
  connectDropTarget?: ConnectDropTarget,
  onDrop: (files: string[]) => void,
  [propName: string]: any;
}

export default DropTarget(NativeTypes.FILE, {
  drop(props: Props, monitor: DropTargetMonitor) {
    props.onDrop(mapFiles((monitor.getItem() as any).files));
  }
}, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget()
}))(({ children, onDrop, connectDropTarget, ...props }: Props) => connectDropTarget!(<div {...props}>
  {children}
</div>));
