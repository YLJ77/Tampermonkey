// ==UserScript==
// @name khanacademy
// @namespace khanacademy
// @include *khanacademy*
// @require      http://code.jquery.com/jquery-latest.js
// @grant none
// ==/UserScript==
// 

function ShowCaption() {
    this.getCaption();
    this.$myCap = this.createMyCap();
}

ShowCaption.prototype = {
    clock: null,
    $caption: null,
    $video: null,
    getCaptionDom() {
        return new Promise((resolve, reject)=>{
            let clock = setInterval(()=>{
                let $caption = $('.tabContent_kucgx');
                let $tranStript = $('.link_1uvuyao-o_O-tabTrigger_iat0p7-o_O-inactiveTab_ldwtvs');
                let $video = $('video');
                if ($caption.length && $tranStript.length && $video.length) {
                    $tranStript.get(0).click();
                    clearInterval(clock);
                    //添加最后一个li标识符
                    $caption.css('visibility','hidden').find('li').last().addClass('last-li');
                    this.$caption = $caption;
                    this.$video = $video;
                    resolve();
                }
                console.info('finding caption');
            }, 1000);
        });
    },
    addVideoEvent(){
        this.$video.on({
            'play':()=>{
                console.log('play');
                this.getCaption();
            },
            'pause':()=>{
                console.log('pause');
                clearInterval(this.clock);
            }
        });
    },
    createMyCap() {
        let $myCap = $('<div>').attr('id', 'my-caption').css({
            'position': 'absolute',
            'top': '466px',
            'left': '258px',
            'width': '1100px',
            'height': '32px',
            'text-align': 'center',
            'line-height': '32px',
            //'background': 'red',
            'z-index': '9999',
            'font-size': '24px',
            'color': 'rgb(2, 125, 151)',
            'cursor': 'move',
            'user-select': 'none'
        });
        this.makeDragable({dom: $myCap.get(0)});
        $myCap.appendTo('body');
        return $myCap;
    },
    makeDragable({dom}) {
        dom.onmousedown = function(ev){
    　　　　let oevent = ev || event;

    　　　　let distanceX = oevent.clientX - dom.offsetLeft;
    　　　　let distanceY = oevent.clientY - dom.offsetTop;

    　　　　document.onmousemove = function(ev){
    　　　　　　let oevent = ev || event;
    　　　　　　dom.style.left = oevent.clientX - distanceX + 'px';
    　　　　　　dom.style.top = oevent.clientY - distanceY + 'px'; 
    　　　　};
    　　　　document.onmouseup = function(){
    　　　　　　document.onmousemove = null;
    　　　　　　document.onmouseup = null;
    　　　　}
        }
    },
    getSingleCap() {
        this.clock = setInterval(()=>{
            let $curCapDom = this.$caption.find('.dot_1w3itss-o_O-dotActive_jsuk9w').parent().find('span').eq(2);
            let isLastLi = $curCapDom.parent().parent().hasClass('last-li');
            if (!$curCapDom.hasClass('pass-tense')) {
                let curCap = $curCapDom.text();
                console.log(curCap);
                this.$myCap.text(curCap);
                $curCapDom.addClass('pass-tense');
            }

            if (isLastLi) {
                clearInterval(clock);
            }
        }, 10);
    },
    getCaption() {
        if (!this.$caption) {
            this.getCaptionDom().then(()=>{
                this.addVideoEvent();
                this.getSingleCap();
            });
        } else {
            this.getSingleCap();
        }
    }
}

new ShowCaption();
