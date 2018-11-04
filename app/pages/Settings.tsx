import * as React from 'react';
import { Form, FormGroup, Label } from 'reactstrap';
import { Link } from 'react-router-dom';
import { remote } from 'electron';
import RecentRepositories from '../containers/RecentRepositories';
import SettingField from '../containers/SettingField';
import SettingFileField from '../containers/SettingFileField';
import SaveSettingsButton from '../containers/SaveSettingsButton';
import PrivateKeyStatus from '../containers/PrivateKeyStatus';
import ActionButton from '../containers/ActionButton';
import { openGenerate } from '../actions/privateKey';

export default () => (<div className="container">
  <h1 className="my-4">Application settings</h1>

  <Form>
    <FormGroup>
      <Label>Recent repositories</Label>
      <RecentRepositories />
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
