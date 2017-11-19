/**
 * Base webpack config used across other specific configs
 */

import * as path from 'path';
import * as webpack from 'webpack';
// import { dependencies as externals } from './app/package.json';

const baseConfig: webpack.Configuration = {
  // externals: Object.keys(externals || {}),

  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          cacheDirectory: true
        }
      }
    }, {
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: {
        loader: 'ts-loader',
        options: {
          // disable type checker - we will use it in fork plugin
          transpileOnly: true
        }
      }
    },
    // crazy hack to work around a nodegit bug with webpack:
    //   nodegit tries to load all possible extension files, even though some don't exist, and swallows the exception
    //   if it refers to a "missing module" by having ex.code === "MODULE_NOT_FOUND"
    //   however, the webpack recursive importer that gets used because of the dynamic file names does not
    //   set this code like to original 'require' does;
    //   so we monkey-patch it to do just that :)
    {
      test: /nodegit\.js$/,
      loader: 'imports-loader',
      query: `xxfoo=>${encodeURIComponent(`(function(){
          const _require = __webpack_require__;
          __webpack_require__ = function() {
            const result = _require.apply(null, arguments);
            if (typeof result === 'function' && result.resolve) {
              return function(req) {
                try {
                  return result(req);
                } catch (e) {
                  if (e.message && e.message.indexOf("Cannot find module") >= 0) {
                    e.code = "MODULE_NOT_FOUND";
                  }
                  throw e;
                }
              };
            }
            return result;
          };
        })()`)}`
      // query: `require=>${encodeURIComponent(`function() {
      //     try {
      //       return __webpack_require__.apply(null, arguments);
      //     } catch (e) {
      //       if (e.message && e.message.indexOf("Cannot find module") >= 0) {
      //         e.code = "MODULE_NOT_FOUND";
      //       }
      //       throw e;
      //     }
      //   }`)}`
    }]
  },

  output: {
    path: path.join(__dirname, 'app'),
    filename: 'renderer.dev.js',
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2'
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    modules: [
      path.join(__dirname, 'app'),
      'node_modules'
    ],
    alias: {
      keytar: 'keytar-prebuild'
    }
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
    }),

    new webpack.NamedModulesPlugin()
  ]
};

export default baseConfig;
