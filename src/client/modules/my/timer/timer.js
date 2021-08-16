import { LightningElement, api } from 'lwc';

export default class Timer extends LightningElement {
    @api durationInSeconds;
    @api secondsLeft;

    get strokeDashArray() {
        const rawTimeFraction = this.secondsLeft / this.durationInSeconds;
        const adjustedTimeFraction =
            rawTimeFraction -
            (1 / this.durationInSeconds) * (1 - rawTimeFraction);
        const dashWidth = (adjustedTimeFraction * 283).toFixed(0);
        return `${dashWidth} 283`;
    }

    get remainingPathColor() {
        const secondsPassed = this.durationInSeconds - this.secondsLeft;
        const progressPercent = secondsPassed / this.durationInSeconds;
        return this.getColor(progressPercent);
    }

    getColor(percent) {
        const hue = ((1 - percent) * 120).toString(10);
        return `hsl(${hue}, 100%, 50%)`;
    }
}