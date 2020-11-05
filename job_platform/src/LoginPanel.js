import 'src/assets/loginPanel.less'

export class LoginPanel {
    constructor() {
        window.addEventListener("message", (event) => {
            console.warn('---------------lagou:');
            console.warn(event);
        }, false);
        // const win = window.open('http://219.136.175.12:3000','','width=400,height=300');
        window.open('http://192.168.43.218:8081','','width=400,height=300');
    }


}