import * as React from 'react';
import { Col, Row } from 'reactstrap';
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
import SpecialFolderLink from '../containers/SpecialFolderLink';
import * as styles from './Home.css';
import NoKeyAlert from '../containers/NoKeyAlert';
import AuthorizedUsersPopup from '../containers/AuthorizedUsersPopup';
import RefreshLink from '../containers/RefreshLink';

export default class Home extends React.Component<{}, {}> {
  render() {
    return (
      <div className={styles.home}>
        <EditPopup />
        <DeletePopup />
        <DeleteNodePopup />
        <ImportPopup />
        <AuthorizedUsersPopup />
        <div className={`bg-light ${styles.sidebar}`}>
          <p>
            <RefreshLink />
            <SpecialFolderLink id="favorites" />
          </p>
          <Folder nodeId="/" />
        </div>
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
