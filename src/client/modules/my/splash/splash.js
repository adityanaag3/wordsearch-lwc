import { LightningElement } from 'lwc';

export default class Splash extends LightningElement {
    gameObj;
    dataloaded = false;
    buttonEle;

    renderedCallback() {
        if (!this.buttonEle) {
            this.buttonEle = this.template.querySelector('.button');
        }
    }

    validateGameKey() {
        const gamekey = this.template.querySelector('.gamecode').value;
        if (gamekey && gamekey.trim().length > 0) {
            fetch('/api/getletters?id=' + gamekey)
                .then((response) => response.json())
                .then((data) => {
                    if (data.length > 0) {
                        this.gameObj = data[0];
                        this.dataloaded = true;
                    } else {
                        this.buttonEle.classList.add('animate');
                        setTimeout(() => {
                            this.buttonEle.classList.remove('animate');
                        }, 1000);
                    }
                });
        } else {
            this.buttonEle.classList.add('animate');
            setTimeout(() => {
                this.buttonEle.classList.remove('animate');
            }, 1000);
        }
    }
}
