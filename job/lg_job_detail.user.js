// ==UserScript==
// @name        lg_jog_detail - lagou.com
// @namespace   Violentmonkey Scripts
// @match       https://www.lagou.com/jobs/*.html
// @grant       none
// @version     1.0
// @author      -
// @description 2020/8/24 下午3:23:04
// ==/UserScript==

const $jobDetail = $('.job-detail');

const commonStyle = 'font-weight:bold;font-size:18px;';
const danger = `color:red;${commonStyle}`;
const nice = `color:green;${commonStyle}`;
const typeMapStyle = { danger, nice };

const tags = [
    {type: 'danger',title: '本科'},
    {type: 'nice',title: '专科'},
    {type: 'nice',title: '双休'},
];
const html = tags.reduce((acc, tag) => {
    return acc.replace(tag.title,`<span style=${typeMapStyle[tag.type]}>${tag.title}</span>`);
}, $jobDetail.html());

$jobDetail.html(html);