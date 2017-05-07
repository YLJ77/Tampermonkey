// ==UserScript==
// @name         damai2
// @namespace    ticket2
// @version      0.2
// @description  Grab a ticket
// @author       ljyang
// @include      *piao.damai.cn*
// @include      *trade.damai.cn*
// @include      *pay.damai.cn*
// @require      http://code.jquery.com/jquery-latest.js
// @require      http://cdn.bootcss.com/jquery-cookie/1.4.1/jquery.cookie.js
// @require      https://cdn.bootcss.com/bootstrap/3.3.7/js/bootstrap.min.js
// @grant       GM_addStyle
// @grant       GM_getResourceText
// ==/UserScript==
/*
var newCSS = GM_getResourceText ("customCSS");
GM_addStyle (newCSS);
*/

(()=>{
  var box = window.alert;
  function Ticket(){
    new Controller();
  }

  Ticket.prototype = {
    ticketAmount: +$.cookie('ticketAmount'),    //购买门票的数量
    certification: true,//是否要实名认证,表单设置无效,需手动配置
    performIndex: +$.cookie('performIndex'),        //从0开始算起，选择第几个演出时间
    priceIndex: +$.cookie('priceIndex'),       //从0开始算起，买第几个价位
    detect() {
      var _this = this;
      async function collectEle(){
        var $performTime = _this.findEle(['#performList .lst','.lst.lst-dis'],'寻找演出时间');
        var $price = _this.findEle(['#priceList .lst'],'寻找票价');

        return {
          $performTime: await $performTime,
          $price: await $price
        }
      };

      collectEle().then(eleObj=>{
        var $performTime = eleObj.$performTime;
        var $price = eleObj.$price;

        _this.doSelect($performTime,'已选择演出时间','演出时间为未可选择状态',_this.performIndex).then(msg=>{
          _this.doSelect($price,'已选择票价','票价为未可选择状态',_this.priceIndex).then(msg=>{
              _this.findEle(['.ipt.ipt-num'],'寻找门票数量输入框').then($ticketAmount=>{
                $ticketAmount.eq(0).val(_this.ticketAmount);
                _this.findEle(['#btnBuyNow','#btnXuanzuo'],'寻找购买按钮').then($ele=>{
                  $ele.get(0).click();
                });
              });
            },reason=>{
            box(reason);
          });
        },reason=>{
          box(reason);
        });

      });
    },
    doSelect ($performTime,log,statusLog,priceIndex) {
      return new Promise((resolve,reject)=>{
        var clock = setInterval(()=>{
          if(Controller.prototype.isCopyPage()) Controller.prototype.closeTag();
          var $timeItems = $performTime.find('li');
          var $timeBtn = null;
          var $item =null;
          var soldOut,mobile;
          var i = priceIndex || 0;
          for(;i<$timeItems.length; i++){
            $item = $timeItems.eq(i);
            soldOut = $item.hasClass('itm-oos');
            mobile = $item.hasClass('itm-mobile');
            if (!soldOut && !mobile) {
              $timeBtn = $item.find('a');
              $timeBtn.get(0).click();
              if ($item.hasClass('itm-sel')) {
                clearInterval(clock);
                resolve(log);
              }
              break;
            }
          }


          if ($timeBtn === null) {
            console.warn(statusLog);
          }
        },1);
      });
    },
    findEle(selector,log) {
        var _this = Ticket.prototype;
        return new Promise(resolve=>{
          var clock = setInterval(()=>{
           if(Controller.prototype.isCopyPage()) Controller.prototype.closeTag();
           var $ele = _this.filtSelector(selector);
            for(var i=0,len=$ele.length;i<len;i++) {
              if($ele[i].length) {
                clearInterval(clock);
                resolve($ele[i]);
                break;
              }
            }
            console.log(log);
          },1);
      });
    },
    filtSelector(selector) {
      var arr = [];
      if(selector.length > 1) {
          if (selector[1] !== '.lst.lst-dis') {
            selector.forEach((item,index)=>{
              arr.push($(item));
            });
            return arr;
        } else {
          arr.push($(selector[0]).not(selector[1]));
          return arr;
        }
      } else {
        arr.push($(selector[0]));
        return arr;
      }
    }
  };

  Confirm.prototype = Ticket.prototype;
  Confirm.prototype.constructor = Confirm;

  function Confirm() {
    var _this = this;
    if (this.certification) {
      this.findEle(['.from-1 .u-btn-rds'],'寻找选择观演人按钮').then($ele=>{
      $ele.get(0).click();
      _this.findEle(["input[name='viewer_radio']"],'寻找观演人radio').then($ele=>{
        $ele.get(0).click();
        _this.findEle(["[ms-on-click='@modal.config_realname.onConfirm()']"],'寻找观演人确定按钮').then($ele=>{
          $ele.get(0).click();
          _this.findEle(['#orderConfirmSubmit'],'寻找确认订单按钮').then($ele=>{
            //$ele.get(0).click();
            $ele.eq(0).text('beautiful day!');
          });
        });
      });
    });
    } else {
      _this.findEle(['#orderConfirmSubmit'],'寻找确认订单按钮').then($ele=>{
        //$ele.get(0).click();
        $ele.eq(0).text('beautiful day!');
      });
    }
  };

  function Controller() {
    if (!this.isCopyPage()) {
      this.appendBootstrapCss();
      this.appendModal();
      this.renderBase();
    } else {
      this.copyPageStart();
    }
  }

  Controller.prototype = {
    isCopyPage() {
      return (window.location.href.indexOf('customCopy') !== -1);
    },
    countdown() {
      var clock = setInterval((()=>{
        var beforeTimeoutSec = +$.cookie('beforeTimeoutSec');
        var time = this.getTime();
        var saleSec = time.sale.sec;
        var curSec = time.now.sec;
        var diffSec = saleSec - curSec;
        var saleFormatTime = this.formatTime(diffSec);
        var openTagFormatTime = this.formatTime(diffSec - beforeTimeoutSec);

        console.info(`距离抢购时间还有：${saleFormatTime} 距离开始循环打开页面的时间还有：${openTagFormatTime}`);
        if (openTagFormatTime == '00:00:00') {
          clearInterval(clock);
          var openPageSpanTime = $.cookie('openPageSpanTime');
          this.openTag(openPageSpanTime);
          this.detect();
        }
      }).bind(this), 1000);
    },
    start(e) {
      if ($.cookie('ticketPageAmount') === undefined) {
        box('请先保存设置');
        return;
      }
      $(e.target).attr('disabled',true);
      //this.detect();
      this.countdown();
    },
    copyPageStart() {
      $.cookie('domLoaded', 'false', { expires: 1000, path: '/' });
      $(()=>{
        $.cookie('domLoaded', 'true', { expires: 1000, path: '/' });
        document.title = this.getPageId();
        this.detect();
      });
    },
    renderBase() {
     var $bar = $("<div class='btn-group'>" +
          "<button class='btn btn-default' type='button' id='setting'>设置</button>" +
          "<button class='btn btn-info' type='button' id='startGrabbing'>开始</button>" +
          "</div>")
      .css({
        position: 'fixed',
        top: '70px',
        left: '20px',
        'z-index': 999
      })
     .find('#setting').on('click',this.setting)
     .end()
     .find('#startGrabbing').on('click',this.start.bind(this))
     .end();

      $('body').prepend($bar);
    },
    openTag(timeSpan) {
      var timeSpan = timeSpan || 1000;
      $.cookie('openedPageAmount', 0, { expires: 1000, path: '/' });
      $.cookie('opendPageLocked', 'false', { expires: 1000, path: '/' });
      $.cookie('initOpenedPageAmount', 'false', { expires: 1000, path: '/' });
      $.cookie('domLoaded', 'true', { expires: 1000, path: '/' });
      var ticketPageAmount = +$.cookie('ticketPageAmount');
      var clock = setInterval((()=>{
        var openedPageAmount = +$.cookie('openedPageAmount');
        var opendPageLocked = $.cookie('opendPageLocked');
        var initOpenedPageAmount = $.cookie('initOpenedPageAmount');
        var domLoaded = $.cookie('domLoaded');
        
        if(domLoaded === 'false') return;
        
        if(openedPageAmount < ticketPageAmount) {
          if (initOpenedPageAmount === 'false') {
            console.log('初始化打开额定数量标签页');
            $.cookie('openedPageAmount', ++openedPageAmount, { expires: 1000, path: '/' });
            this.isCopyPage() ? window.open(window.location.href) : window.open(window.location.href+'?customCopy-'+openedPageAmount);
          } else if (opendPageLocked === 'true') {
            console.log('已锁定打开标签页');
          } else if (opendPageLocked === 'false') {
            console.log('已解锁打开标签页');
            $.cookie('openedPageAmount', ++openedPageAmount, { expires: 1000, path: '/' });
            this.isCopyPage() ? window.open(window.location.href) : window.open(window.location.href+'?customCopy-'+openedPageAmount);
          }
          
        } else {
          $.cookie('initOpenedPageAmount', 'true', { expires: 1000, path: '/' });
          $.cookie('opendPageLocked', 'true', { expires: 1000, path: '/' });
          $.cookie('openedPageAmount', 0, { expires: 1000, path: '/' });
        }

      }).bind(this),timeSpan);
    },
    getPageId() {
      var href = window.location.href;
      var pageId = +(href.split('?')[1].split('-')[1]);
      return pageId;
    },
    closeTag() {
      var pageId = this.getPageId();
      var openedPageAmount = +$.cookie('openedPageAmount');
      if (openedPageAmount === (pageId-1)) {
        $.cookie('opendPageLocked', 'false', { expires: 1000, path: '/' });
        window.close();
      }
    },
    getTime(time) {
      var now = new Date();
      var curHour = now.getHours();
      var curMin = now.getMinutes();
      var curSec = now.getSeconds();
      var flashSaleTime = time ? time : $.cookie('flashSaleTime');
      var flashSaleArr = flashSaleTime.split(':');
      if (flashSaleArr.length === 1) flashSaleArr = flashSaleTime.split('：');
      var saleHour = +flashSaleArr[0];
      var saleMin = +flashSaleArr[1];

      return {
        now: {
          h: curHour,
          m: curMin,
          s: curSec,
          hmMs: curHour * 60 * 60 + curMin * 60,
          sec: curHour * 60 * 60 + curMin * 60 + curSec
        },
        sale: {
          h: saleHour,
          m: saleMin,
          sec: saleHour * 60 * 60 + saleMin * 60
        }
      };
    },
    formatTime(sec) {
      var h = Math.floor(sec / (60 * 60) );
      var m = Math.floor((sec - h * 60 * 60) / 60);
      var s = sec - h * 60 * 60 - m * 60;

      var toString= num=>{
        if (num < 1) {
          num = '00'
        } else if (num <= 9) {
          num = '' + num;
          num = '0' + num;
        }
        return num;
      }
      h = toString(h);
      m = toString(m);
      s = toString(s);
      return [h,m,s].join(':');
    },
    setting() {
      $('#myModal').modal('show');
    },
    appendBootstrapCss() {
      var cssURL = 'https://cdn.bootcss.com/bootstrap/3.3.7/css/bootstrap.min.css',
      linkTag = $('<link href="' + cssURL + '" rel="stylesheet" type="text/css"/>'); 
      $($('head')[0]).prepend(linkTag);
    },
    appendModal() {
      var _this = this;
      var option = this.conf;
      var optionDom = '';
      option.forEach((item,index)=>{
        if(item.id === 'certification') return;
        optionDom += `<div class='form-group'><label class='control-label'>${item.text}:</label><input type='text' class='form-control' id='${item.id}' value=''></div>`;
      });
      var $modal = $("<div class='modal fade' id='myModal' tabindex='-1' style='z-index:99999;'>" +
                    "<div class='modal-dialog'>" +
                      "<div class='modal-content'>" +
                        "<div class='modal-header'>" +
                          "<h4 class='modal-title'>设置</h4>" +
                        "</div>" +
                        "<div class='modal-body'>" +
                          "<form>" +
                            optionDom +
                            "<div class='checkbox'>" +
                               "<label>" +
                                 "<input type='checkbox' id='certification' value='false'>实名认证" +
                               "</label>" +
                            "</div>" +
                          "</form>" +
                        "</div>" +
                        "<div class='modal-footer'>" +
                          "<button type='button' class='btn btn-default' data-dismiss='modal'>关闭</button>" +
                          "<button type='button' class='btn btn-default' id='reset'>重置</button>" +
                          "<button type='button' class='btn btn-primary' id='save'>保存</button>" +
                        "</div>" +
                      "</div>" +
                    "</div>" +
                  "</div>");

      $modal.find('#save').on('click', this.saveSetting.bind(this));
      $modal.find('#reset').on('click', this.reset.bind(this));
      $modal.find('#certification').on('click', function(){
        var value = ($(this).val() === 'false') ? true : false;
        $(this).val(value);
      })
      $modal.on('show.bs.modal', this.settingInit.bind(this));

      $('body').prepend($modal);
    },
    validateSetting() {
      var conf = this.conf;
      for (var i=0,len=conf.length;i<len;i++) {
        conf[i].value = $(`#${conf[i].id}`).val();
        if (conf[i].id === 'certification') continue;
        if (!(conf[i].verify.bind(this,conf[i].value))()) return false;
      }

      return conf;
    },
    reset() {
      this.conf.forEach((item,index)=>{
        if (item.id === 'certification') return;
        $(`#${item.id}`).val(item.default);
      });
    },
    saveSetting() {
      var data = this.validateSetting();
      if (!data) return false;
      data.forEach((item,index)=>{
        $.cookie(item.id, item.value, { expires: 1000, path: '/' });
      });
      $('#myModal').modal('hide');
    },
    settingInit() {
      this.conf.forEach((item,index)=>{
        var $ele = $(`#${item.id}`);
        if (item.id === 'certification' && $.cookie(item.id) === 'true') $ele.attr('checked',true);
        $ele.val($.cookie(item.id) || item.default);
      });
    },
    conf: [
      {
        text: '距倒计时结束前开始循环打开页面的秒数',
        id: 'beforeTimeoutSec',
        default: 5,
        value: '',
        verify(val){
          if (val === '') {
            box('距倒计时结束前开始循环打开页面的秒数');
            return false;
          } else if (!(/^\d+$/.test(val))) {
            box('距倒计时结束前开始循环打开页面的秒数只能输入数字');
            return false;
          }  else if (+val < 0) {
            box('距倒计时结束前开始循环打开页面的秒数不能小于0');
            return false;
          }
          return true;
        }
      },
      {
        text: '浏览器可存活的抢票页面数量',
        id: 'ticketPageAmount',
        default: 1,
        value: '',
        verify(val){
          if (val === '') {
            box('浏览器可存活的抢票页面数量不能为空');
            return false;
          } else if (!(/^\d+$/.test(val))) {
            box('浏览器可存活的抢票页面数量只能输入数字');
            return false;
          } else if (+val > 100) {
            box('浏览器可存活的抢票页面数量不能大于20');
            return false;
          } else if (+val < 0) {
            box('浏览器可存活的抢票页面数量不能小于0');
            return false;
          }
          return true;
        }
      },
      {
        text: '购买门票数',
        id: 'ticketAmount',
        default: 2,
        value: '',
        verify(val){
          if (val === '') {
            box('购买门票数不能为空');
            return false;
          } else if (!(/^\d+$/.test(val))) {
            box('购买门票数只能输入数字');
            return false;
          } else if (+val > 6) {
            var reconfirm = confirm(`确定购买${val}张门票吗？`);
            return reconfirm;
          } else if (+val < 0) {
            box('购买门票数不能小于0');
            return false;
          }
          return true;
        }
      },
      {
        text: '票价索引',
        id: 'priceIndex',
        default: 0,
        value: '',
        verify(val){
          if (val === '') {
            box('票价索引不能为空');
            return false;
          } else if (!(/^\d+$/.test(val))) {
            box('票价索引只能输入数字');
            return false;
          } else if (+val < 0) {
            box('票价索引不能小于0');
            return false;
          }
          return true;
        }
      },
      {
        text: '演出日期索引',
        id: 'dateIndex',
        default: 0,
        value: '',
        verify(val){
          if (val === '') {
            box('演出日期索引不能为空');
            return false;
          } else if (!(/^\d+$/.test(val))) {
            box('演出日期索引只能输入数字');
            return false;
          } else if (+val < 0) {
            box('演出日期索引不能小于0');
            return false;
          }
          return true;
        }
      },
      {
        text: '抢购时间',
        id: 'flashSaleTime',
        default: '00:00',
        value: '',
        verify(val){
          var time = this.getTime(val);
          var nowSec = time.now.sec;
          var saleSec = time.sale.sec;
          if (val === '') {
            box('抢购时间不能为空');
            return false;
          } if (saleSec < nowSec) {
            box('抢购时间不能小于当前时间');
            return false;
          } if (!(/^\d{1,2}(:|：)\d{1,2}$/.test(val))) {
            box('抢购时间格式不正确');
            return false;
          }
          return true;
        }
      },
      {
        text: '打开抢票页面的时间间隔(毫秒)',
        id: 'openPageSpanTime',
        default: 1000,
        value: '',
        verify(val){
          if (val === '') {
            box('打开抢票页面的时间间隔不能为空');
            return false;
          } else if (!(/^\d+$/.test(val))) {
            box('打开抢票页面的时间间隔只能输入数字');
            return false;
          } else if (+val < 0) {
            box('打开抢票页面的时间间隔不能小于0');
            return false;
          }
          return true;
        }
      },
      {
        id: 'certification',
        default: false,
        value: ''
      }
    ]
  }

  Controller.prototype = Object.assign(Ticket.prototype, Controller.prototype);

  if (/.*piao.damai.cn.*/.test(location.href)) {
    new Ticket();
  } else if (/.*trade.damai.cn.*/.test(location.href)) {
    new Confirm();
  } else if (/.*pay.damai.cn.*/.test(location.href)) {
    box('抢票成功！');
  }


})()