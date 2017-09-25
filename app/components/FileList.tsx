import * as React from 'react';
import { Table } from 'reactstrap';
import * as cx from 'classnames';
import { Set } from 'immutable';
import * as moment from 'moment';
import typeFor from '../fileType';
import EntryPtr from '../domain/EntryPtr';
import FileListEntry from '../domain/FileListEntry';
import * as styles from './FileList.scss';

export interface Props {
  files: FileListEntry[],
  selectedEntry?: EntryPtr,
  favorites: Set<EntryPtr>,
  showPath?: boolean,
  onSelect: (ptr: EntryPtr) => void,
  onEdit: (ptr: EntryPtr) => void,
  onToggleFavorite: (ptr: EntryPtr) => void
}

interface ChromeMouseEvent extends React.MouseEvent<HTMLTableRowElement> {
  detail: number  // Click index (1 for first, 2 for second)
}

export default ({ files, selectedEntry, favorites, showPath, onSelect, onEdit, onToggleFavorite }: Props) => (<div>
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
          onKeyDown={ev => console.log(ev)}
        >
          <td><i
            className={cx('fa', favorites.has(file.ptr) ? 'fa-star' : 'fa-star-o')}
            onClick={ev => {
              onToggleFavorite(file.ptr);
              ev.stopPropagation();
            }}
          /></td>
          <td>{type.format ? type.format(file.ptr.entry) : file.ptr.entry}</td>
          {showPath && <td title={file.nodeNames.slice(1).join(' / ')} className={file.nodeNames.length > 3 ? styles.pathEllipsis : undefined}>
            {file.nodeNames.slice(1).slice(-2).map((name, idx) => <span key={idx} className={styles.pathSeg}>{name}</span>)}
          </td>}
          <td className="text-right" style={{ whiteSpace: 'nowrap' }}>{moment(file.lastModified).fromNow()}</td>
        </tr>);
      })}
    </tbody>
  </Table>
</div>);
