import * as React from 'react';

/**
 * Animates height changes of the child component by measuring offsetHeight after render and
 * setting it to an overflow wrapper.
 * Make sure you configure a height animation via className!
 */
export default class AnimateHeight extends React.Component<{ className?: string }, {}> {
  private inner: HTMLDivElement | null;
  private outer: HTMLDivElement | null;
  private placeholder: HTMLDivElement | null;
  private lastHtml: string | null;
  private timer: NodeJS.Timer | undefined;

  componentDidUpdate() {
    if (this.inner && this.outer && this.placeholder) {
      // set fixed height to the outer wrapper so it can be animated
      const innerHeight = this.inner.offsetHeight;
      this.outer.style.height = `${innerHeight}px`;

      // we want to avoid overflow to not block popovers/shadows etc., so set it only during animation and clear afterwards
      this.outer.style.overflow = 'hidden';
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = undefined;
      }
      if (innerHeight) {
        this.timer = setTimeout(() => {
          if (this.outer) {
            this.outer.style.overflow = 'visible';
          }
          this.timer = undefined;
        }, 250);
      }

      // if the inner component disappears, transfer the last HTML to a placeholder component so it can be animated out
      if (innerHeight === 0 && this.lastHtml) {
        this.placeholder.innerHTML = this.lastHtml;
        this.lastHtml = null;
      } else if (innerHeight) {
        this.placeholder.innerHTML = '';
        this.lastHtml = this.inner.innerHTML;
      }
    }
  }

  render() {
    return (
      <div ref={(outer) => (this.outer = outer)} style={{ height: 0, overflowY: 'hidden' }} className={this.props.className}>
        <div ref={(inner) => (this.inner = inner)}>{this.props.children}</div>
        <div ref={(placeholder) => (this.placeholder = placeholder)} />
      </div>
    );
  }
}
