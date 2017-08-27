import React from 'react';

export default class HiddenText extends React.Component {
  state = {
    visible: false
  };

  show = () => {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.setState({ visible: true });
  };

  hide = () => {
    this.timeout = setTimeout(() => {
      this.timeout = null;
      this.setState({ visible: false });
    }, 2000);
  };

  render() {
    return (<span onMouseEnter={this.show} onMouseLeave={this.hide}>
      {this.state.visible ? this.props.children : this.props.replacement}
    </span>);
  }
}
