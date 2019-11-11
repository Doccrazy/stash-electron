import * as React from 'react';
import Trans, { BoundTranslate } from './Trans';

const withTrans = <P>(id?: string) => (Component: React.ComponentType<P & {t: BoundTranslate}>) => {
  return (props: P) => React.createElement(Trans, { id }, (t: BoundTranslate) => React.createElement(Component, {...props, t}));
};

export default withTrans;
