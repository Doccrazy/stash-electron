import * as React from 'react';

export interface Props<T> {
  limit?: number
  items: T[]
  item: (item: T, idx: number) => React.ReactNode
  loadMore?: (onLoadMore: (ev?: React.SyntheticEvent) => void, remaining: number) => React.ReactNode
}

/**
 * Limits initial display of a list of items to a certain limit, to ensure optimal display performance
 */
export default class ItemLimiter<T> extends React.Component<Props<T>, { limit: number }> {
  static defaultProps = {
    limit: 100
  };
  state = { limit: this.props.limit! };

  onLoadMore = (ev?: React.SyntheticEvent) => {
    if (ev) {
      ev.preventDefault();
    }
    this.setState({ limit: this.state.limit + this.props.limit! });
  }

  render() {
    const remaining = this.props.items.length - this.state.limit;
    return [
      ...this.props.items.slice(0, this.state.limit).map(this.props.item),
      ...(this.props.loadMore && remaining > 0 ? [this.props.loadMore(this.onLoadMore, remaining)] : [])
    ];
  }
}
