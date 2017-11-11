import * as cx from 'classnames';
import * as React from 'react';
import { PasswordStrength } from 'tai-password-strength';
import * as styles from './StrengthMeter.scss';

export interface Props {
  value?: string,
  className?: string
}

const STYLE_MAP = {
  VERY_WEAK: styles.veryWeak,
  WEAK: styles.weak,
  REASONABLE: styles.reasonable,
  STRONG: styles.strong,
  VERY_STRONG: styles.veryStrong
};

const strengthTester = new PasswordStrength();

export default ({ value = '', className }: Props) => {
  const result = strengthTester.check(value);
  return (<div className={cx(className, styles.panel, STYLE_MAP[result.strengthCode])}>
    {result.passwordLength} chars / {Math.trunc(result.shannonEntropyBits)} bits
  </div>);
};
