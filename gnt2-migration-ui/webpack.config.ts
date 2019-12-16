import path from 'path';
import {Configuration, DefinePlugin, IgnorePlugin} from 'webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const config: Configuration = {
  entry: [
    'react-hot-loader/patch',
    './src/index.tsx'
  ],

  output: {
    filename: 'main.[hash].js',
    path: path.resolve('./dist')
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
    alias: {
      'react-dom': '@hot-loader/react-dom'
    },
    modules: [
      path.resolve('../node_modules'),
      path.resolve('./node_modules'),
      path.resolve('.'),
    ],
  },

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          }
        }
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack', 'url-loader'],
        exclude: /@universal-login\/react/,
      },
      {
        test: /\.svg$/,
        use: 'file-loader',
        include: /@universal-login\/react/,
      },
      {
        test: /\.(png|jpg|gif|ttf|woff|woff2|eot)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[hash].[ext]'
            },
          },
        ],
      },
      {
        test: /\.(s[ac]|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },

  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].[hash].css',
      chunkFilename: '[id].[hash].css',
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),
    new IgnorePlugin(/\/iconv-loader$/),
    new DefinePlugin({
      'process.env': JSON.stringify({
        NODE_ENV: process.env.NODE_ENV,
      })
    })
  ],

  devtool: 'source-map',

  devServer: {
    stats: 'errors-warnings',
    historyApiFallback: true
  }
};

export default config;
