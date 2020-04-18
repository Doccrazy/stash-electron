import * as fs from 'fs';
import * as SshPK from 'sshpk';
import { afterAction } from '../store/eventMiddleware';
import * as PrivateKey from './privateKey';
import * as Settings from './settings';
import { Dispatch, GetState, TypedThunk } from './types';

const SETTINGS_KEY = 'privateKeys';

function addOrUpdate(privateKey: SshPK.PrivateKey, path: string): TypedThunk<any, void> {
  return (dispatch, getState) => {
    const { privateKeys } = getState().settings.current;
    const publicKeyParts = privateKey.toPublic().toString('ssh').split(' ');
    const publicKey = `${publicKeyParts[0]} ${publicKeyParts[1]}`;

    const clone = privateKeys.map((key) => ({ ...key })).filter((key) => fs.existsSync(key.path));
    const current = clone.find((key) => key.publicKey === publicKey);
    let updated;
    if (!current) {
      clone.push({ path, publicKey });
      updated = true;
    } else if (current.path !== path || current.publicKey !== publicKey) {
      current.path = path;
      current.publicKey = publicKey;
      updated = true;
    }

    if (updated || clone.length !== privateKeys.length) {
      dispatch(Settings.changeAndSave(SETTINGS_KEY, clone));
    }
  };
}

// when a valid private key is loaded, add it to the list of recently used keysy
afterAction([PrivateKey.Actions.LOAD], (dispatch: Dispatch, getState: GetState) => {
  const { privateKey, settings } = getState();
  if (privateKey.key && settings.current.privateKeyFile) {
    dispatch(addOrUpdate(privateKey.key, settings.current.privateKeyFile));
  }
});
