import { connect } from 'react-redux';
import { RootState } from '../../actions/types';
import { Context } from './format';
import { renderToFragment } from './helper';
import { translate } from './translate';

interface OwnProps extends Context {
  id: string
  markdown?: boolean
}
interface Props extends OwnProps {
  locale: string
}

const Trans = ({ locale, id, markdown, ...context }: Props) => {
  const translation = translate(locale, id, context, markdown);
  return renderToFragment(translation);
};

export default connect((state: RootState, props: OwnProps) => ({
  locale: state.settings.current.locale
}), () => ({}))(Trans);
