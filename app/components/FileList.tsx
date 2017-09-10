import * as React from 'react';
import { Table } from 'reactstrap';
import * as cx from 'classnames';
import { Set } from 'immutable';
import typeFor from '../fileType';
import EntryPtr from '../domain/EntryPtr';

export interface Props {
  entries: EntryPtr[],
  selectedEntry?: EntryPtr,
  favorites: Set<EntryPtr>,
  onSelect: (ptr: EntryPtr) => void,
  onEdit: (ptr: EntryPtr) => void,
  onToggleFavorite: (ptr: EntryPtr) => void
}

interface ChromeMouseEvent extends React.MouseEvent<HTMLTableRowElement> {
  detail: number  // Click index (1 for first, 2 for second)
}

export default ({ entries, selectedEntry, favorites, onSelect, onEdit, onToggleFavorite }: Props) => (<div>
  <Table hover className={`table-sm table-sticky`}>
    <thead>
      <tr>
        <th style={{ width: '5%' }}>Fav</th>
        <th>Filename</th>
        <th className="text-right">Modified</th>
      </tr>
    </thead>
    <tbody>
      {entries.map(ptr => {
        const type = typeFor(ptr.entry);
        return (<tr
          key={ptr.toString()}
          className={cx('clickable', ptr.equals(selectedEntry) && 'table-active')}
          onClick={(ev: ChromeMouseEvent) => { if (ev.detail === 1) { onSelect(ptr); } }}
          onMouseDown={(ev: ChromeMouseEvent) => { if (ev.detail > 1) { ev.preventDefault(); } }}
          onDoubleClick={() => onEdit(ptr)}
          onKeyDown={ev => console.log(ev)}
        >
          <td><i
            className={cx('fa', favorites.has(ptr) ? 'fa-star' : 'fa-star-o')}
            onClick={ev => {
              onToggleFavorite(ptr);
              ev.stopPropagation();
            }}
          /></td>
          <td>{type.format ? type.format(ptr.entry) : ptr.entry}</td>
          <td className="text-right" style={{ whiteSpace: 'nowrap' }}>{new Date().toLocaleString()}</td>
        </tr>);
      })}
    </tbody>
  </Table>
</div>);
