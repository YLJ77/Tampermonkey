// ==UserScript==
// @name         damai2
// @namespace    ticket2
// @version      0.2
// @description  Grab a ticket
// @author       ljyang
// @include      *piao.damai.cn*
// @include      *trade.damai.cn*
// @include      *damai.cn/projectlist.do*
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
          //clearInterval(clock);
          //reject('已售罄');
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

function PerformList() {
  var _this = this;
  this.appendBootstrapCss();
  this.formatList();
  this.appendModal();
  this.renderBase();
}

PerformList.prototype = {
  conf: {
    performIndex: 0,
    preTagAmount: 1,
    ticketAmount: 2,
    priceIndex: 0,
    dateIndex: 0,
    flashSaleTime: '00:00',
    startTagTime: 50,
    startTagGapTime: 1000,
    startTagAmount: 40
  },
  renderBase() {
   var $bar = $("<div class='btn-group'>" +
        "<button class='btn btn-default' type='button' id='setting'>设置</button>" +
        "<button class='btn btn-default' type='button' id='startGrabbing'>开始</button>" +
        "</div>")
    .css({
      position: 'fixed',
      top: '50px',
      left: '20px'
    })
   .find('#setting').on('click',this.setting)
   .end()
   .find('#startGrabbing').on('click',this.start.bind(this))
   .end();
    //console.log($bar.find('#setting').on('click',this.setting).end())
    
    $('body').prepend($bar);
  },
  openTag(amount) {
    var performIndex = +$.cookie('performIndex');
    var $li = $('#performList li').eq(performIndex);
    if ($li.find('.btn_mbook').length) {
      alert('预定登记无法抢购');
      return;
    }
    var $btnBuy = $li.find('.btn_buy');
    var $btnBooks = $li.find('.btn_books');
    var $btn = ($btnBuy.length && $btnBuy) || ($btnBooks.length && $btnBooks);
    
    for (var i=0; i<amount; i++) {
      (i=>{
        setTimeout(()=>{
          window.open($btn.eq(0).attr('href'));
        },1000*i);
      })(i)
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
  start(e) {
    $(e.target).attr('disabled',true);
    this.openTag(+$.cookie('preTagAmount'));
    var clock = setInterval((()=>{
      var startTagTime = +$.cookie('startTagTime');
      var startTagGapTime = +$.cookie('startTagGapTime');
      var startTagAmount = +$.cookie('startTagAmount');
      
      var time = this.getTime();
      var saleSec = time.sale.sec;
      var curSec = time.now.sec;
      var diffSec = saleSec - curSec;
      var saleFormatTime = this.formatTime(diffSec);
      var openTagFormatTime = this.formatTime(diffSec + startTagTime - 60);
      
      console.info(`距离抢购时间还有：${saleFormatTime} 距离再次打开标签的时间还有：${openTagFormatTime}`);
      if (diffSec === (60 - startTagTime)) {
        clearInterval(clock);
        this.openTag(startTagAmount);
      }
    }).bind(this),1000);
  },
  setting() {
    $('#myModal').modal('show');
  },
  formatList() {
    this.findEle(['#performList'],'寻找演唱会列表').then($list=>{
      $list.find('li').each((index,item)=>{
        var $num = $('<span>'+index+'</span>').css({
          position: 'absolute',
          top: 0,
          right: 0,
          color: 'red',
          fontSize: '36px'
        });
        $(item).prepend($num);
      });
    });
  },
  appendBootstrapCss() {
    var cssURL = 'https://cdn.bootcss.com/bootstrap/3.3.7/css/bootstrap.min.css',
    linkTag = $('<link href="' + cssURL + '" rel="stylesheet" type="text/css"/>'); 
    $($('head')[0]).prepend(linkTag);
  },
  appendModal() {
    var _this = this;
    var option = [
      {
        text: '演唱会索引',
        id: 'performIndex'
      },
      {
        text: '预备标签数量',
        id: 'preTagAmount'
      },
      {
        text: '购买门票数',
        id: 'ticketAmount'
      },
      {
        text: '票价索引',
        id: 'priceIndex'
      },
      {
        text: '演出日期索引',
        id: 'dateIndex'
      },
      {
        text: '抢购时间',
        id: 'flashSaleTime'
      },
      {
        text: '临倒计时结束打开标签的时间(秒)',
        id: 'startTagTime'
      },
      {
        text: '临倒计时结束打开标签的时间间隔(毫秒)',
        id: 'startTagGapTime'
      },
      {
        text: '临倒计时结束打开标签的数量',
        id: 'startTagAmount'
      }
    ];
    var optionDom = '';
    option.forEach((item,index)=>{
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
    var performIndex = $('#performIndex').val();
    var preTagAmount = $('#preTagAmount').val();
    var ticketAmount = $('#ticketAmount').val();
    var certification = $('#certification').val();
    var priceIndex = $('#priceIndex').val();
    var dateIndex = $('#dateIndex').val();
    var flashSaleTime = $('#flashSaleTime').val();
    var startTagTime = $('#startTagTime').val();
    var startTagGapTime = $('#startTagGapTime').val();
    var startTagAmount = $('#startTagAmount').val();
    var verifyEmpty = '';
    
    if (performIndex === '') verifyEmpty = '演唱会索引不能为空';
    if (ticketAmount === '') verifyEmpty = '购买门票数不能为空';
    if (priceIndex === '') verifyEmpty = '票价索引不能为空';
    if (dateIndex === '') verifyEmpty = '演出日期索引不能为空';
    if (flashSaleTime === '') verifyEmpty = '抢购时间不能为空';
    if (verifyEmpty !== '') {
      alert(verifyEmpty);
      return false;
    }
    
    var time = this.getTime(flashSaleTime);
    var nowSec = time.now.sec;
    var saleSec = time.sale.sec;
    
    if (saleSec < nowSec) {
      alert('抢购时间不能小于当前时间');
      return false;
    }

    var pattern = /^\d+$/;
    var verifyNum = '';
    if (!(pattern.test(performIndex))) verifyNum = '演唱会索引只能输入数字';
    if (!(pattern.test(preTagAmount))) verifyNum = '预备标签数量只能输入数字';
    if (!(pattern.test(ticketAmount))) verifyNum = '购买门票数只能输入数字';
    if (!(pattern.test(priceIndex))) verifyNum = '票价索引只能输入数字';
    if (!(pattern.test(dateIndex))) verifyNum = '演出日期索引只能输入数字';
    if (!(pattern.test(startTagTime))) verifyNum = '临倒计时结束打开标签的时间只能输入数字';
    if (!(pattern.test(startTagGapTime))) verifyNum = '临倒计时结束打开标签的时间间隔只能输入数字';
    if (!(pattern.test(startTagAmount))) verifyNum = '临倒计时结束打开标签的数量只能输入数字';
    if (verifyNum !== '') {
      alert(verifyNum);
      return false;
    }

    if (+performIndex > 9) {
      alert('演唱会索引不能大于9');
      return false;
    }

    if (performIndex < 0 || preTagAmount < 0 || ticketAmount < 0 || priceIndex < 0 || dateIndex < 0) {
      alert('所填数字不能小于0');
      return false;
    }
    
    if (!(/^\d{1,2}(:|：)\d{1,2}$/.test(flashSaleTime))) {
      alert('抢购时间格式不正确');
      return false;
    }
    
    if (+preTagAmount > 100 || +startTagAmount > 100) {
      alert('预备标签数量不能大于100');
      return false;
    }
    return {
      performIndex,
      preTagAmount,
      ticketAmount,
      certification,
      priceIndex,
      dateIndex,
      flashSaleTime,
      startTagTime,
      startTagGapTime,
      startTagAmount
    };
  },
  reset() {
    for (var key in this.conf) $(`#${key}`).val(this.conf[key]);
  },
  saveSetting() {
    var data = this.validateSetting();
    if (!data) return false;
    for (var key in data) $.cookie(key, data[key], { expires: 1000, path: '/' });
    $('#myModal').modal('hide');
  },
  settingInit() {
    for (var key in this.conf) $(`#${key}`).val($.cookie(key) || this.conf[key]);
  },
}

PerformList.prototype = Object.assign(Ticket.prototype, PerformList.prototype);

if (/.*piao.damai.cn.*/.test(location.href)) {
  new Ticket();
} else if (/.*trade.damai.cn.*/.test(location.href)) {
  new Confirm();
} else if (/.*damai.cn\/projectlist.do.*/.test(location.href)) {
  new PerformList();
}

