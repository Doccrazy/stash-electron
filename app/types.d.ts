declare const GIT_VERSION: string;
declare const GIT_HASH: string;
declare const GIT_BRANCH: string;
declare const BUILD_DATE: string;

declare module 'font-awesome-filetypes' {
  function getClassNameForExtension(extension: string): string;
  export default getClassNameForExtension;
}

declare module 'kdbxweb' {
  const Kdbx: any;
  const KdbxUuid: any;
  const KdbxError: any;
  const Credentials: any;
  const Consts: any;
  const ProtectedValue: any;
  const ByteUtils: any;
  const VarDictionary: any;
  const Int64: any;
  const Random: any;
  const CryptoEngine: any;
}

declare module 'natural-compare' {
  const naturalCompare: (a: string, b: string) => number;
  export = naturalCompare;
}

declare module 'electron-unhandled' {
  const unhandled: () => void;
  export = unhandled;
}

declare module 'electron-window-state' {
  const windowStateKeeper: (options: {}) => any;
  export = windowStateKeeper;
}

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
