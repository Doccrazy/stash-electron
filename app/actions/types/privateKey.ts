import * as sshpk from 'sshpk';

export enum KeyError {
  FILE,
  ENCRYPTED,
  PASSPHRASE,
  CANCELLED
}

export interface State {
  key?: sshpk.PrivateKey;
  error?: KeyError
}
