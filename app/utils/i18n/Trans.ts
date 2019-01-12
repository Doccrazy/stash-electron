import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../../actions/types';
import { Context, PlainContext } from './format';
import { renderToFragment } from './helper';
import { translate } from './translate';

type BoundTranslate = (id: string, context?: PlainContext) => string;

interface OwnProps extends Context {
  id?: string
  markdown?: boolean
  children?: (t: BoundTranslate) => React.ReactNode
}
interface Props extends OwnProps {
  locale: string
}

const Trans = ({ locale, id, markdown, children, ...context }: Props) => {
  if (id) {
    const translation = translate(locale, id, context, markdown);
    return renderToFragment(translation);
  } else if (typeof children === 'function') {
    const boundTranslate: BoundTranslate = (innerId, innerContext) => translate(locale, innerId, { ...(context as PlainContext), ...innerContext }, false);
    return renderToFragment(children(boundTranslate));
  }
  throw new Error('Do not nest React components in Trans component! Either pass a message id, or nest a callback taking the t function.');
};

export default connect((state: RootState, props: OwnProps) => ({
  locale: state.settings.current.locale
}), () => ({}))(Trans);
