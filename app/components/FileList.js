// @flow
import React from 'react';
import { Table } from 'reactstrap';
import cx from 'classnames';
import { Set } from 'immutable';
import typeFor from '../fileType';
import utils from '../utils/styles.css';
import { EntryPtr } from '../utils/repository';

type Props = {
  entries: EntryPtr[],
  selectedEntry: ?EntryPtr,
  favorites: Set<EntryPtr>,
  onSelect: (EntryPtr) => void,
  onEdit: (EntryPtr) => void,
  onToggleFavorite: (EntryPtr) => void
};

export default ({ entries, selectedEntry, favorites, onSelect, onEdit, onToggleFavorite }: Props) => (<div>
  <Table hover className={`table-sm ${utils.stickyTable}`}>
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
          className={cx(utils.clickable, ptr.equals(selectedEntry) && 'table-active')}
          onClick={ev => { if (ev.detail === 1) { onSelect(ptr); } }}
          onMouseDown={ev => { if (ev.detail > 1) { ev.preventDefault(); } }}
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
          <td>{type.format(ptr.entry)}</td>
          <td className="text-right" style={{ whiteSpace: 'nowrap' }}>{new Date().toLocaleString()}</td>
        </tr>);
      })}
    </tbody>
  </Table>
</div>);
