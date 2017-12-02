import { dragSource, dropTarget } from './ItemDrag';

const ITEM_TYPE_NODE_ID = 'NodeId';

// Drag Source

export const NodeDragSource = dragSource<string>(ITEM_TYPE_NODE_ID);

// Drop Target

export const NodeDropTarget = dropTarget<string>(ITEM_TYPE_NODE_ID);
