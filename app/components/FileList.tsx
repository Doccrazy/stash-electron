import * as React from 'react';
import { Table } from 'reactstrap';
import * as cx from 'classnames';
import { Set } from 'immutable';
import * as moment from 'moment';
import { remote } from 'electron';
import typeFor from '../fileType';
import EntryPtr from '../domain/EntryPtr';
import FileListEntry from '../domain/FileListEntry';
import { EntryDragSource } from './tools/EntryPtrDrag';
import * as styles from './FileList.scss';
import { copyStashLink } from '../store/stashLinkHandler';

const { Menu, MenuItem } = remote;

export interface Props {
  files: FileListEntry[],
  selectedEntry?: EntryPtr,
  favorites: Set<EntryPtr>,
  showPath?: boolean,
  onSelect: (ptr: EntryPtr) => void,
  onEdit: (ptr: EntryPtr) => void,
  onDelete: (ptr: EntryPtr) => void,
  onToggleFavorite: (ptr: EntryPtr) => void
  onSelectNode: (nodeId: string) => void
}

interface ChromeMouseEvent extends React.MouseEvent<HTMLTableRowElement> {
  detail: number  // Click index (1 for first, 2 for second)
}

function showContextMenu(accessible: boolean | undefined, ptr: EntryPtr, onEdit: (ptr: EntryPtr) => void, onDelete: (ptr: EntryPtr) => void) {
  const menu = new Menu();
  if (accessible) {
    menu.append(new MenuItem({label: 'Edit', icon: remote.nativeImage.createFromDataURL(require('../icon-pencil.png')), click() { onEdit(ptr); }}));
  }
  menu.append(new MenuItem({label: 'Share link', icon: remote.nativeImage.createFromDataURL(require('../icon-share.png')), click() { copyStashLink(ptr); }}));
  if (accessible) {
    menu.append(new MenuItem({type: 'separator'}));
    menu.append(new MenuItem({label: 'Delete', icon: remote.nativeImage.createFromDataURL(require('../icon-trash-o.png')), click() { onDelete(ptr); }}));
  }
  menu.popup(remote.getCurrentWindow());
}

export default ({ files, selectedEntry, favorites, showPath, onSelect, onEdit, onDelete, onToggleFavorite, onSelectNode }: Props) => (<div>
  <Table hover className={`table-sm table-sticky`}>
    <thead>
      <tr>
        <th style={{ width: '5%' }}>Fav</th>
        <th>Filename</th>
        {showPath && <th>Path</th>}
        <th className="text-right">Modified</th>
      </tr>
    </thead>
    <tbody>
      {files.map(file => {
        const type = typeFor(file.ptr.entry);
        return (<tr
          key={file.ptr.toString()}
          className={cx('clickable', file.ptr.equals(selectedEntry) && 'table-active', !file.accessible && styles.inaccessible)}
          onClick={(ev: ChromeMouseEvent) => { if (ev.detail === 1) { onSelect(file.ptr); } }}
          onMouseDown={(ev: ChromeMouseEvent) => { if (ev.detail > 1) { ev.preventDefault(); } }}
          onDoubleClick={() => onEdit(file.ptr)}
          onContextMenu={ev => { ev.preventDefault(); showContextMenu(file.accessible, file.ptr, onEdit, onDelete); }}
          onKeyDown={ev => console.log(ev)}
        >
          <td><i
            className={cx('fa', favorites.has(file.ptr) ? 'fa-star' : 'fa-star-o')}
            onClick={ev => {
              onToggleFavorite(file.ptr);
              ev.stopPropagation();
            }}
          /></td>
          <td><EntryDragSource ptr={file.ptr} dragAllowed={file.accessible}>
            {type.format ? type.format(file.ptr.entry) : file.ptr.entry}
          </EntryDragSource></td>
          {showPath && <td title={file.nodes.slice(1).map(node => node.name).join(' / ')} className={file.nodes.length > 3 ? styles.pathEllipsis : undefined}>
            {file.nodes.slice(1).slice(-2).map((node, idx) => <span key={idx} className={styles.pathSeg}>
              <a href="" onClick={ev => { onSelectNode(node.id); ev.stopPropagation(); }}>{node.name}</a>
            </span>)}
          </td>}
          <td className="text-right" style={{ whiteSpace: 'nowrap' }}>{file.lastModified && moment(file.lastModified).fromNow()}</td>
        </tr>);
      })}
    </tbody>
  </Table>
</div>);
