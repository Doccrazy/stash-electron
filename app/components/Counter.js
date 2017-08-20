// @flow
import React, { Component } from 'react';
import styles from './Counter.css';
import { Button } from 'reactstrap';

class Counter extends Component {
  props: {
    increment: () => void,
    incrementIfOdd: () => void,
    incrementAsync: () => void,
    decrement: () => void,
    counter: number
  };

  render() {
    const { increment, incrementIfOdd, incrementAsync, decrement, counter } = this.props;
    return (
      <div>
        <div className={`counter ${styles.counter}`} data-tid="counter">
          {counter}
        </div>
        <div className="fixed-bottom text-center p-2">
          <Button onClick={increment}>
            <i className="fa fa-plus" />
          </Button>&nbsp;
          <Button onClick={decrement}>
            <i className="fa fa-minus" />
          </Button>&nbsp;
          <Button onClick={incrementIfOdd}>odd</Button>&nbsp;
          <Button onClick={() => incrementAsync()}>async</Button>
        </div>
      </div>
    );
  }
}

export default Counter;
