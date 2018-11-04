import * as React from 'react';
import { Table } from 'reactstrap';
import * as cx from 'classnames';
import { Set } from 'immutable';
import * as moment from 'moment';
import {Details} from '../actions/types/entryDetails';
import EntryPtr from '../domain/EntryPtr';
import FileListEntry from '../domain/FileListEntry';
import { EntryNameLabel } from '../fileType/Components';
import { formatDateTime } from '../utils/format';
import { EntryDragSource } from './tools/EntryPtrDrag';
import * as styles from './FileList.scss';

export interface Props {
  files: FileListEntry[],
  selectedEntry?: EntryPtr,
  favorites: Set<EntryPtr>,
  showPath?: boolean,
  onSelect: (ptr: EntryPtr) => void,
  onEdit: (ptr: EntryPtr) => void,
  onToggleFavorite: (ptr: EntryPtr) => void
  onSelectNode: (nodeId: string) => void
  onContextMenu: (ptr: EntryPtr) => void
}

interface ChromeMouseEvent extends React.MouseEvent<HTMLTableRowElement> {
  detail: number  // Click index (1 for first, 2 for second)
}

const ModifiedHeader = () => (<th className="text-right">Modified</th>);

const ModifiedColumn = ({ details }: { details?: Details }) => details && details.modified ? <td
  className="text-right"
  style={{ whiteSpace: 'nowrap' }}
  title={`${details.modified.date ? formatDateTime(details.modified.date) : ''}${details.modified.user ? ` by ${details.modified.user}` : ''}`}
>
  {details.modified.date && moment(details.modified.date).fromNow()}
</td> : <td/>;

export default ({ files, selectedEntry, favorites, showPath, onSelect, onEdit, onToggleFavorite, onSelectNode, onContextMenu }: Props) => (<div>
  <Table hover className={`table-sm table-sticky`}>
    <thead>
      <tr>
        <th style={{ width: '5%' }}>Fav</th>
        <th>Filename</th>
        {showPath && <th>Path</th>}
        <ModifiedHeader />
      </tr>
    </thead>
    <tbody>
      {files.map(file => {
        return (<tr
          key={file.ptr.toString()}
          className={cx('clickable', file.ptr.equals(selectedEntry) && 'table-active', !file.accessible && styles.inaccessible)}
          onClick={(ev: ChromeMouseEvent) => { if (ev.detail === 1) { onSelect(file.ptr); } }}
          onMouseDown={(ev: ChromeMouseEvent) => { if (ev.detail > 1) { ev.preventDefault(); } }}
          onDoubleClick={() => onEdit(file.ptr)}
          onContextMenu={ev => { ev.preventDefault(); onContextMenu(file.ptr); }}
          onKeyDown={ev => console.log(ev)}
        >
          <td><i
            className={cx('fa', favorites.has(file.ptr) ? 'fa-star' : 'fa-star-o')}
            onClick={ev => {
              onToggleFavorite(file.ptr);
              ev.stopPropagation();
            }}
          /></td>
          <td><EntryDragSource item={file.ptr} dragAllowed={file.accessible}>
            <EntryNameLabel fileName={file.ptr.entry}/>
          </EntryDragSource></td>
          {showPath && <td title={file.nodes.slice(1).map(node => node.name).join(' / ')} className={file.nodes.length > 3 ? styles.pathEllipsis : undefined}>
            {file.nodes.slice(1).slice(-2).map((node, idx) => <span key={idx} className={styles.pathSeg}>
              <a href="" onClick={ev => { onSelectNode(node.id); ev.stopPropagation(); }}>{node.name}</a>
            </span>)}
          </td>}
          <ModifiedColumn details={file.details} />
        </tr>);
      })}
    </tbody>
  </Table>
</div>);
