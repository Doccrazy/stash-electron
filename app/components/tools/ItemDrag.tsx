import * as cx from 'classnames';
import * as React from 'react';
import { ConnectDragSource, ConnectDropTarget, DragSource, DropTarget, DropTargetMonitor } from 'react-dnd';

interface Payload<T> {
  item: T
}

// Drag Source

export interface ItemDragSourceProps<T> {
  item: T,
  children?: React.ReactNode,
  dragAllowed?: boolean,
  connectDragSource?: ConnectDragSource,
  isDragging?: boolean
}

export function dragSource<T>(itemType: string) {
  return DragSource(itemType, {
    canDrag(props: ItemDragSourceProps<T>) {
      return !!props.dragAllowed;
    },
    beginDrag(props: ItemDragSourceProps<T>): Payload<T> {
      return {
        item: props.item
      };
    }
  }, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }))(({ children, connectDragSource, isDragging }: ItemDragSourceProps<T>) => {
    return connectDragSource!(<span>
    {children}
  </span>);
  });
}

// Drop Target

export interface EntryDropTargetProps<T> {
  children?: React.ReactNode,
  className?: string,
  acceptClassName?: string,
  onCheckDrop?: (item: T) => boolean,
  onDrop?: (item: T) => void,
  connectDropTarget?: ConnectDropTarget,
  willDrop?: boolean
}

export function dropTarget<T>(itemType: string) {
  return DropTarget(itemType, {
    drop(props: EntryDropTargetProps<T>, monitor: DropTargetMonitor) {
      const ptr = (monitor.getItem() as Payload<T>).item;
      if (props.onDrop) {
        props.onDrop(ptr);
      }
    },
    canDrop(props: EntryDropTargetProps<T>, monitor: DropTargetMonitor) {
      const ptr = (monitor.getItem() as Payload<T>).item;
      return props.onCheckDrop ? props.onCheckDrop(ptr) : true;
    }
  }, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    willDrop: monitor.isOver() && monitor.canDrop()
  }))(({ children, className, acceptClassName, connectDropTarget, willDrop }: EntryDropTargetProps<T>) => connectDropTarget!(
    <span className={cx(className, willDrop && acceptClassName)}>
    {children}
  </span>
  ));
}
