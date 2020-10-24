const webpack = require('webpack');
module.exports = {
    css: {
        extract: false,
    },
    configureWebpack: {
        devServer: {
            disableHostCheck: true,
            writeToDisk: true // https://webpack.js.org/configuration/dev-server/#devserverwritetodisk-
        },
        output: {
            filename: 'job_list.user.js',
        },
        optimization: {
            splitChunks: false
        },
    },
    productionSourceMap: false,
    publicPath: './',
    filenameHashing: false,
    chainWebpack: config => {
        config
            .plugin('banner')
            .use(webpack.BannerPlugin,[{
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
            }])
    }
}