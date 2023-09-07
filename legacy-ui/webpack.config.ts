import path from 'path';
import {Configuration, DefinePlugin, IgnorePlugin} from 'webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const config: Configuration = {
  node: {
    fs: 'empty',
    net: 'empty'
  },

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
      template: 'src/index.html',
      favicon: 'src/assets/favicon.png'
    }),
    new IgnorePlugin(/\/iconv-loader$/),
    new DefinePlugin({
      'process.env': JSON.stringify({
        NODE_ENV: process.env.NODE_ENV,

        OLD_GNT_TOKEN_CONTRACT_ADDRESS_RINKEBY: process.env.OLD_GNT_TOKEN_CONTRACT_ADDRESS_RINKEBY,
        NEW_GNT_TOKEN_CONTRACT_ADDRESS_RINKEBY: process.env.NEW_GNT_TOKEN_CONTRACT_ADDRESS_RINKEBY,
        BATCHING_GNT_TOKEN_CONTRACT_ADDRESS_RINKEBY: process.env.BATCHING_GNT_TOKEN_CONTRACT_ADDRESS_RINKEBY,
        GNT_DEPOSIT_CONTRACT_ADDRESS_RINKEBY: process.env.GNT_DEPOSIT_CONTRACT_ADDRESS_RINKEBY,
        MIGRATION_AGENT_CONTRACT_ADDRESS_RINKEBY: process.env.MIGRATION_AGENT_CONTRACT_ADDRESS_RINKEBY,

        OLD_GNT_TOKEN_CONTRACT_ADDRESS_LOCAL: process.env.OLD_GNT_TOKEN_CONTRACT_ADDRESS_LOCAL,
        NEW_GNT_TOKEN_CONTRACT_ADDRESS_LOCAL: process.env.NEW_GNT_TOKEN_CONTRACT_ADDRESS_LOCAL,
        BATCHING_GNT_TOKEN_CONTRACT_ADDRESS_LOCAL: process.env.BATCHING_GNT_TOKEN_CONTRACT_ADDRESS_LOCAL,
        DEPOSIT_GNT_TOKEN_CONTRACT_ADDRESS_LOCAL: process.env.DEPOSIT_GNT_TOKEN_CONTRACT_ADDRESS_LOCAL,
        MIGRATION_AGENT_CONTRACT_ADDRESS_LOCAL: process.env.MIGRATION_AGENT_CONTRACT_ADDRESS_LOCAL,

        OLD_GNT_TOKEN_CONTRACT_ADDRESS_MAINNET: process.env.OLD_GNT_TOKEN_CONTRACT_ADDRESS_MAINNET,
        NEW_GNT_TOKEN_CONTRACT_ADDRESS_MAINNET: process.env.NEW_GNT_TOKEN_CONTRACT_ADDRESS_MAINNET,
        BATCHING_GNT_TOKEN_CONTRACT_ADDRESS_MAINNET: process.env.BATCHING_GNT_TOKEN_CONTRACT_ADDRESS_MAINNET,
        GNT_DEPOSIT_CONTRACT_ADDRESS_MAINNET: process.env.GNT_DEPOSIT_CONTRACT_ADDRESS_MAINNET,
        MIGRATION_AGENT_CONTRACT_ADDRESS_MAINNET: process.env.MIGRATION_AGENT_CONTRACT_ADDRESS_MAINNET,

        GAS_LIMIT: process.env.GAS_LIMIT,
        DEFAULT_CONFIRMATION_HEIGHT: process.env.DEFAULT_CONFIRMATION_HEIGHT
      })
    })
  ],

  devtool: 'source-map',

  devServer: {
    stats: 'errors-warnings',
    historyApiFallback: true
  },

  performance: {
    maxEntrypointSize: 1200000,
    maxAssetSize: 1200000
  }
};

export default config;
