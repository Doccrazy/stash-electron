import * as fs from 'fs';
import unhandled from 'electron-unhandled';
import * as sourceMapSupport from 'source-map-support';

if (process.env.NODE_ENV === 'production') {
  unhandled();
  sourceMapSupport.install({
    handleUncaughtExceptions: false,
    // electron passes a file: url, which source-map-support can't handle
    retrieveFile: (path: string) => {
      path = path.trim();
      if (path.startsWith('file://')) {
        path = path.substr('file://'.length);
        if (fs.existsSync(path)) {
          try {
            return fs.readFileSync(path, 'utf8');
          } catch (er) {
          }
        }
      }
      return '';
    }
  });
}
