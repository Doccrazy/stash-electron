import * as React from 'react';
import { connect } from 'react-redux';
import { reload } from '../actions/repository';

export default connect(null, dispatch => ({
  onClick: () => dispatch(reload())
}))(
  ({ onClick }: { onClick: () => void }) => (
    <a href="" className="text-dark pull-right" title="Refresh repository" onClick={onClick}><i className="fa fa-refresh" /></a>
  )
);
