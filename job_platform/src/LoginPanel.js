import 'src/assets/loginPanel.less'

export class LoginPanel {
    constructor() {
        window.addEventListener("message", (event) => {
            if (event.data.token) {
                localStorage.setItem('token',event.data.token);
            }
        }, false);
        // this.visibleLoginPanel();
    }
    visibleLoginPanel() {
        // const win = window.open('http://219.136.175.12:3000','','width=400,height=300');
        window.open('http://127.0.0.1:8080','','width=400,height=300');
    }


}