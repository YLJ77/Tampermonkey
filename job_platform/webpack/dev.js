const webpack = require('webpack');
const { merge } = require('webpack-merge');
const base = require('./base')

const dev = {
    mode: 'development',
    devServer: {
        contentBase: './dist',
        hot: true,
    },
    plugins: [
        new webpack.BannerPlugin({
            banner: () => `// ==UserScript==
  // @name        jog_list - lagou.com
  // @namespace   Violentmonkey Scripts
  // @match       https://www.lagou.com/jobs/list*
  // @match       https://www.zhipin.com/c101280100/*
  // @grant       none
  // @version     1.0
  // @author      -
  // @description 2020/8/24 下午3:23:04
  // ==/UserScript==\n`,
            entryOnly: true,
            raw: true
        })
    ]
};

module.exports = merge(base,dev);