import * as React from 'react';

export interface Props {
  children: any;
  replacement: any;
}

export default class HiddenText extends React.Component<Props, { visible: boolean }> {
  timeout: number | null;

  state = {
    visible: false
  };

  constructor(props: Props) {
    super(props);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  show() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.setState({ visible: true });
  }

  hide() {
    this.timeout = setTimeout(() => {
      this.timeout = null;
      this.setState({ visible: false });
    }, 2000) as any;
  }

  render() {
    return (
      <span onMouseEnter={this.show} onMouseLeave={this.hide}>
        {this.state.visible ? this.props.children : this.props.replacement}
      </span>
    );
  }
}
