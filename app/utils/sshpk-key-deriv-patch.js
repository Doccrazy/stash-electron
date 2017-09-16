/**
 * This file patches a bug in sshpk, where the key length for des-ede3-cbc private key encr. algorithm is
 * set to 56bits (as for single-DES without padding) instead of the correct 192bits (3DES with openssl padding).
 *
 * This fixes the bug by setting the correct value in the CIPHER_LEN map.
 */

var assert = require('assert-plus');
var crypto = require('crypto');

var CIPHER_LEN = {
  'des-ede3-cbc': { key: 24, iv: 8 },     // <- patched line is right here
  'aes-128-cbc': { key: 16, iv: 16 }
};
var PKCS5_SALT_LEN = 8;

function opensslKeyDeriv(cipher, salt, passphrase, count) {
  assert.buffer(salt, 'salt');
  assert.buffer(passphrase, 'passphrase');
  assert.number(count, 'iteration count');

  var clen = CIPHER_LEN[cipher];
  assert.object(clen, 'supported cipher');

  salt = salt.slice(0, PKCS5_SALT_LEN);

  var D, D_prev, bufs;
  var material = new Buffer(0);
  while (material.length < clen.key + clen.iv) {
    bufs = [];
    if (D_prev)
      bufs.push(D_prev);
    bufs.push(passphrase);
    bufs.push(salt);
    D = Buffer.concat(bufs);
    for (var j = 0; j < count; ++j)
      D = crypto.createHash('md5').update(D).digest();
    material = Buffer.concat([material, D]);
    D_prev = D;
  }

  return ({
    key: material.slice(0, clen.key),
    iv: material.slice(clen.key, clen.key + clen.iv)
  });
}

require('sshpk/lib/utils').opensslKeyDeriv = opensslKeyDeriv;
