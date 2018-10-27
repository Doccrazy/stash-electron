/**
 * Base webpack config used across other specific configs
 */
// tslint:disable-next-line
/// <reference path="webpack.config.d.ts" />

import * as path from 'path';
import * as webpack from 'webpack';
import * as GitRevisionPlugin from 'git-revision-webpack-plugin';
import * as TerserPlugin from 'terser-webpack-plugin';
// import { dependencies as externals } from './app/package.json';

const gitRevisionPlugin = new GitRevisionPlugin();

const baseConfig: webpack.Configuration = {
  // externals: Object.keys(externals || {}),

  module: {
    rules: [{
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: {
        loader: 'ts-loader',
        options: {
          // disable type checker - we will use it in fork plugin
          transpileOnly: true
        }
      }
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
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      GIT_VERSION: JSON.stringify(gitRevisionPlugin.version()),
      GIT_HASH: JSON.stringify(gitRevisionPlugin.commithash()),
      GIT_BRANCH: JSON.stringify(gitRevisionPlugin.branch()),
      BUILD_DATE: JSON.stringify(new Date())
    }),
    new webpack.NormalModuleReplacementPlugin(
      /[/\\]promisify-node[/\\]utils[/\\]args\.js$/,
      path.join(__dirname, 'app/utils/promisify-node-args-patch.js')
    )
  ],

  optimization: {
    namedModules: true,
    minimizer: [new TerserPlugin({
      sourceMap: true,
      terserOptions: {
        mangle: {
          reserved: ['Key', 'PrivateKey']
        }
      }
    })]
  }
};

export default baseConfig;
