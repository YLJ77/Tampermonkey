// ==UserScript==
// @name        New script - lagou.com
// @namespace   Violentmonkey Scripts
// @match       https://www.lagou.com/jobs/*.html
// @grant       none
// @version     1.0
// @author      -
// @description 2020/8/24 下午3:23:04
// ==/UserScript==

const $jobAdvantage = $('job-advantage');
const $jobDetail = $('.job-detail');

const danger = 'color:red;font-weight:bold;';
const success = 'color:green;font-weight:bold;';

[$jobAdvantage,$jobDetail].forEach(ele => {
    ele.html($jobDetail.html()
        .replace('本科', `<span style=${danger}>本科</span>`)
        .replace('大专', `<span style=${success}>大专</span>`)
        .replace('双休', `<span style=${success}>双休</span>`))
})
