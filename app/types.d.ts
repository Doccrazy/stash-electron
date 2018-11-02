// tslint:disable:max-classes-per-file interface-name

declare const GIT_VERSION: string;
declare const GIT_HASH: string;
declare const GIT_BRANCH: string;
declare const BUILD_DATE: string;

declare module 'font-awesome-filetypes' {
  function getClassNameForExtension(extension: string): string;
  export default getClassNameForExtension;
}

declare module 'kdbxweb' {
  class Kdbx {
    static load(dataAsArrayBuffer: ArrayBufferLike, credentials: Credentials): Promise<Kdbx>;
    static create(credentials: Credentials, name?: string): Kdbx;
    getDefaultGroup(): KdbxGroup;
    getGroup(uuid: KdbxUuid): KdbxGroup | null;
    createGroup(parentGroup: KdbxGroup, name: string): KdbxGroup;
    createEntry(parentGroup: KdbxGroup): KdbxEntry;
    createBinary(value: ArrayBufferLike): Promise<BinaryReference>;
    save(): Promise<ArrayBuffer>;
    saveXml(): Promise<string>;
  }
  interface KdbxUuid {}
  const KdbxError: any;
  class Credentials {
    constructor(masterKey: ProtectedValue | null, keyFileArrayBuffer?: ArrayBufferLike | null);
    static createRandomKeyFile(): ArrayBuffer;
    static createKeyFileWithHash(): ArrayBuffer;
    setPassword(password: ProtectedValue | null);
    setKeyFile(keyFile: ArrayBufferLike | null);
    getHash(): Promise<ArrayBuffer>;
  }
  const Consts: any;
  class ProtectedValue {
    static fromString(value: string): ProtectedValue;
    static fromBinary(data: ArrayBufferLike): ProtectedValue;
    getText(): string;
    getBinary(): ArrayBuffer;
    includes(substring: string): boolean;
  }
  const ByteUtils: any;
  const VarDictionary: any;
  const Int64: any;
  const Random: any;
  const CryptoEngine: any;
  interface KdbxGroup {
    uuid: KdbxUuid;
    name: string;
    notes?: string;
    icon?: number;
    customIcon?: KdbxUuid;
    times: KdbxTimes;
    expanded?: boolean;
    defaultAutoTypeSeq?: string;
    enableAutoType?: boolean;
    enableSearching?: boolean;
    lastTopVisibleEntry?: KdbxUuid;
    groups: KdbxGroup[];
    entries: KdbxEntry[];
    parentGroup?: KdbxGroup;
    customData: KdbxCustomData;
  }
  interface KdbxTimes {
    creationTime?: Date;
    lastModTime?: Date;
    lastAccessTime?: Date;
    expiryTime?: Date;
    expires?: boolean;
    usageCount?: number;
    locationChanged?: Date;
  }
  interface KdbxCustomData {}
  interface KdbxEntry {
    uuid: KdbxUuid;
    icon?: number;
    customIcon?: KdbxUuid;
    fgColor?: string;
    bgColor?: string;
    overrideUrl?: string;
    tags: string[];
    times: KdbxTimes;
    fields: {
      Title?: string
      UserName?: string
      Password?: ProtectedValue
      URL?: string
      Notes?: string
      [key: string]: string | ProtectedValue
    };
    binaries: {
      [key: string]: ProtectedValue | ArrayBuffer | BinaryReference
    };
    autoType: {
      enabled: boolean, obfuscation: number, defaultSequence: any, items: any[]
    };
    history: any[];
    parentGroup: KdbxGroup;
    customData: KdbxCustomData;
  }
  interface BinaryReference {
    readonly key: string
    readonly value: ArrayBuffer
  }
}

declare module 'natural-compare' {
  const naturalCompare: (a: string, b: string) => number;
  export = naturalCompare;
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
