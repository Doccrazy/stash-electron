import { connect } from 'react-redux';
import { RootState } from '../actions/types';
import * as i18n from '../utils/i18n';

interface OwnProps extends i18n.Context {
  prop: string
  markdown?: boolean
}
interface Props extends OwnProps {
  locale: string
}

const Trans = ({ locale, prop, markdown, ...context }: Props) => {
  const translation = i18n.translate(locale, prop, markdown, context);
  return i18n.renderToFragment(translation);
};

export default connect((state: RootState, props: OwnProps) => ({
  locale: 'de'
}), () => ({}))(Trans);
