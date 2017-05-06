// ==UserScript==
// @name         damai2
// @namespace    ticket2
// @version      0.2
// @description  Grab a ticket
// @author       ljyang
// @include      *piao.damai.cn*
// @include      *trade.damai.cn*
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

function Ticket(){
  var _this = this;
  new Controller();
  async function collectEle(){
    var $performTime = _this.findEle(['#performList .lst','.lst.lst-dis'],'寻找演出时间');
    var $price = _this.findEle(['#priceList .lst'],'寻找票价');
    
    return {
      $performTime: await $performTime,
      $price: await $price,
    }
  }
  
  collectEle().then(eleObj=>{
    var $performTime = eleObj.$performTime;
    var $price = eleObj.$price;
    
    _this.doSelect($performTime,'已选择演出时间','演出时间为未可选择状态',_this.performIndex).then(msg=>{
      _this.doSelect($price,'已选择票价','票价为未可选择状态',_this.priceIndex).then(msg=>{
          _this.findEle(['.ipt.ipt-num'],'寻找门票数量输入框').then($ticketAmount=>{
            $ticketAmount.eq(0).val(_this.ticketAmount);
            _this.findEle(['#btnBuyNow'],'寻找购买按钮').then($ele=>{
              $ele.get(0).click();
            });
          });
        },reason=>{
        alert(reason);
      });
    },reason=>{
      alert(reason);
    });
    
  });
  
};

Ticket.prototype = {
  ticketAmount: $.cookie('ticketAmount'),    //购买门票的数量
  certification: $.cookie('certification') === 'true',//是否要实名认证
  performIndex: $.cookie('performIndex'),        //从0开始算起，选择第几个演出时间
  priceIndex: $.cookie('priceIndex'),       //从0开始算起，买第几个价位
  doSelect: ($performTime,log,statusLog,priceIndex)=>{
    return new Promise((resolve,reject)=>{
      var clock = setInterval(()=>{
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
  findEle: (selector,log)=>{
      var _this = Ticket.prototype;
      return new Promise(resolve=>{
        var clock = setInterval(()=>{
          $ele = _this.filtSelector(selector);
          if ($ele.length){
            clearInterval(clock);
            resolve($ele);
          } else {
            console.log(log);
            $ele = _this.filtSelector(selector);
          }
        },1);
    });
  },
  filtSelector: (selector)=>{
    if (selector.length > 1) {
      return $(selector[0]).not(selector[1]);
    } else {
      return $(selector[0]);
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
    this.start();
  }
}

Controller.prototype = {
  isCopyPage() {
    return (window.location.href.indexOf('custom-copy') !== -1);
  },
  start() {
    if ($.cookie('ticketPageAmount') === undefined) {
      alert('请先保存设置');
      return;
    }
    $('#startGrabbing').attr('disabled',true);
    var openPageGapTime = $.cookie('openPageGapTime');
    this.openTag(openPageGapTime);
    this.closeTag();
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
    setTimeout((()=>{
      this.isCopyPage() ? window.open(window.location.href) : window.open(window.location.href+'?custom-copy');
      
    }).bind(this),timeSpan);
  },
  closeTag() {
    var ticketPageAmount = +$.cookie('ticketPageAmount');
    var openPageSpanTime = +$.cookie('openPageSpanTime');
    var timeout = ticketPageAmount * openPageSpanTime;
    setTimeout((()=>{
      if (this.isCopyPage()) window.close();
    }).bind(this),timeout);
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
      $(`#${item.id}`).val($.cookie(item.id) || item.default);
    });
  },
  conf: [
    {
      text: '浏览器可存活的抢票页面数量',
      id: 'ticketPageAmount',
      default: 1,
      value: '',
      verify(val){
        if (val === '') {
          alert('浏览器可存活的抢票页面数量不能为空');
          return false;
        } else if (!(/^\d+$/.test(val))) {
          alert('浏览器可存活的抢票页面数量只能输入数字');
          return false;
        } else if (+val > 20) {
          alert('浏览器可存活的抢票页面数量不能大于20');
          return false;
        } else if (+val < 0) {
          alert('浏览器可存活的抢票页面数量不能小于0');
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
          alert('购买门票数不能为空');
          return false;
        } else if (!(/^\d+$/.test(val))) {
          alert('购买门票数只能输入数字');
          return false;
        } else if (+val > 6) {
          var reconfirm = confirm(`确定购买${val}张门票吗？`);
          return reconfirm;
        } else if (+val < 0) {
          alert('购买门票数不能小于0');
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
          alert('票价索引不能为空');
          return false;
        } else if (!(/^\d+$/.test(val))) {
          alert('票价索引只能输入数字');
          return false;
        } else if (+val > 6) {
          var reconfirm = confirm(`确定购买${val}张门票吗？`);
          return reconfirm;
        } else if (+val < 0) {
          alert('票价索引不能小于0');
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
          alert('演出日期索引不能为空');
          return false;
        } else if (!(/^\d+$/.test(val))) {
          alert('演出日期索引只能输入数字');
          return false;
        } else if (+val < 0) {
          alert('演出日期索引不能小于0');
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
          alert('抢购时间不能为空');
          return false;
        } if (saleSec < nowSec) {
          alert('抢购时间不能小于当前时间');
          return false;
        } if (!(/^\d{1,2}(:|：)\d{1,2}$/.test(val))) {
          alert('抢购时间格式不正确');
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
          alert('打开抢票页面的时间间隔不能为空');
          return false;
        } else if (!(/^\d+$/.test(val))) {
          alert('打开抢票页面的时间间隔只能输入数字');
          return false;
        } else if (+val < 0) {
          alert('打开抢票页面的时间间隔不能小于0');
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
}

