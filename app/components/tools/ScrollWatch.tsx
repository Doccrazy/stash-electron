import cx from 'classnames';
import * as React from 'react';

function raf(cb: () => void): () => void {
  let ticking = false;
  return () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        ticking = false;
        cb();
      });
      ticking = true;
    }
  };
}

/**
 * Progressively adds the given classes to a div element with increasing scrollTop
 */
export default class ScrollWatch extends React.Component<
  React.HTMLAttributes<HTMLDivElement> & { step: number; classes: string[] },
  { idx: number }
> {
  state = { idx: 0 };

  element?: HTMLDivElement | null;

  constructor(props: ScrollWatch['props']) {
    super(props);
    this.onScroll = raf(this.onScroll.bind(this));
  }

  onScroll() {
    if (this.element) {
      this.setState({ idx: Math.min(Math.trunc(this.element.scrollTop / this.props.step), this.props.classes.length - 1) });
    }
  }

  render() {
    const { className, children, step, classes, ...childProps } = this.props;
    return (
      <div {...childProps} ref={(e) => (this.element = e)} className={cx(className, classes[this.state.idx])} onScroll={this.onScroll}>
        {children}
      </div>
    );
  }
}
