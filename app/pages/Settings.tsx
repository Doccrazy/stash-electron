import * as React from 'react';
import { Form, FormGroup, Label } from 'reactstrap';
import { Link } from 'react-router-dom';
import { remote } from 'electron';
import RecentRepositories from '../containers/RecentRepositories';
import SettingField from '../containers/SettingField';
import SaveSettingsButton from '../containers/SaveSettingsButton';
import SettingLocaleChooser from '../containers/SettingLocaleChooser';
import Trans from '../utils/i18n/Trans';

export default () => (<div className="container">
  <h1 className="my-4">Application settings</h1>

  <Form>
    <FormGroup>
      <Label>Recent repositories</Label>
      <RecentRepositories />
    </FormGroup>
    <FormGroup>
      <Label><Trans id="page.settings.language"/></Label>
      <SettingLocaleChooser/>
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
