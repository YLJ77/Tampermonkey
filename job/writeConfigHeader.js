const fs = require('fs');
const path = require('path');

fs.readFile(path.join(__dirname, './dist/main.user.js'), (err, data) => {
    let sourceCode = `// ==UserScript==
// @name        lg_jog_list - lagou.com
// @namespace   Violentmonkey Scripts
// @match       https://www.lagou.com/jobs/list*
// @match       https://www.zhipin.com/c101280100/*
// @grant       none
// @version     1.0
// @author      -
// @description 2020/8/24 下午3:23:04
// ==/UserScript==\n`;
        sourceCode += data.toString()
    fs.writeFile(path.join(__dirname, './dist/main.user.js'), sourceCode, { flag: 'w' }, err => {
        console.log(err || '头部配置写入成功！');
    });
});
