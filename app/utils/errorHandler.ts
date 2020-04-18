import * as fs from 'fs';
import { URL } from 'url';
import unhandled from 'electron-unhandled';
import * as sourceMapSupport from 'source-map-support';

function resolveFileUrl(url: string): string {
  let decoded = decodeURIComponent(new URL(url).pathname);
  // on windows, remove the / before the drive letter
  if (decoded[2] === ':') {
    decoded = decoded.slice(1);
  }
  return decoded;
}

if (process.env.NODE_ENV === 'production') {
  unhandled();
  sourceMapSupport.install({
    handleUncaughtExceptions: false,
    overrideRetrieveSourceMap: true,
    // electron passes a file: url, which source-map-support can't handle
    retrieveSourceMap: ((source: string) => {
      if (source.startsWith('file://')) {
        const sourceMapUrl = `${source}.map`;
        const resolved = resolveFileUrl(sourceMapUrl);
        if (fs.existsSync(resolved)) {
          try {
            const sourceMapData = fs.readFileSync(resolved, 'utf8');
            return {
              url: '', // do not pass url to keep stack filenames relative
              map: sourceMapData
            };
          } catch (er) {
            // ignore
          }
        }
      }
      return null;
    }) as any
  });
}
