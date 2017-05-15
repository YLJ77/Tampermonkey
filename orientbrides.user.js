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
    let selector = (localStorage.theTypeOfTaskBeingPerformed === 'collectId') ? 'collectId' : 'sendEmail';
    selector = `#${selector}`;
    this.findEle(selector).then($ele=>{
      $ele.get(0).click();
    });
  }
}

CollectId.prototype = {
  emailMaxId: 11400000,
  ladyId: 1187357,
  requestTimeSpan: 100,
  notifyTimeSpan: 2000,
  collectMaxId: 33914386,
  curId: 11111111,
  pendingLimit: 30,
  awaitPendingTimeoutM: 2,
  emailCurIdIndex: 0,
  ladyName: 'xiaojun',
  cantWriteFlag: 'Sorry, you can’t write letter to this man. Use presentations instead.',
  noInfoFlag: 'Information about a man is not available',
  nameFlag: '<td>Name:</td>',
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
    let $bar = $("<div><button class='btn btn-default' type='button' id='collectId'>开始收集id</button><button class='btn btn-default' type='button' id='sendEmail'>开始发信</button></div>")
    .css({
      position: 'fixed',
      top: '70px',
      left: '20px',
      'z-index': 999
    })
    .find('button')
    .css({
      width: '70px',
      height: '30px'
    })
    .end()
    .find('#collectId')
    .on('click',this.controlCollect.bind(this))
    .end()
    .find('#sendEmail')
    .on('click',this.controllEmail.bind(this))
    .end();

    $('body').prepend($bar);
  },
  controlCollect(e) {
    let $ele = $(e.target);
    $('#sendEmail').css('display', 'none');
    if ($ele.text() === '开始收集id') {
      localStorage.theTypeOfTaskBeingPerformed = 'collectId';
      $ele.text('暂停收集id');
      this.mutilThread(this.doCollect, 'collectId');
    } else if ($ele.text() === '暂停收集id') {
      $ele.text('开始收集id');
      clearInterval(this.clock);
    }
  },
  controllEmail(e) {
    let $ele = $(e.target);
    let idArray = localStorage.idArray;
    window.idArray = JSON.parse(idArray);
    $('#collectId').css('display', 'none');
    if ($ele.text() === '开始发信') {
      localStorage.theTypeOfTaskBeingPerformed = 'sendEmail';
      $ele.text('暂停发信');
      this.mutilThread(this.doEmail, 'sendEmail');
    } else if ($ele.text() === '暂停发信') {
      $ele.text('开始发信');
      clearInterval(this.clock);
    }
  },
  getUrl(curId) {
    return `./ViewLadyCorrespondence.aspx?ladyID=${this.ladyId}&manID=${curId}&type=newLetter`;
  },
  increaseId(id) {
    return ++id;
  },
  getCurId(type) {
    if (type === 'collectId') {
      return +localStorage['collectCurId'];
    } else if (type === 'sendEmail') {
      let emailCurIdIndex = (localStorage.emailCurIdIndex === undefined) ? 0 : +localStorage.emailCurIdIndex;
      return window.idArray[emailCurIdIndex];
    }
    
  },
  saveCurId(id) {
    localStorage.collectCurId = id;
  },
  saveIdArray(idJSON) {
    localStorage.idArray = idJSON;
  },
  initData() {
    localStorage.xhrFailTimes = 0;
    localStorage.pendingAmount = 0;
    localStorage.getNamePendingAmount = 0;
    localStorage.getNameXhrFailTimes = 0;
    localStorage.holdingPendingTimes = this.awaitPendingTimeoutLimit();
    localStorage.getNameHoldingPendingTimes = this.awaitPendingTimeoutLimit();
    if(localStorage.idArray === undefined) {
      localStorage.idArray = '[]';
      
      localStorage.collectCurId = this.collectCurId;
      localStorage.emailCurIdIndex = this.emailCurIdIndex;
      localStorage.letterCurIndex = 0;
      localStorage.letterArr = '[]';
    }
  },
  generateLetter(letter, manName, ladyName) {
    return `Dear ${manName}\r\n\r\n${letter}\r\n\r\n${ladyName}`;
  },
  getManName(id) {
    return new Promise((resolve, reject)=>{
      let url = this.getUrl(id);
      $.ajax({url:url,type:'GET'}).done(((data,statusText)=>{
        let startIndex = data.indexOf(this.nameFlag);
        startIndex += this.nameFlag.length;
        let endIndex = data.indexOf('</td>', startIndex);
        let name = data.substring(startIndex, endIndex).replace(/\s*<td>/, '').split(' ')[0];
        resolve(name);
      })).fail((xhr)=>{
        this.handleFail(xhr, 'getNameXhrFailTimes', this.pendingLimit, id, this.refresh);
        reject('fail');
      }).always(()=>{
        let getNamePendingAmount = +localStorage.getNamePendingAmount;
        localStorage.getNamePendingAmount = --getNamePendingAmount;
      });
    });
  },
  handleReachPendingLimit(field) {
    let pendingTimes = +localStorage[field];
    localStorage[field] = --pendingTimes;
    if (pendingTimes === 0) this.refresh();
  },
  mutilThread(fn, type) {
    this.clock = setInterval(()=>{
      let pendingAmount = +localStorage.pendingAmount;
      let holdingPendingTimes, maxId, curId, selector, btnText, completeText, nexId, letter, letterCurIndex, letterArr, getNamePendingAmount, emailCurIdIndex;
      if (type === 'sendEmail') {
        curId = this.getCurId('sendEmail');
        selector = '#sendEmail';
        btnText = '开始发信';
        completeText = '邮件已发完';
      } else if (type === 'collectId') {
        curId = this.getCurId('collectId');
        maxId = this.collectMaxId;
        selector = '#collectId';
        btnText = '开始收集id';
        completeText = '收集ID完成';
      }
      
      if (pendingAmount <= this.pendingLimit) {
        localStorage.pendingAmount = ++pendingAmount;
      } else {
        this.handleReachPendingLimit('holdingPendingTimes');
      }
      
      console.log(`已开始 ${curId}`);
      if (type === 'sendEmail') {
        getNamePendingAmount = +localStorage.getNamePendingAmount;
        letterCurIndex = +localStorage.letterCurIndex;
        letterArr = JSON.parse(localStorage.letterArr);
        letter = letterArr[letterCurIndex];
        if (getNamePendingAmount <= this.pendingLimit) {
          localStorage.getNamePendingAmount = ++getNamePendingAmount;
        } else {
          this.handleReachPendingLimit('getNameHoldingPendingTimes');
        }
        this.getManName(curId).then(manName=>{
          if (typeof manName !== 'string' || manName === 'fail') return;
          letter = this.generateLetter(letter, manName, this.ladyName);
          fn.bind(this, curId, letter)();
        });
        emailCurIdIndex = +localStorage.emailCurIdIndex;
        localStorage.emailCurIdIndex = ++emailCurIdIndex;
        if (emailCurIdIndex > window.idArray.length) {
          alert('邮件已发完毕');
          return;
        }
        
      } else if (type === 'collectId') {
        if (curId > maxId) {
          clearInterval(this.clock);
          $(selector).text(btnText);
          alert(completeText);
          return;
        }
        fn.bind(this, curId)();
        nexId = this.increaseId(curId);
        this.saveCurId(nexId);
      }
      
      
    }, this.requestTimeSpan);
  },
  doEmail(id,letter) {
    let url = this.getUrl(id);
    let ladyId = this.ladyId;
    $.ajax({
      url:url,
      type: 'POST',
      data: {
        ladyID:ladyId,
        manID:id,
        type:'newLetter',
        
      __VIEWSTATEFIELDCOUNT:2,                                                __VIEWSTATE:'/wEPDwULLTEwMjg2MDU0NzEPZBYCZg9kFgJmD2QWAmYPZBYCAgMPZBYIAgEPFgIeBFRleHQFF0FHRU5DWS5PUklFTlRCUklERVMuTkVUZAIGD2QWAgIBDxBkZBYBZmQCCA9kFgICAw9kFgQCCA8WBh4FdGl0bGVkHgRocmVmBSMvTWFpbC9OZXdMZXR0ZXIuYXNweD9sYWR5SUQ9MTE4NzM1Nx4HVmlzaWJsZWcWAmYPFgIeA2FsdGRkAg4PFgYfAQUESGVscB8CBREvSW5kZXgvSGVscDIuYXNweB8DZxYCZg8WAh8EBQRIZWxwZAIKD2QWAgIFD2QWAgIDD2QWAgIBDw8WBh4HUmF3R3VpZCgpWFN5c3RlbS5HdWlkLCBtc2NvcmxpYiwgVmVy',
      __VIEWSTATE1:'c2lvbj00LjAuMC4wLCBDdWx0dXJlPW5ldXRyYWwsIFB1YmxpY0tleVRva2VuPWI3N2E1YzU2MTkzNGUwODkkZjkzNGQxM2MtOGI0OC00OThiLWE0OWYtZDQwMjQyYTQ3NDMwHgZsYWR5SUQCnbxIHgVtYW5JRAKX49cPZGRkEklTWzFKRYK2lcH9LIbR45bp7Zg=',
      __VIEWSTATEGENERATOR:'94640245',
      ctl00$ctl00$ctl00$ddlLanguageSelect:'English',
      ctl00$ctl00$ctl00$ContentPlaceHolder1$nestedContentPlaceHolder$ContentIndex$cntrlViewLadyCorrespondence$txtBoxLetterText:letter,
      ctl00$ctl00$ctl00$ContentPlaceHolder1$nestedContentPlaceHolder$ContentIndex$cntrlViewLadyCorrespondence$btnLetterReplySend:'Send'
      }
    }).done((data,statusText)=>{
      console.info(`发送信件(${id}): ${statusText}`);
    }).fail(xhr=>{
      console.info(`发送信件: ${xhr.statusText}`);
      this.handleFail(xhr, 'xhrFailTimes', this.pendingLimit, id, this.refresh);
    }).always(()=>{
      let pendingAmount = +localStorage.pendingAmount;
      localStorage.pendingAmount = --pendingAmount;
    });
  },
  doCollect(id) {
    let url = this.getUrl(id);
    $.ajax({url:url,type:'GET'}).done(((data,statusText)=>{
      console.log(`${id}: ${statusText}`);
      let idArray,curId,nextId,idJSON,cantWriteIndex,canWriteIndex,noInfoIndex;
      let cantWriteFlag = this.cantWriteFlag;
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
        console.warn(`已存储 ${id}`);
        } else {
          console.warn(`已跳过 ${id}`);
        }
      }
    }).bind(this))
    .fail((xhr)=>{
      console.warn(`${id}: ${xhr.statusText}`);
      this.handleFail(xhr, 'xhrFailTimes', this.pendingLimit, id, this.refresh);
    }).always(()=>{
      let pendingAmount = +localStorage.pendingAmount;
      localStorage.pendingAmount = --pendingAmount;
    });
  },
  handleFail(xhr, field, limit, id, fn) {
    console.log(xhr.statusText);
    let failTimes = +localStorage[field];
    localStorage[field] = ++failTimes;
    if (failTimes > limit) fn();
    console.warn(`已跳过 ${id}`);
  },
  refresh() {
    clearInterval(this.clock);
    let refreshTimes = localStorage.refreshTimes === undefined ? 0 : +localStorage.refreshTimes;
    refreshTimes += 1;
    localStorage.refreshTimes = refreshTimes;
    localStorage.awaitPendingTimeout = 'true';
    window.location.reload(true);
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
