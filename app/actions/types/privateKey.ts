import * as sshpk from 'sshpk';

export enum KeyError {
  FILE,
  ENCRYPTED,
  PASSPHRASE,
  CANCELLED
}

export interface State {
  readonly key?: sshpk.PrivateKey;
  readonly error?: KeyError,
  readonly username?: string,
  readonly encrypted?: boolean
}
