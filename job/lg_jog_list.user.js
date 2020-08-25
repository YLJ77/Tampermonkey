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
    clickedIdx = 0;
    btnStyle = 'color:red;border:1px solid #ccc;padding: 5px 10px;';
    companyName = '';
    constructor() {
        this.appendActions();
    }
    resetControl() {
        $('#off-btn').css({display: 'none'});
        $('#on-btn').css({display: 'inline'});
        localStorage.setItem('isOn', 0);
    }
    run() {
        this.clockId = setInterval(async() => {
            const time = this.$companyList.find('.format-time').eq(this.clickedIdx).text().trim();
            if (time !== '1天前发布') {
                if (this.clickedIdx <= this.$companyList.length - 1) {
                    const companyName = this.$companyList.find('.company_name a').eq(this.clickedIdx).text().trim();
                    if (!blackList.getItem('blackList').includes(companyName)) {
                        this.$companyList.find('.position_link').get(this.clickedIdx).click();
                    }
                    this.clickedIdx += 1;
                } else {
                    clearInterval(this.clockId);
                    this.clickedIdx = 0;
                    const continueRun = window.confirm('继续下一页？');
                    if(continueRun) {
                        await this.toNextPage();
                        this.run();
                    } else {
                        this.resetControl();
                    }
                }
            } else {
                clearInterval(this.clockId);
                this.resetControl();
            }
        }, 1000);
    }
    isLoaded() {
        const companyName = $('.item_con_list li').eq(0).find('.company_name a').text().trim();
        return companyName !== this.companyName;
    }
    add_B_W_btns() {
        const $companyList = this.$companyList = $('.item_con_list li');
        const {btnStyle} = this;
        const _this = this;
        $companyList.each(function(index){
            const companyName = $(this).find('.company_name a').text().trim();
            if (index === 0) _this.companyName = companyName;
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
    async appendActions() {
        await waitToLoad(() => $('.item_con_list li .company_name a').length);
        const $companyList = $('.item_con_list li');
        const {btnStyle} = this;
        const $showAllBtn = $(`<button style="${btnStyle}">显示所有</button>`).click(() => {
            $companyList.each(function() {
                $(this).css({display: 'block'});
            });
        })
        const _this = this;
        const $onBtn = $(`<button id="on-btn" style="${btnStyle}">启动筛选</button>`).click( function() {
            localStorage.setItem('isOn', 1);
            $('#off-btn').css({display: 'inline'});
            $(this).css({display: 'none'});
            _this.run();
        })
        const $offBtn = $(`<button id="off-btn" style="${btnStyle}display:none;">暂停筛选</button>`).click( function() {
            clearInterval(_this.clockId);
            localStorage.setItem('isOn', 0);
            $('#on-btn').css({display: 'inline'});
            $(this).css({display: 'none'});
        })
        const wrapper = $('#s_position_list');
        wrapper.prepend($showAllBtn, $onBtn, $offBtn);
        this.add_B_W_btns();
        this.bindChangePageEvt();
    }
    bindChangePageEvt() {
        const {btnStyle} = this;
        $('.s_position_list ').append(
            $(`<button id="my-next-page" style="${btnStyle}">自定义下一页</button>`).click(async() => {
                $('.pager_next').get(0).click();
            })
        )
    }
    async toNextPage() {
        $('#my-next-page').get(0).click();
        await waitToLoad(() => this.isLoaded());
        this.add_B_W_btns();
        return new Promise(resolve => resolve())
    }
}


new Actions();
