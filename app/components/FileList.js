import React from 'react';
import { Table } from 'reactstrap';
import cx from 'classnames';
import typeFor from '../fileType';
import utils from '../utils/styles.css';

export default ({ currentNode, selectedEntry, favorites, onSelect, onEdit, onToggleFavorite }) => (<div>
  <Table hover className={`table-sm ${utils.stickyTable}`}>
    <thead>
      <tr>
        <th style={{ width: '5%' }}>Fav</th>
        <th>Filename</th>
        <th className="text-right">Modified</th>
      </tr>
    </thead>
    <tbody>
      {currentNode && currentNode.entries && currentNode.entries.map((entry, idx) => {
        const type = typeFor(entry);
        return (<tr
          key={entry}
          className={cx(utils.clickable, selectedEntry === entry && 'table-active')}
          onClick={ev => { if (ev.detail === 1) { onSelect(currentNode, entry); } }}
          onMouseDown={ev => { if (ev.detail > 1) { ev.preventDefault(); } }}
          onDoubleClick={() => onEdit(currentNode, entry)}
          onKeyDown={ev => console.log(ev)}
        >
          <td><i
            className={cx('fa', favorites.has(entry) ? 'fa-star' : 'fa-star-o')}
            onClick={ev => {
              onToggleFavorite(currentNode, entry);
              ev.stopPropagation();
            }}
          /></td>
          <td>{type.format(entry)}</td>
          <td className="text-right" style={{ whiteSpace: 'nowrap' }}>{new Date().toLocaleString()}</td>
        </tr>);
      })}
    </tbody>
  </Table>
</div>);
