import * as React from 'react';
import { Table } from 'reactstrap';
import cx from 'classnames';
import { Set } from 'immutable';
import moment from 'moment';
import { Details } from '../actions/types/entryDetails';
import EntryPtr from '../domain/EntryPtr';
import FileListEntry from '../domain/FileListEntry';
import { EntryNameLabel } from '../fileType/Components';
import withTrans from '../utils/i18n/withTrans';
import { EntryDragSource } from './tools/EntryPtrDrag';
import * as styles from './FileList.scss';

export interface Props {
  files: FileListEntry[];
  selectedEntry?: EntryPtr;
  favorites: Set<EntryPtr>;
  showPath?: boolean;
  onSelect: (ptr: EntryPtr) => void;
  onEdit: (ptr: EntryPtr) => void;
  onToggleFavorite: (ptr: EntryPtr) => void;
  onSelectNode: (nodeId: string) => void;
  onContextMenu: (ptr: EntryPtr) => void;
}

interface ChromeMouseEvent extends React.MouseEvent<HTMLTableRowElement> {
  detail: number; // Click index (1 for first, 2 for second)
}

interface ExtraColProps {
  details?: Details;
}

const ModifiedHeader = withTrans()(({ t }) => <th className="text-right">{t('.column.modified')}</th>);

const ModifiedColumn = withTrans<ExtraColProps>()(({ t, details }) =>
  details && details.modified ? (
    <td
      className="text-right"
      style={{ whiteSpace: 'nowrap' }}
      title={details.modified.date && t('.modifiedTitle', { date: details.modified.date, user: details.modified.user || '_NONE' })}
    >
      {details.modified.date && moment(details.modified.date, undefined, t.locale).fromNow()}
    </td>
  ) : (
    <td />
  )
);

export default withTrans<Props>('component.fileList')(
  ({ t, files, selectedEntry, favorites, showPath, onSelect, onEdit, onToggleFavorite, onSelectNode, onContextMenu }) => (
    <div>
      <Table hover className={`table-sm table-sticky`}>
        <thead>
          <tr>
            <th style={{ width: '5%' }}>{t('.column.favorite')}</th>
            <th>{t('.column.filename')}</th>
            {showPath && <th>{t('.column.path')}</th>}
            <ModifiedHeader />
          </tr>
        </thead>
        <tbody>
          {files.map((file) => {
            return (
              <tr
                key={file.ptr.toString()}
                className={cx('clickable', file.ptr.equals(selectedEntry) && 'table-active', !file.accessible && styles.inaccessible)}
                onClick={(ev: ChromeMouseEvent) => {
                  if (ev.detail === 1) {
                    onSelect(file.ptr);
                  }
                }}
                onMouseDown={(ev: ChromeMouseEvent) => {
                  if (ev.detail > 1) {
                    ev.preventDefault();
                  }
                }}
                onDoubleClick={() => onEdit(file.ptr)}
                onContextMenu={(ev) => {
                  ev.preventDefault();
                  ev.stopPropagation();
                  onContextMenu(file.ptr);
                }}
                onKeyDown={(ev) => console.log(ev)}
              >
                <td>
                  <i
                    className={cx('fa', favorites.has(file.ptr) ? 'fa-star' : 'fa-star-o')}
                    onClick={(ev) => {
                      onToggleFavorite(file.ptr);
                      ev.stopPropagation();
                    }}
                  />
                </td>
                <td>
                  <EntryDragSource item={file.ptr} dragAllowed={file.accessible}>
                    <EntryNameLabel fileName={file.ptr.entry} />
                  </EntryDragSource>
                </td>
                {showPath && (
                  <td
                    title={file.nodes
                      .slice(1)
                      .map((node) => node.name)
                      .join(' / ')}
                    className={file.nodes.length > 3 ? styles.pathEllipsis : undefined}
                  >
                    {file.nodes
                      .slice(1)
                      .slice(-2)
                      .map((node, idx) => (
                        <span key={idx} className={styles.pathSeg}>
                          <a
                            href=""
                            onClick={(ev) => {
                              onSelectNode(node.id);
                              ev.stopPropagation();
                            }}
                          >
                            {node.name}
                          </a>
                        </span>
                      ))}
                  </td>
                )}
                <ModifiedColumn details={file.details} />
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  )
);
