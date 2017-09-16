import * as React from 'react';
import FileActionBar from './FileActionBar';
import typeFor from '../fileType';
import AnimateHeight from './tools/AnimateHeight';
import * as styles from './FileDetails.css';

export interface Props {
  node?: { id: string },
  entry?: string,
  parsedContent: any,
  onEdit: () => void,
  onDelete: () => void
}

export default ({ node, entry, parsedContent, onEdit, onDelete }: Props) => {
  let TypePanel;
  let type;
  if (node && entry) {
    type = typeFor(entry);
    TypePanel = type.panel;
  }
  return (<AnimateHeight className={styles.animateContainer}>
    {type && TypePanel && node && entry ? (<div>
      <div className={styles.headerWithButtons}>
        <div>
          <h4>{type.format ? type.format(entry) : entry}</h4>
        </div>
        <div>
          <FileActionBar node={node} entry={entry} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
      <TypePanel node={node} entry={entry} parsedContent={parsedContent} />
    </div>) : <div />}
  </AnimateHeight>);
};
