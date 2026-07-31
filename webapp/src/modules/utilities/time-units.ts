/** Create a duration value in milliseconds. */
export function milliseconds(amount: number): Milliseconds {
    return new Milliseconds(amount);
}

/** Create a duration value in seconds. */
export function seconds(amount: number): Seconds {
    return new Seconds(amount);
}

/** Create a duration value in minutes. */
export function minutes(amount: number): Minutes {
    return new Minutes(amount);
}

/** Create a duration value in hours. */
export function hours(amount: number): Hours {
    return new Hours(amount);
}

/** Create a duration value in days. */
export function days(amount: number): Days {
    return new Days(amount);
}


/** A duration value that can be converted between time units. */
export interface DurationUnit {
    getValue(): number;
    getValueMilliseconds(): number;
    inMilliseconds(): Milliseconds;
    inSeconds(): Seconds;
    inMinutes(): Minutes;
    inHours(): Hours;
    inDays(): Days;
}


export class Milliseconds implements DurationUnit {

    private readonly value: number;

    constructor(value: number) {
        this.value = value;
    }

    getValue(): number {
        return this.value;
    }

    getValueMilliseconds(): number {
        return this.value;
    }

    inMilliseconds(): Milliseconds {
        return new Milliseconds(this.value);
    }

    inSeconds(): Seconds {
        return new Seconds(this.value / 1000);
    }

    inMinutes(): Minutes {
        return new Minutes(this.value / 60000);
    }

    inHours(): Hours {
        return new Hours(this.value / 3.6e+6);
    }

    inDays(): Days {
        return new Days(this.value / 8.64e+7);
    }
}

export class Seconds implements DurationUnit {

    private readonly value: number;

    constructor(value: number) {
        this.value = value;
    }

    getValue(): number {
        return this.value;
    }

    getValueMilliseconds(): number {
        return this.value * 1000;
    }

    inMilliseconds(): Milliseconds {
        return new Milliseconds(this.value * 1000);
    }

    inSeconds(): Seconds {
        return new Seconds(this.value);
    }

    inMinutes(): Minutes {
        return new Minutes(this.value / 60);
    }

    inHours(): Hours {
        return new Hours(this.value / 3600);
    }

    inDays(): Days {
        return new Days(this.value / 86400);
    }
}

export class Minutes implements DurationUnit {

    private readonly value: number;

    constructor(value: number) {
        this.value = value;
    }

    getValue(): number {
        return this.value;
    }

    getValueMilliseconds(): number {
        return this.value * 6000;
    }

    inMilliseconds(): Milliseconds {
        return new Milliseconds(this.value * 60000);
    }

    inSeconds(): Seconds {
        return new Seconds(this.value * 60);
    }

    inMinutes(): Minutes {
        return new Minutes(this.value);
    }

    inHours(): Hours {
        return new Hours(this.value / 60);
    }

    inDays(): Days {
        return new Days(this.value / 1440);
    }
}

export class Hours implements DurationUnit {

    private readonly value: number;

    constructor(value: number) {
        this.value = value;
    }

    getValue(): number {
        return this.value;
    }

    getValueMilliseconds(): number {
        return this.value * 3.6e+6;
    }

    inMilliseconds(): Milliseconds {
        return new Milliseconds(this.value * 3.6e+6);
    }

    inSeconds(): Seconds {
        return new Seconds(this.value * 3600);
    }

    inMinutes(): Minutes {
        return new Minutes(this.value / 60);
    }

    inHours(): Hours {
        return new Hours(this.value);
    }

    inDays(): Days {
        return new Days(this.value / 24);
    }
}

export class Days implements DurationUnit {

    private readonly value: number;

    constructor(value: number) {
        this.value = value;
    }

    getValue(): number {
        return this.value;
    }

    getValueMilliseconds(): number {
        return this.value * 8.64e+7;
    }

    inMilliseconds(): Milliseconds {
        return new Milliseconds(this.value * 8.64e+7);
    }

    inSeconds(): Seconds {
        return new Seconds(this.value * 86400);
    }

    inMinutes(): Minutes {
        return new Minutes(this.value / 1440);
    }

    inHours(): Hours {
        return new Hours(this.value / 24);
    }

    inDays(): Days {
        return new Days(this.value);
    }
}