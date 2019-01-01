/**
 * Builds the DLL for development electron renderer process
 * Not called standalone; instead, this is referenced from AutoDllPlugin
 */
// tslint:disable-next-line
/// <reference path="webpack.config.d.ts" />

import * as webpack from 'webpack';
import * as packageJson from './package.json';
import CheckNodeEnv from './internals/scripts/CheckNodeEnv';

CheckNodeEnv('development');

const rendererDevDllConfig: webpack.Configuration = {
  mode: 'development',
  devtool: 'eval',
  target: 'electron-renderer',
  externals: ['fsevents', 'crypto-browserify', '../build/Debug/nodegit.node'],
  module: {
    rules: [
      {
        test: /\.node$/,
        use: 'node-loader'
      }
    ]
  },
  entry: {
    vendor: (
      Object
        .keys(packageJson.dependencies || {})
        .filter(dependency => dependency !== 'font-awesome' && dependency !== 'react-hot-loader' && !dependency.startsWith('@types/'))
    )
  },
  resolve: {
    aliasFields: []
  }
};

export default rendererDevDllConfig;
