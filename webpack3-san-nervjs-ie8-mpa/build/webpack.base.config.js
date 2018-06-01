/**
 * webpack 基础配置
 * @type {[type]}
 */
// 引入配置
const config = require("./config");
const utils = require("./utils");

const fs = require('fs');
const path = require("path");
const webpack = require('webpack');
const glob = require("glob")

// 引入插件
const HTMLWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
// 清理 dist 文件夹
const CleanWebpackPlugin = require("clean-webpack-plugin")
// 抽取 css
const ExtractTextPlugin = require("extract-text-webpack-plugin");

// 通过 html-webpack-plugin 生成的 HTML 集合
var HTMLPlugins = [];

// 入口文件集合
var Entries = {}


// 生成多页面的集合
var viewsDirectory = ''
if (process.env.NODE_ENV == 'production') {
  viewsDirectory = config.build.assetsHtmlPath
  // console.log(viewsDirectory)
}

let hasPushInline = false
utils.getEntryDir()
  .forEach((page) => {
    // console.log(JSON.stringify(page) + '/n')

    let moduleName = page.dir.split('/')
    let pathArr = page.tmpl.split('/')

    let fileName = pathArr[pathArr.length - 1].split('.')[0]
    let moduleNameStr = moduleName[moduleName.length - 1]

    // console.log(fileName)
    // console.log(moduleNameStr)

    const htmlPlugin = new HTMLWebpackPlugin({
      filename: viewsDirectory + `${moduleNameStr}/${fileName}.html`,
      // filename: `${page.dir}${moduleNameStr}.html`,
      template: path.resolve(__dirname, `../${page.tmpl}`),
      inlineSource: '.(js|css)$', // embed all javascript and css inline

      // @FIXME 需要考虑具体引入模块
      // chunks: ['commons', moduleNameStr, 'vendors', 'manifest'],
      chunks: ['commons', page.tmpl],
    });

    // console.log('htmlPlugin -> ' + JSON.stringify(htmlPlugin))

    HTMLPlugins.push(htmlPlugin);

    // if (!hasPushInline) {
    //   HTMLPlugins.push(new HtmlWebpackInlineSourcePlugin());
    //   hasPushInline = true;
    // }

    let pathJSFile = path.resolve(__dirname, `../src/${page.dir}/${fileName}.js`);

    // 注意 判断文件是否存在需要时间 要同步
    if (!fs.existsSync(pathJSFile)) {
      pathJSFile = path.resolve(__dirname, '../static/templates.js')
    }

    Entries[page.tmpl] = pathJSFile;
  })


// 第三方类库
let vendorsDir = utils.getVendors()
if (vendorsDir.length > 0) {
  Entries['vendors'] = vendorsDir
}
// console.log('入口 -> ' + JSON.stringify(Entries))
console.log('HTML -> ' + JSON.stringify(...HTMLPlugins))

let webpackconfig = {
  entry: Entries,
  devtool: "cheap-module-source-map",
  output: {
    filename: "static/js/[name].bundle.[hash].js",
    path: path.resolve(__dirname, config.common.devServerOutputPath),

    // 公共路径调整
    // publicPath: (process.env.NODE_ENV === 'dev') ? path.resolve(__dirname, '/static') : '/'
  },
  // 加载器
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          publicPath: config.common.cssPublicPath,
          use: [{
            loader: "css-loader",
            options: {
              // 设置css模块化 名字随机处理
              // CSS模块化 https://www.jianshu.com/p/a5f3b41d5d44
              // @FIXME CSS编译 但是视图没有对应 
              // Nerv.js已经处理, 希望但还是改成.Vue模式  
              modules: true,
              localIdentName: '[local]__[name]--[hash:base64:5]',
              // 开启 css 压缩
              minimize: true
            }
          }, {
            loader: "postcss-loader"
          }]
        })
      },
      {
        test: /\.styl(us)?$/,
        use: ['style-loader', 'css-loader', 'stylus-loader', {
          loader: "postcss-loader",
          options: {
            plugins: function () {
              return [require('autoprefixer')];
            }
          }
        }]
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader',
          {
            loader: 'postcss-loader',
            options: {
              importLoaders: 1,
              plugins: function () {
                return [require('autoprefixer')];
              }
            }
          }]
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader', {
          loader: 'postcss-loader',
          options: {
            importLoaders: 1,
            plugins: function () {
              return [require('autoprefixer')];
            }
          }
        }]
      },
      {
        test: /\.(jade|pug)$/,
        loader: ['html-loader', 'pug-html-loader']
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          // options: {
          //     presets: ['es2015']
          // }
        }
      },
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      // {
      //     test: /\.jsx?$/,
      //     exclude: /node_modules/,
      //     loader: 'babel-loader'
      // },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: {
          loader: "url-loader",
          options: {
            // 打包生成图片的名字
            name: "[name].[ext]",
            // 图片的生成路径
            outputPath: config.common.imgOutputPath
          }
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: ["file-loader"]
      },
      {
        test: /\.(htm|html)$/i,
        use: [
          {
            loader: 'html-withimg-loader'
          },
          {
            loader: 'html-loader',
            options: {
              // 压缩
              minimize: true
            }
          }]
      }],
  },
  // devtool: 'eval',
  devtool: 'source-map',
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'commons',
      filename: 'commons.bundle.js'
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
    }),
    // 自动清理 dist 文件夹
    new CleanWebpackPlugin([config.common.devServerOutputPath]),

    // 将 css 抽取到某个文件夹
    new ExtractTextPlugin({
      //生成css文件名
      filename: 'static/css/[name].[contenthash].css',
      disable: false,
      allChunks: true
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.HashedModuleIdsPlugin(),


    // 自动生成 HTML 插件
    ...HTMLPlugins,
    // new HtmlWebpackInlineSourcePlugin(),

    // @TODO 内联脚本等的处理


    // 提供jquery会被打包进去
    new webpack.ProvidePlugin({
      san: "san",
      nerv: "nervjs"
    })
  ],

  // 全局引用jquery
  externals: {
    jquery: 'window.$',
    $: 'window.$',
    seajs: 'window.seajs',
    requirejs: 'window.requirejs'
  },

  resolve: {
    extensions: ['.js', '.css', '.styl', '.less', 'scss', '.ts'],
    alias: {
      'react': 'nervjs',
      'react-dom': 'nervjs',
      'create-react-class': "nerv-create-class",
            

      "@": path.join(__dirname, "../src"),
      // "src": path.join(__dirname, "../src"),
      "static": path.join(__dirname, "../static"),
      "assets": path.join(__dirname, "../src/assets"),

      // 组件
      "~": path.join(__dirname, "../src/components"),
      "@components": path.join(__dirname, "../src/components"),

      // 视图
      // "@tools": path.join(__dirname, "../src/tools"),
      "@theme": path.join(__dirname, "../src/assets/less/theme"),
    }
  }
}
module.exports = webpackconfig