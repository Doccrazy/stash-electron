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
  <h1 className="my-4"><Trans id="page.settings.title"/></h1>

  <Form>
    <FormGroup>
      <Label><Trans id="repositories"/></Label>
      <RecentRepositories />
    </FormGroup>
    <FormGroup>
      <Label><Trans id="page.settings.language"/></Label>
      <SettingLocaleChooser/>
    </FormGroup>
    <FormGroup>
      <Label><Trans id="page.settings.autoLock"/></Label>
      <SettingField field="inactivityTimeout" type="number" min={0} step={5} />
      <small className="form-text text-muted">
        <Trans id="page.settings.help.autoLock" markdown/>
      </small>
    </FormGroup>
    <FormGroup>
      <Label><Trans id="page.settings.scale"/></Label>
      <SettingField field="rootFontSize" type="number" min={10} max={20} />
    </FormGroup>
    <FormGroup className="text-right">
      <SaveSettingsButton color="success"><Trans id="action.common.save"/></SaveSettingsButton>
    </FormGroup>
  </Form>
  <Trans>{t =>
    <Link to="/changelog" className="text-muted" title={t('page.settings.changelog.title')}>
      <small><Trans id="page.settings.appVersion" name={remote.app.getName()} version={remote.app.getVersion()}
                    gitVersion={GIT_VERSION} buildDate={new Date(BUILD_DATE)} electronVersion={process.versions.electron}/></small>
    </Link>
  }</Trans>
</div>);
