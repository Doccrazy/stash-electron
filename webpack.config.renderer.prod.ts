/**
 * Build config for electron renderer process
 */

import * as path from 'path';
import { Configuration } from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import merge from 'webpack-merge';
import baseConfig from './webpack.config.base';
import CheckNodeEnv from './internals/scripts/CheckNodeEnv';

CheckNodeEnv('production');

const rendererProdConfig: Configuration = {
  mode: 'production',
  devtool: 'nosources-source-map',

  target: 'electron-renderer',

  entry: './app/index',

  output: {
    path: path.join(__dirname, 'build/dist'),
    publicPath: '../dist/',
    filename: 'renderer.prod.js'
  },

  externals: ({ request }, callback) => {
    if (request?.endsWith('.node')) {
      const filename = path.basename(request);
      return callback(undefined, `commonjs ../../${filename}`);
    }
    callback();
  },

  module: {
    rules: [
      // Extract all .global.css to style.css as is, pipe other styles through css modules and append to style.css
      {
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: /^((?!\.global).)*\.s?css$/,
                localIdentName: '[name]__[local]__[hash:base64:5]',
                exportLocalsConvention: 'camelCase'
              }
            }
          },
          'sass-loader'
        ]
      }
    ]
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: 'style.css'
    }),

    new BundleAnalyzerPlugin({
      analyzerMode: process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true'
    }),

    new ForkTsCheckerWebpackPlugin(),

    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'app/app.html')
    })
  ],

  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false
  }
};

export default merge(baseConfig, rendererProdConfig);
