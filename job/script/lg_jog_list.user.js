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
        this.selector = this.getSelectorInfo();
        this.appendActions();
        this.appendMountEle();
    }
    appendMountEle() {
        $('body').prepend('<div id="app"></div>')
    }
    getPlateform() {
        const href = window.location.href;
        let pageType;
        if (href.includes('lagou')) {
            pageType = 'lagou';
        } else if (href.includes('zhipin')) {
            pageType = 'zhipin';
        }
        return pageType;
    }
    getSelectorInfo() {
        const map = {
            lagou: {
                pageType: 'lagou',
                companyList: '.item_con_list li',
                companyName: '.company_name a',
                btnWrapper: '.li_b_r',
                jobListWrapper: '#s_position_list',
                pageWrapper: '#s_position_list',
                nextPage: '.pager_next',
                releaseTime: '.format-time',
                timeLimit: '1天前发布'
            },
            zhipin: {
                pageType: 'zhipin',
                companyList: '.job-list li',
                companyName: 'h3.name a',
                btnWrapper: '.info-primary',
                jobListWrapper: '#main',
                pageWrapper: '.page',
                nextPage: 'a.next',
                releaseTime: '.job-pub-time',
                // timeLimit: '发布于昨天'
                timeLimit: '发布于08-30'
            }
        }
        return map[this.getPlateform()];
    }
    resetControl() {
        $('#off-btn').css({display: 'none'});
        $('#on-btn').css({display: 'inline'});
        localStorage.setItem('isOn', 0);
    }
    run() {
        const {selector} = this;
        this.clockId = setInterval(async() => {
            const time = this.$companyList.find(selector.releaseTime).eq(this.clickedIdx).text().trim();
            if (time !== selector.timeLimit) {
                if (this.clickedIdx <= this.$companyList.length - 1) {
                    const companyName = this.$companyList.find(selector.companyName).eq(this.clickedIdx).text().trim();
                    if (blackList.getItem('blackList').includes(companyName)) {
                        this.clickedIdx += 1;
                        clearInterval(this.clockId);
                        this.run();
                    } else {
                        if (selector.pageType === 'lagou') {
                            this.$companyList.find('.position_link').get(this.clickedIdx).click();
                        } else if (selector.pageType === 'zhipin') {
                            this.$companyList.get(this.clickedIdx).click();
                        }
                        this.clickedIdx += 1;
                    }
                } else {
                    clearInterval(this.clockId);
                    this.clickedIdx = 0;
                    await this.toNextPage();
                    const continueRun = window.confirm('继续筛选？');
                    console.log(continueRun);
                    if(continueRun) {
                        this.run();
                    } else {
                        this.resetControl();
                    }
                }
            } else {
                clearInterval(this.clockId);
                this.clickedIdx = 0;
                this.resetControl();
                window.alert('筛选完成！');
            }
        }, 1000);
    }
    isLoaded() {
        const {selector} = this;
        const companyName = $(selector.companyList).eq(0).find(selector.companyName).text().trim();
        return companyName !== this.companyName;
    }
    add_B_W_btns() {
        const {btnStyle,selector} = this;
        const $companyList = this.$companyList = $(selector.companyList);
        const _this = this;
        $companyList.each(function(index){
            const companyName = $(this).find(selector.companyName).text().trim();
            if (index === 0) _this.companyName = companyName;
            const btnWrapper = $(this).find(selector.btnWrapper);
            const $blackBtn = $(`<button class="black" style="${btnStyle}">加入黑名单</button>`).click((e) => {
                e.stopPropagation();
                blackList.addItem(companyName);
                $(this).css({display: 'none'});
                btnWrapper.find('button').css({display: 'none'});
                btnWrapper.find('button.white').css({display: 'inline'});
            })
            const $whiteBtn = $(`<button class="white" style="${btnStyle}">加入白名单</button>`).click((e) => {
                e.stopPropagation();
                blackList.removeItem(companyName);
                btnWrapper.find('button').css({display: 'none'});
                btnWrapper.find('button.black').css({display: 'inline'});
            })
            const bList = blackList.getItem('blackList');
            btnWrapper.find('button').css({display: 'none'});
            if (bList.includes(companyName)) {
                $blackBtn.css({display: 'none'});
                $(this).css({display: 'none'});
            } else {
                $whiteBtn.css({display: 'none'});
            }
            btnWrapper.prepend($blackBtn, $whiteBtn);
        })
    }
    async appendActions() {
        const {btnStyle,selector} = this;
        await waitToLoad(() => $(`${selector.companyList} ${selector.companyName}`).length);
        const $companyList = $(selector.companyList);
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
        const jobListWrapper = $(selector.jobListWrapper);
        jobListWrapper.prepend($showAllBtn, $onBtn, $offBtn);
        this.add_B_W_btns();
        this.bindChangePageEvt();
    }
    bindChangePageEvt() {
        const {btnStyle,selector} = this;
        $(selector.pageWrapper).append(
            $(`<button id="my-next-page" style="${btnStyle}">自定义下一页</button>`).click(async() => {
                $(selector.nextPage).get(0).click();
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


window.location.href.includes('lagou') && new Actions();
