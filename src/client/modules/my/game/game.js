import { LightningElement, api, track } from 'lwc';

export default class Game extends LightningElement {
    @api gameObj;

    @track gameBlocks = [];
    @track foundWords = [];

    startTimestamp;
    endTimestamp;
    gameOver = false;
    gridWidth;

    get duration(){
        if(this.startTimestamp && this.endTimestamp){
            return Math.floor((this.endTimestamp - this.startTimestamp)/1000);
        }
        return '';
    }

    get totalWords(){
        if(this.gameObj && this.gameObj.words){
            return (this.gameObj.words.length - this.foundWords.length) + ' words remaining';
        }
        return '';
    }

    connectedCallback() {
        if (this.gameObj && this.gameObj.letterGroups && this.gameObj.gridSize) {
            const tmpBlocks = [];

            for (let y = 0; y < this.gameObj.gridSize; y++) {
                for (let x = 0; x < this.gameObj.gridSize; x++) {
                    const obj = {
                        id: `${x}:${y}`,
                        letter: this.gameObj.letterGroups[y][x],
                        used: false,
                        selected: false,
                        class: '',
                        group: ''
                    };
                    tmpBlocks.push(obj);
                }
            }
            this.gameBlocks = tmpBlocks;

            const d = new Date();
            this.startTimestamp = d.getTime();

            this.gridWidth = `width: ${this.gameObj.gridSize * 60}px`;
        }
    }

    handleLetterClick(event){
        event.preventDefault();
        const letterIndex = event.target.dataset.reference;
        const letterPosIndex = this.gameBlocks.findIndex(
            (x) => x.id === letterIndex
        );
        if(this.gameBlocks[letterPosIndex].selected){
            this.gameBlocks[letterPosIndex].selected = false;
        } else {
            this.gameBlocks[letterPosIndex].selected = true;
        }
    }

    validateWord(event){
        let word = '';
        this.gameBlocks.forEach((block)=>{
            if(block.selected){
                word += block.letter;
            }
        });

        const splitString = word.split(""); 
        const reverseArray = splitString.reverse(); 
        const reversedWord = reverseArray.join("");

        const foundWord = this.gameObj.words.find(element => element === word || element === reversedWord);

        if (foundWord && !this.foundWords.includes(foundWord)) {
            this.foundWords.push(foundWord);
            this.gameBlocks.forEach((block)=>{
                if(block.selected){
                    block.used = true;
                    block.selected = false;
                    block.group = this.foundWords.length;
                }
            });
            if(this.gameObj.words.length === this.foundWords.length){
                const d = new Date();
                this.endTimestamp = d.getTime();
                this.gameOver = true;
            }
        } else {
            const element = event.target;
            element.classList.add('animate');
            setTimeout(() => {
                element.classList.remove('animate');
            }, 1000);
        }
    }
}