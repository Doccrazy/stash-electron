import * as React from 'react';
import { Form, FormGroup, InputGroup, InputGroupAddon, Label } from 'reactstrap';
import { Link } from 'react-router-dom';
import { remote } from 'electron';
import SettingField from '../containers/SettingField';
import SaveSettingsButton from '../containers/SaveSettingsButton';
import SettingsBrowseDirButton from '../containers/SettingsBrowseDirButton';
import SettingsBrowseFileButton from '../containers/SettingsBrowseFileButton';
import PrivateKeyStatus from '../containers/PrivateKeyStatus';
import ActionButton from '../containers/ActionButton';
import { openGenerate } from '../actions/privateKey';
import { openClonePopup } from '../actions/git';

export default () => (<div className="container">
  <h1 className="my-4">Application settings</h1>

  <Form>
    <FormGroup>
      <Label>Repository path</Label>
      <div className="d-flex">
        <InputGroup>
          <SettingField field="repositoryPath" />
          <InputGroupAddon addonType="append">
            <SettingsBrowseDirButton field="repositoryPath" title="Select repository path"><i className="fa fa-folder" /></SettingsBrowseDirButton>
          </InputGroupAddon>
        </InputGroup>
        <div className="text-nowrap col-form-label mx-2">- or -</div>
        <ActionButton actionCreator={openClonePopup} title="Will prompt for target folder">
          <i className="fa fa-git-square" /> Clone remote repository
        </ActionButton>
      </div>
    </FormGroup>
    <FormGroup>
      <Label>Private key file (SSH / PEM / PPK)</Label>
      <div className="d-flex">
        <InputGroup>
          <SettingField field="privateKeyFile" />
          <InputGroupAddon addonType="append">
            <SettingsBrowseFileButton field="privateKeyFile" title="Select private key"><i className="fa fa-folder-open" /></SettingsBrowseFileButton>
          </InputGroupAddon>
        </InputGroup>
        <div className="text-nowrap col-form-label mx-2">- or -</div>
        <ActionButton actionCreator={openGenerate} title="Will prompt for save location"><i className="fa fa-cog" /> Generate new keypair</ActionButton>
      </div>
      <small className="form-text"><PrivateKeyStatus /></small>
    </FormGroup>
    <FormGroup>
      <Label>Inactivity lock (minutes)</Label>
      <SettingField field="inactivityTimeout" />
      <small className="form-text text-muted">
        Lock workspace after some minutes of inactivity; 0 to disable.&nbsp;
        <i className="fa fa-warning" /> Requires an encrypted private key.
      </small>
    </FormGroup>
    <FormGroup>
      <Label>UI scale / root font size (px)</Label>
      <SettingField field="rootFontSize" />
    </FormGroup>
    <FormGroup className="text-right">
      <SaveSettingsButton color="success">Save</SaveSettingsButton>
    </FormGroup>
  </Form>
  <Link to="/changelog" className="text-muted" title="Show changelog">
    <small>{remote.app.getName()} {remote.app.getVersion()} (
      {GIT_VERSION} built {new Date(BUILD_DATE).toLocaleString()}, running on Electron {process.versions.electron})</small>
  </Link>
</div>);
