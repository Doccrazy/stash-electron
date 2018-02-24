import * as React from 'react';
import FileActionBar, { Props as ActionBarProps } from './FileActionBar';
import typeFor from '../fileType';
import AnimateHeight from './tools/AnimateHeight';
import * as styles from './FileDetails.css';

export interface Props extends ActionBarProps {
  entry?: string,
  parsedContent: any
}

const Inaccessible = (props: void) => (<div>
  You do not have permission to view/edit the contents of this item.
</div>);

export default ({ entry, parsedContent, accessible, history, selectedCommit, onEdit, onDelete, onCopyLink, onSelectHistory }: Props) => {
  let TypePanel;
  let type;
  if (entry) {
    type = typeFor(entry);
    TypePanel = type.panel;
  }
  if (!accessible) {
    TypePanel = Inaccessible;
  }
  return (<AnimateHeight className={styles.animateContainer}>
    {type && TypePanel && entry ? (<div>
      <div className={styles.headerWithButtons}>
        <div>
          <h4 className="selectable">{type.format ? type.format(entry) : entry}</h4>
        </div>
        <div>
          <FileActionBar accessible={accessible} history={history} selectedCommit={selectedCommit}
                         onEdit={onEdit} onDelete={onDelete} onCopyLink={onCopyLink} onSelectHistory={onSelectHistory} />
        </div>
      </div>
      <TypePanel parsedContent={parsedContent} />
    </div>) : <div />}
  </AnimateHeight>);
};
