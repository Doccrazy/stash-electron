import * as React from 'react';
import { Row, Col } from 'reactstrap';
import FileActionBar from './FileActionBar';
import typeFor from '../fileType';

export interface Props {
  node: { id: string },
  entry: string,
  parsedContent: any,
  onEdit: () => void,
  onDelete: () => void
}

export default ({ node, entry, parsedContent, onEdit, onDelete }: Props) => {
  if (node && entry) {
    const type = typeFor(entry);
    const TypePanel = type.panel;
    return TypePanel ? (<div>
      <Row>
        <Col>
          <h4>{type.format ? type.format(entry): entry}</h4>
        </Col>
        <Col xs="auto">
          <FileActionBar node={node} entry={entry} onEdit={onEdit} onDelete={onDelete} />
        </Col>
      </Row>
      <TypePanel node={node} entry={entry} parsedContent={parsedContent} />
    </div>) : <div />;
  }
  return <div />;
};
