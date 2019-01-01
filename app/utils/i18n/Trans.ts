import { connect } from 'react-redux';
import { RootState } from '../../actions/types';
import { renderToFragment } from './helper';
import { translate, Context } from './translate';

interface OwnProps extends Context {
  prop: string
  markdown?: boolean
}
interface Props extends OwnProps {
  locale: string
}

const Trans = ({ locale, prop, markdown, ...context }: Props) => {
  const translation = translate(locale, prop, context, markdown);
  return renderToFragment(translation);
};

export default connect((state: RootState, props: OwnProps) => ({
  locale: 'de'
}), () => ({}))(Trans);
