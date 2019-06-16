// ==UserScript==
// @name can delivery
// @namespace Violentmonkey Scripts
// @include *www.lagou.com/jobs/*.html*
// @grant none
// ==/UserScript==

function testOk() {
	let detail = document.querySelector('.job-detail');
	let sendBtn = document.querySelector('.send-CV-btn.s-send-btn.fr.gray');
	if (sendBtn) {
		console.warn('已投递');
		return false;
	}
	if (/本科/g.test(detail.innerText)) {
		console.warn('不合适');
		return false;
	}
	for(let i=0; i<detail.children.length; i++) {
        let child = detail.children[i];
        if(/本科/g.test(child.innerText)) {
            console.log('不合适');
            return false;
        }
    }
	return true;
}


let isOk = testOk();
if (!isOk) window.close();
