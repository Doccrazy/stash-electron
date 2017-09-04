import React from 'react';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import { EntryPtr } from '../../utils/repository';
import { browseForSaveAs, open as openExternal } from '../../actions/external';

const DefaultPanel = ({ onOpen, onSaveAs }) => (<div >
  <p>
    No viewer available for file type.
  </p>
  <Button size="sm" onClick={onOpen}><i className="fa fa-external-link" /> Open in default application</Button>{' '}
  <Button size="sm" onClick={onSaveAs}><i className="fa fa-save" /> Save as...</Button>
</div>);

export default connect(null, (dispatch, props) => ({
  onOpen: () => dispatch(openExternal(new EntryPtr(props.node.id, props.entry))),
  onSaveAs: () => dispatch(browseForSaveAs(new EntryPtr(props.node.id, props.entry)))
}))(DefaultPanel);
