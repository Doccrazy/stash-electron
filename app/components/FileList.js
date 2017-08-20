import React from 'react';
import { Table } from 'reactstrap';
import utils from '../utils/styles.css';

export default ({ currentNode }) => (<div>
  <Table hover className={`table-sm ${utils.stickyTable}`}>
    <thead>
      <tr>
        <th style={{ width: '5%' }}>Fav</th>
        <th>Filename</th>
        <th className="text-right">Modified</th>
      </tr>
    </thead>
    <tbody>
      {currentNode && currentNode.entries && currentNode.entries.map((e, i) => (<tr key={e} className={utils.clickable}>
        <td><i className="fa fa-star-o" /></td>
        <td><i className="fa fa-key" /> {e}</td>
        <td className="text-right">{new Date().toLocaleString()}</td>
      </tr>))}
    </tbody>
  </Table>
</div>);
