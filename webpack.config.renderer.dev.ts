/* eslint global-require: 0, import/no-dynamic-require: 0 */

/**
 * Build config for development electron renderer process that uses
 * Hot-Module-Replacement
 *
 * https://webpack.js.org/concepts/hot-module-replacement/
 */

import HtmlWebpackPlugin from 'html-webpack-plugin';
import * as path from 'path';
import * as webpack from 'webpack';
import * as merge from 'webpack-merge';
import { spawn } from 'child_process';
import { omit } from 'lodash';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import AutoDllPlugin from 'autodll-webpack-plugin';
import baseConfig from './webpack.config.base';
import dllConfig from './webpack.config.renderer.dev.dll';
import CheckNodeEnv from './internals/scripts/CheckNodeEnv';

CheckNodeEnv('development');

const port = Number.parseInt(process.env.PORT || '1212', 10);

const rendererDevConfig: webpack.Configuration = {
  mode: 'development',
  devtool: 'inline-source-map',

  target: 'electron-renderer',

  entry: [
    `webpack-dev-server/client?http://localhost:${port}/`,
    'webpack/hot/only-dev-server',
    path.join(__dirname, 'app/index.tsx')
  ],

  output: {
    path: path.join(__dirname, 'build', 'dist'),
    filename: 'renderer.dev.js'
  },

  module: {
    rules: [
      {
        test: /\.global\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /^((?!\.global).)*\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              localsConvention: 'camelCase',
              sourceMap: true,
              importLoaders: 1,
              modules: {
                localIdentName: '[name]__[local]__[hash:base64:5]'
              }
            }
          }
        ]
      },
      // Add SASS support  - compile all .global.scss files and pipe it to style.css
      {
        test: /\.global\.scss$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      },
      // Add SASS support  - compile all other .scss files and pipe it to style.css
      {
        test: /^((?!\.global).)*\.scss$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              localsConvention: 'camelCase',
              sourceMap: true,
              importLoaders: 1,
              modules: {
                localIdentName: '[name]__[local]__[hash:base64:5]'
              }
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      }
    ]
  },

  plugins: [
    /**
     * https://webpack.js.org/concepts/hot-module-replacement/
     */
    new webpack.HotModuleReplacementPlugin({
      // @TODO: Waiting on https://github.com/jantimon/html-webpack-plugin/issues/533
      // multiStep: true
    }),

    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     *
     * By default, use 'development' as NODE_ENV. This can be overriden with
     * 'staging', for example, by changing the ENV variables in the npm scripts
     */
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),

    new webpack.LoaderOptionsPlugin({
      debug: true
    }),

    new ForkTsCheckerWebpackPlugin(),

    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'app/app.html')
    }),

    new AutoDllPlugin({
      inject: true, // will inject the DLL bundles to index.html
      filename: '[name].js',
      config: omit(dllConfig, 'entry'),
      entry: dllConfig.entry
    })
  ],

  optimization: {
    noEmitOnErrors: true
  },

  node: {
    __dirname: false,
    __filename: false
  },

  devServer: {
    port,
    compress: true,
    noInfo: true,
    stats: 'errors-only',
    inline: true,
    lazy: false,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    contentBase: false,
    watchOptions: {
      aggregateTimeout: 300,
      ignored: /node_modules/,
      poll: 100
    },
    before() {
      if (process.env.START_HOT) {
        console.log('Staring Main Process...');
        spawn(
          'npm',
          ['run', 'start-main-dev', '--', process.env.MAIN_ARGS || ''],
          { shell: true, env: { ...process.env, DEV_SERVER_ROOT: 'http://localhost:1212/' }, stdio: 'inherit' }
        )
        .on('close', code => process.exit(code))
        .on('error', spawnError => console.error(spawnError));
      }
    }
  }
};

export default merge.smart(baseConfig, rendererDevConfig);
