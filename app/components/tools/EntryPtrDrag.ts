import { dragSource, dropTarget } from './ItemDrag';
import EntryPtr from '../../domain/EntryPtr';

const ITEM_TYPE_ENTRY_PTR = 'EntryPtr';

// Drag Source

export const EntryDragSource = dragSource<EntryPtr>(ITEM_TYPE_ENTRY_PTR);

// Drop Target

export const EntryDropTarget = dropTarget<EntryPtr>(ITEM_TYPE_ENTRY_PTR);
