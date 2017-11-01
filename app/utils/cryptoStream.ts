// import through2 from 'through2';
// import pumpify from 'pumpify';
// import skip from 'stream-skip';
// import peek from 'peek-stream';
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
export const ALG_KEY_BYTES = 32;
const ALG_IV_BYTES = 16;

/*export function encipher(key) {
    const iv = crypto.randomBytes(ALG_IV_BYTES);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    return pumpify(through2(function (chunk, enc, callback) {
        if (!this.ivWritten) {
            this.push(iv);
            this.ivWritten = true;
        }
        this.push(chunk);
        callback()
    }), cipher);
}

export function decipher(key) {
    return peek({newline: false, maxBuffer: ALG_IV_BYTES}, function (ivBuffer, swap) {
        if (ivBuffer.length > ALG_IV_BYTES) {
            ivBuffer = ivBuffer.slice(0, ALG_IV_BYTES);
        }
        const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);
        swap(null, pumpify(skip({ skip: ALG_IV_BYTES }), decipher));
    });
}*/

export function encipherSync(key: Buffer, buffer: Buffer): Buffer {
    const iv = crypto.randomBytes(ALG_IV_BYTES);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const outBuffer = cipher.update(buffer);
    return Buffer.concat([iv, outBuffer, cipher.final()]);
}

export function decipherSync(key: Buffer, buffer: Buffer): Buffer {
    const ivBuffer = buffer.slice(0, ALG_IV_BYTES);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);
    const outBuffer = decipher.update(buffer.slice(ALG_IV_BYTES));
    return Buffer.concat([outBuffer, decipher.final()]);
}
