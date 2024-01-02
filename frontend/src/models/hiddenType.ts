export interface HiddenType<T> {
    visible: boolean,
    value: T
}

export function getHiddenOrNull<T>(type: HiddenType<T>): T | null {
    if(type.visible) {
        return type.value
    } else {
        return null
    }
}

export function mapHiddenOrNull<T,R>(type: HiddenType<T>, mapping: (value: T) => R): R | null {
    if(type.visible) {
        return mapping(type.value)
    } else {
        return null
    }
}


export function mapHiddenOrDefault<T,R>(type: HiddenType<T>, defaultValue: R, mapping: (value: T) => R): R {
    if(type.visible) {
        return mapping(type.value)
    } else {
        return defaultValue
    }
}