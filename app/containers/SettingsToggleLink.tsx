import * as React from 'react';
import { connect } from 'react-redux';
import { pick } from 'lodash';
import { changeAndSave } from '../actions/settings';
import { Dispatch, RootState } from '../actions/types/index';
import { BoolSettings } from '../actions/types/settings';

export interface Props {
  field: keyof BoolSettings;
  iconOn: string;
  iconOff: string;
  title?: string;
  titleOn?: string;
  titleOff?: string;
}

interface InnerProps {
  iconOn: string;
  iconOff: string;
  title?: string;
  titleOn?: string;
  titleOff?: string;
  on?: boolean;
  onSet: (on: boolean) => void;
}

const InnerLink = ({ iconOn, iconOff, title, titleOn, titleOff, on, onSet }: InnerProps) => (
  <a href="" className="text-dark" title={title || (on ? titleOn : titleOff)} onClick={() => onSet(!on)}>
    <i className={`fa fa-${on ? iconOn : iconOff}`} />
  </a>
);

export default connect(
  (state: RootState, props: Props) => ({
    on: state.settings.current[props.field],
    ...pick(props, 'iconOn', 'iconOff', 'title', 'titleOn', 'titleOff')
  }),
  (dispatch: Dispatch, props) => ({
    onSet: (on: boolean) => dispatch(changeAndSave(props.field, on))
  })
)(InnerLink);
