import * as cx from 'classnames';
import * as React from 'react';
import { ConnectDragSource, ConnectDropTarget, DragSource, DropTarget, DropTargetMonitor } from 'react-dnd';
import EntryPtr from '../../domain/EntryPtr';

interface Payload {
  ptr: EntryPtr;
}

const ITEM_TYPE_ENTRY_PTR = 'EntryPtr';

// Drag Source

export interface EntryDragSourceProps {
  ptr: EntryPtr,
  children?: React.ReactNode,
  dragAllowed?: boolean,
  connectDragSource?: ConnectDragSource,
  isDragging?: boolean
}

export const EntryDragSource = DragSource(ITEM_TYPE_ENTRY_PTR, {
  canDrag(props: EntryDragSourceProps) {
    return !!props.dragAllowed;
  },
  beginDrag(props: EntryDragSourceProps): Payload {
    return {
      ptr: props.ptr
    };
  }
}, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))(({ children, connectDragSource, isDragging }: EntryDragSourceProps) => {
  return connectDragSource!(<span>
    {children}
  </span>);
});

// Drop Target

export interface EntryDropTargetProps {
  children?: React.ReactNode,
  className?: string,
  acceptClassName?: string,
  onCheckDrop?: (ptr: EntryPtr) => boolean,
  onDrop?: (ptr: EntryPtr) => void,
  connectDropTarget?: ConnectDropTarget,
  willDrop?: boolean
}

export const EntryDropTarget = DropTarget(ITEM_TYPE_ENTRY_PTR, {
  drop(props: EntryDropTargetProps, monitor: DropTargetMonitor) {
    const ptr = (monitor.getItem() as Payload).ptr;
    if (props.onDrop) {
      props.onDrop(ptr);
    }
  },
  canDrop(props: EntryDropTargetProps, monitor: DropTargetMonitor) {
    const ptr = (monitor.getItem() as Payload).ptr;
    return props.onCheckDrop ? props.onCheckDrop(ptr) : true;
  }
}, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  willDrop: monitor.isOver() && monitor.canDrop()
}))(({ children, className, acceptClassName, connectDropTarget, willDrop }: EntryDropTargetProps) => connectDropTarget!(
  <span className={cx(className, willDrop && acceptClassName)}>
    {children}
  </span>
));
