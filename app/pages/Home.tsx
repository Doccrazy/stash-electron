import * as React from 'react';
import { Col, Row } from 'reactstrap';
import ScrollWatch from '../components/tools/ScrollWatch';
import FolderActionBar from '../containers/FolderActionBar';
import FileList from '../containers/FileList';
import Folder from '../containers/Folder';
import FileDetails from '../containers/FileDetails';
import EditPopup from '../containers/EditPopup';
import DeletePopup from '../containers/DeletePopup';
import DeleteNodePopup from '../containers/DeleteNodePopup';
import CurrentFolder from '../containers/CurrentFolder';
import ImportPopup from '../containers/ImportPopup';
import AddFileDropAcceptor from '../containers/AddFileDropAcceptor';
import MoveFolderPopup from '../containers/MoveFolderPopup';
import SpecialFolderLink from '../containers/SpecialFolderLink';
import * as styles from './Home.scss';
import NoKeyAlert from '../containers/NoKeyAlert';
import AuthorizedUsersPopup from '../containers/AuthorizedUsersPopup';
import RefreshLink from '../containers/RefreshLink';
import SettingsToggleLink from '../containers/SettingsToggleLink';

export default class Home extends React.Component<{}, {}> {
  render() {
    return (
      <div className={styles.home}>
        <EditPopup />
        <DeletePopup />
        <DeleteNodePopup />
        <ImportPopup />
        <AuthorizedUsersPopup />
        <MoveFolderPopup />
        <ScrollWatch className={styles.sidebar} step={20} classes={['', styles.scroll1, styles.scroll2, styles.scroll3]}>
          <div className={styles.sideToolbar}>
            <span className="pull-right">
              <SettingsToggleLink field="hideInaccessible" iconOn="eye-slash" titleOn="Inaccessible files/folders are hidden; click to toggle"
                                  iconOff="eye" titleOff="Inaccessible files/folders are shown; click to toggle"/>
              &nbsp;&nbsp;
              <RefreshLink />
            </span>
            <SpecialFolderLink id="favorites" />
          </div>
          <div className={styles.sideTree}>
            <Folder nodeId="/" />
          </div>
        </ScrollWatch>
        <div className={`${styles.main}`}>
          <NoKeyAlert />
          <div className={styles.contentHeader}>
            <Row>
              <Col>
                <CurrentFolder />
              </Col>
              <Col xs="auto" className="text-right">
                <FolderActionBar />
              </Col>
            </Row>
          </div>
          <AddFileDropAcceptor className={styles.contentBody}>
            <FileList />
          </AddFileDropAcceptor>
          <div className={styles.contentFooter}>
            <FileDetails />
          </div>
        </div>
      </div>
    );
  }
}
