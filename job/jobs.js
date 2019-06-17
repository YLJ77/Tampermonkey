// ==UserScript==
// @name find jobs
// @namespace Violentmonkey Scripts
// @include *www.lagou.com/jobs/list*
// @grant none
// ==/UserScript==

let maxPage = 20;
async function fetchData({url, formDataList, method}) {
    let body = formDataList.map(data => `${data.name}=${data.value}`).join('&');
    let res =  await fetch(url,{
        method,
        headers:{
            'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
            //'Accept': 'application/json, text/javascript, */*; q=0.01',
            //'Accept-Encoding': 'gzip, deflate, br',
            //'X-Anit-Forge-Code': 0,
            //'X-Anit-Forge-Token': 'None',
            //'X-Requested-With': 'XMLHttpRequest'
        },
        body
    });
    let { msg, content } = await res.json();
    if (msg) {
        alert(msg);
        return { msg };
    }
    let { positionResult: { result } } = content;
    let okState = ['disabled', 'today'];
    let filtered = result.filter(job => {
        let { imState, salary, formatCreateTime, workYear } = job;
        let salaryArr = salary.split('-');
        let min = parseInt(salaryArr[0]);
        let max = parseInt(salaryArr[1]);
        console.log(job.imState);
        return okState.includes(imState) && /\d{2}:\d{2}/g.test(formatCreateTime) && min >= 10 && max >= 15 && /[1-3]+-[1-5]+/.test(workYear);
    });
    return {
        data: filtered,
        outdated: result.some(job => !okState.includes(job.imState) && !/\d{2}:\d{2}/g.test(job.formatCreateTime)),
    };
}

async function openPage() {
    let ids = JSON.parse(localStorage.jobs);
    let begin = localStorage.begin || 0;
    let end = localStorage.end || (ids.length < maxPage ? ids.length : maxPage);
    begin = +begin;
    end = +end;
    for (let i=begin; i<end; i++) {
      await new Promise(resolve => {
        setTimeout(() => {
            window.open(`https://www.lagou.com/jobs/${ids[i]}.html`);
            resolve(i);
        }, 500);
      });
      console.log(i);
      
    }
    begin += maxPage;
    end += maxPage;
    if (end > ids.length) end = ids.length;
    localStorage.begin = begin;
    localStorage.end = end;
    if (begin >= end) alert('已打开所有页面！');
}

async function getJobs({ jobs = [], page = 1, idMapJob = {}, isRecursive = true } = {}) {
    let url = 'https://www.lagou.com/jobs/positionAjax.json?px=new&city=广州&needAddtionalResult=false';
    let formDataList = [{name: 'first', value: true}, {name: 'pn', value: page}, {name: 'kd', value: '前端'}];
    let method = 'POST';
    let { data, outdated, msg } = await fetchData({ url, formDataList, method });
    if (msg) return;
    data.forEach(job => {
        if (!idMapJob[job.positionId]) {
            jobs.push(job.positionId);
            idMapJob[job.positionId] = 1;
        }
    });
    console.warn(page);
    if (!outdated) {
        await getJobs({ jobs, page: page + 1 });
    }
     if (!isRecursive) {
        localStorage.jobs = JSON.stringify(jobs);
    }
    return jobs;
}

function createBtn() {
  let range = document.createRange();
  let parse = range.createContextualFragment.bind(range);
  let $body = document.getElementsByTagName('body')[0];

  let $btn = parse(`<button id='open-page' style="position: absolute;top: 100px; right: 50px;padding: 10px;">打开页面</button>`);
  
  $body.append($btn);
	let button = document.getElementById('open-page');
	button.onclick=openPage;
}

function init() {
  localStorage.begin = 0;
  localStorage.end = maxPage;
}

init();
//getJobs({isRecursive: false});
createBtn();
