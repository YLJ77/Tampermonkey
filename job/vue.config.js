const webpack = require('webpack');
const StringReplacePlugin = require("string-replace-webpack-plugin");
const path = require('path');

module.exports = {
    css: {
        extract: false,
    },
    configureWebpack: config => {
        const lessRule = config.module.rules.find(entry => entry.test.source === '\\.less$')
        // lessRule && (lessRule.exclude = [path.resolve(__dirname,'node_modules/ant-design-vue/es/style/core/base.less')]);
        if (lessRule) {
            // lessRule.enforce = 'pre';
            lessRule.oneOf.forEach(entry => {
                const {use} = entry;
                const lastUse = use[use.length - 1];
                lastUse.options.additionalData = (content, loaderContext) => {
                    // More information about available properties https://webpack.js.org/api/loaders/
                    const { resourcePath, rootContext } = loaderContext;
                    const relativePath = path.relative(rootContext, resourcePath);
    // console.log(`
    // '${relativePath}'`);
if (relativePath === 'node_modules\\ant-design-vue\\es\\style\\index.less') {
    console.log(relativePath);
    console.log(content);
}
                    // if (relativePath === 'styles/foo.less') {
                    //   return '@value: 100px;' + content;
                    // }
    
                    // return '@value: 200px;' + content;
                    return content;
                  }
            })
        }
        return {
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
        }
    },
    productionSourceMap: false,
    publicPath: './',
    filenameHashing: false,
    chainWebpack: config => {
        // config.module
        // .rule('null-loader')
        // .test(path.resolve(__dirname,'node_modules/ant-design-vue/es/style/core/base.less'))
        // .use('null-loader')
        // .loader('null-loader')
        // .end()

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