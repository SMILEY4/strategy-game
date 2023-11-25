export class ValueHistory {

    private readonly maxLength: number;
    private history: number[] = [];

    constructor(maxLength: number) {
        this.maxLength = maxLength;
    }

    public set(value: number) {
        if (this.history.length == this.maxLength) {
            this.history = [...this.history.splice(1), value];
        } else {
            this.history.push(value);
        }
    }

    public get(): number {
        return this.history[this.history.length - 1];
    }

    public getAverage(): number {
        return this.history.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / this.history.length;
    }

    public getHistory(): number[] {
        return this.history;
    }

}