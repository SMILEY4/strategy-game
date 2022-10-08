export function optional<T>(value: T | null | undefined): Optional<T> {
    return Optional.of(value)
}

export class Optional<T> {

    static of<T>(value: T | null | undefined): Optional<T> {
        return new Optional<T>(value);
    }

    static empty<T>(): Optional<T> {
        return new Optional<T>(null);
    }


    private readonly value: T | null | undefined;

    constructor(value: T | null | undefined) {
        this.value = value;
    }


    isEmpty(): boolean {
        return this.value === null || this.value === undefined;
    }


    hasValue(): boolean {
        return !this.isEmpty();
    }


    getValue(): T | null {
        if (this.isEmpty()) {
            return null;
        } else {
            return this.value!!;
        }
    }

    getValueOr(alt: T): T {
        if (this.isEmpty()) {
            return alt;
        } else {
            return this.value!!;
        }
    }

    getValueOrThrow(errorMessage?: string): T {
        if (this.isEmpty()) {
            throw new Error(errorMessage ? errorMessage : "Cannot get value from this optional");
        } else {
            return this.value!!;
        }
    }

    map<R>(mapping: (v: T) => R | null | undefined): Optional<R> {
        if (this.isEmpty()) {
            return Optional.empty();
        } else {
            return Optional.of(mapping(this.getValueOrThrow()));
        }
    }


}