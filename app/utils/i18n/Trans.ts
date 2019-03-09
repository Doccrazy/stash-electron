import * as React from 'react';
import { connect } from 'react-redux';
import { Context, PlainContext } from './format';
import { contextualize, renderToFragment, withContext } from './helper';
import { extractLocaleFromState } from './redux';
import { translate } from './translate';

export type BoundTranslate = (id: string, context?: PlainContext) => string;

interface OwnProps extends Context {
  id?: string
  markdown?: boolean
  children?: (t: BoundTranslate) => React.ReactNode
}
interface Props extends OwnProps {
  locale: string
}

const IdContext = React.createContext('');

const Trans = contextualize(({ locale, id, markdown, children, ...context }: Props) => {
  if (typeof children === 'function') {
    const boundTranslate: BoundTranslate = (innerId, innerContext) =>
      translate(locale, innerId.startsWith('.') ? `${id}${innerId}` : innerId, { ...(context as PlainContext), ...innerContext }, false);
    const frag = renderToFragment(children(boundTranslate));
    return id ? withContext(frag, IdContext, id) : frag;
  } else if (id && !children) {
    return renderTranslation(locale, id, context, markdown);
  }
  throw new Error('Do not nest React components in Trans component! Either pass a message id, or nest a callback taking the t function.');
}, IdContext, props => !props.id || props.id.startsWith('.'), (props, idFromContext) => ({ ...props, id: `${idFromContext}${props.id || ''}` }));

function renderTranslation(locale: string, id: string, context: Context, markdown?: boolean) {
  const translation = translate(locale, id, context, markdown);
  return withContext(renderToFragment(translation), IdContext, id);
}

export default connect((state: any, props: OwnProps) => ({
  locale: extractLocaleFromState ? extractLocaleFromState(state) : 'unk'
}), () => ({}))(Trans);
