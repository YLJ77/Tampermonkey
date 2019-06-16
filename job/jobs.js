// ==UserScript==
// @name find jobs
// @namespace Violentmonkey Scripts
// @match https://www.lagou.com/
// @grant none
// ==/UserScript==

async function fetchData({url, formDataList, method}) {
    let body = formDataList.map(data => `${data.name}=${data.value}`).join('&');
    let res =  await fetch(url,{
        method,
        headers:{
            'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Accept-Encoding': 'gzip, deflate, br',
            'X-Anit-Forge-Code': 0,
            'X-Anit-Forge-Token': 'None',
            'X-Requested-With': 'XMLHttpRequest'
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
        let { imState, salary, formatCreateTime } = job;
        let salaryArr = salary.split('-');
        let min = parseInt(salaryArr[0]);
        let max = parseInt(salaryArr[1]);
        console.log(job.imState);
        return okState.includes(imState) && /\d{2}:\d{2}/g.test(formatCreateTime) && min >= 10 && max >= 15;
    });
    return {
        data: filtered,
        outdated: result.some(job => !okState.includes(job.imState) && !/\d{2}:\d{2}/g.test(job.formatCreateTime)),
    };
}

function openPage(ids) {
    if (ids.length) {
        setTimeout(() => {
            window.open(`https://www.lagou.com/jobs/${ids[0]}.html`);
            ids.shift();
            if (ids.length) openPage(ids);
        }, 2000);
    }
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

    if (!outdated) {
        getJobs({ jobs, page: page + 1 });
    }
    if (!isRecursive) {
        localStorage.jobs = JSON.stringify(jobs);
        openPage(jobs);
    }
}

getJobs({isRecursive: false});




