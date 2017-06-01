// ==UserScript==
// @name         orientbrides
// @namespace    agency
// @version      0.1
// @description  collect id
// @author       ljyang
// @include      *Login.aspx*
// @include      *default.aspx
// @include      *agency.orientbrides.net/
// @include      *type=newLetter
// @include      *GirlsCorrespondenceView.aspx*
// @include      *4006024680.com*
// @grant        null
// ==/UserScript==

function CollectEmail() {
  this.renderBase();
  this.initData();
  
  if(localStorage.awaitPendingTimeout === 'true' && localStorage.platform === 'PC') {
    let refreshTimes = +localStorage.refreshTimes, selector;
    localStorage.refreshTimes = ++refreshTimes;
    localStorage.awaitPendingTimeout = 'false';
    selector = localStorage.theTypeOfTaskBeingPerformed;
    selector = `#${selector}`;
    this.findEle(selector).then($ele=>{
      $ele.get(0).click();
    });
  }
};

CollectEmail.prototype = {
  collectSentIdLimit: 13132967,
  ladyId: 1187357,
  requestTimeSpan: 50,
  collectMaxId: 33914386,
  pendingLimit: 50,
  xhrFailLimit: 30,
  awaitPendingTimeoutM: 2,
  emailCurIdIndex: 0,
  ladyName: 'xiaojun',
  cantWriteFlag: 'Sorry, you can’t write letter to this man. Use presentations instead.',
  noInfoFlag: 'Information about a man is not available',
  nameFlag: '<td>Name:</td>',
  canWriteFlag: 'btnReply2',
  letterArr: [`I'm only five-foot-five and my hands are really small and sometimes I'm quiet and sometimes my face goes bright red really easily. Sometimes I drink too much and make a fool of myself but I hope you don't mind because I'll laugh at your jokes and I'd like you play with my hair or run your hand down the back of my arm. I know you know, and I know you are taking caution and you're trying to figure me out..\r\n\r\nI haven't figured me out, and I'll sincerely smile and wish you luck.\r\n\r\nPlease find me if you ever succeed.\r\n\r\nI'll fall in love with something obscure, the way your left elbow digs into your waist, almost unnoticeably, when you're nervous or the way you move the left side of your mouth when you are acting like what I say doesn't matter. We're all acting aren't we? \r\n\r\nI'm short and you're tall and I don't think it much matters anyway because I'll raise my shoulders for you so we can hold hands. If you hold my hand tight. If you make me feel like the greatest thing you've ever met, even just for that moment.\r\n\r\nBecause in this moment you are my greatest.`],
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
  setting(e) {
    let $ele = $(e.target);
    let text = $ele.text();
    let $table = this.$view.find('#table');
    let $setting,con;
    if (text === '设置') {
      $table.attr('contenteditable', true);
      $ele.text('保存');
    } else if (text === '保存') {
      $setting = this.$view.find('#table td');
      $setting.each((index, item)=>{
        let id = item.id;
        if (id === 'idArray') {
          con = confirm('是否保存idArray?');
          if (con) {
            localStorage[id] = item.innerText;
          } else {
            return;
          }
        } else {
          localStorage[id] = item.innerText;
        }
      });
      $table.attr('contenteditable', false);
      $ele.text('设置');
    }
  },
  renderBase() {
    let $view = $(`<div style='background:#fff;'>
  <button class='btn btn-default' type='button' id='collectSentId'>开始收集已发信ID</button>
  <button class='btn btn-default' type='button' id='collectId'>开始寻找ID</button>
  <button class='btn btn-default' type='button' id='sendEmail'>开始本地ID发信</button>
  <button class='btn btn-default' type='button' id='scanIdSendEmail'>开始寻找ID发信</button>
  <button class='btn btn-default' type='button' id='setting'>设置</button>

  <table id='table' style='margin-top:5px;outline:1px solid #000;background:#fff;border-collapse:collapse;width:100%;' cellpadding="10" contenteditable="false">
    <tr>
      <th>xhrFailTimes</th>
      <th>collectCurId</th>
      <th>curTime</th>
      <th>emailCurIdIndex</th>
      <th>holdingPendingTimes</th>
      <th>idArrayLength</th>
      <th>idArray</th>
      <th>pendingAmount</th>
      <th>platform</th>
      <th>refreshTimes</th>
      <th>theTypeOfTaskBeingPerformed</th>
      <th>awaitPendingTimeout</th>
    </tr>
    <tr>
      <td id='xhrFailTimes'></td>
      <td id='collectCurId'></td>
      <td id='curTime'></td>
      <td id='emailCurIdIndex'></td>
      <td id='holdingPendingTimes'></td>
      <td id='idArrayLength'></td>
      <td id='idArray'></td>
      <td id='pendingAmount'></td>
      <td id='platform'></td>
      <td id='refreshTimes'></td>
      <td id='theTypeOfTaskBeingPerformed'></td>
      <td id='awaitPendingTimeout'></td>
    </tr>
  </table>
  <audio controls="controls" id="myMp3" loop="true" style='margin-top: 5px;'>
    <source src="http://www.w3school.com.cn/i/song.mp3" type="audio/mpeg">
    你的浏览器不支持audio标签
  </audio>
  <p id="taskLog"></p>
</div>`)
    .find('button')
    .css({
      width: '150px',
      height: '30px'
    })
    .end()
    .find('#collectId')
    .on('click',this.controlCollect.bind(this))
    .end()
    .find('#sendEmail')
    .on('click',this.controllEmail.bind(this))
    .end()
    .find('#scanIdSendEmail')
    .on('click',this.scanIdSendEmail.bind(this))
    .end()
    .find('#table th,#table td')
    .css('outline', '1px solid #000')
    .end()
    .find('#setting')
    .on('click',this.setting.bind(this))
    .end()
    .find('#collectSentId')
    .on('click', this.controlCollectSent.bind(this))
    .end();

    this.$view = $view;
    $('body').prepend($view);
  },
  changeView() {
    for (let key in localStorage) {
      if (key === 'idArray' || key === 'letterArr') continue;
      this.$view.find(`#${key}`).text(localStorage[key]);
    }
  },
  getSentListUrl(pageNum) {
    let idArray, con;
    if (pageNum === 1) {
      idArray = JSON.parse(localStorage.idArray);
      if (idArray.length !== 0) {
        con = confirm('idArray不为空，是否向后添加ID?');
        if (!con) {
          return {msg: '请清空idArray'}
        }
      }
      return `http://agency.orientbrides.net/Mail/GirlsCorrespondenceView.aspx?type=1&includeAll=true&ladyID=${this.ladyId}&sortBy=0&sortDirection=1&groupByMan=1&showTotalCount=False`;
    } else if (pageNum > 1) {
      return `http://agency.orientbrides.net/Mail/GirlsCorrespondenceView.aspx?type=1&includeAll=true&ladyID=${this.ladyId}&sortBy=0&sortDirection=1&groupByMan=1&showTotalCount=False&pageNum=${pageNum}`;
    }
  },
  doCollectSentId() {
    this.collectSentId().then(()=>{
      this.doCollectSentId();
    }, errMsg=>{
      this.$view.find('#myMp3').get(0).play();
      this.$view.find('#collectSentId').text('开始收集已发信ID');
      alert(errMsg);
    });
  },
  collectSentId() {
    return new Promise((resolve, reject)=>{
      let pageNum = +localStorage.pageNum;
      let collectSentIdController = localStorage.collectSentIdController;
      let url = this.getSentListUrl(pageNum);
      if (collectSentIdController === 'pause') reject('已停止收集已发信ID');
      if (typeof url !== 'string') reject(url.msg);
      $.ajax({url:url,type:'GET'})
        .done(data=>{
          let $html = $(data);
          let $hrefCollect = $html.find('.agencyMailStats tr').not('.agencyMailStats tr:first').find('td:first a');
          let curPageIdArr = [];
          let idArray = JSON.parse(localStorage.idArray);
          this.$view.find('#taskLog').text(`最近收集的时间：${new Date()}, 页数: ${pageNum}`);
          $hrefCollect.each((index, item)=>{
            curPageIdArr.push(+item.href.replace('http://agency.orientbrides.net/index/ViewLadyCorrespondence.aspx?ladyID=1187357&manID=', ''));
          });
          idArray.push(...curPageIdArr);
          this.$view.find('#idArrayLength').text(idArray.length);
          localStorage.idArray = JSON.stringify(idArray);
          //if (curPageIdArr.length < 32 && pageNum !== 1) reject('收集已发信ID完成');
          if (curPageIdArr[curPageIdArr.length-1] < this.collectSentIdLimit) reject('收集已发信ID完成');
          localStorage.pageNum = ++pageNum;
          resolve();
        })
       .fail(()=>{
        reject(`获取第${pageNum}页失败`);
      });
    });
  },
  controlCollectSent(e) {
    let $ele = $(e.target);
    this.$view.find('button').not('#collectSentId,#setting').css('display', 'none');
    if ($ele.text() === '开始收集已发信ID') {
      localStorage.theTypeOfTaskBeingPerformed = 'collectSentId';
      localStorage.collectSentIdController = 'play';
      this.doCollectSentId();
      $ele.text('暂停收集已发信ID');
    } else if ($ele.text() === '暂停收集已发信ID') {
      $ele.text('开始收集已发信ID');
      localStorage.collectSentIdController = 'pause';
    }
  },
  scanIdSendEmail(e) {
    let $ele = $(e.target);
    this.$view.find('button').not('#scanIdSendEmail,#setting').css('display', 'none');
    if ($ele.text() === '开始寻找ID发信') {
      this.resetByBtn();
      localStorage.theTypeOfTaskBeingPerformed = 'scanIdSendEmail';
      $ele.text('暂停寻找ID发信');
      this.mutilThreadCollect(true);
    } else if ($ele.text() === '暂停寻找ID发信') {
      $ele.text('开始寻找ID发信');
      clearInterval(CollectEmail.clock);
    }
  },
  controlCollect(e) {
    let $ele = $(e.target);
    this.$view.find('button').not('#collectId,#setting').css('display', 'none');
    if ($ele.text() === '开始寻找ID') {
      this.resetByBtn();
      localStorage.theTypeOfTaskBeingPerformed = 'collectId';
      $ele.text('暂停寻找ID');
      this.mutilThreadCollect();
    } else if ($ele.text() === '暂停寻找ID') {
      $ele.text('开始寻找ID');
      clearInterval(CollectEmail.clock);
    }
  },
  controllEmail(e) {
    let $ele = $(e.target);
    let idArray = localStorage.idArray;
    window.idArray = JSON.parse(idArray);
    this.$view.find('button').not('#sendEmail,#setting').css('display', 'none');
    if ($ele.text() === '开始本地ID发信') {
      this.resetByBtn();
      localStorage.theTypeOfTaskBeingPerformed = 'sendEmail';
      $ele.text('暂停本地ID发信');
      this.mutilThreadEmail();
    } else if ($ele.text() === '暂停本地ID发信') {
      $ele.text('开始本地ID发信');
      clearInterval(CollectEmail.clock);
    }
  },
  resetByBtn() {
    if (localStorage.platform === 'ANDROID') localStorage.awaitPendingTimeout = 'false';
    localStorage.xhrFailTimes = 0;
    localStorage.refreshTimes = 0;
    localStorage.pendingAmount = 0;
    localStorage.holdingPendingTimes = this.awaitPendingTimeoutLimit();
  },
  getUrl(curId) {
    return `./ViewLadyCorrespondence.aspx?ladyID=${this.ladyId}&manID=${curId}&type=newLetter`;
  },
  increaseId(id) {
    return ++id;
  },
  getCurId(type) {
    localStorage.curTime = new Date();
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
    localStorage.holdingPendingTimes = this.awaitPendingTimeoutLimit();
    if (localStorage.letterCurIndex === undefined) localStorage.letterCurIndex = 0;
    if (localStorage.letterArr === undefined) localStorage.letterArr = JSON.stringify(this.letterArr);
    if (localStorage.awaitPendingTimeout === undefined) localStorage.awaitPendingTimeout = false;
    if (localStorage.refreshTimes === undefined) localStorage.refreshTimes = 0;
    if (localStorage.pageNum === undefined) localStorage.pageNum = 1;
    if (localStorage.platform === undefined) localStorage.platform = 'PC';
    if (localStorage.collectCurId === undefined) alert('collectCurId未设置');
    if (localStorage.emailCurIdIndex === undefined) alert('emailCurIdIndex未设置');
    if(localStorage.idArray === undefined) {
      alert('idArray未设置');
    } else {
      localStorage.idArrayLength = JSON.parse(localStorage.idArray).length;
    }
    this.changeView();
  },
  generateLetter(letter, manName, ladyName) {
    return `Dear ${manName}\r\n\r\n${letter}\r\n\r\n${ladyName}`;
  },
  getManName(id) {
    return new Promise((resolve, reject)=>{
      let url = this.getUrl(id);
      $.ajax({url:url,type:'GET'}).done(((data,statusText)=>{
        this.reduceXhrFailTimes();
        if (typeof data !== 'string') reject('fail');
        let startIndex = data.indexOf(this.nameFlag);
        startIndex += this.nameFlag.length;
        let endIndex = data.indexOf('</td>', startIndex);
        let name = data.substring(startIndex, endIndex).replace(/\s*<td>/, '').split(' ')[0];
        if (name !== '') {
          resolve(name);
        } else {
          reject('fail');
        }
        
      })).fail((xhr)=>{
        this.handleFail(xhr, 'xhrFailTimes', this.xhrFailLimit, id, this.refresh);
        reject('fail');
      }).always(()=>{
        let pendingAmount = +localStorage.pendingAmount;
        if(pendingAmount > 0) localStorage.pendingAmount = --pendingAmount;
        this.resetHoldingPendingTimes('holdingPendingTimes');
      });
    });
  },
  handleReachPendingLimit(field) {
    let pendingTimes = +localStorage[field];
    if (pendingTimes > 0) localStorage[field] = --pendingTimes;
    if (pendingTimes === 0) {
      this.refresh();
    }
  },
  resetHoldingPendingTimes(field) {
    localStorage[field] = this.awaitPendingTimeoutLimit();
  },
  mutilThreadEmail() {
    let timeSpan = this.requestTimeSpan;
    CollectEmail.clock = setInterval(()=>{
      let pendingAmount = +localStorage.pendingAmount;
      let curId, selector, btnText, completeText, letter, letterCurIndex, letterArr, emailCurIdIndex;
      selector = '#sendEmail';
      btnText = '开始本地ID发信';
      completeText = '邮件已发完毕';
      emailCurIdIndex = +localStorage.emailCurIdIndex;
      if (pendingAmount <= this.pendingLimit) {
        if (emailCurIdIndex > window.idArray.length) {
          clearInterval(CollectEmail.clock);
          alert(completeText);
          $(selector).text(btnText);
          return;
        }
        curId = this.getCurId('sendEmail');
        localStorage.pendingAmount = ++pendingAmount;
        emailCurIdIndex = +localStorage.emailCurIdIndex;
        localStorage.emailCurIdIndex = ++emailCurIdIndex;
        
        pendingAmount = +localStorage.pendingAmount;
        letterCurIndex = +localStorage.letterCurIndex;
        letterArr = JSON.parse(localStorage.letterArr);
        letter = letterArr[letterCurIndex];
        if (pendingAmount <= this.pendingLimit) {
          localStorage.pendingAmount = ++pendingAmount;
          this.getManName(curId).then(manName=>{
            if (typeof manName !== 'string' || manName === 'fail') return;
            letter = this.generateLetter(letter, manName, this.ladyName);
            this.doEmail(curId, letter);
          });
        } else {
          this.handleReachPendingLimit('holdingPendingTimes');
        }
        
      } else {
        this.handleReachPendingLimit('holdingPendingTimes');
      }
      this.changeView();
    }, timeSpan);
  },
  mutilThreadCollect(sendEmail) {
    let timeSpan = this.requestTimeSpan;
    CollectEmail.clock = setInterval(()=>{
      let pendingAmount = +localStorage.pendingAmount;
      let maxId, curId, selector, btnText, completeText, nexId;
      maxId = this.collectMaxId;
      selector = '#collectId';
      btnText = sendEmail ? '开始寻找ID发信' : '开始寻找ID';
      completeText = '收集ID完成';
      
      if (pendingAmount <= this.pendingLimit) {
        curId = this.getCurId('collectId');
        localStorage.pendingAmount = ++pendingAmount;
        nexId = this.increaseId(curId);
        this.saveCurId(nexId);
        if (curId > maxId) {
            clearInterval(CollectEmail.clock);
            $(selector).text(btnText);
            alert(completeText);
            return;
          }
        this.doCollect(curId, sendEmail);
        
      } else {
        this.handleReachPendingLimit('holdingPendingTimes');
      }
      this.changeView();
    }, timeSpan);
  },
  doEmail(id,letter, sendEmail) {
    let url = this.getUrl(id);
    let ladyId = this.ladyId;
    $.ajax({
      url:url,
      type: 'POST',
      data: {
        ladyID:ladyId,
        manID:id,
        type:'newLetter',
        
      __VIEWSTATEFIELDCOUNT:2,
      __VIEWSTATE:'/wEPDwULLTEwMjg2MDU0NzEPZBYCZg9kFgJmD2QWAmYPZBYCAgMPZBYIAgEPFgIeBFRleHQFF0FHRU5DWS5PUklFTlRCUklERVMuTkVUZAIGD2QWAgIBDxBkZBYBZmQCCA9kFgICAw9kFgQCCA8WBh4FdGl0bGVkHgRocmVmBSMvTWFpbC9OZXdMZXR0ZXIuYXNweD9sYWR5SUQ9MTE4NzM1Nx4HVmlzaWJsZWcWAmYPFgIeA2FsdGRkAg4PFgYfAQUESGVscB8CBREvSW5kZXgvSGVscDIuYXNweB8DZxYCZg8WAh8EBQRIZWxwZAIKD2QWAgIFD2QWAgIDD2QWAgIBDw8WBh4HUmF3R3VpZCgpWFN5c3RlbS5HdWlkLCBtc2NvcmxpYiwgVmVy',
      __VIEWSTATE1:'c2lvbj00LjAuMC4wLCBDdWx0dXJlPW5ldXRyYWwsIFB1YmxpY0tleVRva2VuPWI3N2E1YzU2MTkzNGUwODkkZjkzNGQxM2MtOGI0OC00OThiLWE0OWYtZDQwMjQyYTQ3NDMwHgZsYWR5SUQCnbxIHgVtYW5JRAKX49cPZGRkEklTWzFKRYK2lcH9LIbR45bp7Zg=',
      __VIEWSTATEGENERATOR:'94640245',
      ctl00$ctl00$ctl00$ddlLanguageSelect:'English',
      ctl00$ctl00$ctl00$ContentPlaceHolder1$nestedContentPlaceHolder$ContentIndex$cntrlViewLadyCorrespondence$txtBoxLetterText:letter,
      ctl00$ctl00$ctl00$ContentPlaceHolder1$nestedContentPlaceHolder$ContentIndex$cntrlViewLadyCorrespondence$btnLetterReplySend:'Send'
      }
    }).done((data,statusText)=>{
      this.reduceXhrFailTimes();
      //if (sendEmail === true) this.msg('寻找ID发信', `已发送 ${id}`);
      if (sendEmail === undefined) this.msg('本地ID发信', `已发送 ${id}`);
      this.$view.find('#taskLog').text(`最近一次发送的时间与ID: ${new Date()} ${id}`);
    }).fail(xhr=>{
      this.handleFail(xhr, 'xhrFailTimes', this.xhrFailLimit, id, this.refresh);
    }).always(()=>{
      let pendingAmount = +localStorage.pendingAmount;
      if(pendingAmount > 0) localStorage.pendingAmount = --pendingAmount;
      this.resetHoldingPendingTimes('holdingPendingTimes');
    });
  },
  reduceXhrFailTimes() {
    let xhrFailTimes = localStorage.xhrFailTimes;
    if (xhrFailTimes > 0)localStorage.xhrFailTimes = --xhrFailTimes;
    this.$view.find('#xhrFailTimes').text = xhrFailTimes;
  },
  doCollect(id, sendEmail) {
    let url = this.getUrl(id);
    $.ajax({url:url,type:'GET'}).done(((data,statusText)=>{
      this.reduceXhrFailTimes();
      let idArray,nextId,idJSON,cantWriteIndex,canWriteIndex,noInfoIndex, startIndex, endIndex, manName, letterCurIndex, letterArr, letter, pendingAmount, emailCurIdIndex;
      let cantWriteFlag = this.cantWriteFlag;
      this.reduceXhrFailTimes();
      if (typeof data === 'string') {
        cantWriteIndex = data.indexOf(cantWriteFlag);
        canWriteIndex = data.indexOf(this.canWriteFlag);
        noInfoIndex = data.indexOf(this.noInfoFlag);
        if(cantWriteIndex === -1 && canWriteIndex !== -1 && noInfoIndex === -1) {
          if (sendEmail === undefined) {
            idArray = JSON.parse(localStorage.idArray);
            idArray.push(id);
            localStorage.idArrayLength = idArray.length;
            idJSON = JSON.stringify(idArray);
            this.saveIdArray(idJSON);
            this.msg('Collect Id', `已存储 ${id}`);
          } else if(sendEmail === true) {
            startIndex = data.indexOf(this.nameFlag);
            startIndex += this.nameFlag.length;
            endIndex = data.indexOf('</td>', startIndex);
            manName = data.substring(startIndex, endIndex).replace(/\s*<td>/, '').split(' ')[0];
            if (manName !== '') {
              pendingAmount = +localStorage.pendingAmount;
              localStorage.pendingAmount = ++pendingAmount;
              letterCurIndex = +localStorage.letterCurIndex;
              letterArr = JSON.parse(localStorage.letterArr);
              letter = letterArr[letterCurIndex];
              letter = this.generateLetter(letter, manName, this.ladyName);
              this.doEmail(id, letter, true);
            }
          }
        }
      }
    }).bind(this))
    .fail((xhr)=>{
      this.handleFail(xhr, 'xhrFailTimes', this.xhrFailLimit, id, this.refresh);
    }).always(()=>{
      let pendingAmount = +localStorage.pendingAmount;
      if(pendingAmount > 0) localStorage.pendingAmount = --pendingAmount;
      this.resetHoldingPendingTimes('holdingPendingTimes');
    });
  },
  handleFail(xhr, field, limit, id, fn) {
    let failTimes = +localStorage[field];
    localStorage[field] = ++failTimes;
    this.$view.find(`#${field}`).text = failTimes;
    if (failTimes > limit) fn();
  },
  refresh() {
    let platform = localStorage.platform;
    let theTypeOfTaskBeingPerformed = localStorage.theTypeOfTaskBeingPerformed;
    if (localStorage.awaitPendingTimeout === 'true') return;
    clearInterval(CollectEmail.clock);
    if (platform === 'PC') {
      $('#myMp3').get(0).play();
      window.location.reload(true);
    } else if (platform === 'ANDROID') {
      $('#myMp3').get(0).play();
    }
    switch(theTypeOfTaskBeingPerformed) {
      case 'scanIdSendEmail':
        $('#scanIdSendEmail').text('开始寻找ID发信');
        break;
      case 'sendEmail':
        $('#sendEmail').text('开始本地ID发信');
        break;
      case 'collectId':
        $('#collectId').text('开始寻找ID');
        break;
    }
    localStorage.awaitPendingTimeout = 'true';
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
};

function Login() {
  let loginSelector = '#ctl00_ContentPlaceHolder1_txtBoxLogin';
  let pwdSelector = '#ctl00_ContentPlaceHolder1_txtBoxPWD';
  let enterSelector = '#ctl00_ContentPlaceHolder1_btnLogin';
  
  let collectEle = async ()=>{
    let $loginEle = this.findEle(loginSelector);
    let $pwdEle = this.findEle(pwdSelector);
    let $enterEle = this.findEle(enterSelector);
    
    return {
      $loginEle: await $loginEle,
      $pwdEle: await $pwdEle,
      $enterEle: await $enterEle
    }
  };
  
  collectEle().then($ele=>{
    let account = '63496';
    let pwd = 'a3605ea3';
    $ele.$loginEle.val(account);
    $ele.$pwdEle.val(pwd);
    $ele.$enterEle.get(0).click();
  });
};

Login.prototype.findEle = CollectEmail.prototype.findEle;

(()=>{
  let href = window.location.href;
  let $music = $(`<audio controls="controls" id="myMp3" loop="true" style='margin-top: 5px;'>
      <source src="http://www.w3school.com.cn/i/song.mp3" type="audio/mpeg">
      你的浏览器不支持audio标签
    </audio>
  `);
  if (href.indexOf('Login.aspx') !== -1) {
    new Login();
  } else if (href.indexOf('default.aspx') !== -1 || href === 'http://agency.orientbrides.net/') {
    window.location.href = 'http://agency.orientbrides.net/index/ViewLadyCorrespondence.aspx?ladyID=1187357&manID=11111111&type=newLetter';
  } else if (href.indexOf('type=newLetter') !== -1 || href.indexOf('GirlsCorrespondenceView.aspx') !== -1) {
    new CollectEmail();
  } else if (href.indexOf('4006024680.com') !== -1) {
    $music.prepend('body').get(0).play();
  }
  
  //未连接到互联网
  $(()=>{
    if($('#main-frame-error').size()) $music.prepend('body').get(0).play();
  });
})();