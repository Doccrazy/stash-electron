import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../../actions/types';
import { renderToFragment } from './helper';
import { PlainContext, translate } from './translate';

interface OwnProps {
  value: (t: (id: string, context?: PlainContext) => string) => React.ReactNode
}
interface Props extends OwnProps {
  locale: string
}

const WithTrans = ({ locale, value }: Props) => {
  const boundTranslate = (innerId: string, innerContext?: PlainContext) => translate(locale, innerId, innerContext, false);
  return renderToFragment(value(boundTranslate));
};

export default connect((state: RootState, props: OwnProps) => ({
  locale: state.i18n.locale
}), () => ({}))(WithTrans);
