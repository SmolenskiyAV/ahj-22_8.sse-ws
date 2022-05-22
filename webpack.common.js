const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: './',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader, 'css-loader',
        ],
      },
      /** Картинки */
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      /** Шрифты */
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      /** Файлы CSV */
      {
        test: /\.(csv|tsv)$/i,
        use: ['csv-loader'],
        // npm i csv-loader -D
      },
      /** Файлы XML */
      {
        test: /\.xml$/i,
        use: ['xml-loader'],
        // npm i xml-loader -D 
      },
      /** Файлы TXT */
      {
        test: /\.txt$/i,
        use: ['txt-loader'],
        // npm i txt-loader -D
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './src/index.html',
      filename: './index.html',
    }),
    new CopyWebpackPlugin(
      {
        patterns: [
          { 
            from: 'src/*.txt', to: 'licenses.txt' 
          }
        ],      
      }
    ),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ],
};
