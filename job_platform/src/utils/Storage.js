export default class Storage {
    constructor(key) {
        this.init(key);
    }
    init(key) {
        const item = this.getItem(key);
        if (!item)  this.setItem(key, []);
    }
    getItem(key) {
        return localStorage.getItem(key) ?
            JSON.parse(localStorage.getItem(key))
            :
            undefined;
    }
    setItem(key, val) {
        localStorage.setItem(key, JSON.stringify(val));
    }
}
