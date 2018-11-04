import * as React from 'react';
import { EntryNameLabel, EntryPanel } from '../fileType/Components';
import FileActionBar, { Props as ActionBarProps } from './FileActionBar';
import { typeFor } from '../fileType';
import AnimateHeight from './tools/AnimateHeight';
import * as styles from './FileDetails.css';

export interface Props extends ActionBarProps {
  entry?: string,
  parsedContent: any
}

const Inaccessible = (props: {}) => (<div>
  You do not have permission to view/edit the contents of this item.
</div>);

export default ({ entry, parsedContent, accessible, history, selectedCommit, onEdit, onDelete, onCopyLink, onSelectHistory }: Props) => {
  return (<AnimateHeight className={styles.animateContainer}>
    {entry ? (<div>
      <div className={styles.headerWithButtons}>
        <div>
          <h4 className="selectable"><EntryNameLabel fileName={entry}/></h4>
        </div>
        <div>
          <FileActionBar accessible={accessible} history={history} selectedCommit={selectedCommit}
                         onEdit={onEdit} onDelete={onDelete} onCopyLink={onCopyLink} onSelectHistory={onSelectHistory} />
        </div>
      </div>
      {accessible ? <EntryPanel typeId={typeFor(entry).id} parsedContent={parsedContent} /> : <Inaccessible/>}
    </div>) : <div />}
  </AnimateHeight>);
};
