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
    
    _this.doSelect($performTime,'已选择演出时间','演出时间为未可选择状态',_this.timeIndex).then(msg=>{
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
  ticketAmount: 4,    //购买门票的数量
  certification: true,//是否要实名认证
  timeIndex: 0,        //从0开始算起，选择第几个演出时间
  priceIndex: 0,       //从0开始算起，买第几个价位
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
   .find('#startGrabbing').on('click',this.start.bind(this,+$.cookie('preTagAmount')))
   .end();
    //console.log($bar.find('#setting').on('click',this.setting).end())
    
    $('body').prepend($bar);
  },
  start(amount) {
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
  countdown() {
    var clock = setInterval(()=>{
      var countdownTagTime = +$.cookie('countdownTagTime');
      var countdownTagGapTime = +$.cookie('countdownTagGapTime');
      var countdownTagAmount = +$.cookie('countdownTagAmount');
      var flashSaleTime = $.cookie('flashSaleTime').split(':');
      if (flashSaleTime.length === 1) flashSaleTime = $.cookie('flashSaleTime').split('：');
      var saleHour = +flashSaleTime[0];
      var saleMin = +flashSaleTime[1];
      var now = new Date();
      var curHour = now.getHours();
      var curMin = now.getMinutes();
      var curSec = now.getSeconds();
      if (saleHour === curHour && (saleMin-1) === curMin && curSec === countdownTagTime) {
        clearInterval(clock);
        this.start(countdownTagAmount);
      }
    }.bind(this),1000);
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
    var $modal = $("<div class='modal fade' id='myModal' tabindex='-1' style='z-index:99999;'>" +
                  "<div class='modal-dialog'>" +
                    "<div class='modal-content'>" +
                      "<div class='modal-header'>" +
                        "<h4 class='modal-title'>设置</h4>" +
                      "</div>" +
                      "<div class='modal-body'>" +
                        "<form>" +
                          "<div class='form-group'>" +
                            "<label for='message' class='control-label'>演唱会索引:</label>" +
                            "<input type='text' class='form-control' id='performIndex' value=''>" +
                          "</div>" +
                          "<div class='form-group'>" +
                            "<label for='send-times' class='control-label'>预备标签数量:</label>" +
                            "<input type='text' class='form-control' id='preTagAmount' value=''>" +
                          "</div>" +
                          "<div class='form-group'>" +
                            "<label for='sent-times' class='control-label'>购买门票数:</label>" +
                            "<input type='text' class='form-control' id='ticketAmount' value=''>" +
                          "</div>" +
                          "<div class='checkbox'>" +
                             "<label>" +
                               "<input type='checkbox' id='certification' value='false'> 是否实名认证" +
                             "</label>" +
                          "</div>" +
                           "<div class='form-group'>" +
                            "<label for='send-index' class='control-label'>票价索引:</label>" +
                            "<input type='text' class='form-control' id='priceIndex' value=''>" +
                          "</div>" +
                          "<div class='form-group'>" +
                            "<label for='send-index' class='control-label'>演出日期索引:</label>" +
                            "<input type='text' class='form-control' id='dateIndex' value=''>" +
                          "</div>" +
                          "<div class='form-group'>" +
                            "<label for='send-index' class='control-label'>抢购时间(00:00):</label>" +
                            "<input type='text' class='form-control' id='flashSaleTime' value=''>" +
                          "</div>" +
                          "<div class='form-group'>" +
                            "<label for='send-index' class='control-label'>临倒计时结束打开标签的时间(秒):</label>" +
                            "<input type='text' class='form-control' id='countdownTagTime' value=''>" +
                          "</div>" +
                          "<div class='form-group'>" +
                            "<label for='send-index' class='control-label'>临倒计时结束打开标签的时间间隔(毫秒):</label>" +
                            "<input type='text' class='form-control' id='countdownTagGapTime' value=''>" +
                          "</div>" +
                          "<div class='form-group'>" +
                            "<label for='send-index' class='control-label'>临倒计时结束打开标签的数量:</label>" +
                            "<input type='text' class='form-control' id='countdownTagAmount' value=''>" +
                          "</div>" +
                        "</form>" +
                      "</div>" +
                      "<div class='modal-footer'>" +
                        "<button type='button' class='btn btn-default' data-dismiss='modal'>关闭</button>" +
                        "<button type='button' class='btn btn-primary' id='save'>保存</button>" +
                      "</div>" +
                    "</div>" +
                  "</div>" +
                "</div>");
    
    $modal.find('#save').on('click', this.saveSetting.bind(this));
    $modal.find('#certification').on('click', function(){
      var value = ($(this).val() === 'false') ? true : false;
      $(this).val(value);
    })
    $modal.on('show.bs.modal', this.settingInit);
    
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
    var countdownTagTime = $('#countdownTagTime').val();
    var countdownTagGapTime = $('#countdownTagGapTime').val();
    var countdownTagAmount = $('#countdownTagAmount').val();
    var verifyEmpty = '';
    var valid = true;
    if (performIndex === '') verifyEmpty = '演唱会索引不能为空';
    if (ticketAmount === '') verifyEmpty = '购买门票数不能为空';
    if (priceIndex === '') verifyEmpty = '票价索引不能为空';
    if (dateIndex === '') verifyEmpty = '演出日期索引不能为空';
    if (flashSaleTime === '') verifyEmpty = '抢购时间不能为空';
    if (verifyEmpty !== '') {
      alert(verifyEmpty);
      valid = false;
    }

    var pattern = /^\d+$/;
    var verifyNum = '';
    if (!(pattern.test(performIndex))) verifyNum = '演唱会索引只能输入数字';
    if (!(pattern.test(preTagAmount))) verifyNum = '预备标签数量只能输入数字';
    if (!(pattern.test(ticketAmount))) verifyNum = '购买门票数只能输入数字';
    if (!(pattern.test(priceIndex))) verifyNum = '票价索引只能输入数字';
    if (!(pattern.test(dateIndex))) verifyNum = '演出日期索引只能输入数字';
    if (!(pattern.test(countdownTagTime))) verifyNum = '临倒计时结束打开标签的时间只能输入数字';
    if (!(pattern.test(countdownTagGapTime))) verifyNum = '临倒计时结束打开标签的时间间隔只能输入数字';
    if (!(pattern.test(countdownTagAmount))) verifyNum = '临倒计时结束打开标签的数量只能输入数字';
    if (verifyNum !== '') {
      alert(verifyNum);
      valid = false;
    }

    if (+performIndex > 9) {
      alert('演唱会索引不能大于9');
      valid = false;
    }

    if (performIndex < 0 || preTagAmount < 0 || ticketAmount < 0 || priceIndex < 0 || dateIndex < 0) {
      alert('所填数字不能小于0');
      valid = false;
    }
    
    if (!(/^\d\d(:|：)\d\d$/.test(flashSaleTime))) {
      alert('抢购时间格式不正确');
      valid = false;
    }
    
    if (+preTagAmount > 100 || +countdownTagAmount > 100) {
      alert('预备标签数量不能大于100');
      valid = false;
    }
    if (!valid) return false;
    return {
      performIndex,
      preTagAmount,
      ticketAmount,
      certification,
      priceIndex,
      dateIndex,
      flashSaleTime,
      countdownTagTime,
      countdownTagGapTime,
      countdownTagAmount
    };
  },
  saveSetting() {
    var data = this.validateSetting();
    if (!data) return false;
    $.cookie('performIndex', data.performIndex, { expires: 1000, path: '/' });
    $.cookie('preTagAmount', data.preTagAmount, { expires: 1000, path: '/' });
    $.cookie('ticketAmount', data.ticketAmount, { expires: 1000, path: '/' });
    $.cookie('certification', data.certification, { expires: 1000, path: '/' });
    $.cookie('priceIndex', data.priceIndex, { expires: 1000, path: '/' });
    $.cookie('dateIndex', data.dateIndex, { expires: 1000, path: '/' });
    $.cookie('flashSaleTime', data.flashSaleTime, { expires: 1000, path: '/' });
    $.cookie('countdownTagTime', data.countdownTagTime, { expires: 1000, path: '/' });
    $.cookie('countdownTagGapTime', data.countdownTagGapTime, { expires: 1000, path: '/' });
    $.cookie('countdownTagAmount', data.countdownTagAmount, { expires: 1000, path: '/' });
    $('#myModal').modal('hide');
  },
  settingInit() {
    var performIndex = $.cookie('performIndex') || 0;
    var preTagAmount = $.cookie('preTagAmount') || 1;
    var ticketAmount = $.cookie('ticketAmount') || 2;
    var certification = $.cookie('certification') || false;
    var priceIndex = $.cookie('priceIndex') || 0;
    var dateIndex = $.cookie('dateIndex') || 0;
    var flashSaleTime = $.cookie('flashSaleTime') || '';
    var countdownTagTime = $.cookie('countdownTagTime') || 50;
    var countdownTagGapTime = $.cookie('countdownTagGapTime') || 1000;
    var countdownTagAmount = $.cookie('countdownTagAmount') || 40;
    
    $('#performIndex').val(performIndex);
    $('#preTagAmount').val(preTagAmount);
    $('#ticketAmount').val(ticketAmount);
    $('#certification').attr('checked',certification);
    $('#priceIndex').val(priceIndex);
    $('#dateIndex').val(dateIndex);
    $('#flashSaleTime').val(flashSaleTime);
    $('#countdownTagTime').val(countdownTagTime);
    $('#countdownTagGapTime').val(countdownTagGapTime);
    $('#countdownTagAmount').val(countdownTagAmount);
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

