import * as React from 'react';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import { PanelProps } from '../index';
import { browseForSaveAs, open as openExternal } from '../../actions/external';

interface InnerProps {
  onOpen: () => void,
  onSaveAs: () => void
}

const DefaultPanel = ({ onOpen, onSaveAs }: InnerProps) => (<div >
  <p>
    No viewer available for file type.
  </p>
  <Button size="sm" onClick={onOpen}><i className="fa fa-external-link" /> Open in default application</Button>{' '}
  <Button size="sm" onClick={onSaveAs}><i className="fa fa-save" /> Save as...</Button>
</div>);

export default connect(null, (dispatch, props: PanelProps<void>) => ({
  onOpen: () => dispatch(openExternal()),
  onSaveAs: () => dispatch(browseForSaveAs())
}))(DefaultPanel);
