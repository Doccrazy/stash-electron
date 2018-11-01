import * as React from 'react';
import { Form, FormGroup, Label } from 'reactstrap';
import { Link } from 'react-router-dom';
import { remote } from 'electron';
import SettingField from '../containers/SettingField';
import SettingFileField from '../containers/SettingFileField';
import SaveSettingsButton from '../containers/SaveSettingsButton';
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
        <SettingFileField field="repositoryPath" folder dialogTitle="Select repository path"/>
        <div className="text-nowrap col-form-label mx-2">- or -</div>
        <ActionButton actionCreator={openClonePopup} title="Will prompt for target folder">
          <i className="fa fa-git-square" /> Clone remote repository
        </ActionButton>
      </div>
    </FormGroup>
    <FormGroup>
      <Label>Private key file (SSH / PEM / PPK)</Label>
      <div className="d-flex">
        <SettingFileField field="privateKeyFile" dialogTitle="Select private key"/>
        <div className="text-nowrap col-form-label mx-2">- or -</div>
        <ActionButton actionCreator={openGenerate} title="Will prompt for save location"><i className="fa fa-cog" /> Generate new keypair</ActionButton>
      </div>
      <small className="form-text"><PrivateKeyStatus /></small>
    </FormGroup>
    <FormGroup>
      <Label>Inactivity lock (minutes)</Label>
      <SettingField field="inactivityTimeout" type="number" min={0} step={5} />
      <small className="form-text text-muted">
        Lock workspace after some minutes of inactivity; 0 to disable.&nbsp;
        <i className="fa fa-warning" /> Requires an encrypted private key.
      </small>
    </FormGroup>
    <FormGroup>
      <Label>UI scale / root font size (px)</Label>
      <SettingField field="rootFontSize" type="number" min={10} max={20} />
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
