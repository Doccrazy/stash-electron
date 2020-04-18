import * as React from 'react';
import { connect } from 'react-redux';
import { reload } from '../actions/repository';
import { Dispatch } from '../actions/types';

export default connect(null, (dispatch: Dispatch) => ({
  onClick: () => dispatch(reload())
}))(({ onClick }: { onClick: () => void }) => (
  <a href="" className="text-dark" title="Refresh repository" onClick={onClick}>
    <i className="fa fa-refresh" />
  </a>
));
