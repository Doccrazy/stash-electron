import * as cx from 'classnames';
import * as React from 'react';
import * as PasswordStrength from 'tai-password-strength/lib/password-strength.js';  // tslint:disable-line
import Trans from '../../utils/i18n/Trans';
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
    <Trans id="component.shared.strengthMeter.strength" length={result.passwordLength} entropy={Math.trunc(result.shannonEntropyBits)}/>
  </div>);
};
