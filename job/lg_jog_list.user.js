// ==UserScript==
// @name        lg_jog_list - lagou.com
// @namespace   Violentmonkey Scripts
// @match       https://www.lagou.com/jobs/list*
// @grant       none
// @version     1.0
// @author      -
// @description 2020/8/24 下午3:23:04
// ==/UserScript==

class Storage {
    constructor(key) {
        this.init(key);
    }
    init(key) {
        const item = this.getItem(key);
        if (!item)  this.setItem(key, []);
    }
    getItem(key) {
        return localStorage.getItem(key) ?
            JSON.parse(localStorage.getItem(key))
            :
            undefined;
    }
    setItem(key, val) {
        localStorage.setItem(key, JSON.stringify(val));
    }
}

class BlackList extends Storage {
    blackList = [];
    constructor() {
        super('blackList');
    }
    updateList(list) {
        this.setItem('blackList', list);
        this.blackList = list;
    }
    addItem(val) {
        const list = this.getItem('blackList');
        if (!list.includes(val)) list.push(val);
        this.updateList(list);
    }
    removeItem(val) {
        const list = this.getItem('blackList').filter(item => item !== val);
        this.updateList(list);
    }
}

const blackList = new BlackList();

function waitToLoad(fn, interVal = 50 ) {
    const maxTime = 3000;
    let timer = 0;
    return new Promise(resolve => {
        const clockId = setInterval(() => {
            timer += interVal;
            const val = fn();
            if (val) {
                clearInterval(clockId);
                resolve(val);
            } else if (timer >= maxTime) {
                console.error(`wait to load: ${fn.toString()} 超时!`);
                clearInterval(clockId);
                resolve(null);
            }
        }, interVal);
    });
}

class Actions {
    constructor() {
        this.appendActions();
    }
    async appendActions() {
        await waitToLoad(() => $('.item_con_list li .company_name a').length);
        const $companyList = $('.item_con_list li');
        const btnStyle = 'color:red;border:1px solid #ccc;padding: 5px 10px;';
        function addBtns() {
            $companyList.each(function(){
                const companyName = $(this).find('.company_name a').text().trim();
                const target = $(this).find('.li_b_r');
                const $blackBtn = $(`<button class="black" style="${btnStyle}">加入黑名单</button>`).click(() => {
                    blackList.addItem(companyName);
                    $(this).css({display: 'none'});
                    target.find('button').css({display: 'none'});
                    target.find('button.white').css({display: 'inline'});
                })
                const $whiteBtn = $(`<button class="white" style="${btnStyle}">加入白名单</button>`).click(() => {
                    blackList.removeItem(companyName);
                    target.find('button').css({display: 'none'});
                    target.find('button.black').css({display: 'inline'});
                })
                const bList = blackList.getItem('blackList');
                target.find('button').css({display: 'none'});
                if (bList.includes(companyName)) {
                    $blackBtn.css({display: 'none'});
                    $(this).css({display: 'none'});
                } else {
                    $whiteBtn.css({display: 'none'});
                }
                target.prepend($blackBtn, $whiteBtn);
            })
        }
        const $showAllBtn = $(`<button style="${btnStyle}">显示所有</button>`).click(() => {
            $companyList.each(function() {
                $(this).css({display: 'block'});
            });
        })
        const wrapper = $('#s_position_list');
        wrapper.prepend($showAllBtn);
        addBtns();
    }
}


new Actions();
