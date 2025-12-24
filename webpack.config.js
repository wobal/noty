/* global __dirname, require, module */
'use strict';

const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const libraryName = 'Noty';

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';
  const outputFile = isProd ? libraryName.toLowerCase() + '.min.js' : libraryName.toLowerCase() + '.js';

  return {
    entry: path.join(__dirname, '/src/index.js'),
    devtool: 'source-map',
    output: {
      path: path.join(__dirname, '/lib'),
      filename: outputFile,
      library: libraryName,
      libraryTarget: 'umd',
      umdNamedDefine: true,
      // Nécessaire pour la compatibilité UMD dans les environnements Node/Browser
      globalObject: "typeof self !== 'undefined' ? self : this"
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-env', { targets: "defaults" }]]
            }
          }
        },
        {
          test: /\.scss$/,
          use: [
            // Extrait le CSS dans un fichier séparé (noty.css)
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: { sourceMap: true }
            },
            {
              loader: 'postcss-loader',
              options: { sourceMap: true }
            },
            {
              loader: 'sass-loader',
              options: { 
                sourceMap: true,
                // Utilise automatiquement le package 'sass' (Dart Sass) défini dans le package.json
                implementation: require('sass')
              }
            }
          ]
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.scss']
    },
    optimization: {
      minimize: isProd,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              comments: false,
            },
          },
          extractComments: false,
        }),
      ],
    },
    plugins: [
      // Remplace l'ancien ExtractTextPlugin
      new MiniCssExtractPlugin({
        filename: 'noty.css'
      }),
      // Injecte la version du package.json dans le code
      new webpack.DefinePlugin({
        VERSION: JSON.stringify(require('./package.json').version)
      })
    ]
  };
};
