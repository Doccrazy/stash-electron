import * as React from 'react';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import { Dispatch } from '../../actions/types/index';
import Trans from '../../utils/i18n/Trans';
import { PanelProps } from '../index';
import { browseForSaveAs, open as openExternal } from '../../actions/external';

interface InnerProps {
  onOpen: () => void,
  onSaveAs: () => void
}

const DefaultPanel = ({ onOpen, onSaveAs }: InnerProps) => (<div >
  <p>
    <Trans id="fileType.default.panel.title"/>
  </p>
  <Button size="sm" onClick={onOpen}><i className="fa fa-external-link" /> <Trans id="fileType.default.panel.button.open"/></Button>{' '}
  <Button size="sm" onClick={onSaveAs}><i className="fa fa-save" /> <Trans id="fileType.default.panel.button.save"/></Button>
</div>);

export default connect(null, (dispatch: Dispatch, props: PanelProps<void>) => ({
  onOpen: () => dispatch(openExternal()),
  onSaveAs: () => dispatch(browseForSaveAs())
}))(DefaultPanel);
