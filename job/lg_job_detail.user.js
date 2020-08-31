// ==UserScript==
// @name        lg_jog_detail - lagou.com
// @namespace   Violentmonkey Scripts
// @match       https://www.lagou.com/jobs/*.html
// @match       https://www.zhipin.com/job_detail/*
// @grant       none
// @version     1.0
// @author      -
// @description 2020/8/24 下午3:23:04
// ==/UserScript==

let $jobDetail,$companyWrapper,companyName;
const href = window.location.href;
if (href.includes('zhipin')) {
    $jobDetail = $('.job-sec').eq(0);
    $companyWrapper = $('.company-info').eq(1);
    companyName = $companyWrapper.find('a').eq(1).text().trim();
    console.log(companyName);
} else if (href.includes('lagou')) {
    $jobDetail = $('#job_detail');
    $companyWrapper = $('.job_company dt');
    companyName = $('.job_company_content .fl-cn').text().trim();
}

const commonStyle = 'font-weight:bold;font-size:18px;';
const danger = `color:red;${commonStyle}`;
const nice = `color:green;${commonStyle}`;
const typeMapStyle = { danger, nice };

const tags = [
    {type: 'danger',title: '本科'},
    {type: 'danger',title: '偶尔加班'},
    {type: 'danger',title: '5年以上'},
    {type: 'danger',title: 'Egret'},
    {type: 'danger',title: 'ActionScript'},
    {type: 'danger',title: 'Unity3D'},
    {type: 'danger',title: '单休'},
    {type: 'danger',title: 'Java'},
    {type: 'nice',title: '法定假日'},
    {type: 'nice',title: '专科'},
    {type: 'nice',title: '大专'},
    {type: 'nice',title: '双休'},
    {type: 'nice',title: '休二'},
    {type: 'nice',title: '五天'},
    {type: 'nice',title: '不加班'},
    {type: 'nice',title: '朝九晚六'},
    {type: 'nice',title: '六险一金'},
];
const html = tags.reduce((acc, tag) => {
    return acc.replace(tag.title,`<span style=${typeMapStyle[tag.type]}>${tag.title}</span>`);
}, $jobDetail.html());

const btnStyle = 'color:red;border:1px solid #ccc;padding: 5px 10px;';

const $blackBtn = $(`<button class="black" style="${btnStyle}">加入黑名单</button>`).click(() => {
    const blackList = JSON.parse(localStorage.getItem('blackList') || '[]');
    if (!blackList.includes(companyName)) {
        blackList.push(companyName)
        localStorage.setItem('blackList',
            JSON.stringify(blackList)
        );
    }
    $companyWrapper.find('button.white').css({display: 'inline'});
    $companyWrapper.find('button.black').css({display: 'none'});
})
const $whiteBtn = $(`<button class="white" style="${btnStyle}">加入白名单</button>`).click(() => {
    const blackList = JSON.parse(localStorage.getItem('blackList') || '[]');
    localStorage.setItem('blackList',
        JSON.stringify(
            blackList.filter(item => item !== companyName)
        )
    )
    $companyWrapper.find('button.white').css({display: 'none'});
    $companyWrapper.find('button.black').css({display: 'inline'});
})
const blackList = JSON.parse(localStorage.getItem('blackList') || '[]');

$jobDetail.html(html);
$companyWrapper.prepend($('<p>').append($blackBtn,$whiteBtn));

if (blackList.includes(companyName)) {
    const isOn = localStorage.getItem('isOn');
    if (isOn === '1') {
        window.close();
    } else {
        $companyWrapper.find('button.white').css({display: 'inline'});
        $companyWrapper.find('button.black').css({display: 'none'});
    }
} else {
    $companyWrapper.find('button.white').css({display: 'none'});
    $companyWrapper.find('button.black').css({display: 'inline'});
}