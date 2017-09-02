import React from 'react';
import { Button, Row, Col } from 'reactstrap';
import cx from 'classnames';
import FileActionBar from './FileActionBar';
import typeFor from '../fileType';

export default ({ node, entry, parsedContent, onEdit, onDelete }) => {
  if (node && entry) {
    const type = typeFor(entry);
    const TypePanel = type.panel;
    return (<div>
      <Row>
        <Col>
          <h4>{type.format(entry)}</h4>
        </Col>
        <Col xs="auto">
          <FileActionBar node={node} entry={entry} onEdit={onEdit} onDelete={onDelete} />
        </Col>
      </Row>
      <TypePanel node={node} entry={entry} parsedContent={parsedContent} />
    </div>);
  }
  return <div />;
};
