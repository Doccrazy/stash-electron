import { PrivatebinClient, PrivatebinOptions } from '@pixelfactory/privatebin';
import { encode } from 'bs58';

export async function shareOnPrivateBin(siteUrl: string, content: string, options?: Partial<PrivatebinOptions>) {
  const privatebin = new PrivatebinClient(siteUrl);
  const key = crypto.getRandomValues(new Uint8Array(32));
  const paste = await privatebin.sendText(content, key, {
    expire: '10min',
    burnafterreading: 0,
    opendiscussion: 0,
    output: 'text',
    compression: 'zlib',
    textformat: 'plaintext',
    ...options
  });

  const fullUrl = new URL(paste.url + '#' + encode(key), siteUrl).toString();
  return fullUrl;
}
