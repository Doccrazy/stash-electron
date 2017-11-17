declare module 'font-awesome-filetypes';

declare module 'kdbxweb';

declare module 'natural-compare';

declare module 'electron-unhandled';

declare module 'tai-password-strength/lib/password-strength.js' {
  type StrengthCode = 'VERY_WEAK' | 'WEAK' | 'REASONABLE' | 'STRONG' | 'VERY_STRONG';

  interface CheckResult {
    charsetSize: number,
    commonPassword: boolean,
    nistEntropyBits: number,
    passwordLength: number,
    shannonEntropyBits: number,
    strengthCode: StrengthCode,
    trigraphEntropyBits: number,
    charsets: object
  }

  interface PasswordStrength {
    check(currentPassword: string): CheckResult;
  }
  interface Lib {
    new (): PasswordStrength;
  }

  const pws: Lib;
  export = pws;
}

declare module '*.css' {
  interface IClassNames {
    [className: string]: string
  }
  const classNames: IClassNames;
  export = classNames;
}

declare module '*.scss' {
  interface IClassNames {
    [className: string]: string
  }
  const classNames: IClassNames;
  export = classNames;
}
