export interface HiddenType<T> {
    visible: boolean,
    value: T
}

export namespace HiddenType {

    export function hidden<T>(): HiddenType<T> {
        return {
            visible: false,
            value: null as unknown as T
        }
    }

    export function visible<T>(value: T): HiddenType<T> {
        return {
            visible: true,
            value: value
        }
    }

}

export function getHiddenOrNull<T>(type: HiddenType<T>): T | null {
    if (type.visible) {
        return type.value;
    } else {
        return null;
    }
}

export function getHiddenOrDefault<T>(type: HiddenType<T>, defaultValue: T): T {
    if (type.visible) {
        return type.value;
    } else {
        return defaultValue;
    }
}

export function mapHiddenOrNull<T, R>(type: HiddenType<T>, mapping: (value: T) => R): R | null {
    if (type.visible) {
        return mapping(type.value);
    } else {
        return null;
    }
}


export function mapHiddenOrDefault<T, R>(type: HiddenType<T>, defaultValue: R, mapping: (value: T) => R): R {
    if (type.visible) {
        return mapping(type.value);
    } else {
        return defaultValue;
    }
}

export function mapHidden<T, R>(type: HiddenType<T>, mapping: (value: T) => R): HiddenType<R> {
    if (type.visible) {
        return {
            visible: true,
            value: mapping(type.value),
        };
    } else {
        return type as unknown as HiddenType<R>;
    }
}