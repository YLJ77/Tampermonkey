// ==UserScript==
// @name         orientbrides
// @namespace    agency
// @version      0.1
// @description  collect id
// @author       ljyang
// @include      *type=newLetter
// @grant        null
// ==/UserScript==

function CollectId() {
  this.initData();
  this.renderBase();
  
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
  pendingLimit: 30,
  awaitPendingTimeoutM: 2,
  cantWriteFlag: 'Sorry, you can’t write letter to this man. Use presentations instead.',
  noInfoFlag: 'Information about a man is not available',
  canWriteFlag: 'btnReply2',
  clock: null,
  awaitPendingTimeoutLimit() {
    let awaitPendingTimeoutM = this.awaitPendingTimeoutM;
    let times = 1000 / this.requestTimeSpan;
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
    localStorage.xhrFailTimes = 0;
    localStorage.pendingAmount = 0;
    if(localStorage.idArray === undefined) {
      localStorage.idArray = '[]';
      localStorage.curId = this.curId;
    }
  },
  doCollect(id) {
    let url = this.getUrl(id);
    $.ajax({url:url,type:'GET'}).done(((data,statusText)=>{
      console.log(statusText);
      let idArray,curId,nextId,idJSON,cantWriteIndex,canWriteIndex,noInfoIndex;
      let cantWriteFlag = this.cantWriteFlag;
      let pendingAmount = +localStorage.pendingAmount;
      localStorage.pendingAmount = --pendingAmount;
      localStorage.xhrFailTimes = 0;
      localStorage.holdingPendingTimes = this.awaitPendingTimeoutLimit();
      if (typeof data === 'string') {
        cantWriteIndex = data.indexOf(cantWriteFlag);
        canWriteIndex = data.indexOf(this.canWriteFlag);
        noInfoIndex = data.indexOf(this.noInfoFlag);
        console.info(`cantWriteFlag: ${cantWriteIndex}`);
        if(cantWriteIndex === -1 && canWriteIndex !== -1 && noInfoIndex === -1) {
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
      }
    }).bind(this))
    .fail((xhr)=>{
      console.log(xhr.statusText);
      let pendingAmount = +localStorage.pendingAmount;
      let xhrFailTimes = +localStorage.xhrFailTimes;
      localStorage.pendingAmount = --pendingAmount;
      xhrFailTimes += 1;
      localStorage.xhrFailTimes = xhrFailTimes;
      if (xhrFailTimes > 20) this.refresh();
      console.warn(`已跳过 ${id}`);
    });
  },
  refresh() {
    let refreshTimes = localStorage.refreshTimes === undefined ? 0 : +localStorage.refreshTimes;
    refreshTimes += 1;
    localStorage.refreshTimes = refreshTimes;
    localStorage.awaitPendingTimeout = 'true';
    clearInterval(this.clock);
    window.location.reload(true);
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
        if (holdingPendingTimes === 0) {
          this.refresh();
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
