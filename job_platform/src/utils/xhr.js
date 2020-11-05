import axios from 'axios'
axios.defaults.baseURL = 'http://219.136.175.12:3000';

function getHeader() {
    const token = localStorage.getItem('token');
    if (token) {
        return {
            Authorization: token
        };
    }
    return {}
}

export default class Request {
    static visibleLoginModal(msg) {
    }
    static fetch({
                     url,
                     method,
                     params = {},
                     headers = {},
                     cb = Function.prototype,
                 }) {
        headers = {
            ...headers,
            ...getHeader()
        }
        return new Promise((resolve) => {
            const requestInfo = {
                url,
                method,
                headers,
            };
            if (method.toUpperCase() === 'GET') {
                requestInfo.params = params;
            } else {
                requestInfo.data = params;
            }
            cb(true);
            axios.request(requestInfo).then(res => {
                const {msg,code} = res.data;
                if (code === 0) {
                    resolve(res.data);
                } else if (code === -1) {  // 登录过期
                    Request.visibleLoginModal(msg);
                } else {
                }
            }).catch(err => {

            }).finally(() => {
                cb(false);
            });
        });
    }
}
