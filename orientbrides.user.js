// ==UserScript==
// @name         orientbrides
// @namespace    agency
// @version      0.1
// @description  collect id
// @author       ljyang
// @include      *type=newLetter
// @include      *baidu.com*
// @include      *damai.cn*
// @grant        null
// ==/UserScript==

function CollectId() {
  this.initData();
  this.renderBase();
  localStorage.pendingAmount = 0;
  
  if(localStorage.awaitPendingTimeout === 'true') {
    localStorage.awaitPendingTimeout = 'false';
    this.findEle('#setting').then($ele=>{
      $ele.get(0).click();
    });
  }
}

CollectId.prototype = {
  ladyId: 1187357,
  requestTimeSpan: 100,
  notifyTimeSpan: 2000,
  maxId: 33914386,
  curId: 11111111,
  pendingLimit: 20,
  awaitPendingTimeoutM: 2,
  cantWriteFlag: 'Sorry, you can’t write letter to this man. Use presentations instead.',
  clock: null,
  awaitPendingTimeoutLimit() {
    let awaitPendingTimeoutM = this.awaitPendingTimeoutM;
    let times = 1000/ this.requestTimeSpan;
    return awaitPendingTimeoutM * 60 * times;
  },
  findEle(selector) {
    return new Promise((resolve, reject)=>{
      let eleClock = setInterval(()=>{
        let $ele = $(selector);
        if ($ele.length) {
          clearInterval(eleClock);
          resolve($ele);
        }
      }, 100);
    });
  },
  renderBase() {
    var $bar = $("<button class='btn btn-default' type='button' id='setting'>开始</button>")
    .css({
      position: 'fixed',
      top: '70px',
      left: '20px',
      'z-index': 999,
      width: '50px',
      height: '30px'
    })
    .on('click',this.controller.bind(this));

    $('body').prepend($bar);
  },
  controller(e) {
    var $ele = $(e.target);
    if($ele.text() === '开始') {
      $ele.text('暂停');
      this.mutilThreadCollect();
    } else {
      $ele.text('开始');
      clearInterval(this.clock);
    }
  },
  getUrl(curId) {
    return `./ViewLadyCorrespondence.aspx?ladyID=${this.ladyId}&manID=${curId}&type=newLetter`;
  },
  increaseId(id) {
    return ++id;
  },
  getCurId() {
    return +localStorage.curId;
  },
  saveCurId(id) {
    localStorage.curId = id;
  },
  saveIdArray(idJSON) {
    localStorage.idArray = idJSON;
  },
  initData() {
    if(localStorage.idArray === undefined) {
      localStorage.idArray = '[]';
      localStorage.curId = this.curId;
    }
  },
  doCollect(id) {
    let url = this.getUrl(id);
    $.ajax({url:url}).done((data=>{
      let idArray,curId,nextId,idJSON;
      let cantWriteFlag = this.cantWriteFlag;
      let index = data.indexOf(cantWriteFlag);
      let pendingAmount = +localStorage.pendingAmount;
      localStorage.pendingAmount = --pendingAmount;
      localStorage.holdingPendingTimes = this.awaitPendingTimeoutLimit();
      console.info(`cantWriteFlag: ${index}`);
      if(typeof data === 'string' && index === -1) {
        idArray = JSON.parse(localStorage.idArray);
        idArray.push(id);
        localStorage.idArrayLength = idArray.length;
        idJSON = JSON.stringify(idArray);
        this.saveIdArray(idJSON);
        this.msg('Collect Id', `已存储 ${id}`);
        console.info(`已存储 ${id}`);
      } else {
        console.warn(`已跳过 ${id}`);
      }
    }).bind(this));
  },
  mutilThreadCollect() {
    let awaitPendingTimeoutLimit = this.awaitPendingTimeoutLimit();
    localStorage.holdingPendingTimes = awaitPendingTimeoutLimit;
    this.clock = setInterval(()=>{
      let pendingAmount = +localStorage.pendingAmount;
      let holdingPendingTimes;
      curId = this.getCurId();
      if (pendingAmount <= this.pendingLimit) {
        localStorage.pendingAmount = ++pendingAmount;
      } else {
        console.log(`xhrPendingAmount: ${pendingAmount}`);
        holdingPendingTimes = +localStorage.holdingPendingTimes;
        holdingPendingTimes -= 1;
        localStorage.holdingPendingTimes = holdingPendingTimes;
        if (awaitPendingTimeoutLimit - holdingPendingTimes === 0) {
          localStorage.awaitPendingTimeout = 'true';
          window.location.reload(true);
        }
        return;
      }
      if (curId > this.maxId) {
        clearInterval(this.clock);
        $('#setting').text('开始');
        alert('已收集完成');
        return;
      }
      console.log(`已开始 ${curId}`);
      this.doCollect(curId);
      nextId = this.increaseId(curId);
      this.saveCurId(nextId);
      
    }, this.requestTimeSpan);
  },
  msg(title,content,iconUrl='https://raw.githubusercontent.com/YLJ77/Tampermonkey/master/img/icon128.png') {
    let _this = this;
    if (window.Notification){
        if (Notification.permission === 'granted') {
          let notification;
					notification = new Notification(title,{body:content,icon:iconUrl});
        } else {
            Notification.requestPermission(function(result) {
              let notification;
                if (result === 'denied' || result === 'default') {
                    alert('通知权限被拒绝！');
                } else {
									  notification = new Notification(title,{body:content,icon:iconUrl});
								}
						});
        };
    } else {
      alert('你的浏览器不支持Notification，快去升级chrome吧！');
    }
  }
}

new CollectId();
