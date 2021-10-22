import { LightningElement, api, track } from 'lwc';

const TOTAL_SECONDS = 180;

export default class Game extends LightningElement {
    @api gameObj;
    @api gameKey;

    @track gameBlocks = [];
    @track foundWords = [];

    startTimestamp;
    endTimestamp;
    gameOver = false;
    gridWidth;

    timeUp = false;
    countDown;

    totalSeconds = TOTAL_SECONDS;
    secondsLeft = TOTAL_SECONDS;

    score = 0;
    player_id;

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

    get numberOfWordsFound(){
        return this.foundWords.length;
    }

    get solutionUrl(){
        return `/resources/solutions/${this.gameKey}.png`
    }

    connectedCallback() {
        if (this.gameObj && this.gameObj.letterGroups && this.gameObj.gridSize) {
            const tmpBlocks = [];
            this.player_id = localStorage.getItem('player_id');
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

            this.countDown = setInterval(() => {
                this.secondsLeft--;
                if(this.secondsLeft === 0){
                    this.endGame();
                    this.timeUp = true;
                    clearInterval(this.countDown);
                }
            }, 1000);
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
            this.score += 20;
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
                clearInterval(this.countDown);
                this.endGame();
                this.gameOver = true;
            }
        } else {
            const element = event.target;
            element.classList.add('animate');
            setTimeout(() => {
                element.classList.remove('animate');
            }, 1000);
            this.gameBlocks.forEach((block)=>{
                if(block.selected){
                    block.selected = false;
                }
            });
        }
    }


    endGame(){
        this.score += this.secondsLeft;
        const updateScoreBody = {"player_id": this.player_id, "score": this.score};
        fetch('/api/savescore', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateScoreBody)
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
            }).catch((e) => {
                console.error(e);
            });
    }
}