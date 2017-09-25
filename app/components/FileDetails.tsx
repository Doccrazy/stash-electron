import * as React from 'react';
import FileActionBar from './FileActionBar';
import typeFor from '../fileType';
import AnimateHeight from './tools/AnimateHeight';
import * as styles from './FileDetails.css';

export interface Props {
  node?: { id: string },
  entry?: string,
  parsedContent: any,
  accessible?: boolean,
  onEdit: () => void,
  onDelete: () => void
}

const Inaccessible = (props: any) => (<div>
  You do not have permission to view/edit the contents of this item.
</div>);

export default ({ node, entry, parsedContent, accessible, onEdit, onDelete }: Props) => {
  let TypePanel;
  let type;
  if (node && entry) {
    type = typeFor(entry);
    TypePanel = type.panel;
  }
  if (!accessible) {
    TypePanel = Inaccessible;
  }
  return (<AnimateHeight className={styles.animateContainer}>
    {type && TypePanel && node && entry ? (<div>
      <div className={styles.headerWithButtons}>
        <div>
          <h4>{type.format ? type.format(entry) : entry}</h4>
        </div>
        <div>
          <FileActionBar node={node} entry={entry} accessible={accessible} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
      <TypePanel node={node} entry={entry} parsedContent={parsedContent} />
    </div>) : <div />}
  </AnimateHeight>);
};
